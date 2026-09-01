import { Component, EventEmitter, Output, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  @Output() backHome = new EventEmitter<void>();

  constructor(@Optional() private router?: Router) {}

  goHome(): void {
    if (this.backHome.observed) {
      this.backHome.emit();
    } else {
      this.backHome.emit();
    }
    
    if (this.router) {
      this.router.navigate(['/']);
    } else {
      window.location.href = '/';
    }
  }
}
