import { Injectable } from '@angular/core';

/**
 * Pannello di lettura di una FAQ (aperto dalla ricerca in home o dalla pagina FAQ)
 * e tracciamento "già letta" persistito in localStorage. Singleton condiviso, così
 * home e pagina FAQ aprono lo stesso pannello senza duplicare stato.
 */
@Injectable({ providedIn: 'root' })
export class FaqReadingService {
  selectedFaq: any = null;
  readingDesignVariant: 'A' | 'B' | 'C' | 'D' = 'A';

  readFaqs: Set<number> = new Set<number>(this.loadReadFaqs());

  private loadReadFaqs(): number[] {
    try {
      const parsed = JSON.parse(localStorage.getItem('qe_read_faqs') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  markFaqAsRead(id: number): void {
    if (id && !this.readFaqs.has(id)) {
      this.readFaqs.add(id);
      localStorage.setItem('qe_read_faqs', JSON.stringify(Array.from(this.readFaqs)));
    }
  }

  isFaqRead(id: number): boolean {
    return this.readFaqs.has(id);
  }

  /** Apre il pannello laterale (variante C) sulla FAQ e la segna come letta. */
  openFaq(faq: any): void {
    this.readingDesignVariant = 'C';
    this.selectedFaq = faq;
    if (faq && faq.id) this.markFaqAsRead(faq.id);
  }

  closeFaq(): void {
    this.selectedFaq = null;
  }
}
