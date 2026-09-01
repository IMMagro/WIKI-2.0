import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Rende il layout libero a blocchi di una comunicazione (box, testo, immagine, link)
 * su un canvas a larghezza fissa. Sorgente UNICA condivisa tra il popup pubblico
 * (home) e l'anteprima nell'area admin, per evitare markup duplicato.
 */
@Component({
  selector: 'app-news-block-renderer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-block-renderer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsBlockRendererComponent {
  @Input() blocks: any[] = [];
  @Input() width = 720;

  /** Altezza minima del canvas in base ai blocchi. */
  get minH(): number {
    const bs = this.blocks || [];
    if (!bs.length) return 400;
    return Math.max(360, ...bs.map(b => (b.y || 0) + (b.h || 0))) + 24;
  }
}
