import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LegalService } from '../../../services/legal.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cookie-banner.component.html'
})
export class CookieBannerComponent {
  isCustomizing = false;

  // Custom checkboxes state
  analyticsConsent = true;
  preferencesConsent = true;

  constructor(public legalService: LegalService) {}

  acceptAll(): void {
    this.legalService.acceptAllCookies();
  }

  acceptNecessary(): void {
    this.legalService.acceptNecessaryCookies();
  }

  toggleCustomize(): void {
    this.isCustomizing = !this.isCustomizing;
  }

  saveCustom(): void {
    this.legalService.saveCustomCookies(this.analyticsConsent, this.preferencesConsent);
  }

  openPrivacy(): void {
    this.legalService.openPrivacy();
  }
}
