import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { AdminNewsComponent } from '../admin-news/admin-news.component';
import { AdminServerComponent } from '../admin-server/admin-server.component';
import { GuideAdminComponent } from '../../guide/guide-admin.component';
import { AdminLegalComponent } from '../admin-legal/admin-legal.component';
import { ThemeService } from '../../../services/theme.service';
import { LegalService } from '../../../services/legal.service';
import { NavigationSettingsService } from '../../../services/navigation-settings.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, AdminNewsComponent, AdminServerComponent, GuideAdminComponent, AdminLegalComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {
  @Output() exitAdmin = new EventEmitter<void>();
  activeAdminTab: string = 'dashboard';

  menuItemsMetadata = [
    { id: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home', description: 'La pagina principale con la dashboard e i widget rapidi.' },
    { id: 'guide', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Guide & Manuali', description: 'Accesso a tutta la documentazione tecnica e le guide.' },
    { id: 'faq', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'FAQ', description: 'Domande frequenti per assistere rapidamente gli utenti.' },
    { id: 'servizi', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Servizi', description: 'Pannello dei servizi e strumenti aziendali.' },
    { id: 'news', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', label: 'News & Comunicazioni', description: 'Ultimi aggiornamenti e feed delle news.' }
  ];

  constructor(
    private adminService: AdminService,
    public themeService: ThemeService,
    public legalService: LegalService,
    public navigationSettingsService: NavigationSettingsService
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

