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

  getTypeBadgeInfo(type: 'breve' | 'standard' | 'lunga'): { label: string; emoji: string; colorClass: string; points: number } {
    if (type === 'breve') {
      return { label: 'Guida Breve', emoji: '📗', colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', points: 10 };
    }
    if (type === 'standard') {
      return { label: 'Guida Standard', emoji: '📘', colorClass: 'bg-[#EAF1FF] text-[#377DFF] border-blue-200', points: 25 };
    }
    return { label: 'Guida Lunga', emoji: '📕', colorClass: 'bg-[#FFE9F4] text-[#F80086] border-pink-200', points: 50 };
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
      steps: this.selectedDraft.steps.map(s => ({ t: s.t, img: s.img, video: s.video }))
    };

    const extraFaqs: Faq[] = (this.selectedDraft.faqs || []).map(f => ({
      q: f.q,
      tags: [],
      updated: new Date().toLocaleDateString('it-IT'),
      steps: [{ t: f.a }]
    }));

    const newGuide: Guide = {
      id: newGuideId,
      title: this.selectedDraft.title,
      status: 'pub',
      updated: new Date().toLocaleDateString('it-IT'),
      desc: introText,
      faqs: [mainFaq, ...extraFaqs]
    };

    // Add to category
    const cat = this.guideService.categories.find(c => c.id === this.selectedDraft!.targetCategory);
    if (cat) {
      cat.manuals.push(newGuide);
    } else {
      // Fallback to first category if not found
      if (this.guideService.categories.length > 0) {
        this.guideService.categories[0].manuals.push(newGuide);
      }
    }

    // Award points
    const points = this.smartflow.getPointsForType(this.selectedDraft.type);
    this.smartflow.addScore(this.selectedDraft.operatorId, points);

    // Update draft status
    this.selectedDraft.status = 'approved';
    this.smartflow.saveDraft(this.selectedDraft);
    
    this.selectedDraft = null;
  }

  reject() {
    if (!this.selectedDraft) return;
    this.selectedDraft.status = 'rejected';
    this.selectedDraft.rejectionNote = this.rejectionNote;
    this.smartflow.saveDraft(this.selectedDraft);
    this.selectedDraft = null;
    this.showRejectModal = false;
  }
}
