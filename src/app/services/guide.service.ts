import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, Journey, FaqHit } from '../components/guide/guide.models';

@Injectable({ providedIn: 'root' })
export class GuideService {
  loaded = false;

  // Dati di fallback (usati sotto ng serve, dove i .ashx non girano)
  categories: Category[] = [
    { id: 'fatture', name: 'Fatture', icon: 'receipt', accent: 'blue', desc: 'Emissione, invio allo SDI, note di credito e incassi.', manuals: [
      { id: 'fe', title: 'Fatturazione Elettronica', status: 'pub', updated: '20 ago 2026', desc: 'Emettere e inviare fatture allo SDI dal gestionale.',
        overview: '<p>La <strong>fatturazione elettronica</strong> ti permette di emettere fatture e note di credito e inviarle automaticamente al <strong>Sistema di Interscambio (SDI)</strong>. I dati fiscali del paziente vengono ripresi dalla cartella clinica.</p><p>In questa guida trovi il flusso completo, dall\'emissione fino alla gestione degli scarti SDI.</p><h3>Prima di iniziare</h3><ul><li>P.IVA o Codice Fiscale corretti in anagrafica.</li><li>Credenziali SDI configurate nelle impostazioni.</li></ul>',
        service: { name: 'Attivazione Fatturazione Elettronica', desc: 'Configuriamo noi SDI e credenziali, con assistenza all\'avvio.' }, faqs: [
        { q: 'Come emetto una fattura elettronica?', tags: ['SDI', 'fattura'], updated: '20 ago 2026', steps: [
          { t: 'Apri <b>Fatturazione &rarr; Nuova fattura</b>.', img: true }, { t: 'Seleziona il <b>paziente</b> e aggiungi le prestazioni.' }, { t: 'Controlla l\'anteprima e premi <b>Invia allo SDI</b>.', video: true } ] },
        { q: 'Come emetto una nota di credito?', tags: ['nota di credito'], updated: '18 ago 2026', steps: [
          { t: 'Apri la fattura e premi <b>Crea nota di credito</b>.' }, { t: 'Indica importo e causale.', img: true }, { t: 'Invia allo SDI.' } ] },
        { q: 'Cosa faccio se lo SDI scarta la fattura?', tags: ['errore', 'SDI'], updated: '12 ago 2026', service: { name: 'Supporto Scarti SDI', desc: 'Un tecnico analizza gli scarti ricorrenti e sistema la configurazione.' }, steps: [
          { t: 'Apri <b>Fatturazione &rarr; Scarti SDI</b> e leggi il codice.', img: true }, { t: 'Correggi il dato (Codice Destinatario o P.IVA).' }, { t: 'Rigenera e reinvia.' } ] } ] },
      { id: 'solleciti', title: 'Solleciti e Incassi', status: 'draft', updated: '15 ago 2026', desc: 'Gestire pagamenti, solleciti e prima nota.',
        overview: '<p>Questa guida spiega come registrare gli <strong>incassi</strong> sulle fatture e gestire gli insoluti.</p>', faqs: [
        { q: 'Come registro un incasso su una fattura?', tags: ['incasso'], updated: '15 ago 2026', steps: [ { t: 'Apri la fattura e premi <b>Registra incasso</b>.' }, { t: 'Scegli metodo e data.', img: true } ] } ] } ] },
    { id: 'pazienti', name: 'Pazienti', icon: 'users', accent: 'magenta', desc: 'Anagrafica, cartella clinica e anamnesi.', manuals: [
      { id: 'cartella', title: 'Cartella Clinica', status: 'pub', updated: '19 ago 2026', desc: 'Creare e gestire la scheda del paziente.',
        overview: '<p>La <strong>cartella clinica</strong> raccoglie anagrafica, anamnesi e storia clinica in un unico posto. &Egrave; il punto di partenza per appuntamenti, piani di terapia e fatturazione.</p>', faqs: [
        { q: 'Come inserisco un nuovo paziente?', tags: ['anagrafica'], updated: '19 ago 2026', steps: [ { t: 'Vai su <b>Pazienti &rarr; Nuovo</b> e compila i dati.', img: true }, { t: 'Aggiungi contatti e consensi, poi <b>Salva</b>.' } ] },
        { q: 'Dove compilo l\'anamnesi?', tags: ['anamnesi'], updated: '11 ago 2026', steps: [ { t: 'Apri la scheda <b>Anamnesi</b> del paziente.' }, { t: 'Rispondi al questionario: i rischi si evidenziano in rosso.', video: true } ] } ] } ] },
    { id: 'pdt', name: 'Piani di Terapia', icon: 'tooth', accent: 'blue', desc: 'Preventivi clinici, accettazione e contabilità PDT.', manuals: [
      { id: 'contab-pdt', title: 'Contabilità dei Piani di Terapia', status: 'pub', updated: '20 ago 2026', desc: 'Collegare prestazioni, pagamenti e fatture al piano.',
        overview: '<p>Il <strong>Piano di Terapia</strong> tiene insieme prestazioni, accettazione e contabilità: acconti, saldi e fatture restano collegati, così vedi sempre il <strong>residuo aggiornato</strong>.</p>',
        service: { name: 'Modulo Preventivi Avanzati', desc: 'Preventivi clinici con immagini e firma digitale del paziente.' }, faqs: [
        { q: 'Come creo un piano di terapia?', tags: ['PDT'], updated: '20 ago 2026', steps: [ { t: 'Dalla scheda paziente apri <b>Piani di terapia &rarr; Nuovo</b>.', img: true }, { t: 'Aggiungi le prestazioni e definisci le sedute.' }, { t: 'Registra l\'<b>accettazione</b>.', video: true } ] },
        { q: 'Come contabilizzo un acconto sul PDT?', tags: ['acconto'], updated: '17 ago 2026', steps: [ { t: 'Apri il piano e premi <b>Registra acconto</b>.' }, { t: 'L\'importo scala dal residuo automaticamente.', img: true } ] } ] } ] },
    { id: 'magazzino', name: 'Magazzino', icon: 'box', accent: 'blue', desc: 'Articoli, carico/scarico e scorte minime.', manuals: [
      { id: 'gest-mag', title: 'Gestione Magazzino', status: 'pub', updated: '14 ago 2026', desc: 'Movimentare articoli e controllare le scorte.',
        overview: '<p>Il <strong>magazzino</strong> traccia articoli, carichi e scarichi e ti avvisa quando una scorta scende sotto la soglia minima.</p>', faqs: [
        { q: 'Come carico un articolo a magazzino?', tags: ['carico'], updated: '14 ago 2026', steps: [ { t: 'Apri <b>Magazzino &rarr; Carico</b> e seleziona il fornitore.', img: true }, { t: 'Inserisci articoli e quantità dal DDT.', video: true } ] } ] } ] },
    { id: 'fornitori', name: 'Fornitori', icon: 'truck', accent: 'magenta', desc: 'Anagrafica fornitori e ordini.', manuals: [
      { id: 'anag-forn', title: 'Anagrafica Fornitori', status: 'pub', updated: '10 ago 2026', desc: 'Registrare fornitori e listini.',
        overview: '<p>Registra i tuoi <strong>fornitori</strong> con dati fiscali e listini, subito disponibili nei carichi di magazzino.</p>', faqs: [
        { q: 'Come aggiungo un fornitore?', tags: ['fornitore'], updated: '10 ago 2026', steps: [ { t: 'Vai su <b>Fornitori &rarr; Nuovo</b> e compila ragione sociale e P.IVA.', img: true } ] } ] } ] },
    { id: 'preventivi', name: 'Preventivi', icon: 'quote', accent: 'blue', desc: 'Preventivi commerciali e conversione in PDT.', manuals: [
      { id: 'crea-prev', title: 'Creazione Preventivi', status: 'draft', updated: '09 ago 2026', desc: 'Preparare un preventivo e convertirlo in piano.',
        overview: '<p>Prepara un <strong>preventivo</strong> dal tariffario, invialo in PDF e convertilo in Piano di Terapia quando il paziente accetta.</p>', faqs: [
        { q: 'Come creo un preventivo?', tags: ['preventivo'], updated: '09 ago 2026', steps: [ { t: 'Apri <b>Preventivi &rarr; Nuovo</b> e aggiungi le voci.', img: true }, { t: 'Stampa o invia il PDF.' } ] } ] } ] }
  ];

  journey: Journey = {
    intro: 'Sei alle prime armi? Segui questi passi in ordine: ognuno ti porta alla guida o alla FAQ giusta.',
    steps: [
      { title: 'Registra il tuo primo paziente', text: 'Tutto parte dalla cartella clinica.', ref: { type: 'faq', cat: 'pazienti', man: 'cartella', faq: 0 } },
      { title: 'Conosci la Cartella Clinica', text: 'Com\'è organizzata la scheda del paziente.', ref: { type: 'guide', cat: 'pazienti', man: 'cartella' } },
      { title: 'Crea un piano di terapia', text: 'Preventiva le prestazioni e registra l\'accettazione.', ref: { type: 'faq', cat: 'pdt', man: 'contab-pdt', faq: 0 } },
      { title: 'Emetti la tua prima fattura', text: 'Invia la fattura elettronica allo SDI.', ref: { type: 'faq', cat: 'fatture', man: 'fe', faq: 0 } },
      { title: 'Esplora la categoria Fatture', text: 'Tutte le guide su fatturazione e incassi.', ref: { type: 'category', cat: 'fatture' } }
    ]
  };

  constructor(private http: HttpClient) { this.load(); }

  /** Carica l'albero reale da /api/get_guides.ashx; in errore mantiene il fallback. */
  load(): void {
    if (this.loaded) return;
    this.http.get<any>('/api/get_guides.ashx').subscribe({
      next: (data) => {
        if (data && Array.isArray(data.categories) && data.categories.length) this.categories = data.categories;
        if (data && data.journey && Array.isArray(data.journey.steps) && data.journey.steps.length) this.journey = data.journey;
        this.loaded = true;
      },
      error: () => { /* mantiene i dati di fallback */ }
    });
  }

  /**
   * Vista PUBBLICA: solo guide pubblicate (le bozze non sono visibili all'utente),
   * e categorie senza guide pubblicate vengono escluse. L'area admin usa `categories`.
   */
  get publicCategories(): Category[] {
    return (this.categories || [])
      .map(c => ({ ...c, manuals: (c.manuals || []).filter(m => m.status !== 'draft') }))
      .filter(c => c.manuals.length > 0);
  }

  /**
   * Elenco appiattito di TUTTE le FAQ reali (da publicCategories), nella forma attesa
   * dalla modale di lettura: { id, category, color, desc (=guida), title (=domanda), steps, service }.
   * È la sorgente unica per la ricerca in home e per la pagina FAQ, così il contenuto
   * (step, servizio) è lo stesso che si legge nella sezione Guide.
   */
  get allFaqItems(): any[] {
    const out: any[] = [];
    const cats = this.publicCategories || []; // esclude le guide in bozza
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

  /** Ricerca su TUTTE le singole FAQ pubblicate (domanda + tag + testo degli step). */
  search(query: string, limit = 6): FaqHit[] {
    const t = (query || '').trim().toLowerCase();
    if (!t) return [];
    const hits: FaqHit[] = [];
    for (const c of this.categories) {
      for (const g of c.manuals) {
        if (g.status === 'draft') continue; // le bozze non compaiono nella ricerca pubblica
        g.faqs.forEach((f, i) => {
          const hay = (f.q + ' ' + f.tags.join(' ') + ' ' + f.steps.map(s => s.t).join(' ')).toLowerCase();
          if (hay.includes(t)) hits.push({ category: c, guide: g, faqIndex: i, faq: f });
        });
      }
    }
    return hits.slice(0, limit);
  }
}
