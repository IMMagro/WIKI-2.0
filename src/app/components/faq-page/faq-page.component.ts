import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideService } from '../../services/guide.service';
import { FaqReadingService } from '../../services/faq-reading.service';
import { ThemeService } from '../../services/theme.service';

/** Vista "FAQ": animazione d'ingresso, ricerca/filtro, 5 varianti di layout card, statistiche di lettura. */
@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq-page.component.html'
})
export class FaqPageComponent {
  @Input() isActive = false;
  @Input() stage: 'center' | 'content' = 'content';
  @Input() animVariant: 'cinematic' | 'elastic' | 'flipboard' | 'snap' | 'cascade' = 'snap';

  manualsDesignVariant: 'A' | 'B' | 'C' | 'D' | 'E' = 'A';
  faqSearchQuery = '';
  isFaqStatsModalOpen = false;

  constructor(
    public guideService: GuideService,
    public faqReadingService: FaqReadingService,
    public themeService: ThemeService
  ) {}

  get filteredFAQ() {
    const all = this.guideService.allFaqItems;
    if (!this.faqSearchQuery || this.faqSearchQuery.trim() === '') {
      return all;
    }
    const q = this.faqSearchQuery.toLowerCase();
    return all.filter(doc =>
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.desc && doc.desc.toLowerCase().includes(q)) ||
      (doc.category && doc.category.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.join(' ').toLowerCase().includes(q))
    );
  }

  getReadCount(): number {
    const all = this.guideService.allFaqItems;
    return all.filter(d => this.faqReadingService.isFaqRead(d.id)).length;
  }

  getUnreadCount(): number {
    return this.guideService.allFaqItems.length - this.getReadCount();
  }

  getReadPercentage(): number {
    const total = this.guideService.allFaqItems.length;
    if (total === 0) return 0;
    return (this.getReadCount() / total) * 100;
  }

  getPieGradient(): string {
    const p = this.getReadPercentage();
    const bg = this.themeService.isDarkMode ? '#334155' : '#E2E8F0'; // slate-700 or slate-200
    return `conic-gradient(#10B981 ${p}%, ${bg} ${p}%)`;
  }

  openFaq(faq: any) {
    this.faqReadingService.openFaq(faq); // Apertura come pannello laterale (destra), coerente con la ricerca in home
    document.body.style.overflow = 'hidden'; // Blocca lo scroll di sfondo
  }
}
