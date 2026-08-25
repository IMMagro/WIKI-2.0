import { Injectable } from '@angular/core';

/**
 * Dark mode (con transizione a cerchio via View Transitions API) e toggle globale
 * animazioni/coreografie del sito. Singleton condiviso tra app.component e il
 * pannello admin, così lo switch nelle impostazioni agisce davvero sul sito pubblico.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = false;

  constructor() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode = true;
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  get globalAnimationsEnabled(): boolean {
    const v = localStorage.getItem('globalAnimationsEnabled');
    return v ? JSON.parse(v) : false;
  }
  set globalAnimationsEnabled(value: boolean) {
    localStorage.setItem('globalAnimationsEnabled', JSON.stringify(value));
  }

  toggleTheme(event: MouseEvent | null, forceDark?: boolean) {
    const isDark = forceDark !== undefined ? forceDark : !this.isDarkMode;
    if (this.isDarkMode === isDark) return;

    if (!('startViewTransition' in document)) {
      this.applyTheme(isDark);
      return;
    }

    const x = event ? event.clientX : window.innerWidth * 0.05;
    const y = event ? event.clientY : window.innerHeight * 0.95;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) + 150; // Aumento ulteriore del margine

    const transition = (document as any).startViewTransition(() => {
      this.applyTheme(isDark);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
        ],
        {
          duration: 700, // Più veloce e reattiva (0.7s invece di 1s)
          easing: 'ease-out',
          fill: 'forwards', // FONDAMENTALE: impedisce il reset del clip-path alla fine dell'animazione
          pseudoElement: '::view-transition-new(root)'
        }
      );
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
