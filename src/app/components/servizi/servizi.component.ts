import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

/** Vista "Servizi": titolo animato (FLIP verso l'angolo) + carosello card a pagine. */
@Component({
  selector: 'app-servizi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servizi.component.html'
})
export class ServiziComponent {
  @Input() isActive = false;
  @Input() stage: 'title-black' | 'title-blue' | 'moving' | 'cards' = 'cards';
  @Input() services: any[] = [];
  @Input() currentServicePage = 0;
  @Input() isChangingPage = false;
  @Input() animatingDirection = 0;

  /** L'orchestratore (app.component) gestisce ancora lo scroll condiviso con le altre viste. */
  @Output() wheelScroll = new EventEmitter<WheelEvent>();
  @Output() nextPage = new EventEmitter<void>();

  @ViewChild('serviziTitle') serviziTitleRef?: ElementRef;

  constructor(public themeService: ThemeService) {}

  getCardAnimation(index: number): string {
    if (!this.isActive || this.stage !== 'cards') return 'none';

    const baseDuration = '0.7s';
    const easing = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const delay = (index * 40) + 'ms';
    const forwards = 'forwards';

    if (this.isChangingPage) {
      if (this.animatingDirection === 1) {
        return `fadeLeftOut ${baseDuration} ${easing} ${delay} ${forwards}`;
      } else {
        return `fadeRightOut ${baseDuration} ${easing} ${delay} ${forwards}`;
      }
    } else {
      if (this.animatingDirection === 1) {
        return `fadeRightIn ${baseDuration} ${easing} ${delay} ${forwards}`;
      } else if (this.animatingDirection === -1) {
        return `fadeLeftIn ${baseDuration} ${easing} ${delay} ${forwards}`;
      } else {
        // Default entrance (animatingDirection === 0)
        return `fadeUpCard 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${(index * 40)}ms forwards`;
      }
    }
  }

  /** Misura la posizione ATTUALE del titolo, prima che l'orchestratore cambi stage. */
  getTitleRect(): DOMRect | null {
    return this.serviziTitleRef?.nativeElement?.getBoundingClientRect() ?? null;
  }

  /** Anima il titolo dalla posizione `first` (FLIP) fino a quella corrente dopo il cambio di stage. */
  animateTitleFlip(first: DOMRect, onFinish: () => void): void {
    const el = this.serviziTitleRef?.nativeElement;
    if (!el) {
      onFinish();
      return;
    }

    const last = el.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    const sx = first.width / last.width;
    const sy = first.height / last.height;

    el.animate([
      { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
      { transformOrigin: 'top left', transform: 'none' }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
    }).onfinish = onFinish;
  }
}
