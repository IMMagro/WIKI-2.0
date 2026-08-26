import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalService, LegalConfig } from '../../../services/legal.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-legal-wizard-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './legal-wizard-modal.component.html'
})
export class LegalWizardModalComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 4;

  // Local working copy of config for the wizard
  wizardData!: LegalConfig;
  supportedSoftwareString: string = '';
  saveSuccessMessage = false;
  previewTab: 'privacy' | 'terms' = 'privacy';

  constructor(
    public legalService: LegalService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.initWizardData();
  }

  initWizardData(): void {
    // Deep clone current config
    this.wizardData = JSON.parse(JSON.stringify(this.legalService.config));
    this.supportedSoftwareString = this.wizardData.supportedSoftware.join(', ');
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.syncSoftwareArray();
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.syncSoftwareArray();
      this.currentStep = step;
    }
  }

  syncSoftwareArray(): void {
    if (this.supportedSoftwareString) {
      this.wizardData.supportedSoftware = this.supportedSoftwareString
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
  }

  close(): void {
    this.legalService.closeWizard();
  }

  resetDefaults(): void {
    if (confirm('Sei sicuro di voler ripristinare i testi e i parametri predefiniti di Quaderno Elettronico?')) {
      this.legalService.resetToDefaults();
      this.initWizardData();
      this.currentStep = 1;
    }
  }

  saveAndApply(): void {
    this.syncSoftwareArray();
    this.legalService.saveConfig(this.wizardData);
    this.saveSuccessMessage = true;
    setTimeout(() => {
      this.saveSuccessMessage = false;
      this.legalService.closeWizard();
      this.legalService.openPrivacy();
    }, 1200);
  }

  get previewPrivacySections() {
    // Temporarily build preview from working wizardData
    const oldConfig = this.legalService.config;
    this.legalService.config = this.wizardData;
    const sections = this.legalService.getPrivacySections();
    this.legalService.config = oldConfig;
    return sections;
  }

  get previewTermsSections() {
    const oldConfig = this.legalService.config;
    this.legalService.config = this.wizardData;
    const sections = this.legalService.getTermsSections();
    this.legalService.config = oldConfig;
    return sections;
  }

  formatContent(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#1E2022] dark:text-white">$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
}
