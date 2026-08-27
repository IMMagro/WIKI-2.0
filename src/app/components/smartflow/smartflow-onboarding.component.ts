import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-smartflow-onboarding',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-[#0F172A] z-[9999] flex flex-col items-center justify-center text-white overflow-hidden" [class.fade-out]="fadingOut">
      <!-- Cool hacker/setup animation -->
      <div class="mb-8 w-24 h-24 rounded-full border-4 border-[#377DFF] border-t-transparent animate-spin"></div>
      
      <div class="text-3xl font-bold mb-4 tracking-wider animate-pulse text-[#F8FAFD]">WIKI 2.0 INIT</div>
      
      <div class="h-6 overflow-hidden w-64 text-center text-[#94A3B8] font-mono text-sm">
        <div class="transition-transform duration-500" [style.transform]="'translateY(' + (-stepIndex * 24) + 'px)'">
          <div class="h-6">Autenticazione operatore...</div>
          <div class="h-6">Inizializzazione servizi...</div>
          <div class="h-6">Caricamento database...</div>
          <div class="h-6">Area Riservata pronta.</div>
        </div>
      </div>
      
      <div class="w-64 h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
        <div class="h-full bg-[#F80086] transition-all duration-300 ease-out" [style.width.%]="progress"></div>
      </div>
    </div>
  `,
  styles: [`
    .fade-out { opacity: 0; pointer-events: none; transition: opacity 0.8s ease-out; }
  `]
})
export class SmartflowOnboardingComponent implements OnInit {
  @Output() complete = new EventEmitter<void>();
  
  stepIndex = 0;
  progress = 0;
  fadingOut = false;

  ngOnInit() {
    // Sequence
    setTimeout(() => { this.stepIndex = 1; this.progress = 30; }, 800);
    setTimeout(() => { this.stepIndex = 2; this.progress = 65; }, 1800);
    setTimeout(() => { this.stepIndex = 3; this.progress = 100; }, 2800);
    
    setTimeout(() => {
      this.fadingOut = true;
      setTimeout(() => this.complete.emit(), 800);
    }, 3500);
  }
}
