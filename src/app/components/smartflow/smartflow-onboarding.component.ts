import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OnboardingTip {
  icon: string;
  title: string;
  tag: string;
  desc: string;
}

@Component({
  selector: 'app-smartflow-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './smartflow-onboarding.component.html',
  styleUrls: ['./smartflow-onboarding.component.css']
})
export class SmartflowOnboardingComponent implements OnInit, OnDestroy {
  @Output() complete = new EventEmitter<void>();

  progress: number = 0;
  currentTipIndex: number = 0;
  currentStatusText: string = 'Inizializzazione ambiente...';
  isCompleted: boolean = false;
  fadingOut: boolean = false;

  readonly tips: OnboardingTip[] = [
    {
      icon: '💡',
      title: 'Ricerca Rapida',
      tag: 'Produttività',
      desc: 'Usa la barra di ricerca globale per trovare risposte e FAQ in pochi millisecondi.'
    },
    {
      icon: '🎯',
      title: 'Interfaccia Live',
      tag: 'Interattività',
      desc: 'Esplora le schermate interattive per scoprire tutte le funzioni a colpo d\'occhio.'
    },
    {
      icon: '🚀',
      title: 'SmartFlow Guide',
      tag: 'Documentazione',
      desc: 'Crea nuove guide operative con passaggi dettagliati e screenshot annotati.'
    },
    {
      icon: '⚡',
      title: 'FAQ & Risoluzioni',
      tag: 'Supporto',
      desc: 'Consulta le procedure con immagini ingrandibili per un supporto immediato.'
    },
    {
      icon: '🌟',
      title: 'Community & Livelli',
      tag: 'Gamification',
      desc: 'Contribuisci alla documentazione per guadagnare punti e salire di livello!'
    }
  ];

  private timerRef: any = null;
  private timeoutRefs: any[] = [];

  get currentTip(): OnboardingTip {
    return this.tips[this.currentTipIndex] || this.tips[0];
  }

  ngOnInit(): void {
    this.startProgressAnimation();
  }

  ngOnDestroy(): void {
    this.cleanupTimers();
  }

  /**
   * Fluid 0 to 100% progress animation with status updates and tips cycling
   */
  private startProgressAnimation(): void {
    const totalDurationMs = 3800; // ~3.8s total
    const intervalMs = 35;
    const totalSteps = totalDurationMs / intervalMs;
    let stepCount = 0;

    this.timerRef = setInterval(() => {
      stepCount++;
      // Smooth progression curve
      const ratio = stepCount / totalSteps;
      const rawProgress = Math.round(ratio * 100);
      this.progress = Math.min(100, Math.max(0, rawProgress));

      this.updateStateForProgress(this.progress);

      if (this.progress >= 100) {
        clearInterval(this.timerRef);
        this.timerRef = null;
        this.finishSequence();
      }
    }, intervalMs);
  }

  private updateStateForProgress(p: number): void {
    if (p < 22) {
      this.currentTipIndex = 0;
      this.currentStatusText = 'Inizializzazione ambiente...';
    } else if (p < 44) {
      this.currentTipIndex = 1;
      this.currentStatusText = 'Caricamento manuali e guide...';
    } else if (p < 66) {
      this.currentTipIndex = 2;
      this.currentStatusText = 'Sincronizzazione FAQ e risorse...';
    } else if (p < 88) {
      this.currentTipIndex = 3;
      this.currentStatusText = 'Configurazione interfaccia live...';
    } else if (p < 100) {
      this.currentTipIndex = 4;
      this.currentStatusText = 'Finalizzazione workspace...';
    } else {
      this.currentTipIndex = 4;
      this.currentStatusText = 'Workspace pronto!';
    }
  }

  /**
   * Final transition sequence with success badge and smooth fade out
   */
  private finishSequence(): void {
    this.isCompleted = true;
    this.currentStatusText = 'Workspace pronto!';

    const fadeTimeout = setTimeout(() => {
      this.fadingOut = true;

      const completeTimeout = setTimeout(() => {
        this.complete.emit();
      }, 600); // Wait for CSS opacity/transform fade-out transition

      this.timeoutRefs.push(completeTimeout);
    }, 700); // Brief pause to see 100% and success mark

    this.timeoutRefs.push(fadeTimeout);
  }

  /**
   * Skip directly to app
   */
  skip(): void {
    this.cleanupTimers();
    this.progress = 100;
    this.isCompleted = true;
    this.fadingOut = true;

    const skipTimeout = setTimeout(() => {
      this.complete.emit();
    }, 250);

    this.timeoutRefs.push(skipTimeout);
  }

  private cleanupTimers(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
    this.timeoutRefs.forEach(t => clearTimeout(t));
    this.timeoutRefs = [];
  }
}
