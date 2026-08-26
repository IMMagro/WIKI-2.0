import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminNewsComponent } from '../admin-news/admin-news.component';
import { AdminServerComponent } from '../admin-server/admin-server.component';
import { GuideAdminComponent } from '../../guide/guide-admin.component';
import { ThemeService } from '../../../services/theme.service';
import { LegalService } from '../../../services/legal.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, AdminNewsComponent, AdminServerComponent, GuideAdminComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  @Output() exitAdmin = new EventEmitter<void>();
  activeAdminTab: string = 'dashboard';

  constructor(
    private adminService: AdminService,
    public themeService: ThemeService,
    public legalService: LegalService
  ) {}

  onExitAdmin() {
    this.adminService.logout();
    this.exitAdmin.emit();
  }

  openLegalWizard() {
    this.legalService.openWizard();
  }

  openLegalViewer() {
    this.legalService.openPrivacy();
  }
}

