import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideService } from '../../services/guide.service';
import { FaqReadingService } from '../../services/faq-reading.service';
import { HomePill } from '../guide/guide.models';

/** Vista "QeHome": titolo + ricerca spotlight sulle FAQ reali, ricerche frequenti. */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  host: {
    class: 'w-full max-w-4xl mx-auto flex flex-col items-center justify-center'
  }
})
export class HomeComponent {
  @Input() isActive = false;
  @Input() titleVisible = false;
  @Input() homeStage: 0 | 1 = 0;
  @Input() tags: string[] = [];
  @Output() pillSelected = new EventEmitter<HomePill>();

  get pills(): HomePill[] {
    return this.guideService.homePills || [];
  }

  onPillClick(pill: HomePill) {
    this.pillSelected.emit(pill);
  }

  homeSearchQuery = '';
  isHomeSearchOpen = false;

  @ViewChild('homeSearchContainer') homeSearchContainer!: ElementRef;

  constructor(public guideService: GuideService, private faqReadingService: FaqReadingService) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isHomeSearchOpen && this.homeSearchContainer && !this.homeSearchContainer.nativeElement.contains(event.target)) {
      this.isHomeSearchOpen = false;
    }
  }

  homeSearchResults: any[] = [];

  onHomeSearchFocus() {
    if (this.homeSearchQuery.trim() !== '') {
      this.isHomeSearchOpen = true;
    }
  }

  onHomeSearchInput() {
    const q = (this.homeSearchQuery || '').trim().toLowerCase();
    if (!q) {
      this.homeSearchResults = [];
      this.isHomeSearchOpen = false;
      return;
    }
    // Cerca sulle singole FAQ reali (domanda + guida + categoria + tag + testo step). Max 5.
    this.homeSearchResults = this.guideService.allFaqItems.filter(doc =>
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.desc && doc.desc.toLowerCase().includes(q)) ||
      (doc.category && doc.category.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.join(' ').toLowerCase().includes(q)) ||
      (doc.steps && doc.steps.map((s: any) => s.t).join(' ').toLowerCase().includes(q))
    ).slice(0, 5);
    this.isHomeSearchOpen = true;
  }

  openFaqFromHome(faq: any) {
    this.homeSearchQuery = '';
    this.isHomeSearchOpen = false;

    // Apre la FAQ in modalità sidepage (Variante C) e rimane nella home
    this.faqReadingService.openFaq(faq);
    document.body.style.overflow = 'hidden';
  }
}
