import { Component, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideComponent } from './components/guide/guide.component';
import { GuideService } from './services/guide.service';
import { GuideAdminComponent } from './components/guide/guide-admin.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';
import { NewsBellComponent } from './components/shared/news-bell/news-bell.component';
import { NewsPopupComponent } from './components/shared/news-popup/news-popup.component';
import { ThemeService } from './services/theme.service';
import { NewsService } from './services/news.service';
import { FaqReadingService } from './services/faq-reading.service';
import { HomeComponent } from './components/home/home.component';
import { ServiziComponent } from './components/servizi/servizi.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';
import { FaqReadingPanelComponent } from './components/shared/faq-reading-panel/faq-reading-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent, NewsBellComponent, NewsPopupComponent, HomeComponent, ServiziComponent, FaqPageComponent, FaqReadingPanelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  @ViewChild('contactDropdown') contactDropdown!: ElementRef;
  @ViewChild(ServiziComponent) serviziRef?: ServiziComponent;
  stage = 0;
  titleVisible = false;
  isSidebarExpanded = false;
  isContactOpen = false;
  isAdminRoute = false;
  isAdminAuthenticated = false;
  isUploadModalOpen = false;

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
  }

  @ViewChild(GuideComponent) guideRef?: GuideComponent;

  constructor(
    private eRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    public guideService: GuideService,
    public themeService: ThemeService,
    public newsService: NewsService,
    public faqReadingService: FaqReadingService
  ) {}

  // Uscita dalla modalità admin
  exitAdmin() {
    this.isAdminRoute = false;
    window.location.href = '/';
  }

  isLocalhost = window.location.hostname === 'localhost';

  goToAdmin() {
    this.isAdminRoute = true;
    if (this.isLocalhost) {
      // Accesso diretto per localhost, per evitare loop 404
      this.isAdminAuthenticated = true;
    } else if (sessionStorage.getItem('adminToken')) {
      this.isAdminAuthenticated = true;
    }
  }

  onLoginSuccess() {
    this.isAdminAuthenticated = true;
  }

  tags: string[] = [];
  // TODO: Popolare tramite chiamata HTTP al backend (es. /api/get_popular_tags.ashx)

  menuItems = [
    { icon: 'home', label: 'QeHome', active: true },
    { icon: 'book-open', label: 'FAQ', active: false },
    { icon: 'briefcase', label: 'Servizi', active: false },
    { icon: 'folder', label: 'Guide', active: false },
    { icon: 'newspaper', label: 'News', active: false }
  ];

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isContactOpen && this.contactDropdown && !this.contactDropdown.nativeElement.contains(event.target)) {
      this.isContactOpen = false;
    }
  }

  activeIndex = 0;
  homeStage: 0 | 1 = 0;
  manualiStage: 'center' | 'content' = 'content';
  faqAnimVariant: 'cinematic' | 'elastic' | 'flipboard' | 'snap' | 'cascade' = 'snap';
  serviziStage: 'title-black' | 'title-blue' | 'moving' | 'cards' = 'cards';
  currentServicePage = 0;
  isChangingPage = false;
  animatingDirection = 0;
  
  replayFaqAnimation(variant: 'cinematic' | 'elastic' | 'flipboard' | 'snap' | 'cascade') {
    this.faqAnimVariant = variant;
    this.manualiStage = 'center';
    setTimeout(() => {
      this.manualiStage = 'content';
    }, 2800);
  }

  private pageTimeout: any;
  private animationId = 0;
  newsStage: 'title-black' | 'title-blue' | 'moving' | 'cards' | 'detail' = 'title-black';
  newsBaseColor: string | null = null;
  newsOverlayColor: string | null = null;
  newsFillPosition: string = '0% 0%';
  isRefilling = false;

  activeProgramIndex: number = 0;
  programs = [
    { id: 'windent', name: 'Windent', hexColor: '#377DFF', color: 'from-blue-600 to-sky-400', shadow: 'shadow-blue-500/40', image: 'https://www.quadernoelettronico.it/librerie/qe/img/WINDENT.png' },
    { id: 'poliwin', name: 'Poliwin', hexColor: '#6D28D9', color: 'from-violet-800 to-purple-600', shadow: 'shadow-violet-700/40', image: 'https://www.quadernoelettronico.it/librerie/qe/img/POLIWIN.png' },
    { id: 'winodlab', name: 'Winodlab', hexColor: '#F97316', color: 'from-orange-500 to-amber-400', shadow: 'shadow-orange-500/40', image: 'https://www.quadernoelettronico.it/librerie/qe/img/WINODLAB.png' }
  ];

  services: any[] = [];
  // TODO: Popolare tramite chiamata HTTP al backend (es. /api/get_services.ashx)

  loadNews() {
    // Nessuna apertura automatica: le comunicazioni restano nella campanella.
    this.newsService.loadNews(() => this.updateProgramNews());
  }

  updateProgramNews() {
    const programName = this.programs[this.activeProgramIndex].name;
    this.newsItems = this.newsService.newsForProgram(programName);
    if (this.newsItems.length === 0) {
      this.newsItems = [
        {
          title: `Novità in arrivo per ${programName}`,
          date: 'Oggi',
          excerpt: `Stiamo preparando fantastici aggiornamenti per `
        }
      ];
    }
    this.activeNewsItemIndex = 0;
  }

  loadServices() {
    this.http.get<any[]>('/api/get_services.ashx').subscribe({
      next: (data) => {
        this.services = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento dei servizi:', err)
    });
  }
  
  loadTags() {
    this.http.get<string[]>('/api/get_popular_tags.ashx').subscribe({
      next: (data) => {
        this.tags = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Errore nel caricamento dei tags:', err)
    });
  }

  nextProgram() {
    this.activeProgramIndex = (this.activeProgramIndex + 1) % this.programs.length;
    this.triggerColorChange();
  }

  prevProgram() {
    this.activeProgramIndex = (this.activeProgramIndex - 1 + this.programs.length) % this.programs.length;
    this.triggerColorChange();
  }

  selectProgram(index: number) {
    if (this.activeProgramIndex === index) {
      if (this.activeIndex === 4 && this.newsStage === 'cards') {
        this.newsStage = 'detail';
      }
      return;
    }
    this.activeProgramIndex = index;
    this.triggerColorChange();
  }

  hexToRgba(hex: string, alpha: number): string {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  triggerColorChange() {
    if (this.activeIndex !== 4) return;
    
    // 1. Store the CURRENT overlay color as the NEW base color
    this.newsBaseColor = this.newsOverlayColor;
    
    // 2. Set the NEW overlay color (but it's hidden because clip-path is 0%)
    this.newsOverlayColor = this.programs[this.activeProgramIndex].hexColor;
    
    // 3. Reset the liquid fill position instantly
    this.isRefilling = true;
    this.newsFillPosition = '0% 0%';
    
    // 4. Wait for DOM to update
    setTimeout(() => {
      this.isRefilling = false;
      setTimeout(() => {
        this.newsFillPosition = '100% 0%';
      }, 50);
    }, 50);
  }

  getGlowColor(orb: number): string {
    let hex = orb === 1 ? '#377DFF' : '#F80086';
    if (this.activeIndex === 4 && this.programs[this.activeProgramIndex]) {
      hex = this.programs[this.activeProgramIndex].hexColor;
    }
    return this.hexToRgba(hex, 0.4);
  }

  getOrbitTransform(orb: number): string {
    const time = Date.now() * 0.001;
    const speed = 0.5;
    if (orb === 1) {
      const x = Math.cos(time * speed) * 15;
      const y = Math.sin(time * speed) * 15;
      return `translate(${x}px, ${y}px)`;
    } else {
      const x = Math.sin(time * speed * -0.7) * 20;
      const y = Math.cos(time * speed * -0.7) * 20;
      return `translate(${x}px, ${y}px)`;
    }
  }

  getCarouselStyle(index: number): any {
    const total = this.programs.length;
    let offset = index - this.activeProgramIndex;
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;

    let style: any = {
      transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      position: 'absolute',
      width: '300px',
      height: '360px',
      top: '0',
      left: 'calc(50% - 150px)',
      zIndex: 10 - absOffset,
      transformOrigin: 'bottom center'
    };

    if (this.newsStage === 'detail') {
      if (isCenter) {
        style.left = '48px';
        style.transform = `translateX(0) scale(0.9) translateZ(0)`;
        style.opacity = 1;
        style.filter = 'brightness(1)';
        style.cursor = 'default';
      } else {
        style.transform = `translateX(${Math.sign(offset) * 112}%) scale(0.82) translateZ(-100px)`;
        style.opacity = 0;
        style.pointerEvents = 'none';
      }
      return style;
    }

    if (isCenter) {
      style.transform = `translateX(0) scale(1.08) translateZ(50px)`;
      style.opacity = 1;
      style.filter = 'brightness(1)';
    } else {
      const sign = Math.sign(offset);
      style.transform = `translateX(${sign * 112}%) scale(0.82) translateZ(-100px)`;
      style.opacity = 0.55;
      style.filter = 'brightness(0.7)';
      style.cursor = 'pointer';
    }

    if (absOffset > 1) {
      style.opacity = 0;
      style.pointerEvents = 'none';
    }

    return style;
  }

  selectMenuItem(selectedItem: any) {
    if (selectedItem.active) return; // Prevent resetting if clicking the same item

    const prevLabel = this.menuItems[this.activeIndex].label;
    const newIndex = this.menuItems.indexOf(selectedItem);
    
    this.menuItems.forEach(item => item.active = false);
    selectedItem.active = true;
    this.activeIndex = newIndex;

    // Reset the old view silently after it fades out
    setTimeout(() => {
      if (prevLabel === 'QeHome' && this.activeIndex !== 0) {
        this.homeStage = 0;
      } else if (prevLabel === 'Servizi' && this.activeIndex !== 2) {
        this.serviziStage = 'title-black';
        this.currentServicePage = 0;
        this.animatingDirection = 0;
      } else if (prevLabel === 'FAQ' && this.activeIndex !== 1) {
        this.manualiStage = 'center';
      } else if (prevLabel === 'News' && this.activeIndex !== 4) {
        this.newsStage = 'title-black';
      }
    }, 700);

    // Reset for new entrance
    if (selectedItem.label === 'QeHome') {
      this.homeStage = 0;
    } else if (selectedItem.label === 'FAQ') {
      if (!this.themeService.globalAnimationsEnabled) {
        this.manualiStage = 'content';
      } else {
        this.manualiStage = 'center';
        setTimeout(() => {
          this.manualiStage = 'content';
        }, 1200);
      }
    } else if (selectedItem.label === 'Servizi') {
      this.serviziStage = 'title-black';
      this.animatingDirection = 0;
    } else if (selectedItem.label === 'News') {
      this.newsStage = 'title-black';
      this.newsBaseColor = null;
      this.newsOverlayColor = this.programs[this.activeProgramIndex].hexColor;
      this.newsFillPosition = '0% 0%';
    }

    this.triggerPageAnimation(selectedItem.label);
  }

  triggerPageAnimation(pageLabel: string) {
    // Clear any existing timeout
    if (this.pageTimeout) {
      clearTimeout(this.pageTimeout);
    }
    
    this.animationId++;
    const currentAnimId = this.animationId;

    if (pageLabel === 'QeHome') {
      this.pageTimeout = setTimeout(() => {
        if (this.animationId !== currentAnimId) return;
        this.homeStage = 1;
      }, 800);
    } else if (pageLabel === 'Servizi') {
      if (!this.themeService.globalAnimationsEnabled) {
        this.serviziStage = 'cards';
        return;
      }
      
      // Step 1: Color it blue after 800ms
      this.pageTimeout = setTimeout(() => {
        if (this.activeIndex !== 2 || this.animationId !== currentAnimId) return;
        this.serviziStage = 'title-blue';
        
        // Step 2: Move to top left after 500ms using JS FLIP for 60fps
        // (misura/muta/misura/anima delegati a ServiziComponent, che possiede il DOM del titolo)
        setTimeout(() => {
          if (this.activeIndex !== 2 || this.animationId !== currentAnimId) return;

          // First (measure)
          const first = this.serviziRef?.getTitleRect();
          if (!first) {
            this.serviziStage = 'moving';
            setTimeout(() => { if (this.activeIndex === 2 && this.animationId === currentAnimId) this.serviziStage = 'cards'; }, 800);
            return;
          }

          // Mutate (change layout class)
          this.serviziStage = 'moving';

          // Wait for Angular to update the DOM
          setTimeout(() => {
            if (this.activeIndex !== 2 || this.animationId !== currentAnimId) return;

            // Last (measure new layout) + Invert & Play
            this.serviziRef?.animateTitleFlip(first, () => {
              setTimeout(() => {
                if (this.activeIndex === 2 && this.animationId === currentAnimId) {
                  this.serviziStage = 'cards';
                  this.cdr.detectChanges();
                }
              });
            });

          }, 0);
        }, 500);
      }, 800);
    } else if (pageLabel === 'News') {
      if (!this.themeService.globalAnimationsEnabled) {
        this.newsStage = 'cards';
        this.newsBaseColor = this.newsOverlayColor;
        this.newsFillPosition = '100% 0%';
        return;
      }

      // Step 1: Liquid fill blue after 800ms
      this.pageTimeout = setTimeout(() => {
        if (this.activeIndex !== 4 || this.animationId !== currentAnimId) return;
        this.newsStage = 'title-blue';
        this.newsFillPosition = '100% 0%';
        
        // Step 2: Move to top center after liquid fill completes (1000ms)
        setTimeout(() => {
          if (this.activeIndex !== 4 || this.animationId !== currentAnimId) return;
          this.newsStage = 'moving';
          this.newsBaseColor = this.newsOverlayColor; // Prevent base layer bleeding through
          
          // Step 3: Show "Prodotti &" and Carousel after move completes
          setTimeout(() => {
            if (this.activeIndex !== 4 || this.animationId !== currentAnimId) return;
            this.newsStage = 'cards';
          }, 1000);
          
        }, 1000);
      }, 800);
    }
  }

  private scrollLock = false;

  nextServicePage() {
    if (this.isChangingPage || this.scrollLock) return;
    this.changePage(1);
  }

  prevServicePage() {
    if (this.isChangingPage || this.scrollLock) return;
    this.changePage(-1);
  }

  private changePage(direction: number) {
    this.isChangingPage = true;
    this.scrollLock = true;
    this.animatingDirection = direction;
    setTimeout(() => {
      const maxPages = Math.ceil(this.services.length / 8);
      this.currentServicePage = (this.currentServicePage + direction + maxPages) % maxPages;
      this.isChangingPage = false;
      
      setTimeout(() => {
        this.scrollLock = false;
      }, 500); // Wait for entrance animation to finish before unlocking
    }, 400); 
  }

  activeNewsItemIndex: number = 0;
  isNewsAnimating: boolean = false;
  newsAnimState: 'stable' | 'leaving-up' | 'leaving-down' | 'entering-up' | 'entering-down' = 'stable';

  newsItems: any[] = [];

  getNewsContentClass() {
    switch(this.newsAnimState) {
      case 'stable': return 'opacity-100 translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
      case 'leaving-up': return 'opacity-0 -translate-y-12 transition-all duration-400 ease-in';
      case 'leaving-down': return 'opacity-0 translate-y-12 transition-all duration-400 ease-in';
      case 'entering-up': return 'opacity-0 translate-y-12 transition-none';
      case 'entering-down': return 'opacity-0 -translate-y-12 transition-none';
      default: return 'opacity-100 translate-y-0 transition-all duration-500';
    }
  }

  changeNewsItem(newIndex: number) {
      const isDown = newIndex > this.activeNewsItemIndex;
      this.isNewsAnimating = true;
      this.newsAnimState = isDown ? 'leaving-up' : 'leaving-down';
      
      setTimeout(() => {
          this.activeNewsItemIndex = newIndex;
          this.newsAnimState = isDown ? 'entering-up' : 'entering-down';
          
          setTimeout(() => {
              this.newsAnimState = 'stable';
              setTimeout(() => {
                  this.isNewsAnimating = false;
              }, 500);
          }, 50);
      }, 400);
  }

  lastWheelTime = 0;

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!(this.activeIndex === 2 && this.serviziStage === 'cards') && !(this.activeIndex === 4 && this.newsStage === 'detail')) return;
    
    event.preventDefault();
    const now = Date.now();
    const isContinuousScroll = (now - this.lastWheelTime) < 150;
    this.lastWheelTime = now;

    if (this.activeIndex === 2) {
      if (this.scrollLock || isContinuousScroll) return;
      if (event.deltaY > 0) this.nextServicePage();
      else if (event.deltaY < 0) this.prevServicePage();
    } else if (this.activeIndex === 4) {
      if (this.isNewsAnimating || isContinuousScroll) return;
      if (Math.abs(event.deltaY) > 20) {
        if (event.deltaY > 0 && this.activeNewsItemIndex < this.newsItems.length - 1) {
           this.changeNewsItem(this.activeNewsItemIndex + 1);
        } else if (event.deltaY < 0 && this.activeNewsItemIndex > 0) {
           this.changeNewsItem(this.activeNewsItemIndex - 1);
        }
      }
    }
  }

  ngOnInit() {
    this.loadNews();
    this.loadServices();
    this.loadTags();

    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path === '/admin' || hash.includes('/admin')) {
      this.isAdminRoute = true;
      if (sessionStorage.getItem('adminToken')) {
        this.isAdminAuthenticated = true;
      }
    }

    this.triggerPageAnimation('QeHome');

    // Il titolo appare in fade in morbido appena la pagina carica
    setTimeout(() => {
      this.titleVisible = true;
    }, 100);

    // Dopo 3 secondi scatta la fase 2 della coreografia
    setTimeout(() => {
      this.stage = 1;
    }, 3000);
  }

  goToCategoryFromFaq(catId?: string) {
    // Passa alla sezione Guide (indice menu 3) e apri la categoria della FAQ.
    this.menuItems.forEach((m, idx) => m.active = (idx === 3));
    this.activeIndex = 3;
    if (catId) {
      setTimeout(() => this.guideRef?.openCat(catId), 0);
    }
  }
}
