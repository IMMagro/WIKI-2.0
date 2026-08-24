import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminNewsComponent } from '../admin-news/admin-news.component';
import { AdminServerComponent } from '../admin-server/admin-server.component';
// Nota: GuideAdminComponent non è ancora estratto o è gestito in un altro modulo
// Lo mockiamo o lo lasciamo da implementare se serve

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, AdminNewsComponent, AdminServerComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  @Output() exitAdmin = new EventEmitter<void>();
  activeAdminTab: string = 'dashboard';
  globalAnimationsEnabled: boolean = true;

  constructor(private adminService: AdminService) {}

  onExitAdmin() {
    this.adminService.logout();
    this.exitAdmin.emit();
  }
}
