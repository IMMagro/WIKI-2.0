import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Inizializza lo stato in base alla presenza del token
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      this.isAuthenticatedSubject.next(true);
    }
  }

  get token(): string | null {
    return sessionStorage.getItem('adminToken');
  }

  private getHeaders() {
    return { 'Authorization': `Bearer ${this.token || ''}` };
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/login.ashx', { email, password }).pipe(
      tap(res => {
        if (res.success && res.token) {
          sessionStorage.setItem('adminToken', res.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('adminToken');
    this.isAuthenticatedSubject.next(false);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>('/api/get_admin_dashboard.ashx', { headers: this.getHeaders() });
  }

  getNews(): Observable<any[]> {
    return this.http.get<any[]>('/api/get_admin_news.ashx', { headers: this.getHeaders() });
  }
  
  saveNews(newsList: any[]): Observable<any> {
    return this.http.post<any>('/api/get_admin_news.ashx', newsList, { headers: this.getHeaders() });
  }

  getServerStats(): Observable<any> {
    return this.http.get<any>('/api/get_admin_server.ashx', { headers: this.getHeaders() });
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>('/api/get_notifications.ashx', { headers: this.getHeaders() });
  }

  markNotificationsAsRead(notifications: any[] = []): Observable<any> {
    const payload = notifications.map(n => ({ ...n, unread: false }));
    return this.http.post<any>('/api/get_notifications.ashx', payload, { headers: this.getHeaders() });
  }
}
