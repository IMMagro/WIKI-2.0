import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  @ViewChild('contactDropdown') contactDropdown!: ElementRef;
  @ViewChild('serviziTitle') serviziTitle!: ElementRef;
  query = '';
  stage = 0;
  titleVisible = false;
  isDarkMode = false;
  isSidebarExpanded = false;
  isContactOpen = false;
  isAdminRoute = false;
  isAdminAuthenticated = false;

  backgroundImages = [
    'assets/images/office-1.jpg',
    'assets/images/office-2.jpg',
    'assets/images/office-3.jpg'
  ];
  currentBgIndex = 0;
  private bgInterval: any;

  constructor(private eRef: ElementRef) {}

  startBackgroundRotation() {
    this.bgInterval = setInterval(() => {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.backgroundImages.length;
    }, 6000); // Ruota ogni 6 secondi
  }

  exitAdmin() {
    if (this.bgInterval) clearInterval(this.bgInterval);
    this.isAdminRoute = false;
    window.history.pushState({}, '', '/');
  }

  loginAdmin() {
    // For now, simulate a successful login
    this.isAdminAuthenticated = true;
  }

  tags = [
    'Cambio credenziali 730',
    'Invio fatture elettroniche',
    'Inserire un utilizzatore',
    'Backup del database',
    'Configurare la stampante'
  ];

  menuItems = [
    { icon: 'home', label: 'QeHome', active: true },
    { icon: 'book-open', label: 'Manuali', active: false },
    { icon: 'briefcase', label: 'Servizi', active: false },
    { icon: 'folder', label: 'Documenti', active: false },
    { icon: 'newspaper', label: 'News', active: false },
    { icon: 'cog', label: 'Impostazioni', active: false },
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
  homeStage = 0;
  serviziStage: 'title-black' | 'title-blue' | 'moving' | 'cards' = 'title-black';
  currentServicePage = 0;
  isChangingPage = false;
  animatingDirection = 0;
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

  services = [
    { title: "QE Pocket", description: "Con Quaderno Pocket puoi modificare, cancellare e inserire appuntamenti, consultare anamnesi, cartella clinica, fatture, odontogramma, anagrafiche e tutte le informazioni del paziente direttamente dal tuo smartphone.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/pocket.svg", link: "https://www.quadernoelettronico.it/servizi/pocket", color: "from-blue-600 to-blue-400" },
    { title: "Firma Elettronica Wi-Fi", description: "Fai firmare elettronicamente i documenti ai tuoi pazienti su un qualsiasi tablet Wi-Fi.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/firma-wifi.svg", link: "https://www.quadernoelettronico.it/servizi/firma-elettronica-wifi", color: "from-sky-500 to-cyan-400" },
    { title: "Anamnesi online", description: "Rendi il tuo studio tecnologicamente avanzato permettendo ai pazienti di compilare la propria anamnesi sul tablet o comodamente da casa.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/4.svg", link: "https://www.quadernoelettronico.it/servizi/anamnesi_tablet", color: "from-red-600 to-rose-400" },
    { title: "Dashboard", description: "Migliora la gestione e l'analisi del tuo studio odontoiatrico. Con indicatori chiave e grafici intuitivi, avrai un controllo completo sulle performance del tuo studio.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/dashboardbianco.svg", link: "https://www.quadernoelettronico.it/servizi/dashboard", color: "from-purple-600 to-fuchsia-500" },
    { title: "Centro Prenotazioni", description: "Prenotazione appuntamenti direttamente dal sito web del tuo studio. Integrazione con portali di prenotazione appuntamenti.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/centrobianco.svg", link: "https://www.quadernoelettronico.it/servizi/centro-prenotazioni", color: "from-indigo-800 to-blue-900" },
    { title: "Mia, la tua assistente virtuale", description: "Chi risponde al telefono quando lo studio è chiuso? E quando la segreteria è già occupata?", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/mia.svg", link: "https://www.quadernoelettronico.it/servizi/mia-ai", color: "from-pink-600 to-rose-500" },
    { title: "Fotomanager", description: "Importa le immagini in Quaderno direttamente da cellulare o dalla macchina fotografica.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/fotomanager.svg", link: "https://www.quadernoelettronico.it/servizi/fotomanager-importa-da-smartphone-fotocamera", color: "from-emerald-600 to-teal-500" },
    { title: "Importa da TS e CIE", description: "Quaderno Elettronico importa nella scheda del paziente i dati letti direttamente dalla Tessera Sanitaria e anche quelli della CIE (Carta d’Identità Elettronica).", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/tessera.svg", link: "https://www.quadernoelettronico.it/servizi/acquisizione-da-tessera-sanitaria", color: "from-blue-700 to-blue-500" },
    { title: "Servizio SMS", description: "Ricordate gli appuntamenti, le scadenze oppure inviate messaggi istantanei direttamente dal vostro gestionale Quaderno.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/sms.svg", link: "https://www.quadernoelettronico.it/servizi/invio-sms", color: "from-yellow-500 to-amber-400" },
    { title: "Fatturazione Elettronica", description: "Attraverso la pressione del tasto Invia/Ricevi invierai le fatture elettroniche e riceverai quelle dei tuoi fornitori direttamente in Quaderno.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/fatturazione-elettronica.svg", link: "https://www.quadernoelettronico.it/servizi/fatturazione-elettronica", color: "from-orange-500 to-amber-500" },
    { title: "Comunicazione Sistema TS", description: "Invia con un click gli importi delle spese sanitarie sostenute dai tuoi pazienti direttamente all'Agenzia delle Entrate da Quaderno.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/invio-ts.svg", link: "https://www.quadernoelettronico.it/servizi/servizio-ts", color: "from-slate-800 to-slate-600" },
    { title: "Referto FSE 2.0", description: "Invia i referti al Fascicolo Sanitario Elettronico 2.0 direttamente da Quaderno.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/refertofse.svg", link: "https://www.quadernoelettronico.it/servizi/referto-fse", color: "from-cyan-600 to-teal-400" },
    { title: "Servizio Whatsapp", description: "Ricordate gli appuntamenti, inviate messaggi istantanei o condividete i documenti al paziente tramite Whatsapp.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/whatsapp.svg", link: "https://www.quadernoelettronico.it/servizi/whatsapp", color: "from-emerald-500 to-green-400" },
    { title: "Sincronizer Google Calendar", description: "La tua agenda sincronizzata in tempo reale su Smartphone, Tablet e Google Calendar. Condividi l'agenda con i tuoi collaboratori.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/google-calendar.svg", link: "https://www.quadernoelettronico.it/servizi/guida-paziente", color: "from-blue-500 to-indigo-500" },
    { title: "Esportazione dati clinici ed RX", description: "Esporta le Rx ed i dati clinici del paziente su Smart Card, Penne Usb, CD e Mini-CD personalizzati.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/5.svg", link: "https://www.quadernoelettronico.it/servizi/esportazione-usb-dvd", color: "from-slate-700 to-slate-500" },
    { title: "Chi è", description: "Trova automaticamente per te nel Quaderno Elettronico la scheda del paziente che stà chiamando senza il bisogno di eseguire ricerche, subito disponibili appuntamenti e contabilità.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/chie.svg", link: "https://www.quadernoelettronico.it/servizi/chi-e", color: "from-sky-400 to-blue-400" },
    { title: "Backup Immagini - Documenti", description: "Salvataggio dei documenti ed immagini del paziente in modo semplice e veloce.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/backup.svg", link: "https://www.quadernoelettronico.it/servizi/backup-documenti", color: "from-indigo-400 to-purple-400" },
    { title: "Archiviazione Documentale", description: "Risparmia carta archiviando digitalmente i documenti stampati dallo studio.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/documenti.svg", link: "https://www.quadernoelettronico.it/servizi/archiviazione-documentale", color: "from-teal-400 to-emerald-400" },
    { title: "Firma Elettronica", description: "Firma i documenti e falli firmare anche ai tuoi pazienti con la firma elettronica.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/firma.svg", link: "https://www.quadernoelettronico.it/servizi/firma-elettronica", color: "from-blue-500 to-sky-400" },
    { title: "Firma Elettronica Avanzata", description: "Firma i documenti e falli firmare anche ai tuoi pazienti con la Firma Elettronica Avanzata.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/firma-fea.svg", link: "https://www.quadernoelettronico.it/servizi/firma-elettronica-avanzata", color: "from-indigo-500 to-blue-500" },
    { title: "Conformità Elettronica", description: "Invia al medico tutte le conformità firmate elettronicamente da Winodlab tramite l’apposizione della tua firma autografa ed il certificato di firma di Quaderno Elettronico.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/conformita-elettronica.svg", link: "https://www.quadernoelettronico.it/servizi/conformita-elettronica", color: "from-violet-500 to-purple-500" },
    { title: "Openceph", description: "Un programma di Cefalometria Gratuito - Per gentile concessione del Dott. Oliva Bruno, docente all'Universita Cattolica di Roma.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/openceph.svg", link: "https://www.quadernoelettronico.it/servizi/openceph", color: "from-slate-600 to-slate-400" },
    { title: "Controllo errori Segreteria", description: "Quaderno Elettronico è in grado di intercettare errori o anomalie nel proprio gestionale. Tieni lo studio sotto controllo anche in tua assenza.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/controllo-seg.svg", link: "https://www.quadernoelettronico.it/servizi/controllo-segreteria", color: "from-red-500 to-orange-400" },
    { title: "Esportazione programma Contabilità", description: "Trasmissione dei flussi contabili dal Quaderno Elettronico al programma contabile del tuo commercialista.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/esporta.svg", link: "https://www.quadernoelettronico.it/servizi/esportazione-programma-contabilita", color: "from-emerald-500 to-teal-400" },
    { title: "Statistiche e Fatturato online", description: "Analisi, proiezioni e formule per analizzare la tua azienda. Monitorizza l'andamento del tuo fatturato direttamente sul tuo smartphone.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/fatturato.svg", link: "https://www.quadernoelettronico.it/servizi/statistiche-fatturato-on-line", color: "from-sky-500 to-blue-500" },
    { title: "Fidelity", description: "Gestione fidelity card tramite punti raccolti (basati su fatturato o eseguito). Gestione e moduli di soddisfazione (anonimi o meno) del paziente.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/fidelity.svg", link: "https://www.quadernoelettronico.it/servizi/fidelity-card", color: "from-pink-500 to-rose-400" },
    { title: "Tracciabilità", description: "Controllate da chi sono stati modificati i dati del programma, mostrando anche le modifiche effettuate.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/eye.svg", link: "https://www.quadernoelettronico.it/servizi/tracciabilita", color: "from-gray-500 to-slate-400" },
    { title: "Accesso Contactless/NFC", description: "Accedi a Quaderno Elettronico con strumenti di accesso wireless senza toccare la tastiera.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/nfc.svg", link: "https://www.quadernoelettronico.it/servizi/nfc", color: "from-blue-600 to-indigo-600" },
    { title: "SQRIVO - Tu parli ed io scrivo", description: "Parla a Quaderno Elettronico per compilare il diario clinico e molto altro ancora.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/sqrivo.svg", link: "https://www.quadernoelettronico.it/servizi/sqrivo", color: "from-violet-600 to-purple-600" },
    { title: "Gestione sala d'attesa", description: "Visualizza le Code di Appuntamenti e la chiamata del paziente su schermo in sala d'attesa.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/sala.svg", link: "https://www.quadernoelettronico.it/servizi/gestione-sala-attesa", color: "from-orange-400 to-amber-300" },
    { title: "Interfacciamento Doctolib", description: "Sincronizza l'agenda di Quaderno Elettronico con il portale di visibilità Doctolib e gestisci tutto in un unico gestionale in modo facile e veloce.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/doctolib.svg", link: "https://www.quadernoelettronico.it/servizi/doctolib", color: "from-cyan-500 to-blue-400" },
    { title: "Prescrizioni online", description: "Ricevi le prescrizioni degli studi online ed inserisci automaticamente i lavori.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/prescrizioni-online.svg", link: "https://www.quadernoelettronico.it/servizi/prescrizioni-online", color: "from-blue-400 to-indigo-400" },
    { title: "Interfacciamento Miodottore", description: "Sincronizza l'agenda di Quaderno Elettronico con il portale di visibilità Miodottore e gestisci tutto in un unico gestionale in modo facile e veloce.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/miodottore.svg", link: "https://www.quadernoelettronico.it/servizi/miodottore", color: "from-emerald-400 to-green-400" },
    { title: "Interfacciamento Cupsolidale", description: "Sincronizza l'agenda di Quaderno Elettronico con il portale di visibilità Cupsolidale e gestisci tutto in un unico gestionale in modo facile e veloce.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/cupsolidale.svg", link: "https://www.quadernoelettronico.it/servizi/cupsolidale", color: "from-rose-500 to-red-400" },
    { title: "API 1.0/2.0", description: "Il connettore prevede l'accesso e la sincronizzazione ai dati di Quaderno: Agenda, Prestazioni agendabili e Pazienti.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/API.svg", link: "https://www.quadernoelettronico.it/servizi/api", color: "from-slate-800 to-gray-700" },
    { title: "Idoctors", description: "Sincronizza l'agenda di Quaderno Elettronico con il portale di visibilità Idoctors e gestisci tutto in un unico gestionale in modo facile e veloce.", image: "https://www.quadernoelettronico.it/librerie/qe/img/add-on/idoctors.svg", link: "https://www.quadernoelettronico.it/servizi/idoctors", color: "from-sky-500 to-blue-500" }
  ];

  // --- DOCUMENTI 3D CAROUSEL ---
  documents = [
    { title: 'Manuale Utente 2026', type: 'PDF', size: '2.4 MB', date: '10 Ago 2026', desc: 'Guida completa all\'utilizzo del software gestionale.' },
    { title: 'Modulo Privacy', type: 'DOCX', size: '1.1 MB', date: '05 Ago 2026', desc: 'Informativa sul trattamento dei dati personali (GDPR).' },
    { title: 'Listino Prezzi', type: 'XLSX', size: '0.8 MB', date: '01 Ago 2026', desc: 'Prezzario ufficiale per le prestazioni odontoiatriche.' },
    { title: 'Certificazione CE', type: 'PDF', size: '4.5 MB', date: '15 Lug 2026', desc: 'Dichiarazione di conformità del dispositivo medico.' },
    { title: 'Manuale Integrazione TS', type: 'PDF', size: '3.2 MB', date: '10 Lug 2026', desc: 'Specifiche tecniche per l\'invio al Sistema TS.' },
    { title: 'Consenso Informato', type: 'DOCX', size: '0.5 MB', date: '05 Lug 2026', desc: 'Modello standard per il consenso alle cure.' },
    { title: 'Brochure Servizi', type: 'PDF', size: '5.1 MB', date: '01 Lug 2026', desc: 'Presentazione dei servizi aggiuntivi e add-on.' },
    { title: 'Guida Fatturazione', type: 'PDF', size: '2.9 MB', date: '20 Giu 2026', desc: 'Gestione della fatturazione elettronica.' },
    { title: 'Note di Rilascio v5.2', type: 'TXT', size: '0.1 MB', date: '15 Giu 2026', desc: 'Changelog completo dell\'ultimo aggiornamento.' },
    { title: 'Template Referto', type: 'DOCX', size: '0.6 MB', date: '10 Giu 2026', desc: 'Modello per la refertazione medica.' },
    { title: 'Report Statistiche', type: 'XLSX', size: '1.4 MB', date: '01 Giu 2026', desc: 'Esempio di report esportabile dalla dashboard.' },
    { title: 'Manuale Backup', type: 'PDF', size: '1.8 MB', date: '25 Mag 2026', desc: 'Istruzioni per il salvataggio in cloud.' }
  ];

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
  docTitleLetters = 'Documenti'.split('');
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
      if (prevLabel === 'QeHome') {
        this.homeStage = 0;
      } else if (prevLabel === 'Servizi') {
        this.serviziStage = 'title-black';
        this.currentServicePage = 0;
        this.animatingDirection = 0;
      } else if (prevLabel === 'Documenti') {
        this.docEntranceStage = 'center';
      } else if (prevLabel === 'News') {
        this.newsStage = 'title-black';
      }
    }, 700);

    // Reset for new entrance
    if (selectedItem.label === 'QeHome') {
      this.homeStage = 0;
    } else if (selectedItem.label === 'Servizi') {
      this.serviziStage = 'title-black';
      this.animatingDirection = 0;
    } else if (selectedItem.label === 'Documenti') {
      this.docEntranceStage = 'center';
      setTimeout(() => {
        this.docEntranceStage = 'moving';
        setTimeout(() => {
          this.docEntranceStage = 'content';
        }, 800);
      }, 1200);
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
              if (this.activeIndex === 2 && this.animationId === currentAnimId) {
                this.serviziStage = 'cards';
              }
            };
            
          }, 0);
        }, 500);
      }, 800);
    } else if (pageLabel === 'News') {
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
  
  newsItems = [
    { title: "Note di Rilascio e Novità", date: "15 Agosto 2026", description: "Questo è un testo di prova posizionato nello spazio vuoto. In quest'area verranno caricati dinamicamente gli articoli, i dettagli degli ultimi aggiornamenti e le comunicazioni." },
    { title: "Integrazione Fascicolo Sanitario 2.0", date: "10 Agosto 2026", description: "La nuova versione introduce un supporto completo e automatico al FSE 2.0, migliorando drasticamente i tempi di invio dei referti e la validazione dei dati sanitari inviati." },
    { title: "Nuovo Modulo Statistiche Avanzate", date: "5 Agosto 2026", description: "Abbiamo introdotto una dashboard interattiva migliorata che permette di filtrare i dati storici del fatturato con algoritmi predittivi per i prossimi trimestri." },
    { title: "Aggiornamento Sicurezza e Privacy", date: "1 Agosto 2026", description: "Migliorati i protocolli di crittografia per i dati sensibili. Aggiunto supporto nativo per l'autenticazione a due fattori obbligatoria per gli amministratori di sistema." }
  ];

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
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path === '/admin' || hash.includes('/admin')) {
      this.isAdminRoute = true;
      this.startBackgroundRotation();
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
}
