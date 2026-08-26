import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalService, LegalConfig } from '../../../services/legal.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-admin-legal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-legal.component.html'
})
export class AdminLegalComponent implements OnInit {
  formData!: LegalConfig;
  supportedSoftwareInput: string = '';
  activeSubTab: 'config' | 'previewPrivacy' | 'previewTerms' = 'config';
  savedMessage = false;

  constructor(
    public legalService: LegalService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.initFormData();
  }

  initFormData(): void {
    this.formData = JSON.parse(JSON.stringify(this.legalService.config));
    this.supportedSoftwareInput = this.formData.supportedSoftware.join(', ');
  }

  saveChanges(): void {
    if (this.supportedSoftwareInput) {
      this.formData.supportedSoftware = this.supportedSoftwareInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    this.legalService.saveConfig(this.formData);
    this.savedMessage = true;
    setTimeout(() => {
      this.savedMessage = false;
    }, 3000);
  }

  resetDefaults(): void {
    if (confirm('Vuoi ripristinare i valori predefiniti ufficiali di Quaderno Elettronico?')) {
      this.legalService.resetToDefaults();
      this.initFormData();
      this.savedMessage = true;
      setTimeout(() => {
        this.savedMessage = false;
      }, 3000);
    }
  }

  testCookieBanner(): void {
    this.legalService.resetCookieConsent();
    alert('Consenso cookie resettato. Il banner ricomparirà per tutti i nuovi utenti o ricaricando la pagina.');
  }

  openPublicViewer(): void {
    this.legalService.openPrivacy();
  }

  get privacySections() {
    return this.legalService.getPrivacySections();
  }

  get termsSections() {
    return this.legalService.getTermsSections();
  }

  formatContent(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#1E2022] dark:text-white">$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
}
