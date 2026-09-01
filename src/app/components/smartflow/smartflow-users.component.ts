import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartflowService } from '../../services/smartflow.service';
import { SmartflowOperator } from '../guide/guide.models';

@Component({
  selector: 'app-smartflow-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smartflow-users.component.html'
})
export class SmartflowUsersComponent {
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  searchQuery = '';
  toastMsg = '';
  toastType: 'success' | 'danger' = 'success';

  constructor(public smartflow: SmartflowService) {}

  get operators(): SmartflowOperator[] {
    return this.smartflow.operators;
  }

  get pendingOperators(): SmartflowOperator[] {
    return this.operators.filter(o => o.status === 'pending');
  }

  get approvedOperators(): SmartflowOperator[] {
    return this.operators.filter(o => o.status === 'approved');
  }

  get rejectedOperators(): SmartflowOperator[] {
    return this.operators.filter(o => o.status === 'rejected');
  }

  get filteredOperators(): SmartflowOperator[] {
    let list = this.operators;
    if (this.filterStatus !== 'all') {
      list = list.filter(o => o.status === this.filterStatus);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q) || (o.levelName && o.levelName.toLowerCase().includes(q)));
    }
    return list;
  }

  approve(op: SmartflowOperator): void {
    this.smartflow.approveOperator(op.id);
    this.showToast(`Operatore ${op.name} approvato con successo!`, 'success');
  }

  reject(op: SmartflowOperator): void {
    this.smartflow.rejectOperator(op.id);
    this.showToast(`Operatore ${op.name} respinto.`, 'danger');
  }

  resetOnboarding(op: SmartflowOperator): void {
    op.hasOnboarded = false;
    this.smartflow.saveOperator(op);
    this.showToast(`Animazione onboarding riattivata per ${op.name}`, 'success');
  }

  delete(op: SmartflowOperator): void {
    if (confirm(`Sei sicuro di voler eliminare definitivamente l'operatore "${op.name}"?`)) {
      this.smartflow.deleteOperator(op.id);
      this.showToast(`Operatore ${op.name} eliminato definitivamente.`, 'danger');
    }
  }

  getLevelColor(level: number): string {
    const lvl = this.smartflow.levels.find(l => l.level === level);
    return lvl ? lvl.color : '#377DFF';
  }

  private showToast(msg: string, type: 'success' | 'danger' = 'success'): void {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => {
      if (this.toastMsg === msg) {
        this.toastMsg = '';
      }
    }, 3500);
  }
}
