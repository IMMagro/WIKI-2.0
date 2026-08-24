import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideService } from '../../../services/guide.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  isNotificationOpen = false;
  adminNotifications: any[] = [];
  accessStats: any = null;
  // Silhouette stilizzata dell'Italia nel viewBox 0 0 300 300, coerente con le
  // coordinate x/y dei nodi-città seminati in Data/access_stats.json.
  italyPath =
    'M40 56 L68 42 L110 46 L134 50 L152 70 L166 96 L182 128 L200 158 L216 186 L228 196 ' +
    'L214 206 L196 202 L186 210 L182 232 L176 250 L164 252 L156 236 L158 214 L146 198 ' +
    'L128 176 L116 150 L106 120 L96 96 L78 74 L54 64 Z ' +
    'M118 250 L186 256 L152 282 Z ' +
    'M52 150 L84 156 L80 208 L56 202 Z';

  constructor(private guideService: GuideService, private http: HttpClient) {}

  ngOnInit() {
    this.adminNotifications = [
      { message: 'Nuovo backup generato con successo', time: '10 min fa', icon: 'fallback' }
    ];
    this.loadAccessStats();
  }

  get guideStats() {
    const cats = this.guideService.categories;
    let guides = 0, faqs = 0, published = 0, drafts = 0, maxFaqs = 0;
    const perCategory = cats.map(c => {
      const gf = c.manuals.reduce((n, g) => n + g.faqs.length, 0);
      guides += c.manuals.length;
      faqs += gf;
      c.manuals.forEach(g => g.status === 'pub' ? published++ : drafts++);
      if (gf > maxFaqs) maxFaqs = gf;
      return { name: c.name, accent: c.accent, guides: c.manuals.length, faqs: gf };
    });
    return { categories: cats.length, guides, faqs, published, drafts, maxFaqs: maxFaqs || 1, perCategory };
  }

  get publishGradient(): string {
    const s = this.guideStats;
    const total = (s.published + s.drafts) || 1;
    const p = (s.published / total) * 100;
    return `conic-gradient(#12B76A ${p}%, #F79009 ${p}%)`;
  }

  get draftGuides(): { category: string; title: string }[] {
    const out: { category: string; title: string }[] = [];
    this.guideService.categories.forEach(c => c.manuals.forEach(g => {
      if (g.status === 'draft') out.push({ category: c.name, title: g.title });
    }));
    return out;
  }

  private loadAccessStats() {
    this.http.get<any>('/api/get_access_stats.ashx').subscribe({
      next: (d) => this.accessStats = d,
      error: () => {}
    });
  }

  get accessHeatmap(): { rows: { day: string; cells: { h: number; v: number; alpha: number }[] }[]; max: number; hasData: boolean } {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const hm = this.accessStats && Array.isArray(this.accessStats.heatmap) ? this.accessStats.heatmap : null;
    if (!hm || hm.length === 0) return { rows: [], max: 0, hasData: false };
    const rows = days.map((day, di) => ({
      day,
      cells: (((hm[di] as number[]) || [])).map((v: any, h: number) => ({ h, v: v || 0, alpha: 0 }))
    }));
    let max = 0;
    rows.forEach(r => r.cells.forEach(c => { if (c.v > max) max = c.v; }));
    const denom = max || 1;
    rows.forEach(r => r.cells.forEach(c => c.alpha = c.v === 0 ? 0.05 : 0.15 + 0.85 * (c.v / denom)));
    return { rows, max, hasData: max > 0 };
  }

  get accessMapNodes(): { name: string; x: number; y: number; v: number }[] {
    return (this.accessStats && Array.isArray(this.accessStats.mapNodes)) ? this.accessStats.mapNodes : [];
  }
  get accessMapNodesSorted() { return [...this.accessMapNodes].sort((a, b) => b.v - a.v); }
  get accessMapMax() { return Math.max(1, ...this.accessMapNodes.map(n => n.v)); }
  get accessMapHasData() { return this.accessMapNodes.some(n => n.v > 0); }
}
