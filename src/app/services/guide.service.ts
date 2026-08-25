import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category, Journey, FaqHit } from '../components/guide/guide.models';

@Injectable({ providedIn: 'root' })
export class GuideService {
  loaded = false;

  private _categories: Category[] = [];
  private _publicCategories: Category[] = [];
  private _allFaqItems: any[] = [];

  get categories(): Category[] {
    return this._categories;
  }

  set categories(val: Category[]) {
    this._categories = val || [];
    this.recomputeDerived();
  }

  journey: Journey = {
    intro: 'Benvenuto in Quaderno Elettronico! Segui questo percorso guidato per apprendere le operazioni fondamentali passo dopo passo.',
    steps: [
      {
        title: '1. Comprendere l\'interfaccia di lavoro',
        text: 'Familiarizza con la barra degli strumenti, i menu e le aree di lavoro principali.',
        ref: { type: 'guide', cat: 'primi-passi', man: 'interfaccia-quaderno' }
      },
      {
        title: '2. Configura il listino dello studio',
        text: 'Personalizza i prezzi e le prestazioni del tuo tariffario.',
        ref: { type: 'guide', cat: 'onorario', man: 'gestione-listini-onorario' }
      },
      {
        title: '3. Inserisci il tuo primo paziente',
        text: 'Crea la scheda anagrafica e inserisci i dati anagrafici e di contatto.',
        ref: { type: 'guide', cat: 'pazienti', man: 'inserire-paziente' }
      },
      {
        title: '4. Esplora l\'Odontogramma',
        text: 'Visualizza la dentizione grafica e segna la situazione iniziale della bocca.',
        ref: { type: 'guide', cat: 'odontogramma', man: 'panoramica-odontogramma' }
      },
      {
        title: '5. Aggiungi un intervento ed emetti il preventivo',
        text: 'Pianifica le cure da eseguire e stampa la proposta per il paziente.',
        ref: { type: 'guide', cat: 'odontogramma', man: 'inserire-intervento' }
      },
      {
        title: '6. Fissa l\'appuntamento in Agenda',
        text: 'Inserisci l\'appuntamento sul calendario assegnando medico e poltrona.',
        ref: { type: 'guide', cat: 'agenda', man: 'gestione-appuntamenti' }
      },
      {
        title: '7. Emetti la fattura e gestisci il Sistema TS',
        text: 'Genera il documento fiscale e trasmetti le spese sanitarie per il 730.',
        ref: { type: 'guide', cat: 'contabilita', man: 'fatture-pazienti' }
      }
    ]
  };

  constructor(private http: HttpClient) {
    this.load();
  }

  /** Carica l'albero reale da /Data/guides.json o /api/get_guides.ashx. */
  load(): void {
    // Prova prima il file statico Data/guides.json (funziona sia su ng serve che su IIS)
    this.http.get<any>('Data/guides.json?v=' + Date.now()).subscribe({
      next: (data) => {
        if (data && Array.isArray(data.categories) && data.categories.length) {
          this.categories = data.categories;
        }
        if (data && data.journey && Array.isArray(data.journey.steps) && data.journey.steps.length) {
          this.journey = data.journey;
        }
        this.loaded = true;
      },
      error: () => {
        // In fallback prova l'handler API
        this.http.get<any>('/api/get_guides.ashx').subscribe({
          next: (apiData) => {
            if (apiData && Array.isArray(apiData.categories) && apiData.categories.length) {
              this.categories = apiData.categories;
            }
            if (apiData && apiData.journey && Array.isArray(apiData.journey.steps) && apiData.journey.steps.length) {
              this.journey = apiData.journey;
            }
            this.loaded = true;
          },
          error: () => {
            // Se entrambi falliscono, ricarica da /Data/guides.json con slash iniziale
            this.http.get<any>('/Data/guides.json').subscribe({
              next: (rootData) => {
                if (rootData && Array.isArray(rootData.categories)) {
                  this.categories = rootData.categories;
                }
                if (rootData && rootData.journey) {
                  this.journey = rootData.journey;
                }
                this.loaded = true;
              }
            });
          }
        });
      }
    });
  }

  private recomputeDerived(): void {
    this._publicCategories = (this._categories || [])
      .map(c => ({ ...c, manuals: (c.manuals || []).filter(m => m.status !== 'draft') }))
      .filter(c => c.manuals.length > 0);

    const out: any[] = [];
    this._publicCategories.forEach((c: any, ci: number) => {
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
    this._allFaqItems = out;
  }

  /**
   * Vista PUBBLICA: solo guide pubblicate (le bozze non sono visibili all'utente),
   * e categorie senza guide pubblicate vengono escluse. L'area admin usa `categories`.
   */
  get publicCategories(): Category[] {
    return this._publicCategories;
  }

  /**
   * Elenco appiattito di TUTTE le FAQ reali (da publicCategories), nella forma attesa
   * dalla modale di lettura: { id, category, color, desc (=guida), title (=domanda), steps, service }.
   */
  get allFaqItems(): any[] {
    return this._allFaqItems;
  }

  /** Ricerca su TUTTE le singole FAQ pubblicate (domanda + tag + testo degli step). */
  search(query: string, limit = 6): FaqHit[] {
    const t = (query || '').trim().toLowerCase();
    if (!t) return [];
    const hits: FaqHit[] = [];
    for (const c of this.categories) {
      for (const g of c.manuals) {
        if (g.status === 'draft') continue; // le bozze non compaiono nella ricerca pubblica
        (g.faqs || []).forEach((f, i) => {
          const hay = (f.q + ' ' + (f.tags || []).join(' ') + ' ' + (f.steps || []).map(s => s.t).join(' ')).toLowerCase();
          if (hay.includes(t)) hits.push({ category: c, guide: g, faqIndex: i, faq: f });
        });
      }
    }
    return hits.slice(0, limit);
  }
}
