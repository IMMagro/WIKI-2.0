import { Injectable } from '@angular/core';

export interface LegalConfig {
  companyName: string;
  vatNumber: string;
  registeredOffice: string;
  contactEmail: string;
  dpoEmail: string;
  supportedSoftware: string[];
  cookieTypes: {
    technical: boolean;
    analytics: boolean;
    preferences: boolean;
    thirdParty: boolean;
  };
  dataRetentionMonths: number;
  jurisdictionCourt: string;
  lastUpdated: string;
  customNotes?: string;
}

export interface LegalSection {
  id: string;
  title: string;
  icon?: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class LegalService {
  private readonly STORAGE_KEY = 'qe_legal_configuration_v1';
  private readonly ACCEPTANCE_KEY = 'qe_legal_accepted_v1';

  // Modal display states
  isViewerOpen = false;
  isWizardOpen = false;
  activeViewerTab: 'privacy' | 'terms' = 'privacy';

  // Default initial configuration
  config: LegalConfig = {
    companyName: 'Quaderno Elettronico S.r.l. / Windent & Poliwin Support',
    vatNumber: 'IT01234567890',
    registeredOffice: 'Via Roma, 100 - 00100 Roma (RM), Italia',
    contactEmail: 'assistenza@quadernoelettronico.it',
    dpoEmail: 'privacy@quadernoelettronico.it',
    supportedSoftware: ['Windent', 'Poliwin', 'Quaderno Elettronico Web', 'Servizi Cloud'],
    cookieTypes: {
      technical: true,
      analytics: true,
      preferences: true,
      thirdParty: false
    },
    dataRetentionMonths: 24,
    jurisdictionCourt: 'Foro di Roma',
    lastUpdated: '26 Agosto 2026',
    customNotes: 'Piattaforma di consultazione manuali tecnici, guide operative e assistenza software per strutture sanitarie e odontoiatriche.'
  };

  constructor() {
    this.loadConfig();
  }

  /**
   * Carica la configurazione salvata da LocalStorage se presente
   */
  loadConfig(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.config = { ...this.config, ...parsed };
      }
    } catch (e) {
      console.warn('Impossibile caricare la configurazione legal salvata:', e);
    }
  }

  /**
   * Salva la configurazione nel LocalStorage
   */
  saveConfig(newConfig: LegalConfig): void {
    this.config = { ...newConfig, lastUpdated: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Errore nel salvataggio della configurazione legal:', e);
    }
  }

  /**
   * Ripristina la configurazione di default
   */
  resetToDefaults(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.config = {
      companyName: 'Quaderno Elettronico S.r.l. / Windent & Poliwin Support',
      vatNumber: 'IT01234567890',
      registeredOffice: 'Via Roma, 100 - 00100 Roma (RM), Italia',
      contactEmail: 'assistenza@quadernoelettronico.it',
      dpoEmail: 'privacy@quadernoelettronico.it',
      supportedSoftware: ['Windent', 'Poliwin', 'Quaderno Elettronico Web', 'Servizi Cloud'],
      cookieTypes: {
        technical: true,
        analytics: true,
        preferences: true,
        thirdParty: false
      },
      dataRetentionMonths: 24,
      jurisdictionCourt: 'Foro di Roma',
      lastUpdated: '26 Agosto 2026',
      customNotes: 'Piattaforma di consultazione manuali tecnici, guide operative e assistenza software per strutture sanitarie e odontoiatriche.'
    };
  }

  /**
   * Apre il visualizzatore sulla tab Privacy
   */
  openPrivacy(): void {
    this.activeViewerTab = 'privacy';
    this.isViewerOpen = true;
  }

  /**
   * Apre il visualizzatore sulla tab Termini
   */
  openTerms(): void {
    this.activeViewerTab = 'terms';
    this.isViewerOpen = true;
  }

  /**
   * Chiude il visualizzatore
   */
  closeViewer(): void {
    this.isViewerOpen = false;
  }

  /**
   * Apre la Procedura Guidata (Wizard)
   */
  openWizard(): void {
    this.isWizardOpen = true;
  }

  /**
   * Chiude la Procedura Guidata
   */
  closeWizard(): void {
    this.isWizardOpen = false;
  }

  /**
   * Verifica se l'utente ha accettato/preso visione
   */
  hasAccepted(): boolean {
    return localStorage.getItem(this.ACCEPTANCE_KEY) === 'true';
  }

  /**
   * Registra la presa visione dell'utente
   */
  acceptTerms(): void {
    localStorage.setItem(this.ACCEPTANCE_KEY, 'true');
  }

  /**
   * Genera le sezioni strutturate per la Privacy Policy (GDPR UE 2016/679)
   */
  getPrivacySections(): LegalSection[] {
    const c = this.config;
    return [
      {
        id: 'titolare',
        title: '1. Titolare del Trattamento e DPO',
        icon: 'shield',
        content: `Il Titolare del trattamento dei dati personali raccolti attraverso questo portale (la "Wiki" e documentazione di supporto per ${c.supportedSoftware.join(', ')}) è **${c.companyName}**, con sede legale in **${c.registeredOffice}**, P.IVA/C.F. **${c.vatNumber}**.\n\nPer qualsiasi chiarimento in materia di protezione dei dati personali, o per contattare il Responsabile della Protezione dei Dati (DPO), è possibile scrivere a: **${c.dpoEmail}** o all'indirizzo generale **${c.contactEmail}**.`
      },
      {
        id: 'dati-trattati',
        title: '2. Categorie di Dati Personali Trattati',
        icon: 'database',
        content: `Durante la navigazione e l'utilizzo dei servizi di documentazione tecnica e assistenza vengono trattate le seguenti categorie di dati:\n\n` +
          `• **Dati di Navigazione e Log Tecnici**: indirizzo IP (anonimizzato), tipologia di browser, orario di accesso, pagine consultate ed eventuali codici di stato HTTP. Tali dati sono necessari per garantire la sicurezza del sistema e il corretto funzionamento tecnico.\n` +
          `• **Dati di Autenticazione Personale Autorizzato**: credenziali di accesso (username, token di sessione cifrato) per il personale clinico o di assistenza accreditato ad accedere a guide riservate o funzioni di amministrazione.\n` +
          `• **Ricerche e Interazioni**: termini di ricerca inseriti per il reperimento di guide e FAQ, elaborati in forma aggregata per ottimizzare la pertinenza dei risultati.`
      },
      {
        id: 'finalita-basi',
        title: '3. Finalità del Trattamento e Base Giuridica',
        icon: 'check-circle',
        content: `I dati personali sono trattati esclusivamente in conformità al Regolamento UE 2016/679 (GDPR) per:\n\n` +
          `1. **Erogazione del Servizio di Assistenza e Documentazione**: consentire la consultazione efficiente dei manuali di **${c.supportedSoftware.join(', ')}** e la ricerca di soluzioni operative (Base giuridica: Esecuzione del contratto o misure precontrattuali - Art. 6.1.b GDPR).\n` +
          `2. **Sicurezza e Manutenzione dell'Infrastruttura**: prevenzione di accessi non autorizzati, attacchi informatici e monitoraggio della disponibilità dei server (Base giuridica: Legittimo interesse del Titolare - Art. 6.1.f GDPR).\n` +
          `3. **Adempimenti di Legge**: conformità a obblighi normativi, fiscali o richieste vincolanti delle Autorità di vigilanza (Base giuridica: Obbligo legale - Art. 6.1.c GDPR).\n\n` +
          `I dati non saranno mai ceduti a terzi né utilizzati a scopo commerciale o di profilazione senza esplicito consenso.`
      },
      {
        id: 'cookie',
        title: '4. Gestione Cookie e Tecnologie di Tracciamento',
        icon: 'cpu',
        content: `Il portale utilizza una configurazione di cookie essenziale e trasparente:\n\n` +
          `• **Cookie Tecnici Strettamente Necessari** (${c.cookieTypes.technical ? 'Attivi' : 'Disattivati'}): indispensabili per memorizzare lo stato del tema (Dark/Light mode), la sessione di consultazione e le preferenze dell'interfaccia.\n` +
          `• **Cookie Analitici Anonimizzati** (${c.cookieTypes.analytics ? 'Attivi con mascheramento IP' : 'Disattivati'}): utilizzati unicamente per metriche aggregate di consultazione delle guide senza profilazione individuale.\n` +
          `• **Cookie di Preferenze** (${c.cookieTypes.preferences ? 'Attivi' : 'Disattivati'}): memorizzano l'accettazione e filtri di navigazione.\n` +
          `• **Cookie di Profilazione Terze Parti**: ${c.cookieTypes.thirdParty ? 'Presenti' : 'Non utilizzati. Nessun dato viene ceduto a scopi pubblicitari o commerciali.'}`
      },
      {
        id: 'conservazione',
        title: '5. Periodo di Conservazione dei Dati',
        icon: 'clock',
        content: `I dati di navigazione e i log tecnici vengono conservati per un periodo massimo di **${c.dataRetentionMonths} mesi**, decorsi i quali vengono automaticamente cancellati o anonimizzati in modo irreversibile, salvo eventuali necessità di accertamento di reati da parte dell'Autorità Giudiziaria.`
      },
      {
        id: 'diritti',
        title: '6. Diritti dell\'Interessato (Artt. 15-22 GDPR)',
        icon: 'user-check',
        content: `In ogni momento, l'utente può esercitare i propri diritti previsti dal GDPR:\n\n` +
          `• **Accesso e Rettifica**: ottenere conferma dell'esistenza dei propri dati e richiederne la rettifica o integrazione.\n` +
          `• **Cancellazione ("Diritto all'Oblio")**: richiedere la cancellazione dei dati non più necessari alle finalità dichiarate.\n` +
          `• **Limitazione e Opposizione**: richiedere la limitazione del trattamento o opporsi per motivi legittimi.\n` +
          `• **Portabilità**: ricevere in formato strutturato di uso comune i dati forniti.\n\n` +
          `Per esercitare tali diritti, è sufficiente inviare un'email all'indirizzo DPO dedicato: **${c.dpoEmail}** o scrivere al Titolare all'indirizzo **${c.contactEmail}**. È altresì fatto salvo il diritto di proporre reclamo al **Garante per la Protezione dei Dati Personali** (www.garanteprivacy.it).`
      }
    ];
  }

  /**
   * Genera le sezioni strutturate per i Termini e Condizioni di Utilizzo
   */
  getTermsSections(): LegalSection[] {
    const c = this.config;
    return [
      {
        id: 'oggetto',
        title: '1. Oggetto e Ambito di Applicazione',
        icon: 'file-text',
        content: `I presenti Termini e Condizioni d'Uso disciplinano l'accesso e la consultazione della piattaforma Wiki e knowledge base ufficiale fornita da **${c.companyName}**.\n\n` +
          `Il servizio è destinato primariamente a professionisti, personale sanitario e studi odontoiatrici utilizzatori dei software gestionali **${c.supportedSoftware.join(', ')}** al fine di fornire manualistica aggiornata, procedure operative e supporto formativo.`
      },
      {
        id: 'proprieta',
        title: '2. Proprietà Intellettuale e Copyright',
        icon: 'bookmark',
        content: `Tutti i contenuti presenti su questo portale, compresi a titolo esemplificativo ma non esaustivo: testi delle guide, schermate, diagrammi di flusso, loghi, video tutorial, layout grafico e codice sorgente della piattaforma, sono di esclusiva proprietà di **${c.companyName}** o dei relativi danti causa e sono protetti dalle leggi vigenti sul diritto d'autore e sulla proprietà industriale.\n\n` +
          `È fatto espresso divieto di riprodurre, distribuire a terzi non autorizzati, modificare, decompilare o sfruttare economicamente in tutto o in parte i contenuti senza preventiva autorizzazione scritta.`
      },
      {
        id: 'responsabilita',
        title: '3. Limitazione di Responsabilità e Accuratezza',
        icon: 'alert-triangle',
        content: `Le informazioni tecniche e le guide operative contenute nella Wiki sono redatte e verificate con la massima diligenza professionale. Tuttavia:\n\n` +
          `• I manuali costituiscono supporto all'uso ordinario del software e non sostituiscono il parere professionale o le prescrizioni di legge in ambito clinico, contabile o fiscale.\n` +
          `• Il Titolare non potrà essere ritenuto responsabile per interruzioni temporanee del servizio dovute a manutenzione programmata, cause di forza maggiore o anomalie delle reti di telecomunicazione.\n` +
          `• L'utente è tenuto a verificare sempre la compatibilità delle procedure con la versione specifica del software in uso presso la propria struttura.`
      },
      {
        id: 'condotta',
        title: '4. Regole di Condotta e Accesso alle Aree Riservate',
        icon: 'lock',
        content: `L'accesso a funzionalità amministrative o a contenuti protetti è riservato agli utenti in possesso di credenziali valide fornite dal Titolare. L'utente si impegna a:\n\n` +
          `• Custodire con riservatezza le credenziali di accesso e non cederle a terzi.\n` +
          `• Non tentare di aggirare le misure di sicurezza, né effettuare attività di scansione vulnerabilità o scraping automatizzato non autorizzato.\n` +
          `• Segnalare tempestivamente qualsiasi anomalia o sospetto abuso di credenziali al supporto: **${c.contactEmail}**.`
      },
      {
        id: 'modifiche',
        title: '5. Modifiche ai Termini e al Servizio',
        icon: 'refresh-cw',
        content: `**${c.companyName}** si riserva il diritto di aggiornare in qualsiasi momento i presenti Termini e l'Informativa Privacy per riflettere innovazioni funzionali, aggiornamenti normativi o modifiche ai software supportati. Le modifiche avranno efficacia dalla data di pubblicazione indicata in calce ai documenti.`
      },
      {
        id: 'foro',
        title: '6. Legge Applicabile e Foro Competente',
        icon: 'scale',
        content: `I presenti Termini sono regolati dalla legge italiana. Per ogni eventuale controversia derivante dall'interpretazione, validità o esecuzione delle presenti condizioni, la competenza territoriale esclusiva è devoluta al **${c.jurisdictionCourt}**, fatti salvi i fori inderogabili previsti dalla normativa a tutela dei consumatori ove applicabili.`
      }
    ];
  }
}
