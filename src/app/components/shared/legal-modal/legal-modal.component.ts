import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalService, LegalSection } from '../../../services/legal.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-legal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './legal-modal.component.html'
})
export class LegalModalComponent implements OnInit {
  searchQuery: string = '';
  accepted = false;
  copiedNotification = false;

  constructor(
    public legalService: LegalService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.accepted = this.legalService.hasAccepted();
  }

  get sections(): LegalSection[] {
    const rawSections = this.legalService.activeViewerTab === 'privacy'
      ? this.legalService.getPrivacySections()
      : this.legalService.getTermsSections();

    if (!this.searchQuery.trim()) {
      return rawSections;
    }

    const query = this.searchQuery.toLowerCase();
    return rawSections.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.content.toLowerCase().includes(query)
    );
  }

  setTab(tab: 'privacy' | 'terms'): void {
    this.legalService.activeViewerTab = tab;
    this.searchQuery = '';
  }

  close(): void {
    this.legalService.closeViewer();
  }

  openWizard(): void {
    this.legalService.closeViewer();
    this.legalService.openWizard();
  }

  onAccept(): void {
    this.legalService.acceptTerms();
    this.accepted = true;
  }

  printDocument(): void {
    window.print();
  }

  copyText(): void {
    const title = this.legalService.activeViewerTab === 'privacy'
      ? `INFORMATIVA PRIVACY (GDPR) - ${this.legalService.config.companyName}`
      : `TERMINI E CONDIZIONI D'USO - ${this.legalService.config.companyName}`;
    
    const body = this.sections.map(s => `\n### ${s.title}\n${s.content}\n`).join('\n');
    const fullText = `${title}\nUltimo aggiornamento: ${this.legalService.config.lastUpdated}\n\n${body}`;

    navigator.clipboard.writeText(fullText).then(() => {
      this.copiedNotification = true;
      setTimeout(() => {
        this.copiedNotification = false;
      }, 3000);
    });
  }

  scrollToSection(id: string): void {
    const el = document.getElementById('legal-sec-' + id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  formatContent(text: string): string {
    // Basic markdown-like replacement for **bold** and linebreaks for preview display
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#1E2022] dark:text-white">$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return formatted;
  }
}
