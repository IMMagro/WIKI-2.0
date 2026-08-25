import { Component, Input, Output, EventEmitter, HostListener, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface NewsBlock {
  id: string;
  type: 'text' | 'image' | 'link' | 'box';
  x: number; y: number; w: number; h: number;
  content?: string;   // testo, oppure URL immagine, oppure etichetta link
  href?: string;      // destinazione del link
  color?: string;     // colore testo
  bg?: string;        // sfondo box
  fontSize?: number;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  radius?: number;
}

/**
 * Editor grafico libero (stile Figma) per comporre una comunicazione:
 * box, testi, immagini e link posizionabili e ridimensionabili su un canvas.
 * Two-way binding: [(blocks)]="news.blocks".
 */
@Component({
  selector: 'app-news-canvas-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-canvas-editor.component.html'
})
export class NewsCanvasEditorComponent implements OnChanges {
  @Input() blocks: NewsBlock[] = [];
  @Output() blocksChange = new EventEmitter<NewsBlock[]>();

  readonly canvasW = 720;
  canvasH = 480;
  selectedId: string | null = null;

  private mode: 'move' | 'resize' | null = null;
  private sx = 0; private sy = 0;
  private ox = 0; private oy = 0; private ow = 0; private oh = 0;
  private active: NewsBlock | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(): void {
    if (!this.blocks) this.blocks = [];
    this.growCanvas();
  }

  get selected(): NewsBlock | null {
    return this.blocks.find(b => b.id === this.selectedId) || null;
  }

  private uid(): string {
    return 'b' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  }

  add(type: NewsBlock['type']): void {
    const b: NewsBlock = {
      id: this.uid(), type,
      x: 40, y: 40,
      w: type === 'text' ? 320 : (type === 'link' ? 180 : 240),
      h: type === 'text' ? 64 : (type === 'link' ? 48 : 160)
    };
    if (type === 'text') { b.content = 'Scrivi qui il testo'; b.color = '#1E2022'; b.fontSize = 18; b.align = 'left'; }
    if (type === 'box') { b.bg = '#EAF1FF'; b.radius = 14; }
    if (type === 'link') { b.content = 'Apri il link'; b.href = 'https://'; }
    if (type === 'image') { b.content = ''; }
    this.blocks = [...this.blocks, b];
    this.selectedId = b.id;
    this.emit();
  }

  select(id: string, ev: Event): void { ev.stopPropagation(); this.selectedId = id; }
  clearSel(): void { this.selectedId = null; }

  remove(id: string): void {
    this.blocks = this.blocks.filter(b => b.id !== id);
    if (this.selectedId === id) this.selectedId = null;
    this.emit();
  }

  bringToFront(b: NewsBlock): void {
    this.blocks = [...this.blocks.filter(x => x.id !== b.id), b];
    this.emit();
  }

  startMove(b: NewsBlock, ev: MouseEvent): void {
    ev.stopPropagation(); ev.preventDefault();
    this.mode = 'move'; this.active = b; this.selectedId = b.id;
    this.sx = ev.clientX; this.sy = ev.clientY; this.ox = b.x; this.oy = b.y;
  }

  startResize(b: NewsBlock, ev: MouseEvent): void {
    ev.stopPropagation(); ev.preventDefault();
    this.mode = 'resize'; this.active = b; this.selectedId = b.id;
    this.sx = ev.clientX; this.sy = ev.clientY; this.ow = b.w; this.oh = b.h;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(ev: MouseEvent): void {
    if (!this.mode || !this.active) return;
    const dx = ev.clientX - this.sx, dy = ev.clientY - this.sy;
    if (this.mode === 'move') {
      this.active.x = Math.round(Math.max(0, Math.min(this.canvasW - 20, this.ox + dx)));
      this.active.y = Math.round(Math.max(0, this.oy + dy));
    } else {
      this.active.w = Math.round(Math.max(40, Math.min(this.canvasW - this.active.x, this.ow + dx)));
      this.active.h = Math.round(Math.max(28, this.oh + dy));
    }
    this.growCanvas();
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.mode) { this.mode = null; this.active = null; this.emit(); }
  }

  private growCanvas(): void {
    const maxB = (this.blocks || []).reduce((m, b) => Math.max(m, b.y + b.h), 0);
    this.canvasH = Math.max(480, maxB + 40);
  }

  /** Da chiamare quando cambiano i campi nel pannello proprietà. */
  emit(): void { this.growCanvas(); this.blocksChange.emit(this.blocks); }

  /** Carica un'immagine da file: la ridimensiona e la salva inline (data URL) nel blocco. */
  onImageFile(block: NewsBlock, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.downscale(reader.result as string, 1200, (dataUrl, w, h) => {
        block.content = dataUrl;
        // adatta l'altezza del blocco alle proporzioni dell'immagine
        if (w && h && block.w) block.h = Math.round(block.w * h / w);
        this.emit();
        this.cdr.detectChanges();
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  /** Ridimensiona l'immagine a maxW px di larghezza ed esporta in JPEG per contenere il peso. */
  private downscale(src: string, maxW: number, cb: (out: string, w?: number, h?: number) => void): void {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { cb(src, img.width, img.height); return; }
      ctx.drawImage(img, 0, 0, w, h);
      try { cb(canvas.toDataURL('image/jpeg', 0.85), w, h); }
      catch { cb(src, img.width, img.height); }
    };
    img.onerror = () => cb(src);
    img.src = src;
  }
}
