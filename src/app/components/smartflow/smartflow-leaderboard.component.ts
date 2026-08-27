import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartflowService } from '../../services/smartflow.service';
import { SmartflowOperator, SmartflowLevel } from '../guide/guide.models';

@Component({
  selector: 'app-smartflow-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './smartflow-leaderboard.component.html'
})
export class SmartflowLeaderboardComponent {
  constructor(public smartflow: SmartflowService) {}

  get leaderboard(): SmartflowOperator[] {
    return this.smartflow.getLeaderboard();
  }

  get currentOperator(): SmartflowOperator | undefined {
    return this.smartflow.currentOperator;
  }

  getLevelColor(level: number): string {
    const l = this.smartflow.levels.find(x => x.level === level);
    return l ? l.color : '#A9B4BF';
  }

  getNextLevel(score: number): SmartflowLevel | null {
    const currentLvl = this.smartflow.getLevelForScore(score);
    return this.smartflow.levels.find(l => l.level === currentLvl.level + 1) || null;
  }

  getProgressPercentage(score: number): number {
    const current = this.smartflow.getLevelForScore(score);
    const next = this.getNextLevel(score);
    if (!next) return 100; // Max level
    
    const range = next.minScore - current.minScore;
    const currentProgress = score - current.minScore;
    return Math.min(100, Math.max(0, (currentProgress / range) * 100));
  }
}
