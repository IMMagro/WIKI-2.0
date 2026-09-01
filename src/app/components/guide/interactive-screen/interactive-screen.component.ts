import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
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
  @ViewChild('imageContainer') imageContainerRef?: ElementRef<HTMLElement>;
  
  @Input() screenId!: string;
  @Input() editMode = false;
  @Output() chiudi = new EventEmitter<void>();

  screen: InteractiveScreen | null = null;
  loading = false;
  uploading = false;

  // Tool Selection for Creation: 'box' (Rettangolo) or 'pin' (Punto singolo)
  creationTool: 'box' | 'pin' = 'box';

  // Drawing state (for creating new boxes)
  isDrawing = false;
  drawStartX = 0;
  drawStartY = 0;
  currentDrawingBox: { x: number; y: number; width: number; height: number } | null = null;

  // Resizing / Dragging state (for editing existing items)
  isResizing = false;
  isDragging = false;
  activeInteractionPin: InteractivePin | null = null;
  interactionStartX = 0;
  interactionStartY = 0;
  pinInitialState: { x: number; y: number; width: number; height: number } | null = null;

  // Selected Pin / Box in Edit Mode
  selectedPin: InteractivePin | null = null;

  // For Edit Mode Form Popup
  showForm = false;
  isEditingExisting = false;
  newPinId = '';
  newPinX = 0;
  newPinY = 0;
  newPinWidth: number | undefined = undefined;
  newPinHeight: number | undefined = undefined;
  newPinType: 'box' | 'pin' = 'box';
  newPinTitle = '';
  newPinContent = '';

  // For View Mode Popup
  activePin: InteractivePin | null = null;

  // Flag to prevent immediate click closing after mouseup
  isJustDrawn = false;

  // Smart Popover Positioning
  get formLeft(): number {
    const center = this.newPinX + (this.newPinWidth ? this.newPinWidth / 2 : 0);
    return Math.max(18, Math.min(82, center));
  }

  get formTop(): number {
    return this.newPinY > 50 ? this.newPinY : (this.newPinY + (this.newPinHeight || 0));
  }

  get formTransform(): string {
    return this.newPinY > 50 ? 'translate(-50%, -105%)' : 'translate(-50%, 15px)';
  }

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
      this.selectedPin = null;
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

  // ===== Mouse Event Handlers on Image Container =====

  onCanvasMouseDown(event: MouseEvent) {
    if (!this.editMode || !this.screen) return;
    
    // Ignore if clicking on an interactive element or handle or form
    const target = event.target as HTMLElement;
    if (target.closest('.interactive-pin') || target.closest('.interactive-box') || target.closest('.form-popover') || target.closest('.handle')) {
      return;
    }

    event.preventDefault(); // Prevent default browser image drag

    const imgEl = this.imageContainerRef?.nativeElement;
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();

    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

    this.isDrawing = true;
    this.drawStartX = x;
    this.drawStartY = y;
    this.currentDrawingBox = { x, y, width: 0, height: 0 };
    this.showForm = false;
    this.activePin = null;
    this.selectedPin = null;
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent) {
    const imgEl = this.imageContainerRef?.nativeElement;
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();

    // 1. Drawing a new box
    if (this.isDrawing && this.currentDrawingBox) {
      const currentX = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const currentY = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));

      const minX = Math.min(this.drawStartX, currentX);
      const minY = Math.min(this.drawStartY, currentY);
      const width = Math.abs(currentX - this.drawStartX);
      const height = Math.abs(currentY - this.drawStartY);

      this.currentDrawingBox = { x: minX, y: minY, width, height };
      return;
    }

    // 2. Resizing an existing box
    if (this.isResizing && this.activeInteractionPin && this.pinInitialState) {
      const currentX = ((event.clientX - rect.left) / rect.width) * 100;
      const currentY = ((event.clientY - rect.top) / rect.height) * 100;

      const deltaX = currentX - this.interactionStartX;
      const deltaY = currentY - this.interactionStartY;

      const newWidth = Math.max(3, Math.min(100 - this.pinInitialState.x, this.pinInitialState.width + deltaX));
      const newHeight = Math.max(3, Math.min(100 - this.pinInitialState.y, this.pinInitialState.height + deltaY));

      this.activeInteractionPin.width = Math.round(newWidth * 10) / 10;
      this.activeInteractionPin.height = Math.round(newHeight * 10) / 10;
      return;
    }

    // 3. Dragging/moving an existing item
    if (this.isDragging && this.activeInteractionPin && this.pinInitialState) {
      const currentX = ((event.clientX - rect.left) / rect.width) * 100;
      const currentY = ((event.clientY - rect.top) / rect.height) * 100;

      const deltaX = currentX - this.interactionStartX;
      const deltaY = currentY - this.interactionStartY;

      const newX = Math.max(0, Math.min(100 - (this.pinInitialState.width || 0), this.pinInitialState.x + deltaX));
      const newY = Math.max(0, Math.min(100 - (this.pinInitialState.height || 0), this.pinInitialState.y + deltaY));

      this.activeInteractionPin.x = Math.round(newX * 10) / 10;
      this.activeInteractionPin.y = Math.round(newY * 10) / 10;
      return;
    }
  }

  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp(event: MouseEvent) {
    if (this.isDrawing) {
      if (this.currentDrawingBox) {
        const isBox = this.creationTool === 'box' && (this.currentDrawingBox.width > 2 || this.currentDrawingBox.height > 2);
        
        this.isEditingExisting = false;
        this.newPinId = 'pin_' + Date.now().toString();
        this.newPinTitle = '';
        this.newPinContent = '';

        if (isBox) {
          this.newPinX = Math.round(this.currentDrawingBox.x * 10) / 10;
          this.newPinY = Math.round(this.currentDrawingBox.y * 10) / 10;
          this.newPinWidth = Math.round(this.currentDrawingBox.width * 10) / 10;
          this.newPinHeight = Math.round(this.currentDrawingBox.height * 10) / 10;
          this.newPinType = 'box';
        } else {
          this.newPinX = Math.round(this.drawStartX * 10) / 10;
          this.newPinY = Math.round(this.drawStartY * 10) / 10;
          this.newPinWidth = undefined;
          this.newPinHeight = undefined;
          this.newPinType = 'pin';
        }

        this.showForm = true;
        this.isJustDrawn = true;
        setTimeout(() => { this.isJustDrawn = false; }, 350);
      }
      this.isDrawing = false;
      this.currentDrawingBox = null;
    }

    if (this.isResizing || this.isDragging) {
      this.isResizing = false;
      this.isDragging = false;
      this.activeInteractionPin = null;
      this.pinInitialState = null;
      this.saveCurrentScreen();
    }
  }

  // ===== Interaction Controls for Existing Items =====

  startResize(pin: InteractivePin, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.editMode) return;

    const imgEl = this.imageContainerRef?.nativeElement;
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();

    this.isResizing = true;
    this.activeInteractionPin = pin;
    this.interactionStartX = ((event.clientX - rect.left) / rect.width) * 100;
    this.interactionStartY = ((event.clientY - rect.top) / rect.height) * 100;
    this.pinInitialState = {
      x: pin.x,
      y: pin.y,
      width: pin.width || 10,
      height: pin.height || 6
    };
  }

  startDrag(pin: InteractivePin, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.editMode) return;

    const imgEl = this.imageContainerRef?.nativeElement;
    if (!imgEl) return;
    const rect = imgEl.getBoundingClientRect();

    this.isDragging = true;
    this.activeInteractionPin = pin;
    this.interactionStartX = ((event.clientX - rect.left) / rect.width) * 100;
    this.interactionStartY = ((event.clientY - rect.top) / rect.height) * 100;
    this.pinInitialState = {
      x: pin.x,
      y: pin.y,
      width: pin.width || 0,
      height: pin.height || 0
    };
  }

  onPinClick(pin: InteractivePin, event: Event) {
    event.stopPropagation();
    if (this.editMode) {
      this.selectedPin = pin;
      this.isEditingExisting = true;
      this.newPinId = pin.id;
      this.newPinX = pin.x;
      this.newPinY = pin.y;
      this.newPinWidth = pin.width;
      this.newPinHeight = pin.height;
      this.newPinType = (pin.width && pin.height) ? 'box' : 'pin';
      this.newPinTitle = pin.title;
      this.newPinContent = pin.content;
      this.showForm = true;
      this.activePin = null;
    } else {
      this.activePin = pin;
    }
  }

  deleteSelectedPin(pin: InteractivePin, event?: Event) {
    if (event) event.stopPropagation();
    if (confirm('Vuoi eliminare questo elemento (' + pin.title + ')?')) {
      if (this.screen) {
        this.screen.pins = this.screen.pins.filter(p => p.id !== pin.id);
        this.showForm = false;
        this.selectedPin = null;
        this.saveCurrentScreen();
      }
    }
  }

  closePopup(event?: Event) {
    if (this.isJustDrawn) return;
    if (event) event.stopPropagation();
    this.activePin = null;
    this.showForm = false;
    this.selectedPin = null;
  }

  saveFormPin(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.screen || !this.newPinTitle || !this.newPinContent) return;

    if (!this.screen.pins) {
      this.screen.pins = [];
    }

    if (this.isEditingExisting) {
      // Update existing
      const existing = this.screen.pins.find(p => p.id === this.newPinId);
      if (existing) {
        existing.title = this.newPinTitle;
        existing.content = this.newPinContent;
        existing.width = this.newPinWidth;
        existing.height = this.newPinHeight;
        existing.type = this.newPinType;
      }
    } else {
      // Add new
      const newPin: InteractivePin = {
        id: this.newPinId || ('pin_' + Date.now().toString()),
        x: this.newPinX,
        y: this.newPinY,
        width: this.newPinWidth,
        height: this.newPinHeight,
        type: this.newPinType,
        title: this.newPinTitle,
        content: this.newPinContent
      };
      this.screen.pins.push(newPin);
    }

    this.showForm = false;
    this.selectedPin = null;
    this.saveCurrentScreen();
  }

  // ===== Screenshot Image Upload =====

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
