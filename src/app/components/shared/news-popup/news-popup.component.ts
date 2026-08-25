import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';
import { NewsBlockRendererComponent } from '../news-block-renderer/news-block-renderer.component';

/** Popup a schermo per la comunicazione aperta dalla campanella (layout libero a blocchi o testo semplice). */
@Component({
  selector: 'app-news-popup',
  standalone: true,
  imports: [CommonModule, NewsBlockRendererComponent],
  templateUrl: './news-popup.component.html'
})
export class NewsPopupComponent {
  constructor(public newsService: NewsService) {}

  close() {
    this.newsService.closeNewsPopup();
    document.body.style.overflow = 'auto';
  }
}
