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
}
