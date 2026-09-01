import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../../../services/news.service';

/** Campanella comunicazioni in home: elenco delle news "Generale" con pallino "non lette". */
@Component({
  selector: 'app-news-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-bell.component.html'
})
export class NewsBellComponent {
  isOpen = false;

  @ViewChild('notificationDropdown') notificationDropdown!: ElementRef;

  constructor(public newsService: NewsService) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.isOpen && this.notificationDropdown && !this.notificationDropdown.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.isOpen = false;
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  openNews(n: any) {
    this.newsService.openNewsPopup(n);
    this.isOpen = false;
    document.body.style.overflow = 'hidden';
  }

  trackByNews(_i: number, n: any): any {
    return (n && (n.id ?? n.title)) ?? _i;
  }
}
