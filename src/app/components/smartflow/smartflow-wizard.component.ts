import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartflowService } from '../../services/smartflow.service';
import { GuideService } from '../../services/guide.service';
import { SmartflowDraft, SmartflowDraftStep, SmartflowDraftFaq, Category } from '../guide/guide.models';

@Component({
  selector: 'app-smartflow-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smartflow-wizard.component.html',
  styleUrls: ['./smartflow-wizard.component.css']
})
export class SmartflowWizardComponent {
  currentStep = 1;
  totalSteps = 5;

  // Step 1: Area funzionale
  selectedCategoryId = '';
  newCategoryName = '';
  useNewCategory = false;

  // Step 2: Descrizione
  title = '';
  description = '';
  problemType: 'risoluzione' | 'procedura' = 'procedura';
  cause = '';
  solution = '';

  // Step 3: Passaggi operativi
  steps: SmartflowDraftStep[] = [{ t: '', img: false, video: false }];

  // Step 4: FAQ collegate
  faqs: SmartflowDraftFaq[] = [];

  // Step 5: Review
  get autoType(): 'breve' | 'standard' | 'lunga' {
    return this.smartflow.classifyType(this.steps.length, this.faqs.length);
  }

  get suggestedCategory(): string {
    if (this.selectedCategoryId) return this.selectedCategoryId;
    return this.smartflow.suggestCategory(this.title) || '';
  }

  get selectedCategoryName(): string {
    if (this.useNewCategory) {
      return this.newCategoryName.trim() || 'Nuova area personalizzata';
    }
    const cat = this.guideService.categories.find(c => c.id === this.selectedCategoryId);
    return cat ? cat.name : 'Non selezionata';
  }

  get typeEmoji(): string {
    if (this.autoType === 'breve') return '📗';
    if (this.autoType === 'standard') return '📘';
    return '📕';
  }

  get typeLabel(): string {
    if (this.autoType === 'breve') return 'Guida Breve';
    if (this.autoType === 'standard') return 'Guida Standard';
    return 'Guida Lunga';
  }

  get pointsForCurrentType(): number {
    return this.smartflow.getPointsForType(this.autoType);
  }

  // Wizard completed
  wizardComplete = false;

  // Temp operator (for now, hardcoded; Phase 4 will add real registration)
  operatorId = 'op-temp';

  get categories(): Category[] {
    return this.guideService.categories;
  }

  private iconPaths: Record<string, string> = {
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
    users: 'M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 10a3 3 0 100-6 3 3 0 000 6zM21 19v-1a4 4 0 00-3-3.9M16.5 4.1a3 3 0 010 5.8',
    truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 100-4 2 2 0 000 4zM18 19a2 2 0 100-4 2 2 0 000 4z',
    box: 'M12 3l8 4v10l-8 4-8-4V7l8-4zM4 7l8 4 8-4M12 11v10',
    tooth: 'M12 3c2.5 0 4 1.4 4 4 0 1.6-.6 3-1 6-.3 2.4-.7 4-1.6 4-1 0-1-2.4-1.4-2.4S10.6 21 9.6 21C8.7 21 8.3 19 8 16.6 7.6 13.7 7 12.3 7 10.7 7 8.4 8.5 3 12 3z',
    quote: 'M4 5h13v11H9l-4 3V5zM8 9h6M8 12h4',
    book: 'M5 5a2 2 0 012-2h11v16H7a2 2 0 00-2 2V5z'
  };

  iconPath(name: string): string {
    return this.iconPaths[name] || this.iconPaths['book'];
  }

  constructor(public smartflow: SmartflowService, public guideService: GuideService) {}

  selectCategory(catId: string): void {
    this.selectedCategoryId = catId;
    this.useNewCategory = false;
  }

  selectNewCategoryOption(): void {
    this.useNewCategory = true;
    this.selectedCategoryId = '';
  }

  applySuggestedCategory(): void {
    const sug = this.suggestedCategory;
    if (sug) {
      this.selectedCategoryId = sug;
      this.useNewCategory = false;
    }
  }

  // ----- Navigation -----
  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return (this.useNewCategory && !!this.newCategoryName.trim()) || (!this.useNewCategory && !!this.selectedCategoryId);
      case 2:
        return !!this.title.trim() && !!this.description.trim();
      case 3:
        return this.steps.length > 0 && this.steps.every(s => !!s.t.trim());
      case 4:
        return true; // FAQs are optional
      case 5:
        return true;
      default:
        return false;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    } else if (step > this.currentStep && this.canProceed()) {
      if (step === 4 && this.autoType === 'breve') {
        this.currentStep = 5;
      } else {
        this.currentStep = step;
      }
    }
  }

  nextStep(): void {
    if (!this.canProceed()) return;
    // Skip step 4 (FAQ) if auto-type is 'breve'
    if (this.currentStep === 3 && this.autoType === 'breve') {
      this.currentStep = 5;
    } else if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    // If we're on step 5 and type is breve, go back to step 3 (skip 4)
    if (this.currentStep === 5 && this.autoType === 'breve') {
      this.currentStep = 3;
    } else if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // ----- Step Management -----
  addStep(): void {
    this.steps.push({ t: '', img: false, video: false });
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.splice(index, 1);
    }
  }

  moveStep(index: number, dir: -1 | 1): void {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= this.steps.length) return;
    const temp = this.steps[index];
    this.steps[index] = this.steps[newIdx];
    this.steps[newIdx] = temp;
  }

  // ----- FAQ Management -----
  addFaq(): void {
    this.faqs.push({ q: '', a: '' });
  }

  removeFaq(index: number): void {
    this.faqs.splice(index, 1);
  }

  // ----- Submit -----
  submitDraft(): void {
    const targetCat = this.useNewCategory
      ? (this.newCategoryName.trim() || 'uncategorized')
      : (this.selectedCategoryId || 'uncategorized');

    const draft: SmartflowDraft = {
      id: 'draft-' + Date.now(),
      operatorId: this.operatorId,
      type: this.autoType,
      targetCategory: targetCat,
      title: this.title.trim(),
      description: this.description.trim(),
      problemType: this.problemType,
      cause: this.problemType === 'risoluzione' ? this.cause.trim() : undefined,
      solution: this.problemType === 'risoluzione' ? this.solution.trim() : undefined,
      steps: this.steps.filter(s => !!s.t.trim()),
      faqs: this.faqs.filter(f => !!f.q.trim()),
      status: 'pending',
      createdAt: new Date().toLocaleDateString('it-IT'),
      kbEntriesUsed: []
    };

    this.smartflow.saveDraft(draft);
    this.wizardComplete = true;
  }

  // Reset wizard for another draft
  resetWizard(): void {
    this.currentStep = 1;
    this.selectedCategoryId = '';
    this.newCategoryName = '';
    this.useNewCategory = false;
    this.title = '';
    this.description = '';
    this.problemType = 'procedura';
    this.cause = '';
    this.solution = '';
    this.steps = [{ t: '', img: false, video: false }];
    this.faqs = [];
    this.wizardComplete = false;
  }
}
