import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Comunicazioni (news): caricamento dal backend, filtro bozze (non visibili
 * all'utente), tracciamento "già viste" per il pallino rosso della campanella
 * e stato della comunicazione aperta a schermo (popup).
 */
@Injectable({ providedIn: 'root' })
export class NewsService {
  allNews: any[] = [];
  selectedNews: any = null; // comunicazione aperta a schermo nel popup

  private seenNewsKeys = new Set<string>(this.loadSeenNews());

  constructor(private http: HttpClient) {}

  loadNews(onLoaded?: () => void) {
    this.http.get<any[]>('/api/get_admin_news.ashx').subscribe({
      next: (data) => {
        this.allNews = (Array.isArray(data) && data.length > 0) ? data : [];
        if (this.allNews.length === 0) {
          this.loadFallbackNews(onLoaded);
        } else {
          onLoaded?.();
        }
      },
      error: () => {
        this.loadFallbackNews(onLoaded);
      }
    });
  }

  private loadFallbackNews(onLoaded?: () => void) {
    this.http.get<any[]>('/Data/news.json').subscribe({
      next: (data) => {
        this.allNews = data || [];
        onLoaded?.();
      },
      error: () => {
        this.allNews = [
          {
            id: 1,
            title: 'Benvenuti nel nuovo Portale Assistenza QE 2.0',
            category: 'Generale',
            date: 'Oggi',
            excerpt: 'È online il nuovo portale con motore di ricerca istantaneo per manuali, FAQ interattive e visualizzatore a schede.',
            status: 'published'
          }
        ];
        onLoaded?.();
      }
    });
  }

  /** News per un programma (es. "Windent"): esclude le bozze, non visibili all'utente. */
  newsForProgram(programName: string): any[] {
    return (this.allNews || []).filter(n => n && String(n.category || '').toLowerCase() === String(programName || '').toLowerCase() && n.status !== 'draft');
  }

  /** News "Generale" pubblicate (le bozze non sono visibili all'utente) — campanella in home. */
  get generalNews(): any[] {
    return (this.allNews || []).filter(n => n && String(n.category || '').toLowerCase() === 'generale' && n.status !== 'draft');
  }

  /** Vero se c'è almeno una comunicazione Generale non ancora aperta → pallino rosso. */
  get hasUnseenGeneralNews(): boolean {
    return this.generalNews.some(n => !this.isNewsSeen(n));
  }

  private loadSeenNews(): string[] {
    try { return JSON.parse(localStorage.getItem('qe_seen_news') || '[]'); } catch { return []; }
  }
  private newsKey(n: any): string { return String((n && (n.id ?? n.title)) || ''); }

  isNewsSeen(n: any): boolean { return this.seenNewsKeys.has(this.newsKey(n)); }

  markNewsSeen(n: any): void {
    const k = this.newsKey(n);
    if (k && !this.seenNewsKeys.has(k)) {
      this.seenNewsKeys.add(k);
      localStorage.setItem('qe_seen_news', JSON.stringify(Array.from(this.seenNewsKeys)));
    }
  }

  /** Apre la comunicazione a schermo intero (rende i blocchi liberi se presenti). */
  openNewsPopup(n: any): void {
    this.selectedNews = n;
    this.markNewsSeen(n);
  }

  closeNewsPopup(): void {
    this.selectedNews = null;
  }
}
