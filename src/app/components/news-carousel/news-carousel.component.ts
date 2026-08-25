import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

/** Vista "News": titolo con liquid-fill del colore del prodotto attivo + carosello 3D Windent/Poliwin/Winodlab. */
@Component({
  selector: 'app-news-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-carousel.component.html',
  host: {
    class: 'w-full h-full block relative'
  }
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
  @Output() backToCards = new EventEmitter<void>();
  @Output() changeNewsItem = new EventEmitter<number>();

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
      width: '320px',
      height: '380px',
      top: '50%',
      marginTop: '-190px',
      left: 'calc(50% - 160px)',
      zIndex: 10 - absOffset,
      transformOrigin: 'center center'
    };

    if (this.stage === 'detail') {
      if (isCenter) {
        style.left = '4%';
        style.transform = 'translateX(0) scale(0.92) translateZ(0)';
        style.opacity = 1;
        style.filter = 'brightness(1)';
        style.cursor = 'pointer';
      } else {
        style.transform = `translateX(${Math.sign(offset) * 120}%) scale(0.7) translateZ(-150px)`;
        style.opacity = 0;
        style.pointerEvents = 'none';
      }
      return style;
    }

    if (isCenter) {
      style.transform = 'translateX(0) scale(1.05) translateZ(50px)';
      style.opacity = 1;
      style.filter = 'brightness(1)';
      style.cursor = 'pointer';
    } else {
      const sign = Math.sign(offset);
      style.transform = `translateX(${sign * 110}%) scale(0.8) translateZ(-80px)`;
      style.opacity = 0.45;
      style.filter = 'brightness(0.75)';
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
