import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GuideService } from '../../services/guide.service';
import { SmartflowService } from '../../services/smartflow.service';
import { Category, Guide, Faq, Step, HomePill } from './guide.models';
import { SmartflowWizardComponent } from '../smartflow/smartflow-wizard.component';
import { SmartflowReviewComponent } from '../smartflow/smartflow-review.component';
import { SmartflowLeaderboardComponent } from '../smartflow/smartflow-leaderboard.component';

@Component({
  selector: 'app-guide-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SmartflowWizardComponent,
    SmartflowReviewComponent,
    SmartflowLeaderboardComponent
  ],
  templateUrl: './guide-admin.component.html'
})
export class GuideAdminComponent {
  @Input() activeTab: 'manuals' | 'pills' | 'smartflow' = 'manuals';
  sfView: 'wizard' | 'review' | 'leaderboard' = 'wizard';

  selCat: Category | null = null;
  selGuide: Guide | null = null;
  expanded: Record<string, boolean> = {};
  saving = false;
  saveMsg = '';
  saveOk = false;

  iconOptions = ['receipt', 'users', 'truck', 'box', 'tooth', 'quote', 'book'];
  private iconPaths: Record<string, string> = {
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
    users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6zM21 19v-1a4 4 0 00-3-3.9M16.5 4.1a3 3 0 010 5.8',
    truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z',
    box: 'M12 3l8 4v10l-8 4-8-4V7l8-4zM4 7l8 4 8-4M12 11v10',
    tooth: 'M12 3c2.5 0 4 1.4 4 4 0 1.6-.6 3-1 6-.3 2.4-.7 4-1.6 4-1 0-1-2.4-1.4-2.4S10.6 21 9.6 21C8.7 21 8.3 19 8 16.6 7.6 13.7 7 12.3 7 10.7 7 8.4 8.5 3 12 3z',
    quote: 'M4 5h13v11H9l-4 3V5zM8 9h6M8 12h4',
    book: 'M5 5a2 2 0 012-2h11v16H7a2 2 0 00-2 2V5z'
  };
  iconPath(name: string): string { return this.iconPaths[name] || this.iconPaths['book']; }

  constructor(public guides: GuideService, public smartflow: SmartflowService, private http: HttpClient) {}


  get categories(): Category[] { return this.guides.categories; }
  get homePills(): HomePill[] { return this.guides.homePills; }

  faqCount(c: Category): number { return c.manuals.reduce((n, g) => n + g.faqs.length, 0); }

  private slug(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'voce';
  }
  private uniqueId(base: string, existing: string[]): string {
    let id = this.slug(base); let i = 2;
    while (existing.includes(id)) { id = this.slug(base) + '-' + i; i++; }
    return id;
  }
  private today(): string {
    const d = new Date();
    const mesi = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
    return d.getDate() + ' ' + mesi[d.getMonth()] + ' ' + d.getFullYear();
  }

  toggle(cat: Category) { this.expanded[cat.id] = !this.expanded[cat.id]; }
  isOpen(cat: Category) { return !!this.expanded[cat.id]; }
  selectCat(cat: Category) { this.selCat = cat; this.selGuide = null; this.expanded[cat.id] = true; }
  selectGuide(cat: Category, g: Guide) { this.selCat = cat; this.selGuide = g; }

  // ----- Categorie -----
  addCategory() {
    const id = this.uniqueId('nuova-categoria', this.categories.map(c => c.id));
    const cat: Category = { id, name: 'Nuova categoria', icon: 'book', accent: 'blue', desc: '', manuals: [] };
    this.categories.push(cat); this.expanded[id] = true; this.selCat = cat; this.selGuide = null;
  }
  deleteCategory(cat: Category, ev: Event) {
    ev.stopPropagation();
    if (!confirm('Eliminare la categoria "' + cat.name + '" e tutte le sue guide?')) return;
    const i = this.categories.indexOf(cat); if (i >= 0) this.categories.splice(i, 1);
    if (this.selCat === cat) { this.selCat = null; this.selGuide = null; }
  }

  // ----- Guide -----
  addGuide(cat: Category, ev?: Event) {
    if (ev) ev.stopPropagation();
    const id = this.uniqueId('nuova-guida', cat.manuals.map(g => g.id));
    const g: Guide = { id, title: 'Nuova guida', status: 'draft', updated: this.today(), desc: '', overview: '', faqs: [] };
    cat.manuals.push(g); this.expanded[cat.id] = true; this.selCat = cat; this.selGuide = g;
  }
  deleteGuide(cat: Category, g: Guide, ev: Event) {
    ev.stopPropagation();
    if (!confirm('Eliminare la guida "' + g.title + '"?')) return;
    const i = cat.manuals.indexOf(g); if (i >= 0) cat.manuals.splice(i, 1);
    if (this.selGuide === g) this.selGuide = null;
  }

  // ----- FAQ / step -----
  addFaq() {
    if (!this.selGuide) return;
    this.selGuide.faqs.push({ q: 'Nuova domanda', tags: [], updated: this.today(), steps: [{ t: '' }] });
  }
  deleteFaq(f: Faq) {
    if (!this.selGuide) return;
    const i = this.selGuide.faqs.indexOf(f); if (i >= 0) this.selGuide.faqs.splice(i, 1);
  }
  addStep(f: Faq) { f.steps.push({ t: '' }); }
  deleteStep(f: Faq, s: Step) { const i = f.steps.indexOf(s); if (i >= 0) f.steps.splice(i, 1); }

  tagsStr(f: Faq): string { return (f.tags || []).join(', '); }
  setTags(f: Faq, val: string) { f.tags = val.split(',').map(t => t.trim()).filter(Boolean); }

  // ----- Gestione Pills Home -----
  addPill() {
    const firstCat = this.categories[0];
    const newPill: HomePill = {
      id: 'p-' + Date.now(),
      label: 'Nuova Pill',
      targetType: 'category',
      targetId: firstCat ? firstCat.id : ''
    };
    this.guides.homePills.push(newPill);
  }

  addSuggestedPill(sug: HomePill) {
    this.guides.homePills.push({
      ...sug,
      id: 'p-' + Date.now()
    });
  }

  removePill(index: number) {
    this.guides.homePills.splice(index, 1);
  }

  movePill(index: number, dir: -1 | 1) {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= this.guides.homePills.length) return;
    const temp = this.guides.homePills[index];
    this.guides.homePills[index] = this.guides.homePills[newIdx];
    this.guides.homePills[newIdx] = temp;
  }

  getAllGuides(): { id: string; title: string; categoryName: string; categoryId: string }[] {
    const list: { id: string; title: string; categoryName: string; categoryId: string }[] = [];
    for (const c of this.categories) {
      for (const g of (c.manuals || [])) {
        list.push({ id: g.id, title: g.title, categoryName: c.name, categoryId: c.id });
      }
    }
    return list;
  }

  onPillTargetTypeChange(pill: HomePill) {
    if (pill.targetType === 'category') {
      const firstCat = this.categories[0];
      pill.targetId = firstCat ? firstCat.id : '';
      pill.categoryId = undefined;
    } else {
      const firstGuide = this.getAllGuides()[0];
      if (firstGuide) {
        pill.targetId = firstGuide.id;
        pill.categoryId = firstGuide.categoryId;
      }
    }
  }

  onPillGuideChange(pill: HomePill, guideId: string) {
    pill.targetId = guideId;
    const found = this.getAllGuides().find(g => g.id === guideId);
    if (found) {
      pill.categoryId = found.categoryId;
    }
  }

  getSuggestions(): { pill: HomePill; reason: string }[] {
    return this.guides.getSuggestedPills();
  }

  logoutOp() {
    this.smartflow.logout();
  }

  // ----- Salvataggio -----
  save() {
    this.saving = true; this.saveMsg = '';
    const token = sessionStorage.getItem('adminToken');
    const headers: any = token ? { Authorization: 'Bearer ' + token } : {};
    this.http.post('/api/get_guides.ashx', {
      categories: this.guides.categories,
      journey: this.guides.journey,
      homePills: this.guides.homePills
    }, { headers }).subscribe({
      next: () => { this.saving = false; this.saveOk = true; this.saveMsg = 'Modifiche salvate'; setTimeout(() => this.saveMsg = '', 3500); },
      error: () => { this.saving = false; this.saveOk = false; this.saveMsg = 'Errore nel salvataggio (serve login admin e ambiente IIS)'; }
    });
  }

  async uploadMedia(event: any, type: 'img' | 'video', step: Step) {
    const file = event.target.files[0];
    if (!file || !this.selCat || !this.selGuide) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', this.selCat.id);
    formData.append('id', this.selGuide.id);

    try {
      const token = sessionStorage.getItem('adminToken');
      const headers: any = token ? { Authorization: 'Bearer ' + token } : {};
      const res = await this.http.post<{success: boolean, url: string}>('api/upload_asset.ashx', formData, { headers }).toPromise();
      if (res && res.success) {
         if (type === 'img') {
           step.img = true;
           step.imgUrl = res.url;
         } else {
           step.video = true;
           step.videoUrl = res.url;
         }
      }
    } catch(e) {
      alert("Errore durante il caricamento del file.");
    }
  }
}
