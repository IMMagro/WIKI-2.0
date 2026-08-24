import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminNewsComponent } from '../admin-news/admin-news.component';
import { AdminServerComponent } from '../admin-server/admin-server.component';
import { GuideAdminComponent } from '../../guide/guide-admin.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, AdminNewsComponent, AdminServerComponent, GuideAdminComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  @Output() exitAdmin = new EventEmitter<void>();
  activeAdminTab: string = 'dashboard';

  // Collegato alla stessa chiave localStorage usata da AppComponent,
  // così lo switch nelle impostazioni admin agisce davvero sulle animazioni del sito.
  get globalAnimationsEnabled(): boolean {
    const v = localStorage.getItem('globalAnimationsEnabled');
    return v ? JSON.parse(v) : false;
  }
  set globalAnimationsEnabled(value: boolean) {
    localStorage.setItem('globalAnimationsEnabled', JSON.stringify(value));
  }

  constructor(private adminService: AdminService) {}

  onExitAdmin() {
    this.adminService.logout();
    this.exitAdmin.emit();
  }
}
