import { Component, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideComponent } from './components/guide/guide.component';
import { GuideService } from './services/guide.service';
import { GuideAdminComponent } from './components/guide/guide-admin.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  activeFaqCategory: string = 'General';
  @ViewChild('contactDropdown') contactDropdown!: ElementRef;
  @ViewChild('notificationDropdown') notificationDropdown!: ElementRef;
  @ViewChild('homeSearchContainer') homeSearchContainer!: ElementRef;
  @ViewChild('serviziTitle') serviziTitle!: ElementRef;
  query = '';
  stage = 0;
  titleVisible = false;
  isDarkMode = false;
  isSidebarExpanded = false;
  isContactOpen = false;
  isAdminRoute = false;
  isAdminAuthenticated = false;
  activeAdminTab: 'dashboard' | 'manuals' | 'news' | 'server' | 'users' | 'settings' = 'dashboard';
  private _globalAnimationsEnabled: boolean = localStorage.getItem('globalAnimationsEnabled') ? JSON.parse(localStorage.getItem('globalAnimationsEnabled')!) : false;

  get globalAnimationsEnabled(): boolean {
    // Rilegge sempre da localStorage così il toggle nel pannello admin
    // si riflette subito sul sito senza ricostruire il componente.
    const v = localStorage.getItem('globalAnimationsEnabled');
    this._globalAnimationsEnabled = v ? JSON.parse(v) : false;
    return this._globalAnimationsEnabled;
  }

  set globalAnimationsEnabled(value: boolean) {
    this._globalAnimationsEnabled = value;
    localStorage.setItem('globalAnimationsEnabled', JSON.stringify(value));
  }
  manualsDesignVariant: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
  selectedManualStats: any = null;
  isStatsPanelOpen = false;
  isUploadModalOpen = false;
  isNotificationOpen = false;
  adminNotifications: any[] = [];
  // TODO: Popolare tramite chiamata HTTP al backend (es. /api/get_notifications.ashx)

  // -- AUTH --
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;
  // ----------

  // -- ADMIN FILTERS --
  adminSearchQuery: string = '';
  adminCategoryFilter: string = '';
  adminStatusFilter: string = '';
  isAdminFilterMenuOpen: boolean = false;

  get filteredAdminDocuments() {
    let result = this.documents || [];
    
    if (this.adminSearchQuery.trim() !== '') {
      const q = this.adminSearchQuery.toLowerCase();
      result = result.filter(doc => 
        (doc.title && doc.title.toLowerCase().includes(q)) || 
        (doc.id && doc.id.toLowerCase().includes(q)) ||
        (doc.category && doc.category.toLowerCase().includes(q))
      );
    }
    
    if (this.adminCategoryFilter !== '') {
      result = result.filter(doc => doc.category === this.adminCategoryFilter);
    }
    
    if (this.adminStatusFilter !== '') {
      result = result.filter(doc => {
        const s = doc.status || 'Pubblicato';
        return s.toLowerCase() === this.adminStatusFilter.toLowerCase();
      });
    }
    
    return result;
  }
  // -------------------

  openManualStats(title: string) {
    this.selectedManualStats = {
      title: title,
      views: 1245,
      downloads: 853,
      avgReadTime: '4m 12s',
      rating: 4.8
    };
    setTimeout(() => this.isStatsPanelOpen = true, 10);
  }

  closeManualStats() {
    this.isStatsPanelOpen = false;
    setTimeout(() => this.selectedManualStats = null, 300);
  }

  openUploadModal() {
    this.isUploadModalOpen = true;
  }

  closeUploadModal() {
    this.isUploadModalOpen = false;
  }

  backgroundImages = [
    '/assets/images/quaderno-bg-left-logo.jpg'
  ];
  currentBgIndex = 0;
  private bgInterval: any;

  @ViewChild(GuideComponent) guideRef?: GuideComponent;

  constructor(private eRef: ElementRef, private cdr: ChangeDetectorRef, private http: HttpClient, public guideService: GuideService) {}

  /**
   * Elenco appiattito di TUTTE le FAQ reali (da GuideService), nella forma attesa
   * dalla modale di lettura: { id, category, color, desc (=guida), title (=domanda), steps, service }.
   * È la sorgente unica per la ricerca in home e per la pagina FAQ, così il contenuto
   * (step, servizio) è lo stesso che si legge nella sezione Guide.
   */
  get allFaqItems(): any[] {
    const out: any[] = [];
    const cats = this.guideService.categories || [];
    cats.forEach((c: any, ci: number) => {
      const color = c.accent === 'magenta' ? 'from-fuchsia-500 to-pink-400' : 'from-blue-500 to-sky-400';
      (c.manuals || []).forEach((g: any, mi: number) => {
        (g.faqs || []).forEach((f: any, fi: number) => {
          out.push({
            id: ci * 10000 + mi * 100 + fi,
            category: c.name,
            categoryId: c.id,
            guideId: g.id,
            faqIndex: fi,
            color,
            desc: g.title,
            title: f.q,
            steps: f.steps || [],
            tags: f.tags || [],
            service: f.service || g.service || null
          });
        });
      });
    });
    return out;
  }

  readFaqs: Set<number> = new Set<number>();

  markFaqAsRead(id: number) {
    if (id && !this.readFaqs.has(id)) {
      this.readFaqs.add(id);
      localStorage.setItem('qe_read_faqs', JSON.stringify(Array.from(this.readFaqs)));
    }
  }

  isFaqRead(id: number): boolean {
    return this.readFaqs.has(id);
  }

  // --- ADMIN MOCK DATA CLEANUP ---
  // TODO: Popolare tramite chiamate HTTP al backend
  adminNews: any[] = [];
  adminDashboardStats: any = null; // conterrà { onlineUsers, mapNodes, weeklyAccess, storageUsage, searchStats }
  adminServerStats: any = null; // conterrà { cpu, ram, storage, uptime }
  adminServerServices: any[] = [];
  adminServerLogs: any[] = [];
  // -------------------------------

  startBackgroundRotation() {
    this.bgInterval = setInterval(() => {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.backgroundImages.length;
    }, 6000); // Ruota ogni 6 secondi
  }

  stopBackgroundRotation() {
    if (this.bgInterval) {
      clearInterval(this.bgInterval);
      this.bgInterval = null;
    }
  }

  // Uscita dalla modalità admin
  exitAdmin() {
    this.isAdminRoute = false;
    this.stopBackgroundRotation();
    window.location.href = '/';
  }

  isLocalhost = window.location.hostname === 'localhost';

  goToAdmin() {
    this.isAdminRoute = true;
    this.startBackgroundRotation();
    if (this.isLocalhost) {
      // Accesso diretto e dati mock per localhost per evitare loop 404
      this.isAdminAuthenticated = true;
      this.adminDashboardStats = {
        onlineUsers: 24,
        mapNodes: [
          { name: 'Milano-01', users: 8, x: 72, y: 52, color: '#377DFF', gradientId: '#heatBlue', glowRadius: 6, pointRadius: 4 },
          { name: 'Torino-01', users: 4, x: 45, y: 62, color: '#377DFF', gradientId: '#heatBlue', glowRadius: 5, pointRadius: 4 },
          { name: 'Venezia-01', users: 3, x: 128, y: 58, color: '#F80086', gradientId: '#heatMagenta', glowRadius: 5, pointRadius: 4 },
          { name: 'Firenze-01', users: 5, x: 115, y: 112, color: '#377DFF', gradientId: '#heatBlue', glowRadius: 5, pointRadius: 4 },
          { name: 'Roma-02', users: 6, x: 140, y: 165, color: '#F80086', gradientId: '#heatMagenta', glowRadius: 6, pointRadius: 4 }
        ],
        weeklyAccess: [
          { day: 'Lun', x1: 45,  y1: 85,  h1: 105, x2: 65,  y2: 115, h2: 75,  isCurrent: false },
          { day: 'Mar', x1: 107, y1: 107, h1: 83,  x2: 127, y2: 130, h2: 60,  isCurrent: false },
          { day: 'Mer', x1: 169, y1: 47,  h1: 143, x2: 189, y2: 77,  h2: 113, isCurrent: true },
          { day: 'Gio', x1: 231, y1: 130, h1: 60,  x2: 251, y2: 145, h2: 45,  isCurrent: false },
          { day: 'Ven', x1: 293, y1: 62,  h1: 128, x2: 313, y2: 92,  h2: 98,  isCurrent: false },
          { day: 'Sab', x1: 355, y1: 145, h1: 45,  x2: 375, y2: 157, h2: 33,  isCurrent: false },
          { day: 'Dom', x1: 417, y1: 160, h1: 30,  x2: 437, y2: 167, h2: 23,  isCurrent: false }
        ],
        trendlineData: 'M53 85 L115 107 L177 47 L239 130 L301 62 L363 145 L425 160',
        storageUsage: { manualsPct: 45, mediaPct: 35, totalPct: 80 },
        searchStats: { total: 12.5, suffix: 'k', trend: 12, topKeywords: ['Fatturazione', 'TS', 'Agenda', 'Backup'] }
      };
      this.adminServerStats = {
        cpu: 32, ramTotal: 16, ramUsed: 8.5, storageTotal: 2, storageUsed: 800,
        uptimeDays: 45, uptimeTime: '12:30:45'
      };
      this.adminServerServices = [
        { name: 'Database Engine', status: 'online', memory: '450MB' },
        { name: 'API Server', status: 'online', memory: '1.2GB' },
        { name: 'Background Jobs', status: 'warning', memory: '850MB' }
      ];
      this.adminServerLogs = [
        '[INFO] Servizio avviato correttamente.',
        '[WARN] Utilizzo memoria oltre la soglia (85%).'
      ];
      this.adminNews = [
        { title: 'Aggiornamento Sistema TS 2.0 completato', date: 'Oggi', category: 'Sistema' }
      ];
      this.adminNotifications = [
        { message: 'Nuovo backup generato con successo', time: '10 min fa' }
      ];
    } else {
      const savedToken = sessionStorage.getItem('adminToken');
      if (savedToken) {
        this.isAdminAuthenticated = true;
        this.loadAdminData();
      }
    }
  }

  loginAdmin() {
    this.loginError = '';
    
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Inserisci email e password';
      return;
    }
    
    this.loginLoading = true;
    
    this.http.post<any>('/api/login.ashx', { 
      email: this.loginEmail, 
      password: this.loginPassword 
    }).subscribe({
      next: (res) => {
        this.loginLoading = false;
        if (res.success && res.token) {
          sessionStorage.setItem('adminToken', res.token);
          this.isAdminAuthenticated = true;
          this.loadAdminData();
        }
      },
      error: (err) => {
        this.loginLoading = false;
        this.loginError = err.error?.error || 'Credenziali non valide o errore di rete';
      }
    });
  }
  onLoginSuccess() {
    this.isAdminAuthenticated = true;
    this.loadAdminData();
  }

  logoutAdmin() {
    this.isAdminAuthenticated = false;
    sessionStorage.removeItem('adminToken');
    this.loginEmail = '';
    this.loginPassword = '';
  }

  tags: string[] = [];
  // TODO: Popolare tramite chiamata HTTP al backend (es. /api/get_popular_tags.ashx)

  publicManuals = [
    { id: 1, title: '🦷 Gestione Pazienti e Cartella Clinica', category: 'Generale', desc: 'Guida completa su come inserire, modificare e cercare pazienti nel database, inclusa la gestione dell\'anamnesi.', featured: true, color: 'from-blue-500 to-sky-400' },
    { id: 2, title: '💸 Fatturazione Elettronica B2B', category: 'Fatturazione', desc: 'Come emettere fatture, note di credito e gestire l\'invio automatico allo SDI.', featured: false, color: 'from-green-500 to-emerald-400' },
    { id: 3, title: '📅 Agenda e Appuntamenti', category: 'Setup', desc: 'Configurazione degli orari dello studio, colori delle prestazioni e sincronizzazione con Google Calendar.', featured: false, color: 'from-purple-500 to-fuchsia-400' },
    { id: 4, title: '⚙️ Configurazione Sistema TS', category: 'Setup', desc: 'Invia con un click gli importi delle spese sanitarie sostenute dai tuoi pazienti.', featured: true, color: 'from-orange-500 to-amber-400' },
    { id: 5, title: '📸 Modulo Fotomanager', category: 'Generale', desc: 'Importa e gestisci le foto radiografiche direttamente dallo smartphone.', featured: false, color: 'from-rose-500 to-red-400' },
    { id: 6, title: '🤖 Assistente Virtuale Mia', category: 'Premium', desc: 'Impostazione delle risposte automatiche per l\'assistente vocale.', featured: false, color: 'from-indigo-500 to-blue-500' }
  ];

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
    if (this.isNotificationOpen && this.notificationDropdown && !this.notificationDropdown.nativeElement.contains(event.target)) {
      this.isNotificationOpen = false;
    }
    if (this.isHomeSearchOpen && this.homeSearchContainer && !this.homeSearchContainer.nativeElement.contains(event.target)) {
      this.isHomeSearchOpen = false;
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

  // -- HOME SPOTLIGHT SEARCH --
  homeSearchQuery: string = '';
  isHomeSearchOpen: boolean = false;

  get homeSearchResults() {
    if (!this.homeSearchQuery || this.homeSearchQuery.trim() === '') {
      return [];
    }
    const q = this.homeSearchQuery.toLowerCase();
    // Cerca sulle singole FAQ reali (domanda + guida + categoria + tag + testo step). Max 5.
    return this.allFaqItems.filter(doc =>
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.desc && doc.desc.toLowerCase().includes(q)) ||
      (doc.category && doc.category.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.join(' ').toLowerCase().includes(q)) ||
      (doc.steps && doc.steps.map((s: any) => s.t).join(' ').toLowerCase().includes(q))
    ).slice(0, 5);
  }

  onHomeSearchFocus() {
    if (this.homeSearchQuery.trim() !== '') {
      this.isHomeSearchOpen = true;
    }
  }

  onHomeSearchInput() {
    this.isHomeSearchOpen = this.homeSearchQuery.trim() !== '';
  }

  openFaqFromHome(faq: any) {
    this.homeSearchQuery = '';
    this.isHomeSearchOpen = false;
    
    // Apre la FAQ in modalità sidepage (Variante C) e rimane nella home
    this.readingDesignVariant = 'C';
    this.selectedFaq = faq;
    if (faq && faq.id) this.markFaqAsRead(faq.id);
    document.body.style.overflow = 'hidden';
  }

  goToAllFaqs() {
    this.closeFaq();
    
    // Switch to manuali view
    this.menuItems.forEach((m, idx) => m.active = (idx === 1)); // Set FAQ tab active
    this.activeIndex = 1;
    
    // Salta l'animazione e vai direttamente al contenuto per un'apertura immediata
    this.manualiStage = 'content';
  }

  // -- FAQ SEARCH --
  faqSearchQuery: string = '';
  selectedFaq: any = null;
  readingDesignVariant: 'A' | 'B' | 'C' | 'D' = 'A';

  openFaq(faq: any) {
    this.readingDesignVariant = 'C'; // Apertura come pannello laterale (destra), coerente con la ricerca in home
    this.selectedFaq = faq;
    if (faq && faq.id) this.markFaqAsRead(faq.id);
    document.body.style.overflow = 'hidden'; // Blocca lo scroll di sfondo
  }

  closeFaq() {
    this.selectedFaq = null;
    document.body.style.overflow = 'auto'; // Ripristina lo scroll
  }

  // -- FAQ STATS --
  isFaqStatsModalOpen = false;

  getReadCount(): number {
    const all = this.allFaqItems;
    return all.filter(d => this.isFaqRead(d.id)).length;
  }

  getUnreadCount(): number {
    return this.allFaqItems.length - this.getReadCount();
  }

  getReadPercentage(): number {
    const total = this.allFaqItems.length;
    if (total === 0) return 0;
    return (this.getReadCount() / total) * 100;
  }

  getPieGradient(): string {
    const p = this.getReadPercentage();
    const bg = this.isDarkMode ? '#334155' : '#E2E8F0'; // slate-700 or slate-200
    return `conic-gradient(#10B981 ${p}%, ${bg} ${p}%)`;
  }


  get filteredFAQ() {
    const all = this.allFaqItems;
    if (!this.faqSearchQuery || this.faqSearchQuery.trim() === '') {
      return all;
    }
    const q = this.faqSearchQuery.toLowerCase();
    return all.filter(doc =>
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.desc && doc.desc.toLowerCase().includes(q)) ||
      (doc.category && doc.category.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.join(' ').toLowerCase().includes(q))
    );
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
    this.http.get<any[]>('/api/news.ashx').subscribe({
      next: (data) => {
        this.allNews = data || [];
        const generalNews = this.allNews.filter(n => n.category === 'Generale');
        if (generalNews.length > 0) {
          this.latestGeneralNews = generalNews[0];
          // Mostra il popup una sola volta: se già visto, resta disponibile solo l'iconcina.
          if (!localStorage.getItem(this.generalNewsSeenKey())) {
            this.showGeneralNewsPopup = true;
          }
        }
        this.updateProgramNews();
      },
      error: (err) => console.error('Errore caricamento news:', err)
    });
  }

  updateProgramNews() {
    const programName = this.programs[this.activeProgramIndex].name;
    this.newsItems = this.allNews.filter(n => n.category === programName);
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

  // --- DOCUMENTI 3D CAROUSEL ---
  documents: any[] = [];
  // TODO: Popolare tramite chiamata HTTP al backend (es. /api/get_manuals.ashx)
  loadDocuments() {
    this.http.get<any[]>('/api/get_manuals.ashx').subscribe({
      next: (data) => {
        this.documents = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei manuali:', err);
      }
    });
  }

  // TODO: Implementare funzioni per caricare i dati delle altre sezioni Admin
  loadAdminData() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get<any>('/api/get_admin_dashboard.ashx', { headers }).subscribe({
      next: (data) => this.adminDashboardStats = data,
      error: () => this.handleAuthError()
    });
    
    this.http.get<any[]>('/api/get_admin_news.ashx', { headers }).subscribe({
      next: (data) => this.adminNews = data,
      error: () => this.handleAuthError()
    });
    
    this.loadNotifications();
    
    this.http.get<any>('/api/get_admin_server.ashx', { headers }).subscribe({
      next: (data) => {
        this.adminServerStats = data.stats;
        this.adminServerServices = data.services;
        this.adminServerLogs = data.logs;
      },
      error: () => this.handleAuthError()
    });
  }

  handleAuthError() {
    this.isAdminAuthenticated = false;
    sessionStorage.removeItem('adminToken');
    this.loginError = 'Sessione scaduta o non valida.';
  }
  
  loadNotifications() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    this.http.get<any[]>('/api/get_notifications.ashx', { headers }).subscribe({
      next: (data) => this.adminNotifications = data,
      error: () => console.error('Errore nel caricamento notifiche')
    });
  }

  docAngleStep = 30; // 360 / 12 items
  docRadius = 400; // Radius of the cylinder
  docTargetRotation = 0;
  docCurrentRotation = 0;
  docActiveIndex = 0;
  docAnimationId: number | null = null;
  hoveredDocIndex: number | null = null;
  isReadingMode: boolean = false;
  
  documentSearchQuery: string = '';
  isSearchExpanded: boolean = false;
  docTitleLetters = 'Manuali'.split('');
  docEntranceStage: 'center' | 'moving' | 'content' = 'center';

  toggleSearch() {
    this.isSearchExpanded = true;
    // Timeout needed to allow the input to render before focusing
    setTimeout(() => {
      const input = document.getElementById('docSearchInput');
      if (input) input.focus();
    }, 100);
  }

  closeSearch() {
    if (!this.documentSearchQuery.trim()) {
      this.isSearchExpanded = false;
    }
  }

  onDocumentSearch() {
    if (!this.documentSearchQuery.trim()) return;
    
    const query = this.documentSearchQuery.toLowerCase();
    const matchIndex = this.documents.findIndex(d => 
      d.title.toLowerCase().includes(query) || d.desc.toLowerCase().includes(query)
    );

    if (matchIndex !== -1 && matchIndex !== this.docActiveIndex) {
      // Calcoliamo lo scostamento circolare più breve
      const diff = matchIndex - this.docActiveIndex;
      let rotationsToMove = diff;
      
      // Se è più veloce girare dall'altra parte
      if (Math.abs(diff) > this.documents.length / 2) {
        rotationsToMove = diff > 0 ? diff - this.documents.length : diff + this.documents.length;
      }
      
      this.docTargetRotation -= rotationsToMove * this.docAngleStep;
      this.updateDocActiveIndex();
      this.startDocAnimation();
    }
  }
  // -----------------------------
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
      } else if (prevLabel === 'Guide' && this.activeIndex !== 3) {
        this.docEntranceStage = 'center';
      } else if (prevLabel === 'News' && this.activeIndex !== 4) {
        this.newsStage = 'title-black';
      }
    }, 700);

    // Reset for new entrance
    if (selectedItem.label === 'QeHome') {
      this.homeStage = 0;
    } else if (selectedItem.label === 'FAQ') {
      if (!this.globalAnimationsEnabled) {
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
    } else if (selectedItem.label === 'Guide') {
      if (!this.globalAnimationsEnabled) {
        this.docEntranceStage = 'content';
      } else {
        this.docEntranceStage = 'center';
        setTimeout(() => {
          this.docEntranceStage = 'moving';
          setTimeout(() => {
            this.docEntranceStage = 'content';
          }, 800);
        }, 1200);
      }
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
      if (!this.globalAnimationsEnabled) {
        this.serviziStage = 'cards';
        return;
      }
      
      // Step 1: Color it blue after 800ms
      this.pageTimeout = setTimeout(() => {
        if (this.activeIndex !== 2 || this.animationId !== currentAnimId) return;
        this.serviziStage = 'title-blue';
        
        // Step 2: Move to top left after 500ms using JS FLIP for 60fps
        setTimeout(() => {
          if (this.activeIndex !== 2 || this.animationId !== currentAnimId) return;
          
          // First (measure)
          const el = this.serviziTitle?.nativeElement;
          if (!el) {
            this.serviziStage = 'moving';
            setTimeout(() => { if (this.activeIndex === 2 && this.animationId === currentAnimId) this.serviziStage = 'cards'; }, 800);
            return;
          }
          
          const first = el.getBoundingClientRect();
          
          // Mutate (change layout class)
          this.serviziStage = 'moving';
          
          // Wait for Angular to update the DOM
          setTimeout(() => {
            if (this.activeIndex !== 2 || this.animationId !== currentAnimId) return;
            
            // Last (measure new layout)
            const last = el.getBoundingClientRect();
            
            // Invert & Play
            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const sx = first.width / last.width;
            const sy = first.height / last.height;
            
            el.animate([
              { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
              { transformOrigin: 'top left', transform: 'none' }
            ], {
              duration: 800,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
            }).onfinish = () => {
              setTimeout(() => {
                if (this.activeIndex === 2 && this.animationId === currentAnimId) {
                  this.serviziStage = 'cards';
                  this.cdr.detectChanges();
                }
              });
            };
            
          }, 0);
        }, 500);
      }, 800);
    } else if (pageLabel === 'News') {
      if (!this.globalAnimationsEnabled) {
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

  getCardAnimation(index: number): string {
    if (this.activeIndex !== 2 || this.serviziStage !== 'cards') return 'none';
    
    const baseDuration = '0.7s';
    const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const delay = (index * 40) + 'ms';
    const forwards = 'forwards';

    if (this.isChangingPage) {
      if (this.animatingDirection === 1) {
        return `fadeLeftOut ${baseDuration} ${easing} ${delay} ${forwards}`;
      } else {
        return `fadeRightOut ${baseDuration} ${easing} ${delay} ${forwards}`;
      }
    } else {
      if (this.animatingDirection === 1) {
        return `fadeRightIn ${baseDuration} ${easing} ${delay} ${forwards}`;
      } else if (this.animatingDirection === -1) {
        return `fadeLeftIn ${baseDuration} ${easing} ${delay} ${forwards}`;
      } else {
        // Default entrance (animatingDirection === 0)
        return `fadeUpCard 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index * 40)}ms forwards`;
      }
    }
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
  
  allNews: any[] = [];
  latestGeneralNews: any = null;
  showGeneralNewsPopup: boolean = false;

  private generalNewsSeenKey(): string {
    return 'seenGeneralNews:' + (this.latestGeneralNews?.title || '');
  }

  openGeneralNewsPopup() {
    if (this.latestGeneralNews) this.showGeneralNewsPopup = true;
  }

  closeGeneralNewsPopup() {
    this.showGeneralNewsPopup = false;
    if (this.latestGeneralNews) {
      localStorage.setItem(this.generalNewsSeenKey(), '1');
    }
  }

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
    if (this.activeIndex === 3) {
      if (this.isReadingMode) {
        // If reading, allow native scroll inside the expanded popup
        return;
      }
      event.preventDefault();
      // Increase/decrease target rotation based on scroll direction
      this.docTargetRotation += event.deltaY > 0 ? -this.docAngleStep : this.docAngleStep;
      this.updateDocActiveIndex();
      this.startDocAnimation();
      return;
    }

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

  updateDocActiveIndex() {
    let rotations = Math.round(this.docTargetRotation / this.docAngleStep);
    let idx = (-rotations) % this.documents.length;
    if (idx < 0) idx += this.documents.length;
    this.docActiveIndex = idx;
  }

  docPopupStage = 2; // 0: hidden, 1: drawing line, 2: popup visible
  private docPopupTimeout: any = null;

  startDocAnimation() {
    // Hide popup and line when wheel starts moving
    this.docPopupStage = 0;
    if (this.docPopupTimeout) {
      clearTimeout(this.docPopupTimeout);
    }

    if (!this.docAnimationId) {
      const animate = () => {
        const diff = this.docTargetRotation - this.docCurrentRotation;
        if (Math.abs(diff) < 0.1) {
          this.docCurrentRotation = this.docTargetRotation;
          this.docAnimationId = null;
          
          // When rotation finishes, trigger the line drawing
          this.docPopupStage = 1;
          this.docPopupTimeout = setTimeout(() => {
            // After 300ms (line drawing duration), show the popup
            this.docPopupStage = 2;
          }, 400);

        } else {
          this.docCurrentRotation += diff * 0.12; // Smooth lerp
          this.docAnimationId = requestAnimationFrame(animate);
        }
      };
      this.docAnimationId = requestAnimationFrame(animate);
    }
  }

  getDocTransform(i: number): string {
    const angle = i * this.docAngleStep + this.docCurrentRotation;
    return `rotateX(${angle}deg) translateZ(${this.docRadius}px)`;
  }

  toggleReadingMode() {
    this.isReadingMode = !this.isReadingMode;
  }

  getDocStyles(index: number) {
    // Calculate the shortest distance on the cylinder
    let distance = Math.abs(index - this.docActiveIndex);
    if (distance > this.documents.length / 2) {
      distance = this.documents.length - distance;
    }
    
    if (distance === 0) {
      return { 'opacity': '1', 'filter': 'none' };
    } else if (distance === 1) {
      return { 'opacity': '0.6', 'filter': 'blur(2px)' };
    } else {
      return { 'opacity': '0.15', 'filter': 'blur(5px)' };
    }
  }


  ngOnInit() {
    this.loadNews();
    this.loadDocuments();
    this.loadServices();
    this.loadTags();
    
    // Inizializza FAQs lette da localStorage
    const storedReads = localStorage.getItem('qe_read_faqs');
    if (storedReads) {
      try {
        const parsed = JSON.parse(storedReads);
        if (Array.isArray(parsed)) {
          this.readFaqs = new Set<number>(parsed);
        }
      } catch (e) {}
    }
    
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path === '/admin' || hash.includes('/admin')) {
      this.isAdminRoute = true;
      this.startBackgroundRotation();
      
      const savedToken = sessionStorage.getItem('adminToken');
      if (savedToken) {
        this.isAdminAuthenticated = true;
        this.loadAdminData();
      }
    }

    this.triggerPageAnimation('QeHome');
    // Check initial theme preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Il titolo appare in fade in morbido appena la pagina carica
    setTimeout(() => {
      this.titleVisible = true;
    }, 100);

    // Dopo 3 secondi scatta la fase 2 della coreografia
    setTimeout(() => {
      this.stage = 1;
    }, 3000);
  }

  toggleTheme(event: MouseEvent | null, forceDark?: boolean) {
    const isDark = forceDark !== undefined ? forceDark : !this.isDarkMode;
    if (this.isDarkMode === isDark) return;

    if (!('startViewTransition' in document)) {
      this.applyTheme(isDark);
      return;
    }

    const x = event ? event.clientX : window.innerWidth * 0.05;
    const y = event ? event.clientY : window.innerHeight * 0.95;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) + 150; // Aumento ulteriore del margine

    const transition = (document as any).startViewTransition(() => {
      this.applyTheme(isDark);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
        ],
        {
          duration: 700, // Più veloce e reattiva (0.7s invece di 1s)
          easing: 'ease-out',
          fill: 'forwards', // FONDAMENTALE: impedisce il reset del clip-path alla fine dell'animazione
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  }

  private applyTheme(isDark: boolean) {
    this.isDarkMode = isDark;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  goToCategoryFromFaq() {
    const catId = this.selectedFaq?.categoryId;
    this.closeFaq();
    // Passa alla sezione Guide (indice menu 3) e apri la categoria della FAQ.
    this.menuItems.forEach((m, idx) => m.active = (idx === 3));
    this.activeIndex = 3;
    if (catId) {
      setTimeout(() => this.guideRef?.openCat(catId), 0);
    }
  }
}
