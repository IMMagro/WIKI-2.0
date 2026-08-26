// Modello contenuti condiviso: Categoria -> Guida -> FAQ -> step
export interface Step { t: string; img?: boolean; video?: boolean; }
export interface Service { name: string; desc: string; }
export interface Faq { q: string; tags: string[]; read?: boolean; updated: string; steps: Step[]; service?: Service; extra?: boolean; }
export interface Guide { id: string; title: string; status: 'pub' | 'draft'; updated: string; desc: string; overview?: string; service?: Service; faqs: Faq[]; }
export interface Category { id: string; name: string; icon: string; emoji?: string; accent: 'blue' | 'magenta'; desc: string; manuals: Guide[]; }
export interface Ref { type: 'category' | 'guide' | 'faq' | 'home'; cat?: string; man?: string; faq?: number; }
export interface JourneyStep { title: string; text: string; ref: Ref; }
export interface Journey { intro: string; steps: JourneyStep[]; }

// Risultato di ricerca su una singola FAQ (con contesto per il breadcrumb e la navigazione)
export interface FaqHit { category: Category; guide: Guide; faqIndex: number; faq: Faq; }
