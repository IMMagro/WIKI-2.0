import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NewsCanvasEditorComponent } from '../news-canvas-editor/news-canvas-editor.component';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsCanvasEditorComponent],
  templateUrl: './admin-news.component.html'
})
export class AdminNewsComponent implements OnInit {
  adminNews: any[] = [];
  
  // Modal state
  isModalOpen = false;
  isEditing = false;
  editingIndex: number = -1;
  
  // Preview state
  isPreviewOpen = false;
  previewItem: any = null;
  
  currentNews: any = {
    title: '',
    excerpt: '',
    category: 'Generale',
    date: '',
    author: 'Amministratore',
    authorInitial: 'AD',
    blocks: []
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.adminService.getNews().subscribe({
      next: (data) => {
        this.adminNews = data || [];
      },
      error: () => {
        // Fallback for local testing if API fails
        this.adminNews = [
          { title: 'Aggiornamento completato', excerpt: 'Nuova area comunicazioni attiva.', category: 'Generale', date: 'Oggi', author: 'Amministratore', authorInitial: 'AD' }
        ];
      }
    });
  }

  openNewModal() {
    this.isEditing = false;
    this.currentNews = {
      title: '',
      excerpt: '',
      category: 'Generale',
      date: new Date().toLocaleDateString('it-IT'),
      author: 'Amministratore',
      authorInitial: 'AD',
      blocks: []
    };
    this.isModalOpen = true;
  }

  openEditModal(news: any, index: number) {
    this.isEditing = true;
    this.editingIndex = index;
    // clona anche i blocchi così le modifiche si applicano solo al salvataggio
    this.currentNews = { ...news, blocks: (news.blocks || []).map((b: any) => ({ ...b })) };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
  
  previewNews(news: any) {
    this.previewItem = news;
    this.isPreviewOpen = true;
  }
  
  closePreviewModal() {
    this.isPreviewOpen = false;
    this.previewItem = null;
  }

  saveNews() {
    // Il titolo è obbligatorio; l'estratto no (una comunicazione può essere solo grafica).
    if (!this.currentNews.title) return;
    
    if (this.isEditing) {
      this.adminNews[this.editingIndex] = { ...this.currentNews };
    } else {
      this.adminNews.unshift({ ...this.currentNews });
    }
    
    this.persistNews();
    this.closeModal();
  }

  deleteNews(index: number) {
    if (confirm('Sei sicuro di voler eliminare questa news?')) {
      this.adminNews.splice(index, 1);
      this.persistNews();
    }
  }

  private persistNews() {
    this.adminService.saveNews(this.adminNews).subscribe({
      next: () => {},
      error: (err) => console.error('Errore durante il salvataggio delle news', err)
    });
  }
}
