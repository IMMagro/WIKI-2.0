import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface MenuItemSetting {
  id: string;
  label: string;
  visible: boolean;
}

const STORAGE_KEY = 'qe_navigation_settings_v1';
const DEFAULT_SETTINGS: MenuItemSetting[] = [
  { id: 'home', label: 'QeHome', visible: true },
  { id: 'guide', label: 'Guide', visible: true },
  { id: 'faq', label: 'FAQ', visible: true },
  { id: 'servizi', label: 'Servizi', visible: true },
  { id: 'news', label: 'News', visible: true }
];

@Injectable({
  providedIn: 'root'
})
export class NavigationSettingsService {
  private apiUrl = '/api/navigation_settings.ashx';
  private settingsSubject = new BehaviorSubject<MenuItemSetting[]>([]);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSettings();
  }

  loadSettings(): void {
    this.http.get<MenuItemSetting[]>(this.apiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        console.warn('Failed to load navigation settings from API. Using fallback.', error.message);
        let fallbackSettings = DEFAULT_SETTINGS;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            fallbackSettings = JSON.parse(stored);
          } catch (e) {
            console.error('Failed to parse settings from localStorage', e);
          }
        }
        return of(fallbackSettings);
      })
    ).subscribe(settings => {
      this.settingsSubject.next(settings);
    });
  }

  saveSettings(settings: MenuItemSetting[]): Observable<any> {
    this.settingsSubject.next(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    return this.http.post(this.apiUrl, settings).pipe(
      catchError(error => {
        console.warn('Failed to save settings to API.', error.message);
        return of({ success: false, fallback: true });
      })
    );
  }

  isItemVisible(id: string): boolean {
    const settings = this.settingsSubject.getValue();
    if (!settings || settings.length === 0) return true;
    const item = settings.find(s => s.id === id);
    return item ? item.visible : true;
  }

  toggleItemVisibility(id: string): void {
    const currentSettings = this.settingsSubject.getValue();
    const itemIndex = currentSettings.findIndex(s => s.id === id);
    
    if (itemIndex > -1) {
      const newSettings = [...currentSettings];
      const newVisibleState = !newSettings[itemIndex].visible;
      
      // Prevent hiding the last visible menu item
      if (!newVisibleState) {
        const visibleCount = newSettings.filter(s => s.visible).length;
        if (visibleCount <= 1) {
          console.warn('Cannot hide the last visible menu item.');
          return;
        }
      }
      
      newSettings[itemIndex].visible = newVisibleState;
      this.saveSettings(newSettings).subscribe();
    }
  }
}
