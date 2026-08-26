import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { NewsCanvasEditorComponent } from '../news-canvas-editor/news-canvas-editor.component';
import { NewsBlockRendererComponent } from '../../shared/news-block-renderer/news-block-renderer.component';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, FormsModule, NewsCanvasEditorComponent, NewsBlockRendererComponent],
  templateUrl: './admin-news.component.html'
})
export class AdminNewsComponent implements OnInit {
  adminNews: any[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successToast = '';

  // Filter & Search state
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';

  // Modal state
  isModalOpen = false;
  isEditing = false;
  editingIndex: number = -1;
  titleError = false;

  // Preview state
  isPreviewOpen = false;
  previewItem: any = null;
  readonly newsCanvasW = 720;

  currentNews: any = {
    id: '',
    title: '',
    excerpt: '',
    category: 'Generale',
    date: '',
    author: 'Amministratore',
    authorInitial: 'AD',
    status: 'published', // 'published' | 'draft'
    blocks: []
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.isLoading = true;
    this.adminService.getNews().subscribe({
      next: (data) => {
        this.adminNews = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Errore caricamento news:', err);
        this.adminNews = [];
        this.isLoading = false;
      }
    });
  }

  get filteredNews(): any[] {
    return this.adminNews.filter(news => {
      const matchesSearch = !this.searchQuery.trim() ||
        (news.title && news.title.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (news.excerpt && news.excerpt.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCat = !this.selectedCategory ||
        (news.category && news.category.toLowerCase() === this.selectedCategory.toLowerCase());

      const matchesStat = !this.selectedStatus ||
        (this.selectedStatus === 'published' && (news.status === 'published' || news.status === 'Pubblicato' || !news.status)) ||
        (this.selectedStatus === 'draft' && (news.status === 'draft' || news.status === 'Bozza'));

      return matchesSearch && matchesCat && matchesStat;
    });
  }

  openNewModal() {
    this.isEditing = false;
    this.editingIndex = -1;
    this.titleError = false;
    this.errorMessage = '';
    this.currentNews = {
      id: 'news_' + Date.now(),
      title: '',
      excerpt: '',
      category: 'Generale',
      date: new Date().toLocaleDateString('it-IT'),
      author: 'Amministratore',
      authorInitial: 'AD',
      status: 'published',
      blocks: []
    };
    this.isModalOpen = true;
  }

  openEditModal(news: any, index: number) {
    this.isEditing = true;
    this.editingIndex = this.adminNews.indexOf(news);
    this.titleError = false;
    this.errorMessage = '';
    // clona anche i blocchi così le modifiche si applicano solo al salvataggio
    this.currentNews = {
      ...news,
      status: news.status === 'Bozza' ? 'draft' : (news.status || 'published'),
      blocks: (news.blocks || []).map((b: any) => ({ ...b }))
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.titleError = false;
    this.errorMessage = '';
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
    if (!this.currentNews.title || !this.currentNews.title.trim()) {
      this.titleError = true;
      this.errorMessage = 'Inserisci un titolo per la news prima di salvare.';
      return;
    }
    this.titleError = false;
    this.errorMessage = '';

    if (!this.currentNews.id) {
      this.currentNews.id = 'news_' + Date.now();
    }
    if (!this.currentNews.date) {
      this.currentNews.date = new Date().toLocaleDateString('it-IT');
    }

    if (this.isEditing && this.editingIndex >= 0) {
      this.adminNews[this.editingIndex] = { ...this.currentNews };
    } else {
      this.adminNews.unshift({ ...this.currentNews });
    }
    
    this.persistNews();
    this.closeModal();
  }

  deleteNews(news: any) {
    const idx = this.adminNews.indexOf(news);
    if (idx !== -1 && confirm(`Sei sicuro di voler eliminare la news "${news.title || 'Selezionata'}"?`)) {
      this.adminNews.splice(idx, 1);
      this.persistNews();
    }
  }

  private persistNews() {
    this.isSaving = true;
    this.adminService.saveNews(this.adminNews).subscribe({
      next: () => {
        this.isSaving = false;
        this.showToast('News salvata con successo!');
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Errore salvataggio news backend:', err);
        this.showToast('Salvato in locale (server offline)');
      }
    });
  }

  private showToast(msg: string) {
    this.successToast = msg;
    setTimeout(() => {
      if (this.successToast === msg) this.successToast = '';
    }, 3500);
  }
}
