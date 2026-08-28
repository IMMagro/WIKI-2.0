import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartflowService } from '../../services/smartflow.service';
import { GuideService } from '../../services/guide.service';
import { SmartflowDraft, Guide, Faq, Step, SmartflowOperator } from '../guide/guide.models';

@Component({
  selector: 'app-smartflow-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smartflow-review.component.html'
})
export class SmartflowReviewComponent {
  selectedDraft: SmartflowDraft | null = null;
  rejectionNote = '';
  showRejectModal = false;
  showImportModal = false;
  importedText = '';

  constructor(public smartflow: SmartflowService, public guideService: GuideService) {}

  selectDraft(draft: SmartflowDraft) {
    this.selectedDraft = draft;
    this.showRejectModal = false;
    this.rejectionNote = '';
  }

  get drafts(): SmartflowDraft[] {
    return this.smartflow.pendingDrafts;
  }

  getCategoryName(id: string): string {
    const c = this.guideService.categories.find(cat => cat.id === id);
    return c ? c.name : id;
  }

  getOperator(id: string): SmartflowOperator | undefined {
    return this.smartflow.getOperator(id);
  }

  getTypeBadgeInfo(type: 'breve' | 'standard' | 'lunga'): { label: string; colorClass: string; points: number } {
    if (type === 'breve') {
      return { label: 'Guida Breve', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', points: 10 };
    }
    if (type === 'standard') {
      return { label: 'Guida Standard', colorClass: 'bg-[#EAF1FF] text-[#377DFF] border-blue-200', points: 25 };
    }
    return { label: 'Guida Lunga', colorClass: 'bg-[#FFE9F4] text-[#F80086] border-pink-200', points: 50 };
  }

  approve() {
    if (!this.selectedDraft) return;
    
    // Transform draft into a Guide object
    const newGuideId = 'guide-' + Date.now();
    
    let introText = this.selectedDraft.description;
    if (this.selectedDraft.problemType === 'risoluzione') {
      if (this.selectedDraft.cause) {
        introText += '\n\nCausa: ' + this.selectedDraft.cause;
      }
      if (this.selectedDraft.solution) {
        introText += '\n\nSoluzione: ' + this.selectedDraft.solution;
      }
    }

    const mainFaq: Faq = {
      q: 'Procedura Principale',
      tags: [],
      updated: new Date().toLocaleDateString('it-IT'),
      steps: (this.selectedDraft.steps || []).map(s => ({
        t: s.t,
        img: s.img,
        imgUrl: s.imgUrl,
        video: s.video,
        videoUrl: s.videoUrl
      }))
    };

    const extraFaqs: Faq[] = (this.selectedDraft.faqs || []).map(f => ({
      q: f.q,
      tags: [],
      updated: new Date().toLocaleDateString('it-IT'),
      steps: [{
        t: f.a,
        img: f.img,
        imgUrl: f.imgUrl,
        video: f.video,
        videoUrl: f.videoUrl
      }],
      extra: true
    }));

    const newGuide: Guide = {
      id: newGuideId,
      title: this.selectedDraft.title,
      status: 'pub',
      updated: new Date().toLocaleDateString('it-IT'),
      desc: introText,
      overview: this.selectedDraft.overview,
      faqs: []
    };

    // Always include mainFaq (steps) if present
    if (this.selectedDraft.steps && this.selectedDraft.steps.length > 0) {
      newGuide.faqs.push(mainFaq);
    }
    // Always include FAQ accordion items
    if (extraFaqs && extraFaqs.length > 0) {
      newGuide.faqs.push(...extraFaqs);
    }

    // Add to category
    let cat = this.guideService.categories.find(c => c.id === this.selectedDraft!.targetCategory || c.name.toLowerCase() === this.selectedDraft!.targetCategory.toLowerCase());
    if (!cat) {
      const newCatId = this.selectedDraft!.targetCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      cat = {
        id: newCatId,
        name: this.selectedDraft!.targetCategory,
        icon: 'book',
        accent: 'blue',
        desc: 'Categoria creata da SmartFlow',
        manuals: []
      };
      this.guideService.categories.push(cat);
    }
    cat.manuals.push(newGuide);

    // Save the new guide to backend immediately
    this.guideService.saveToBackend();

    // Award points
    const points = this.smartflow.getPointsForType(this.selectedDraft.type);
    this.smartflow.addScore(this.selectedDraft.operatorId, points);

    // Update draft status
    this.selectedDraft.status = 'approved';
    this.smartflow.saveDraft(this.selectedDraft);
    
    this.selectedDraft = null;
  }

  copyForAI() {
    if (!this.selectedDraft) return;
    const d = this.selectedDraft;
    let txt = `# BOZZA MANUALE SMARTFLOW\n\n`;
    txt += `**Titolo**: ${d.title}\n`;
    txt += `**Categoria**: ${this.getCategoryName(d.targetCategory)}\n`;
    txt += `**Tipo stimato**: ${this.getTypeBadgeInfo(d.type).label}\n\n`;
    txt += `## Descrizione\n${d.description}\n\n`;
    if (d.problemType === 'risoluzione') {
      txt += `**Causa**: ${d.cause}\n\n`;
      txt += `**Soluzione**: ${d.solution}\n\n`;
    }
    if (d.steps && d.steps.length > 0) {
      txt += `\n## Passaggi Operativi\n`;
      d.steps.forEach((s, i) => {
        txt += `${i + 1}. ${s.t}\n`;
        if (s.img || s.video) {
          txt += `   *(Media richiesti: ${s.img ? 'Screenshot ' : ''}${s.video ? 'Video ' : ''})*\n`;
          if (s.imgUrl) txt += `   *(URL Immagine: ${s.imgUrl})*\n`;
          if (s.videoUrl) txt += `   *(URL Video: ${s.videoUrl})*\n`;
        }
      });
    }

    if (d.faqs && d.faqs.length > 0) {
      txt += `\n## FAQ Collegate\n`;
      d.faqs.forEach(f => {
        txt += `**Q**: ${f.q}\n**A**: ${f.a}\n`;
        if (f.img || f.video) {
          txt += `   *(Media richiesti: ${f.img ? 'Screenshot ' : ''}${f.video ? 'Video ' : ''})*\n`;
          if (f.imgUrl) txt += `   *(URL Immagine: ${f.imgUrl})*\n`;
          if (f.videoUrl) txt += `   *(URL Video: ${f.videoUrl})*\n`;
        }
        txt += `\n`;
      });
    }
    navigator.clipboard.writeText(txt).then(() => {
      alert('Bozza copiata negli appunti! Incollala in chat per revisione AI.');
    }).catch(err => {
      console.error('Errore nella copia', err);
    });
  }

  reject() {
    if (!this.selectedDraft) return;
    this.selectedDraft.status = 'rejected';
    this.selectedDraft.rejectionNote = this.rejectionNote;
    this.smartflow.saveDraft(this.selectedDraft);
    this.selectedDraft = null;
    this.showRejectModal = false;
  }

  importFromAI() {
    if (!this.selectedDraft || !this.importedText) return;
    
    // Parse YAML frontmatter
    const titleMatch = this.importedText.match(/title:\s*"(.*?)"/);
    if (titleMatch && titleMatch[1]) {
      this.selectedDraft.title = titleMatch[1];
    }

    const descMatch = this.importedText.match(/description:\s*"(.*?)"/);
    if (descMatch && descMatch[1]) {
      this.selectedDraft.description = descMatch[1];
    }

    // Extract HTML body (everything after the second ---)
    const parts = this.importedText.split('---');
    if (parts.length >= 3) {
      // The first part is empty (before first ---)
      // The second part is frontmatter
      // The rest is the body
      const body = parts.slice(2).join('---').trim();
      this.selectedDraft.overview = body;
    } else {
      // No valid frontmatter found, just use the whole text as overview
      this.selectedDraft.overview = this.importedText;
    }

    this.showImportModal = false;
    alert('Importazione completata con successo! Clicca "Approva e Pubblica" per finalizzare.');
  }
}
