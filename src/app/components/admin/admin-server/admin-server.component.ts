import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-server',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-server.component.html'
})
export class AdminServerComponent implements OnInit, OnDestroy {
  adminServerStats: any = null;
  adminServerServices: any[] = [];
  adminServerLogs: any[] = [];
  private interval: any;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadData();
    // Auto refresh every 5 seconds (simulated realtime monitoring)
    this.interval = setInterval(() => {
      this.loadData();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  loadData() {
    this.adminService.getServerStats().subscribe({
      next: (data) => {
        this.adminServerStats = data.stats;
        this.adminServerServices = data.services;
        this.adminServerLogs = data.logs;
      },
      error: () => {
        // Silently fail during dev, or handle it
      }
    });
  }
}
