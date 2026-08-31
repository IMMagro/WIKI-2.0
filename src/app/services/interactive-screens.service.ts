import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InteractiveScreen } from '../components/guide/guide.models';
import { Observable, of, tap, catchError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class InteractiveScreensService {
  private screensCache: { [id: string]: InteractiveScreen } | null = null;

  constructor(private http: HttpClient) {}

  private fetchAll(): Observable<{ [id: string]: InteractiveScreen }> {
    if (this.screensCache) {
      return of(this.screensCache);
    }
    // Try API first, fallback to JSON
    return this.http.get<{ [id: string]: InteractiveScreen }>('/api/interactive_screens.ashx?v=' + Date.now()).pipe(
      catchError(() => this.http.get<{ [id: string]: InteractiveScreen }>('/Data/interactive_screens.json?v=' + Date.now())),
      catchError(() => of({})),
      tap(data => {
        this.screensCache = data || {};
      })
    );
  }

  getScreen(id: string): Observable<InteractiveScreen | undefined> {
    return this.fetchAll().pipe(
      map(screens => screens[id])
    );
  }

  saveScreen(screen: InteractiveScreen): Observable<boolean> {
    return this.fetchAll().pipe(
      switchMap(screens => {
        screens[screen.id] = screen;
        this.screensCache = screens;
        const token = sessionStorage.getItem('adminToken');
        const headers: any = token ? { Authorization: 'Bearer ' + token } : {};
        return this.http.post('/api/interactive_screens.ashx', screens, { headers }).pipe(
          map(() => true),
          catchError((err) => {
            console.error('Failed to save interactive screen', err);
            // In dev environment with ng serve, .ashx might fail. We still update the cache above.
            return of(false);
          })
        );
      })
    );
  }
}
