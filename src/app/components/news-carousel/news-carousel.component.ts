import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

/** Vista "News": titolo con liquid-fill del colore del prodotto attivo + carosello 3D Windent/Poliwin/Winodlab. */
@Component({
  selector: 'app-news-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-carousel.component.html'
})
export class NewsCarouselComponent {
  @Input() stage: 'title-black' | 'title-blue' | 'moving' | 'cards' | 'detail' = 'title-black';
  @Input() programs: any[] = [];
  @Input() activeProgramIndex = 0;
  @Input() newsBaseColor: string | null = null;
  @Input() newsOverlayColor: string | null = null;
  @Input() newsFillPosition = '0% 0%';
  @Input() isRefilling = false;
  @Input() newsItems: any[] = [];
  @Input() activeNewsItemIndex = 0;
  @Input() newsAnimState: 'stable' | 'leaving-up' | 'leaving-down' | 'entering-up' | 'entering-down' = 'stable';

  @Output() prevProgram = new EventEmitter<void>();
  @Output() nextProgram = new EventEmitter<void>();
  @Output() selectProgram = new EventEmitter<number>();

  constructor(public themeService: ThemeService) {}

  getCarouselStyle(index: number): any {
    const total = this.programs.length;
    let offset = index - this.activeProgramIndex;
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;

    let style: any = {
      transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      position: 'absolute',
      width: '300px',
      height: '360px',
      top: '0',
      left: 'calc(50% - 150px)',
      zIndex: 10 - absOffset,
      transformOrigin: 'bottom center'
    };

    if (this.stage === 'detail') {
      if (isCenter) {
        style.left = '48px';
        style.transform = `translateX(0) scale(0.9) translateZ(0)`;
        style.opacity = 1;
        style.filter = 'brightness(1)';
        style.cursor = 'default';
      } else {
        style.transform = `translateX(${Math.sign(offset) * 112}%) scale(0.82) translateZ(-100px)`;
        style.opacity = 0;
        style.pointerEvents = 'none';
      }
      return style;
    }

    if (isCenter) {
      style.transform = `translateX(0) scale(1.08) translateZ(50px)`;
      style.opacity = 1;
      style.filter = 'brightness(1)';
    } else {
      const sign = Math.sign(offset);
      style.transform = `translateX(${sign * 112}%) scale(0.82) translateZ(-100px)`;
      style.opacity = 0.55;
      style.filter = 'brightness(0.7)';
      style.cursor = 'pointer';
    }

    if (absOffset > 1) {
      style.opacity = 0;
      style.pointerEvents = 'none';
    }

    return style;
  }

  getNewsContentClass() {
    switch (this.newsAnimState) {
      case 'stable': return 'opacity-100 translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
      case 'leaving-up': return 'opacity-0 -translate-y-12 transition-all duration-400 ease-in';
      case 'leaving-down': return 'opacity-0 translate-y-12 transition-all duration-400 ease-in';
      case 'entering-up': return 'opacity-0 translate-y-12 transition-none';
      case 'entering-down': return 'opacity-0 -translate-y-12 transition-none';
      default: return 'opacity-100 translate-y-0 transition-all duration-500';
    }
  }
}
