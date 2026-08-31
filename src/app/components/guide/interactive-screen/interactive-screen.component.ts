import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InteractiveScreensService } from '../../../services/interactive-screens.service';
import { InteractiveScreen, InteractivePin } from '../guide.models';

@Component({
  selector: 'app-interactive-screen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interactive-screen.component.html',
  styleUrls: ['./interactive-screen.component.css']
})
export class InteractiveScreenComponent implements OnInit, OnChanges {
  @Input() screenId!: string;
  @Input() editMode = false;
  @Output() chiudi = new EventEmitter<void>();

  screen: InteractiveScreen | null = null;
  loading = false;
  uploading = false;
  
  // For Edit Mode Form
  showForm = false;
  newPinX = 0;
  newPinY = 0;
  newPinTitle = '';
  newPinContent = '';

  // For View Mode Popup
  activePin: InteractivePin | null = null;

  constructor(
    private interactiveScreensService: InteractiveScreensService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadScreen();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['screenId'] && !changes['screenId'].firstChange) {
      this.loadScreen();
    }
    if (changes['editMode']) {
      this.showForm = false;
      this.activePin = null;
    }
  }

  private loadScreen() {
    if (!this.screenId) return;
    this.loading = true;
    this.interactiveScreensService.getScreen(this.screenId).subscribe(s => {
      this.screen = s || null;
      this.loading = false;
    });
  }

  onImageClick(event: MouseEvent) {
    if (!this.editMode || !this.screen) return;
    
    // Prevent triggering if clicking on an existing pin
    const target = event.target as HTMLElement;
    if (target.closest('.interactive-pin')) return;

    const imgEl = event.currentTarget as HTMLElement;
    const rect = imgEl.getBoundingClientRect();
    
    // Calculate percentage coordinates
    this.newPinX = ((event.clientX - rect.left) / rect.width) * 100;
    this.newPinY = ((event.clientY - rect.top) / rect.height) * 100;
    
    this.showForm = true;
    this.newPinTitle = '';
    this.newPinContent = '';
    this.activePin = null;
  }

  onPinClick(pin: InteractivePin, event: Event) {
    event.stopPropagation(); // Don't trigger image click
    if (this.editMode) {
      if (confirm('Vuoi eliminare questo pin?')) {
        this.screen!.pins = this.screen!.pins.filter(p => p.id !== pin.id);
        this.saveCurrentScreen();
      }
    } else {
      this.activePin = pin;
    }
  }

  closePopup(event?: Event) {
    if (event) event.stopPropagation();
    this.activePin = null;
    this.showForm = false;
  }

  saveNewPin(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.screen || !this.newPinTitle || !this.newPinContent) return;

    const newPin: InteractivePin = {
      id: 'pin_' + Date.now().toString(),
      x: this.newPinX,
      y: this.newPinY,
      title: this.newPinTitle,
      content: this.newPinContent
    };

    if (!this.screen.pins) {
      this.screen.pins = [];
    }
    
    this.screen.pins.push(newPin);
    this.showForm = false;
    this.saveCurrentScreen();
  }

  onFileSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file || !this.screenId) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'interactive');
    formData.append('id', this.screenId);

    const token = sessionStorage.getItem('adminToken');
    const headers: any = token ? { Authorization: 'Bearer ' + token } : {};

    this.http.post<{ success: boolean; url: string }>('/api/upload_asset.ashx', formData, { headers }).subscribe({
      next: (res) => {
        if (res && res.success && res.url) {
          this.uploading = false;
          this.updateImageUrl(res.url);
        } else {
          this.fallbackReadFile(file);
        }
      },
      error: () => {
        // Fallback for dev server (ng serve)
        this.fallbackReadFile(file);
      }
    });

    event.target.value = '';
  }

  private fallbackReadFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploading = false;
      this.updateImageUrl(e.target.result);
    };
    reader.onerror = () => {
      this.uploading = false;
      alert('Impossibile leggere il file selezionato.');
    };
    reader.readAsDataURL(file);
  }

  private updateImageUrl(url: string) {
    if (!this.screen) {
      this.screen = {
        id: this.screenId,
        imageUrl: url,
        pins: []
      };
    } else {
      this.screen.imageUrl = url;
    }
    this.saveCurrentScreen();
  }

  private saveCurrentScreen() {
    if (!this.screen) return;
    this.interactiveScreensService.saveScreen(this.screen).subscribe(success => {
      if (!success) {
        console.warn('Salvataggio API non riuscito (fallback su cache locale attivo).');
      }
    });
  }
}
