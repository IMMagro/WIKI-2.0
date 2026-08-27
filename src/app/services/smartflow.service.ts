import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SmartflowData, SmartflowOperator, SmartflowDraft, SmartflowLevel, KnowledgeEntry, Category } from '../components/guide/guide.models';
import { GuideService } from './guide.service';

@Injectable({ providedIn: 'root' })
export class SmartflowService {
  currentOperatorId: string | null = null;
  loaded = false;
  operators: SmartflowOperator[] = [];
  drafts: SmartflowDraft[] = [];
  levels: SmartflowLevel[] = [
    { level: 1, name: 'Barba', emoji: '🧔', minScore: 0, color: '#A9B4BF' },
    { level: 2, name: 'Minion', emoji: '👾', minScore: 50, color: '#FFD700' },
    { level: 3, name: 'Author', emoji: '✍️', minScore: 150, color: '#10B981' },
    { level: 4, name: 'Expert', emoji: '🎯', minScore: 350, color: '#377DFF' },
    { level: 5, name: 'Senior', emoji: '🔷', minScore: 600, color: '#6366F1' },
    { level: 6, name: 'Master', emoji: '👑', minScore: 1000, color: '#F80086' },
    { level: 7, name: 'Legend', emoji: '🌟', minScore: 2000, color: '#FFD700' }
  ];
  kbEntries: KnowledgeEntry[] = [];

  constructor(private http: HttpClient, private guideService: GuideService) {
    const savedOpId = localStorage.getItem('smartflow_operator_id');
    if (savedOpId) {
      this.currentOperatorId = savedOpId;
    }
    this.load();
  }

  loginAs(id: string): void {
    this.currentOperatorId = id;
    localStorage.setItem('smartflow_operator_id', id);
  }

  logout(): void {
    this.currentOperatorId = null;
    localStorage.removeItem('smartflow_operator_id');
  }

  get currentOperator(): SmartflowOperator | undefined {
    return this.currentOperatorId ? this.getOperator(this.currentOperatorId) : undefined;
  }

  load(): void {
    this.http.get<SmartflowData>('Data/smartflow.json?v=' + Date.now()).subscribe({
      next: (data) => this.applyData(data),
      error: () => {
        this.http.get<SmartflowData>('/api/save_smartflow.ashx?v=' + Date.now()).subscribe({
          next: (data) => this.applyData(data),
          error: () => { this.loaded = true; }
        });
      }
    });

    this.http.get<{ entries: KnowledgeEntry[] }>('Data/smartflow-kb.json?v=' + Date.now()).subscribe({
      next: (data) => {
        if (data && data.entries) this.kbEntries = data.entries;
      },
      error: () => {}
    });
  }

  private applyData(data: SmartflowData): void {
    if (data) {
      this.operators = (data.operators || []).map(o => ({
        ...o,
        status: o.status || 'pending',
        hasOnboarded: o.hasOnboarded !== undefined ? o.hasOnboarded : false
      }));
      this.drafts = data.drafts || [];
      if (data.levels && data.levels.length) this.levels = data.levels;
    }
    this.loaded = true;
  }

  saveToBackend(): void {
    const payload = {
      operators: this.operators,
      drafts: this.drafts,
      levels: this.levels
    };
    this.http.post('/api/save_smartflow.ashx', payload).subscribe({
      next: () => console.log('Smartflow data saved successfully.'),
      error: (err) => console.error('Failed to save smartflow data', err)
    });
  }

  // ----- Livelli -----
  getLevelForScore(score: number): SmartflowLevel {
    let result = this.levels[0];
    for (const lvl of this.levels) {
      if (score >= lvl.minScore) result = lvl;
    }
    return result;
  }

  // ----- Operatori -----
  getOperator(id: string): SmartflowOperator | undefined {
    return this.operators.find(o => o.id === id);
  }

  get pendingOperators(): SmartflowOperator[] {
    return this.operators.filter(o => o.status === 'pending');
  }

  get pendingOperatorsCount(): number {
    return this.pendingOperators.length;
  }

  saveOperator(op: SmartflowOperator): void {
    const existing = this.operators.findIndex(o => o.id === op.id);
    if (existing >= 0) this.operators[existing] = op;
    this.saveToBackend();
  }

  deleteOperator(id: string): void {
    this.operators = this.operators.filter(o => o.id !== id);
    if (this.currentOperatorId === id) {
      this.logout();
    }
    this.saveToBackend();
  }

  registerOperator(name: string, emoji: string, password?: string, avatar?: string): SmartflowOperator {
    const id = 'op-' + Date.now();
    const now = this.today();
    const op: SmartflowOperator = {
      id, name, emoji, avatar, password, score: 0, level: 1, levelName: 'Barba',
      guidesCreated: 0, guidesApproved: 0, lastActivity: now, registeredAt: now,
      status: 'pending',
      hasOnboarded: false
    };
    this.operators.push(op);
    this.saveToBackend();
    return op;
  }

  addScore(operatorId: string, points: number): void {
    const op = this.getOperator(operatorId);
    if (!op) return;
    op.score += points;
    op.guidesApproved = (op.guidesApproved || 0) + 1;
    const lvl = this.getLevelForScore(op.score);
    op.level = lvl.level;
    op.levelName = lvl.name;
    op.lastActivity = this.today();
    this.saveToBackend();
  }

  getLeaderboard(): SmartflowOperator[] {
    return [...this.operators].sort((a, b) => b.score - a.score);
  }

  // ----- Bozze -----
  get pendingDrafts(): SmartflowDraft[] {
    return this.drafts.filter(d => d.status === 'pending');
  }

  saveDraft(draft: SmartflowDraft): void {
    const existing = this.drafts.findIndex(d => d.id === draft.id);
    if (existing >= 0) {
      this.drafts[existing] = draft;
    } else {
      this.drafts.push(draft);
      const op = this.getOperator(draft.operatorId);
      if (op) {
        op.guidesCreated++;
        op.lastActivity = this.today();
      }
    }
    this.saveToBackend();
  }

  // ----- Auto-classificazione tipo guida -----
  classifyType(stepsCount: number, faqsCount: number): 'breve' | 'standard' | 'lunga' {
    if (stepsCount <= 3 && faqsCount === 0) return 'breve';
    if (stepsCount <= 8 && faqsCount <= 3) return 'standard';
    return 'lunga';
  }

  // ----- Suggerisci categoria -----
  suggestCategory(topic: string): string | null {
    const q = (topic || '').toLowerCase();
    const categories = this.guideService.categories;
    for (const c of categories) {
      if (c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) return c.id;
      for (const m of (c.manuals || [])) {
        if (m.title.toLowerCase().includes(q)) return c.id;
      }
    }
    // Check KB entries
    for (const kb of this.kbEntries) {
      if (kb.topic.toLowerCase().includes(q) || kb.tags.some(t => t.toLowerCase().includes(q))) {
        return kb.category;
      }
    }
    return categories.length > 0 ? categories[0].id : null;
  }

  // ----- Punti per tipo guida -----
  getPointsForType(type: 'breve' | 'standard' | 'lunga'): number {
    if (type === 'breve') return 10;
    if (type === 'standard') return 25;
    return 50;
  }

  // ----- Helpers -----
  private today(): string {
    const d = new Date();
    const mesi = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
    return d.getDate() + ' ' + mesi[d.getMonth()] + ' ' + d.getFullYear();
  }
}
