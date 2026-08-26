import { Injectable } from '@angular/core';

export interface CookiePreferences {
  technical: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp?: string;
}

export interface LegalConfig {
  companyName: string;
  vatNumber: string;
  registeredOffice: string;
  operativeOffice: string;
  phoneSupport: string;
  phoneCommercial: string;
  contactEmail: string;
  commercialEmail: string;
  adminEmail: string;
  dpoEmail: string;
  pec: string;
  reaNumber: string;
  shareCapital: string;
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
  private readonly COOKIE_KEY = 'qe_cookie_consent_v1';

  // Modal display states
  isViewerOpen = false;
  isWizardOpen = false;
  isCookieBannerOpen = false;
  activeViewerTab: 'privacy' | 'terms' = 'privacy';

  // Cookie preferences
  cookiePreferences: CookiePreferences | null = null;

  // Dati ufficiali estratti da quadernoelettronico.it
  config: LegalConfig = {
    companyName: 'Quaderno Elettronico S.r.l.',
    vatNumber: '02072670512',
    registeredOffice: 'Via Carlo Cattaneo, 3 - 52025 Montevarchi (AR), Italia',
    operativeOffice: 'Via Giacomo Leopardi, 31/B - 52025 Montevarchi (AR), Italia',
    phoneSupport: '055 985 0486',
    phoneCommercial: '055 982 476',
    contactEmail: 'assistenza@quadernoelettronico.it',
    commercialEmail: 'commerciale@quadernoelettronico.it',
    adminEmail: 'amministrazione@quadernoelettronico.it',
    dpoEmail: 'info@quadernoelettronico.it',
    pec: 'gino@pec.quadernoelettronico.it',
    reaNumber: 'AR - 159691',
    shareCapital: '€ 10.000 i.v.',
    supportedSoftware: ['Windent', 'Poliwin', 'Winodlab', 'Quaderno Elettronico Web', 'Servizi Cloud'],
    cookieTypes: {
      technical: true,
      analytics: true,
      preferences: true,
      thirdParty: false
    },
    dataRetentionMonths: 24,
    jurisdictionCourt: 'Foro di Arezzo',
    lastUpdated: '26 Agosto 2026',
    customNotes: 'Piattaforma di consultazione guide, manuali tecnici e assistenza software gestionale per studi dentistici, cliniche polispecialistiche e laboratori odontotecnici.'
  };

  constructor() {
    this.loadConfig();
    this.loadCookieConsent();
  }

  /**
   * Carica il consenso cookie salvato
   */
  loadCookieConsent(): void {
    try {
      const saved = localStorage.getItem(this.COOKIE_KEY);
      if (saved) {
        this.cookiePreferences = JSON.parse(saved);
        this.isCookieBannerOpen = false;
      } else {
        this.isCookieBannerOpen = true;
      }
    } catch (e) {
      console.warn('Errore lettura cookie consent:', e);
      this.isCookieBannerOpen = true;
    }
  }

  /**
   * Accetta tutti i cookie (tecnici, analitici, preferenze)
   */
  acceptAllCookies(): void {
    const prefs: CookiePreferences = {
      technical: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString()
    };
    this.saveCookiePreferences(prefs);
  }

  /**
   * Accetta solo i cookie tecnici strettamente necessari
   */
  acceptNecessaryCookies(): void {
    const prefs: CookiePreferences = {
      technical: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString()
    };
    this.saveCookiePreferences(prefs);
  }

  /**
   * Salva preferenze personalizzate
   */
  saveCustomCookies(analytics: boolean, preferences: boolean): void {
    const prefs: CookiePreferences = {
      technical: true,
      analytics: analytics,
      preferences: preferences,
      timestamp: new Date().toISOString()
    };
    this.saveCookiePreferences(prefs);
  }

  private saveCookiePreferences(prefs: CookiePreferences): void {
    this.cookiePreferences = prefs;
    try {
      localStorage.setItem(this.COOKIE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.error('Errore salvataggio cookie consent:', e);
    }
    this.isCookieBannerOpen = false;
  }

  /**
   * Resetta il consenso cookie (utile per test e admin)
   */
  resetCookieConsent(): void {
    localStorage.removeItem(this.COOKIE_KEY);
    this.cookiePreferences = null;
    this.isCookieBannerOpen = true;
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
   * Ripristina la configurazione con i dati ufficiali di quadernoelettronico.it
   */
  resetToDefaults(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.config = {
      companyName: 'Quaderno Elettronico S.r.l.',
      vatNumber: '02072670512',
      registeredOffice: 'Via Carlo Cattaneo, 3 - 52025 Montevarchi (AR), Italia',
      operativeOffice: 'Via Giacomo Leopardi, 31/B - 52025 Montevarchi (AR), Italia',
      phoneSupport: '055 985 0486',
      phoneCommercial: '055 982 476',
      contactEmail: 'assistenza@quadernoelettronico.it',
      commercialEmail: 'commerciale@quadernoelettronico.it',
      adminEmail: 'amministrazione@quadernoelettronico.it',
      dpoEmail: 'info@quadernoelettronico.it',
      pec: 'gino@pec.quadernoelettronico.it',
      reaNumber: 'AR - 159691',
      shareCapital: '€ 10.000 i.v.',
      supportedSoftware: ['Windent', 'Poliwin', 'Winodlab', 'Quaderno Elettronico Web', 'Servizi Cloud'],
      cookieTypes: {
        technical: true,
        analytics: true,
        preferences: true,
        thirdParty: false
      },
      dataRetentionMonths: 24,
      jurisdictionCourt: 'Foro di Arezzo',
      lastUpdated: '26 Agosto 2026',
      customNotes: 'Piattaforma di consultazione guide, manuali tecnici e assistenza software gestionale per studi dentistici, cliniche polispecialistiche e laboratori odontotecnici.'
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
   * Apre la Procedura Guidata (Wizard / Editor)
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
   * Genera le sezioni strutturate per la Privacy Policy (GDPR UE 2016/679) ufficiali di Quaderno Elettronico
   */
  getPrivacySections(): LegalSection[] {
    const c = this.config;
    return [
      {
        id: 'titolare',
        title: '1. Identità e Dati di Contatto del Titolare del Trattamento',
        icon: 'shield',
        content: `Il Titolare del trattamento dei dati personali ai sensi dell'art. 4 del Regolamento (UE) 2016/679 (GDPR) è:\n\n` +
          `**${c.companyName}**\n` +
          `• Sede Legale: ${c.registeredOffice}\n` +
          `• Sede Operativa: ${c.operativeOffice}\n` +
          `• Codice Fiscale e Partita IVA: **${c.vatNumber}** (REA: ${c.reaNumber} - Capitale Sociale ${c.shareCapital})\n` +
          `• Telefono Assistenza: **${c.phoneSupport}** | Telefono Commerciale: **${c.phoneCommercial}**\n` +
          `• Email Assistenza: **${c.contactEmail}**\n` +
          `• Email Amministrazione: **${c.adminEmail}**\n` +
          `• Email Informativa & DPO: **${c.dpoEmail}**\n` +
          `• Posta Elettronica Certificata (PEC): **${c.pec}**`
      },
      {
        id: 'finalita-basi',
        title: '2. Finalità del Trattamento e Basi Giuridiche (Art. 6 GDPR)',
        icon: 'check-circle',
        content: `I dati personali forniti in occasione della consultazione della Wiki e dell'uso dei servizi di assistenza per i software **${c.supportedSoftware.join(', ')}** sono trattati per:\n\n` +
          `1. **Esecuzione di rapporti contrattuali e precontrattuali**: consentire la consultazione delle guide operative, risoluzione di anomalie, gestione ticket di assistenza e fruizione dei moduli software (Base giuridica: Art. 6 co. 1 lett. b GDPR).\n` +
          `2. **Manutenzione e Sicurezza dei Sistemi**: prevenzione di accessi non autorizzati, attacchi informatici, monitoraggio dell'infrastruttura server (Base giuridica: Legittimo interesse - Art. 6 co. 1 lett. f GDPR).\n` +
          `3. **Adempimento di Obblighi di Legge**: conformità a normative fiscali, contabili e disposizioni vincolanti delle Autorità di controllo (Base giuridica: Art. 6 co. 1 lett. c GDPR).\n` +
          `4. **Miglioramento del Servizio**: analisi aggregate ed anonimizzate sulla frequenza di consultazione dei manuali tecnici al fine di ottimizzare la documentazione.`
      },
      {
        id: 'dati-trattati',
        title: '3. Categorie di Dati Personali Trattati',
        icon: 'database',
        content: `Vengono trattate esclusivamente le seguenti categorie di dati:\n\n` +
          `• **Dati di Navigazione e Log Tecnici**: indirizzi IP (anonimizzati), timestamp di richiesta, URI delle guide consultate, user-agent del browser e codici di stato di risposta del server.\n` +
          `• **Credenziali di Autenticazione (Area Riservata/Admin)**: identificativo utente e token di sessione protetti da crittografia per il personale abilitato.\n` +
          `• **Dati di Contatto e Segnalazioni**: indirizzo email o recapito telefonico fornito spontaneamente per richieste di supporto tecnico o chiarimenti sui manuali.`
      },
      {
        id: 'cookie',
        title: '4. Informativa Estesa sui Cookie',
        icon: 'cpu',
        content: `Il portale Wiki adotta una politica di massima trasparenza e minimizzazione dei dati:\n\n` +
          `• **Cookie Tecnici Strettamente Necessari** (${c.cookieTypes.technical ? 'Attivi' : 'Disattivati'}): indispensabili per memorizzare la sessione di consultazione, la preferenza di tema (Light/Dark mode) e le scelte di consenso.\n` +
          `• **Cookie Analitici con Anonimizzazione IP** (${c.cookieTypes.analytics ? 'Attivi' : 'Disattivati'}): metriche aggregate per valutare l'efficacia dei contenuti senza tracciamento dell'identità dell'utente.\n` +
          `• **Cookie di Terze Parti a Scopo Pubblicitario**: ${c.cookieTypes.thirdParty ? 'Presenti' : 'Non utilizzati. I dati non vengono ceduti a scopi commerciali.'}`
      },
      {
        id: 'destinatari',
        title: '5. Destinatari dei Dati e Trasferimento Extra UE',
        icon: 'share-2',
        content: `I dati personali sono trattati da personale interno di **${c.companyName}** espressamente autorizzato e istruito ai sensi dell'art. 29 del GDPR.\n\n` +
          `Possono essere comunicati a fornitori di infrastruttura cloud e manutenzione IT nominati Responsabili del Trattamento (Art. 28 GDPR). Tutti i dati risiedono all'interno dell'Unione Europea e non vengono trasferiti verso Paesi terzi privi di adeguate decisioni di adeguatezza o garanzie equivalenti.`
      },
      {
        id: 'conservazione',
        title: '6. Periodo di Conservazione dei Dati',
        icon: 'clock',
        content: `I dati relativi all'assistenza e le interazioni tecniche vengono conservati per tutta la durata del rapporto contrattuale e per i successivi tempi previsti dalla legge (fino a un massimo di 5 anni dall'ultima interazione). I log tecnici di sicurezza vengono conservati per un periodo standard di **${c.dataRetentionMonths} mesi**, al termine dei quali vengono cancellati o anonimizzati in via definitiva.`
      },
      {
        id: 'diritti',
        title: '7. Diritti dell\'Interessato (Artt. 15-22 GDPR) e Modalità di Esercizio',
        icon: 'user-check',
        content: `L'interessato ha diritto in qualunque momento di esercitare i diritti garantiti dal Regolamento UE 2016/679:\n\n` +
          `• **Diritto di Accesso (Art. 15)**: verificare se sia in corso un trattamento e ottenere copia dei propri dati.\n` +
          `• **Diritto di Rettifica (Art. 16)**: ottenere la correzione di dati inesatti o l'integrazione di quelli incompleti.\n` +
          `• **Diritto alla Cancellazione (Art. 17)**: richiedere la cancellazione ("diritto all'oblio") nei casi previsti dalla legge.\n` +
          `• **Diritto di Limitazione (Art. 18)** e **Portabilità dei Dati (Art. 20)**.\n` +
          `• **Diritto di Opposizione (Art. 21)**.\n\n` +
          `Per esercitare tali diritti è possibile rivolgersi a **${c.companyName}** inviando un'email a **${c.dpoEmail}** o scrivendo a **${c.registeredOffice}** (all'attenzione del Responsabile Privacy) o tramite PEC a **${c.pec}**.\n\n` +
          `È sempre fatto salvo il diritto di proporre reclamo all'Autorità Garante per la Protezione dei Dati Personali (Piazza Venezia 11, 00187 Roma - www.garanteprivacy.it).`
      }
    ];
  }

  /**
   * Genera le sezioni strutturate per i Termini e Condizioni di Utilizzo ufficiali
   */
  getTermsSections(): LegalSection[] {
    const c = this.config;
    return [
      {
        id: 'oggetto',
        title: '1. Oggetto del Servizio e Accettazione dei Termini',
        icon: 'file-text',
        content: `I presenti Termini disciplinano l'accesso e la consultazione della Wiki e del portale di documentazione tecnica ufficiale fornito da **${c.companyName}** (${c.registeredOffice}, P.IVA ${c.vatNumber}).\n\n` +
          `L'utilizzo del portale è riservato all'uso professionale da parte di odontoiatri, medici, igienisti, assistenti, personale di segreteria e odontotecnici operanti con i gestionali **${c.supportedSoftware.join(', ')}**. L'accesso e la navigazione costituiscono piena accettazione dei presenti termini.`
      },
      {
        id: 'proprieta',
        title: '2. Proprietà Intellettuale, Marchi e Diritti d\'Autore',
        icon: 'bookmark',
        content: `I marchi commerciali (**Windent**, **Poliwin**, **Winodlab**, **Quaderno Elettronico**), i loghi grafici, le schermate, i manuali d'uso, i diagrammi procedurali, i video tutorial e i codici sorgente appartengono in via esclusiva a **${c.companyName}** o ai rispettivi aventi diritto.\n\n` +
          `È severamente vietata qualsiasi attività di estrazione sistematica (scraping), duplicazione non autorizzata, cessione o commercializzazione a terzi delle guide e dei materiali protetti senza espresso consenso scritto della Società.`
      },
      {
        id: 'responsabilita',
        title: '3. Limitazioni di Responsabilità e Uso delle Guide',
        icon: 'alert-triangle',
        content: `Le guide e le indicazioni presenti sulla Wiki hanno natura formativa e di supporto all'uso standard dei programmi gestionali.\n\n` +
          `• L'utente ha la responsabilità di verificare che la configurazione del proprio ambiente operativo e i dati clinici e contabili inseriti rispondano ai requisiti fiscali, sanitari e normativi applicabili alla propria struttura.\n` +
          `• La Società garantisce il massimo impegno per mantenere i manuali aggiornati ma non risponde di eventuali ritardi o sospensioni temporanee della consultazione dovuti a manutenzione dell'infrastruttura di rete o cause di forza maggiore.`
      },
      {
        id: 'condotta',
        title: '4. Regole di Accesso all\'Area Riservata e Supporto Tecnico',
        icon: 'lock',
        content: `Gli utenti in possesso di credenziali di accesso al pannello amministrativo o ad aree riservate sono tenuti a custodirle con la massima diligenza e segretezza. In caso di smarrimento, furto o sospetto uso illecito, è obbligatorio darne tempestiva comunicazione al servizio assistenza (${c.contactEmail} - Tel. ${c.phoneSupport}).`
      },
      {
        id: 'modifiche',
        title: '5. Aggiornamenti dei Termini',
        icon: 'refresh-cw',
        content: `**${c.companyName}** si riserva la facoltà di aggiornare i presenti Termini e l'Informativa Privacy in caso di rilascio di nuove versioni dei software (${c.supportedSoftware.join(', ')}) o per adeguamento a nuove disposizioni legislative. Le modifiche saranno rese pubbliche tramite il portale.`
      },
      {
        id: 'foro',
        title: '6. Legge Applicabile e Foro Competente Esclusivo',
        icon: 'scale',
        content: `I presenti Termini sono interamente regolati dalla Legge Italiana. Per qualsiasi controversia che dovesse insorgere in relazione alla validità, interpretazione, esecuzione o risoluzione dei presenti termini o all'utilizzo del portale Wiki, la competenza esclusiva e inderogabile è attribuita al **${c.jurisdictionCourt}**.`
      }
    ];
  }
}
