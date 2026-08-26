import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TrackPayload {
  type: 'guide_view' | 'guide_heartbeat' | 'guide_leave' | 'page_view';
  sessionId: string;
  guideId?: string | null;
  guideTitle?: string | null;
  category?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class GuideTrackerService {
  private http = inject(HttpClient);
  private sessionId: string;
  private heartbeatInterval: any = null;
  private currentGuide: { guideId: string; title: string; category: string } | null = null;

  constructor() {
    this.sessionId = this.initSessionId();
    this.setupUnloadListener();
  }

  private initSessionId(): string {
    let id = '';
    try {
      id = sessionStorage.getItem('wiki_session_id') || '';
    } catch { }

    if (!id) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      }
      try {
        sessionStorage.setItem('wiki_session_id', id);
      } catch { }
    }
    return id;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Traccia l'apertura di un manuale / guida e avvia il timer di heartbeat ogni 20s
   */
  public trackGuideView(guideId: string, title: string, category: string): void {
    if (this.currentGuide && this.currentGuide.guideId !== guideId) {
      this.trackGuideLeave(false);
    }

    this.currentGuide = { guideId, title, category };
    this.stopHeartbeat();

    // 1. Invio immediato evento apertura guida
    const payload: TrackPayload = {
      type: 'guide_view',
      sessionId: this.sessionId,
      guideId,
      guideTitle: title,
      category
    };
    this.sendTrack(payload);

    // 2. Timer periodico heartbeat ogni 20 secondi
    this.heartbeatInterval = setInterval(() => {
      if (this.currentGuide) {
        const hbPayload: TrackPayload = {
          type: 'guide_heartbeat',
          sessionId: this.sessionId,
          guideId: this.currentGuide.guideId,
          guideTitle: this.currentGuide.title,
          category: this.currentGuide.category
        };
        this.sendTrack(hbPayload);
      }
    }, 20000);
  }

  /**
   * Ferma il timer e notifica l'uscita dalla consultazione della guida
   */
  public trackGuideLeave(sendLeaveRequest: boolean = true): void {
    this.stopHeartbeat();

    if (this.currentGuide) {
      const prevGuide = this.currentGuide;
      this.currentGuide = null;

      if (sendLeaveRequest) {
        const payload: TrackPayload = {
          type: 'guide_leave',
          sessionId: this.sessionId,
          guideId: prevGuide.guideId,
          guideTitle: prevGuide.title,
          category: prevGuide.category
        };
        this.sendTrack(payload);
      }
    }
  }

  /**
   * Traccia una visualizzazione generica della pagina
   */
  public trackPageView(): void {
    const payload: TrackPayload = {
      type: 'page_view',
      sessionId: this.sessionId
    };
    this.sendTrack(payload);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendTrack(payload: TrackPayload): void {
    this.http.post('/api/track_access.ashx', payload).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  private setupUnloadListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.currentGuide) {
          const payload = JSON.stringify({
            type: 'guide_leave',
            sessionId: this.sessionId,
            guideId: this.currentGuide.guideId
          });
          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/track_access.ashx', payload);
          }
        }
      });
    }
  }
}
