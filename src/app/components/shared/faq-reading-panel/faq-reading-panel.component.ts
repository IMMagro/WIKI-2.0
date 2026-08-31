import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqReadingService } from '../../../services/faq-reading.service';

/** Pannello di lettura di una FAQ (4 varianti di layout), aperto da Home o dalla pagina FAQ. */
@Component({
  selector: 'app-faq-reading-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-reading-panel.component.html'
})
export class FaqReadingPanelComponent {
  /** L'orchestratore (app.component) cambia vista verso la sezione Guide della categoria. */
  @Output() categorySelected = new EventEmitter<string | undefined>();
  /** L'orchestratore apre un'altra guida/FAQ da un link interno. */
  @Output() internalLinkClick = new EventEmitter<{catId: string, guideId: string, faqIdx?: number}>();

  constructor(public faqReadingService: FaqReadingService) {}

  close(): void {
    this.faqReadingService.closeFaq();
    document.body.style.overflow = 'auto';
  }

  goToCategory(): void {
    const catId = this.faqReadingService.selectedFaq?.categoryId;
    this.close();
    this.categorySelected.emit(catId);
  }

  handleInternalLink(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('.internal-link') as HTMLElement;
    if (link) {
      event.preventDefault();
      const catId = link.getAttribute('data-cat-id');
      const guideId = link.getAttribute('data-guide-id');
      const faqIdxStr = link.getAttribute('data-faq-idx');
      if (catId && guideId) {
        this.close();
        this.internalLinkClick.emit({
          catId,
          guideId,
          faqIdx: faqIdxStr ? parseInt(faqIdxStr, 10) : undefined
        });
      }
    }
  }
}
