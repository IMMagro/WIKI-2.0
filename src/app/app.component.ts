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

  constructor(private eRef: ElementRef) {}

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
      }
    }, 700);

    // Reset for new entrance
    if (selectedItem.label === 'Servizi') {
      this.serviziStage = 'title-black';
      this.animatingDirection = 0;
    }

    this.triggerPageAnimation(selectedItem.label);
  }

  triggerPageAnimation(pageLabel: string) {
    // Clear any existing timeout
    if (this.pageTimeout) {
      clearTimeout(this.pageTimeout);
    }

    if (pageLabel === 'QeHome') {
      this.pageTimeout = setTimeout(() => {
        this.homeStage = 1;
      }, 800);
    } else if (pageLabel === 'Servizi') {
      // Step 1: Color it blue after 800ms
      this.pageTimeout = setTimeout(() => {
        if (this.activeIndex !== 2) return;
        this.serviziStage = 'title-blue';
        
        // Step 2: Move to top left after 500ms using JS FLIP for 60fps
        setTimeout(() => {
          if (this.activeIndex !== 2) return;
          
          // First (measure)
          const el = this.serviziTitle?.nativeElement;
          if (!el) {
            this.serviziStage = 'moving';
            setTimeout(() => { if (this.activeIndex === 2) this.serviziStage = 'cards'; }, 800);
            return;
          }
          
          const first = el.getBoundingClientRect();
          
          // Mutate (change layout class)
          this.serviziStage = 'moving';
          
          // Wait for Angular to update the DOM
          setTimeout(() => {
            if (this.activeIndex !== 2) return;
            
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
            });
            
            // Step 3: Shift right and show "Tutti i" after move completes
            setTimeout(() => {
              if (this.activeIndex !== 2) return;
              this.serviziStage = 'cards';
            }, 800);
            
          }, 0);
        }, 500);
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
    }, 400); // 400ms for fade out
  }

  lastWheelTime = 0;

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    // Only handle scroll when we're viewing cards (Fase 2)
    if (this.activeIndex !== 2 || this.serviziStage !== 'cards') return;
    
    // Prevent default scroll behavior to stop the page from moving
    event.preventDefault();

    const now = Date.now();
    // If events are firing rapidly (less than 150ms apart), it's part of the same continuous swipe/momentum
    const isContinuousScroll = (now - this.lastWheelTime) < 150;
    this.lastWheelTime = now;

    // Block if we are already locked by the animation OR if it's the tail end of a momentum scroll
    if (this.scrollLock || isContinuousScroll) {
      return;
    }
    
    if (event.deltaY > 0) {
      this.nextServicePage();
    } else if (event.deltaY < 0) {
      this.prevServicePage();
    }
  }

  ngOnInit() {
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
