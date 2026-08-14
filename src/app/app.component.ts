import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  query = '';
  stage = 0;
  titleVisible = false;
  isDarkMode = false;
  isSidebarExpanded = false;
  isContactOpen = false;

  tags = [
    'Cambio credenziali 730',
    'Invio fatture elettroniche',
    'Inserire un utilizzatore',
    'Backup del database',
    'Configurare la stampante'
  ];

  menuItems = [
    { icon: 'grid', label: 'Dashboard', active: true },
    { icon: 'document-text', label: 'Guide 730', active: false },
    { icon: 'cash', label: 'Fatturazione', active: false },
    { icon: 'user-group', label: 'Pazienti', active: false },
    { icon: 'chart-bar', label: 'Statistiche', active: false },
    { icon: 'cog', label: 'Impostazioni', active: false },
  ];

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  ngOnInit() {
    // Check initial theme preference
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Il titolo appare in fade in morbido appena la pagina carica
    setTimeout(() => {
      this.titleVisible = true;
    }, 100);

    // Dopo 3 secondi scatta la fase 2 della coreografia
    setTimeout(() => {
      this.stage = 1;
    }, 3000);
  }

  toggleTheme(event: MouseEvent | null, forceDark?: boolean) {
    const isDark = forceDark !== undefined ? forceDark : !this.isDarkMode;
    if (this.isDarkMode === isDark) return;

    if (event) {
      document.documentElement.style.setProperty('--click-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--click-y', `${event.clientY}px`);
    } else {
      document.documentElement.style.setProperty('--click-x', '5%');
      document.documentElement.style.setProperty('--click-y', '95%');
    }

    if (!('startViewTransition' in document)) {
      this.applyTheme(isDark);
      return;
    }

    (document as any).startViewTransition(() => {
      this.applyTheme(isDark);
    });
  }

  private applyTheme(isDark: boolean) {
    this.isDarkMode = isDark;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
