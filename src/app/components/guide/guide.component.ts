import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideService } from '../../services/guide.service';
import { Category, Guide, Faq, Service, Ref, JourneyStep, Journey } from './guide.models';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent {
  @ViewChild('stage') stage?: ElementRef<HTMLElement>;

  // Stato di navigazione (drill-down "a schede")
  view: 'cats' | 'guides' | 'read' | 'journey' = 'cats';
  selCat: string | null = null;
  selGuide: string | null = null;
  selFaq = -1; // -1 = panoramica della guida

  // Popup servizio consigliato
  svcVisible = false;
  svcData: Service | null = null;
  private svcTimer: any = null;

  // Icone (solo il path "d", reso via [attr.d])
  icons: Record<string, string> = {
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
    users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6zM21 19v-1a4 4 0 00-3-3.9M16.5 4.1a3 3 0 010 5.8',
    truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z',
    box: 'M12 3l8 4v10l-8 4-8-4V7l8-4zM4 7l8 4 8-4M12 11v10',
    tooth: 'M12 3c2.5 0 4 1.4 4 4 0 1.6-.6 3-1 6-.3 2.4-.7 4-1.6 4-1 0-1-2.4-1.4-2.4S10.6 21 9.6 21C8.7 21 8.3 19 8 16.6 7.6 13.7 7 12.3 7 10.7 7 8.4 8.5 3 12 3z',
    quote: 'M4 5h13v11H9l-4 3V5zM8 9h6M8 12h4',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10c.7.7 1 1.4 1 2h6c0-.6.3-1.3 1-2a6 6 0 00-4-10z',
    compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM14.8 9.2l-1.6 4.6-4.6 1.6 1.6-4.6 4.6-1.6z',
    chevR: 'M9 6l6 6-6 6',
    chevL: 'M15 18l-6-6 6-6',
    close: 'M6 6l12 12M18 6L6 18',
    book: 'M5 5a2 2 0 012-2h11v16H7a2 2 0 00-2 2V5z',
    q: 'M8.2 9a3.8 3.8 0 117.6.4c0 2.2-3.4 2.6-3.4 5M12 18h.01',
    clock: 'M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  // ===== Dati (dal GuideService: reali via /api/get_guides.ashx, con fallback interno) =====
  get categories(): Category[] { return this.guides.categories; }
  get journey(): Journey { return this.guides.journey; }

  // ===== Helpers =====
  cat(id: string | null): Category | undefined { return this.categories.find(c => c.id === id); }
  guide(cid: string | null, gid: string | null): Guide | undefined { return this.cat(cid)?.manuals.find(m => m.id === gid); }
  get curCat(): Category | undefined { return this.cat(this.selCat); }
  get curGuide(): Guide | undefined { return this.guide(this.selCat, this.selGuide); }
  get curFaq(): Faq | undefined { return this.selFaq >= 0 ? this.curGuide?.faqs[this.selFaq] : undefined; }
  faqTotal(c: Category): number { return c.manuals.reduce((n, m) => n + m.faqs.length, 0); }

  refMeta(r: Ref): { cls: string; icon: string; label: string } {
    if (r.type === 'category') return { cls: 'rc-cat', icon: 'box', label: 'Categoria · ' + (this.cat(r.cat!)?.name || '') };
    if (r.type === 'guide') return { cls: 'rc-guide', icon: 'book', label: 'Guida · ' + (this.guide(r.cat!, r.man!)?.title || '') };
    if (r.type === 'faq') return { cls: 'rc-faq', icon: 'q', label: 'FAQ · ' + (this.guide(r.cat!, r.man!)?.faqs[r.faq!]?.q || '') };
    return { cls: '', icon: 'compass', label: 'Home' };
  }

  // ===== Navigazione =====
  private play(dir: 'fwd' | 'back') {
    const el = this.stage?.nativeElement;
    if (!el) return;
    el.classList.remove('fwd', 'back');
    void el.offsetWidth;              // forza il restart dell'animazione
    el.classList.add(dir);
  }

  goHome() { this.view = 'cats'; this.selCat = null; this.selGuide = null; this.selFaq = -1; this.hideSvc(); this.play('back'); }
  openJourney() { this.view = 'journey'; this.hideSvc(); this.play('fwd'); }
  openCat(id: string, dir: 'fwd' | 'back' = 'fwd') { this.view = 'guides'; this.selCat = id; this.hideSvc(); this.play(dir); }
  openGuide(id: string) { this.view = 'read'; this.selGuide = id; this.selFaq = -1; this.hideSvc(); this.play('fwd'); }

  openFaq(i: number) {
    const g = this.curGuide;
    if (!g || i < -1 || i >= g.faqs.length) return;
    if (i >= 0) g.faqs[i].read = true;
    this.selFaq = i;
    if (i >= 0) { const svc = g.faqs[i].service || g.service; if (svc) this.showSvc(svc); else this.hideSvc(); }
    else this.hideSvc();
  }

  openRef(step: JourneyStep) {
    const r = step.ref;
    if (r.type === 'category') { this.openCat(r.cat!); }
    else if (r.type === 'guide') { this.selCat = r.cat!; this.openGuide(r.man!); }
    else if (r.type === 'faq') { this.selCat = r.cat!; this.selGuide = r.man!; this.view = 'read'; this.play('fwd'); this.openFaq(r.faq!); }
    else this.goHome();
  }

  // ===== Popup servizio =====
  private showSvc(s: Service) {
    clearTimeout(this.svcTimer);
    this.svcData = s;
    this.svcVisible = false;
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    this.svcTimer = setTimeout(() => { this.svcVisible = true; }, reduce ? 0 : 600);
  }
  hideSvc() { clearTimeout(this.svcTimer); this.svcVisible = false; }

  constructor(private guides: GuideService) {}

  /** Apre una FAQ specifica da navigazione esterna (es. ricerca dalla home). */
  openFaqByRef(catId: string, guideId: string, faqIndex: number): void {
    this.selCat = catId;
    this.selGuide = guideId;
    this.view = 'read';
    this.play('fwd');
    this.openFaq(faqIndex);
  }
}
