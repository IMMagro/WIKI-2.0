import { Component, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
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
import { GuideTrackerService } from './services/guide-tracker.service';
import { HomeComponent } from './components/home/home.component';
import { ServiziComponent } from './components/servizi/servizi.component';
import { FaqPageComponent } from './components/faq-page/faq-page.component';
import { FaqReadingPanelComponent } from './components/shared/faq-reading-panel/faq-reading-panel.component';
import { NewsCarouselComponent } from './components/news-carousel/news-carousel.component';
import { LegalService } from './services/legal.service';
import { LegalModalComponent } from './components/shared/legal-modal/legal-modal.component';
import { CookieBannerComponent } from './components/shared/cookie-banner/cookie-banner.component';
import { NavigationSettingsService } from './services/navigation-settings.service';
import { InteractiveScreenComponent } from './components/guide/interactive-screen/interactive-screen.component';
import { InteractiveScreensService } from './services/interactive-screens.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GuideComponent,
    GuideAdminComponent,
    AdminLoginComponent,
    AdminLayoutComponent,
    NewsBellComponent,
    NewsPopupComponent,
    HomeComponent,
    ServiziComponent,
    FaqPageComponent,
    FaqReadingPanelComponent,
    NewsCarouselComponent,
    LegalModalComponent,
    CookieBannerComponent,
    InteractiveScreenComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  @ViewChild('contactDropdown') contactDropdown!: ElementRef;
  @ViewChild(ServiziComponent) serviziRef?: ServiziComponent;

  isContactOpen = false;
  stage = 0;
  titleVisible = false;
  isAdminRoute = false;
  isAdminAuthenticated = false;
  isUploadModalOpen = false;
  isSidebarExpanded = false;

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
    private ngZone: NgZone,
    private http: HttpClient,
    public guideService: GuideService,
    public themeService: ThemeService,
    public newsService: NewsService,
    public faqReadingService: FaqReadingService,
    public guideTracker: GuideTrackerService,
    public legalService: LegalService,
    public navSettingsService: NavigationSettingsService,
    public interactiveScreensService: InteractiveScreensService
  ) {}

  // Sfondo Aurora Ultra-Performante (Hardware-Accelerated via CSS Radial Gradients, 0% CPU/GPU overhead)
  get auroraGradientStyle(): string {
    const isDark = this.themeService.isDarkMode;
    const c1 = this.activeIndex === 4 && this.programs[this.activeProgramIndex]
      ? this.programs[this.activeProgramIndex].hexColor
      : '#377DFF';
    const c2 = '#F80086';
    const a1 = isDark ? 0.12 : 0.07;
    const a2 = isDark ? 0.08 : 0.04;
    return `radial-gradient(circle at 10% 15%, ${this.hexToRgba(c1, a1)} 0%, transparent 60%), radial-gradient(circle at 90% 85%, ${this.hexToRgba(c2, a2)} 0%, transparent 60%)`;
  }

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
    { id: 'home', icon: 'home', label: 'QeHome', active: true },
    { id: 'guide', icon: 'book-open', label: 'Guide', active: false },
    { id: 'faq', icon: 'help-circle', label: 'FAQ', active: false },
    { id: 'servizi', icon: 'briefcase', label: 'Servizi', active: false },
    { id: 'news', icon: 'newspaper', label: 'News', active: false }
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
    this.updateProgramNews();
    this.triggerColorChange();
  }

  prevProgram() {
    this.activeProgramIndex = (this.activeProgramIndex - 1 + this.programs.length) % this.programs.length;
    this.updateProgramNews();
    this.triggerColorChange();
  }

  selectProgram(index: number) {
    if (this.activeProgramIndex === index) {
      if (this.activeIndex === 4 && this.newsStage === 'cards') {
        this.updateProgramNews();
        this.newsStage = 'detail';
      }
      return;
    }
    this.activeProgramIndex = index;
    this.updateProgramNews();
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

  onHomePillSelected(pill: any) {
    if (this.activeIndex !== 1) {
      this.selectMenuItem(this.menuItems[1]);
    }
    setTimeout(() => {
      if (this.guideRef) {
        this.guideRef.openFromPill(pill);
      }
    }, 120);
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
      } else if (prevLabel === 'FAQ' && this.activeIndex !== 2) {
        this.manualiStage = 'center';
      } else if (prevLabel === 'Servizi' && this.activeIndex !== 3) {
        this.serviziStage = 'title-black';
        this.currentServicePage = 0;
        this.animatingDirection = 0;
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
        if (this.activeIndex !== 3 || this.animationId !== currentAnimId) return;
        this.serviziStage = 'title-blue';
        
        // Step 2: Move to top left after 500ms using JS FLIP for 60fps
        // (misura/muta/misura/anima delegati a ServiziComponent, che possiede il DOM del titolo)
        setTimeout(() => {
          if (this.activeIndex !== 3 || this.animationId !== currentAnimId) return;

          // First (measure)
          const first = this.serviziRef?.getTitleRect();
          if (!first) {
            this.serviziStage = 'moving';
            setTimeout(() => { if (this.activeIndex === 3 && this.animationId === currentAnimId) this.serviziStage = 'cards'; }, 800);
            return;
          }

          // Mutate (change layout class)
          this.serviziStage = 'moving';

          // Wait for Angular to update the DOM
          setTimeout(() => {
            if (this.activeIndex !== 3 || this.animationId !== currentAnimId) return;

            // Last (measure new layout) + Invert & Play
            this.serviziRef?.animateTitleFlip(first, () => {
              setTimeout(() => {
                if (this.activeIndex === 3 && this.animationId === currentAnimId) {
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

  private setupWheelListener() {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('wheel', (event: WheelEvent) => {
        if (!(this.activeIndex === 3 && this.serviziStage === 'cards') && !(this.activeIndex === 4 && this.newsStage === 'detail')) {
          return;
        }
        
        event.preventDefault();
        const now = Date.now();
        const isContinuousScroll = (now - this.lastWheelTime) < 150;
        this.lastWheelTime = now;

        if (this.activeIndex === 3) {
          if (this.scrollLock || isContinuousScroll) return;
          this.ngZone.run(() => {
            if (event.deltaY > 0) this.nextServicePage();
            else if (event.deltaY < 0) this.prevServicePage();
          });
        } else if (this.activeIndex === 4) {
          if (this.isNewsAnimating || isContinuousScroll) return;
          if (Math.abs(event.deltaY) > 20) {
            this.ngZone.run(() => {
              if (event.deltaY > 0 && this.activeNewsItemIndex < this.newsItems.length - 1) {
                 this.changeNewsItem(this.activeNewsItemIndex + 1);
              } else if (event.deltaY < 0 && this.activeNewsItemIndex > 0) {
                 this.changeNewsItem(this.activeNewsItemIndex - 1);
              }
            });
          }
        }
      }, { passive: false });
    });
  }

  ngOnInit() {
    this.setupWheelListener();
    this.guideTracker.trackPageView();
    this.loadNews();
    this.loadServices();
    this.loadTags();

    // Protezione/Fallback navigazione
    this.navSettingsService.settings$.subscribe(() => {
      const activeItem = this.menuItems[this.activeIndex];
      if (activeItem && !this.navSettingsService.isItemVisible(activeItem.id)) {
        const firstVisible = this.menuItems.find(m => this.navSettingsService.isItemVisible(m.id));
        if (firstVisible) {
          this.selectMenuItem(firstVisible);
        }
      }
    });

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
    // Passa alla sezione Guide (indice menu 1) e apri la categoria della FAQ.
    this.menuItems.forEach((m, idx) => m.active = (idx === 1));
    this.activeIndex = 1;
    if (catId) {
      setTimeout(() => this.guideRef?.openCat(catId), 0);
    }
  }

  goToInternalLinkFromFaq(linkInfo: {catId: string, guideId: string, faqIdx?: number}) {
    // Navigate to the correct tab and open the guide
    this.menuItems.forEach((m, idx) => m.active = (idx === 1));
    this.activeIndex = 1;
    setTimeout(() => {
      if (this.guideRef) {
        this.guideRef.selCat = linkInfo.catId;
        this.guideRef.openGuide(linkInfo.guideId);
        if (linkInfo.faqIdx !== undefined) {
          this.guideRef.openFaq(linkInfo.faqIdx);
        }
      }
    }, 0);
  }
}
