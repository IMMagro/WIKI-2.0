// Modello contenuti condiviso: Categoria -> Guida -> FAQ -> step
export interface Step { t: string; img?: boolean; imgUrl?: string; video?: boolean; videoUrl?: string; _expanded?: boolean; }
export interface Service { name: string; desc: string; }
export interface Faq { q: string; tags: string[]; read?: boolean; expanded?: boolean; updated: string; steps: Step[]; service?: Service; extra?: boolean; }
export interface Guide { id: string; title: string; status: 'pub' | 'draft'; updated: string; desc: string; overview?: string; service?: Service; faqs: Faq[]; }
export interface Category { id: string; name: string; icon: string; emoji?: string; accent: 'blue' | 'magenta'; desc: string; manuals: Guide[]; interactiveScreenId?: string; }
export interface InteractivePin { id: string; x: number; y: number; title: string; content: string; }
export interface InteractiveScreen { id: string; imageUrl: string; pins: InteractivePin[]; }
export interface Ref { type: 'category' | 'guide' | 'faq' | 'home'; cat?: string; man?: string; faq?: number; }
export interface JourneyStep { title: string; text: string; ref: Ref; }
export interface Journey { intro: string; steps: JourneyStep[]; }

// Risultato di ricerca su una singola FAQ (con contesto per il breadcrumb e la navigazione)
export interface FaqHit { category: Category; guide: Guide; faqIndex: number; faq: Faq; }

// Pills in evidenza per la Home ("Ricerche frequenti")
export interface HomePill {
  id: string;
  label: string;
  targetType: 'category' | 'guide';
  targetId: string;
  categoryId?: string;
}

// ===== SmartFlow System =====
export interface SmartflowLevel {
  level: number;
  name: string;
  emoji: string;
  minScore: number;
  color: string;
}

export interface SmartflowOperator {
  id: string;
  name: string;
  emoji: string;
  avatar?: string;
  password?: string;
  score: number;
  level: number;
  levelName: string;
  guidesCreated: number;
  guidesApproved: number;
  lastActivity: string;
  registeredAt: string;
  status: 'pending' | 'approved' | 'rejected';
  hasOnboarded?: boolean;
}

export interface SmartflowDraftStep {
  t: string;
  img?: boolean;
  imgUrl?: string;
  video?: boolean;
  videoUrl?: string;
  _expanded?: boolean;
}

export interface SmartflowDraftFaq {
  q: string;
  steps: SmartflowDraftStep[];
}

export interface SmartflowDraft {
  id: string;
  operatorId: string;
  type: 'breve' | 'standard' | 'lunga';
  targetCategory: string;
  title: string;
  description: string;
  problemType: 'risoluzione' | 'procedura';
  cause?: string;
  solution?: string;
  steps: SmartflowDraftStep[];
  faqs: SmartflowDraftFaq[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionNote?: string;
  overview?: string;
  createdAt: string;
  kbEntriesUsed: string[];
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  category: string;
  internalNotes: string;
  publicSummary: string;
  tags: string[];
  source: 'notion' | 'operator' | 'auto';
  createdBy?: string;
  createdAt: string;
}

export interface SmartflowData {
  operators: SmartflowOperator[];
  drafts: SmartflowDraft[];
  levels: SmartflowLevel[];
}
