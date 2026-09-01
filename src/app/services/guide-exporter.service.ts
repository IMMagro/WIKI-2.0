import { Injectable } from '@angular/core';
import { Guide, Category, Faq, Step } from '../components/guide/guide.models';

@Injectable({
  providedIn: 'root'
})
export class GuideExporterService {

  constructor() {}

  /**
   * Converte un URL di immagine in stringa Base64.
   * Se l'URL non è raggiungibile o si verifica un errore, restituisce l'URL originale come fallback.
   */
  private async imageToBase64(url: string): Promise<string> {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || url);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn(`[GuideExporter] Impossibile convertire immagine "${url}" in Base64:`, err);
      return url;
    }
  }

  /**
   * Converte una stringa in formato slug sicuro per il nome file.
   */
  private slugify(text: string): string {
    return (text || 'guida')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'guida';
  }

  /**
   * Esegue l'escape dei caratteri speciali HTML.
   */
  private escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Formatta il contenuto testuale supportando HTML o ritorni a capo.
   */
  private formatContent(text: string): string {
    if (!text) return '';
    if (!/<[a-z][\s\S]*>/i.test(text)) {
      return this.escapeHtml(text).replace(/\n/g, '<br>');
    }
    return text;
  }

  /**
   * Esporta una guida in formato HTML standalone e avvia il download nel browser.
   */
  async exportToHtml(categoryName: string, guide: Guide | null): Promise<void> {
    if (!guide) return;

    // Converti in parallelo tutte le immagini degli step in Base64
    const processedFaqs = await Promise.all(
      (guide.faqs || []).map(async (faq) => {
        const processedSteps = await Promise.all(
          (faq.steps || []).map(async (step) => {
            let base64Img = '';
            if (step.img && step.imgUrl) {
              base64Img = await this.imageToBase64(step.imgUrl);
            }
            return {
              ...step,
              base64Img
            };
          })
        );
        return {
          ...faq,
          processedSteps
        };
      })
    );

    const now = new Date();
    const generationDate = now.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = this.buildHtmlDocument({
      categoryName: categoryName || 'Generale',
      guide,
      faqs: processedFaqs,
      generationDate
    });

    // Crea il Blob e avvia il download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `guida-${this.slugify(guide.title)}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 150);
  }

  /**
   * Assembla l'intero documento HTML standalone con CSS tema QE incorporato.
   */
  private buildHtmlDocument(data: {
    categoryName: string;
    guide: Guide;
    faqs: Array<Faq & { processedSteps: Array<Step & { base64Img?: string }> }>;
    generationDate: string;
  }): string {
    const { categoryName, guide, faqs, generationDate } = data;

    let blocksHtml = '';

    faqs.forEach((faq, fIdx) => {
      const isFaqExtra = !!faq.extra;
      const blockBadgeText = isFaqExtra ? 'FAQ / Approfondimento' : 'Procedura Operativa';
      const blockBadgeClass = isFaqExtra ? 'badge-magenta' : 'badge-blue';

      let tagsHtml = '';
      if (faq.tags && faq.tags.length > 0) {
        tagsHtml = `
          <div class="tags-container">
            ${faq.tags.map(t => `<span class="tag-pill">#${this.escapeHtml(t)}</span>`).join('')}
          </div>
        `;
      }

      let stepsHtml = '';
      if (faq.processedSteps && faq.processedSteps.length > 0) {
        stepsHtml = `
          <div class="steps-list">
            ${faq.processedSteps.map((step, sIdx) => {
              let imgHtml = '';
              if (step.base64Img) {
                imgHtml = `
                  <div class="step-image-wrap">
                    <img src="${step.base64Img}" alt="Screenshot passaggio ${sIdx + 1}" loading="lazy" />
                  </div>
                `;
              }

              let videoHtml = '';
              if (step.video && step.videoUrl) {
                videoHtml = `
                  <div class="step-video-wrap">
                    <a href="${this.escapeHtml(step.videoUrl)}" target="_blank" rel="noopener noreferrer" class="video-link">
                      <span class="video-icon">▶</span>
                      <span>Guarda video correlato: ${this.escapeHtml(step.videoUrl)}</span>
                    </a>
                  </div>
                `;
              }

              return `
                <div class="step-item">
                  <div class="step-badge">${sIdx + 1}</div>
                  <div class="step-content">
                    <div class="step-text">${this.formatContent(step.t)}</div>
                    ${imgHtml}
                    ${videoHtml}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else {
        stepsHtml = `<p class="empty-notice">Nessun passaggio definito per questa sezione.</p>`;
      }

      blocksHtml += `
        <section class="guide-card block-card ${isFaqExtra ? 'block-card-extra' : ''}">
          <div class="block-header">
            <div class="block-title-row">
              <span class="block-badge ${blockBadgeClass}">${blockBadgeText}</span>
              <h2 class="block-title">${this.escapeHtml(faq.q || `Blocco ${fIdx + 1}`)}</h2>
            </div>
            ${tagsHtml}
          </div>
          ${stepsHtml}
        </section>
      `;
    });

    let overviewHtml = '';
    if (guide.overview && guide.overview.trim()) {
      overviewHtml = `
        <section class="guide-card overview-card">
          <div class="overview-header">
            <svg class="overview-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Panoramica Generale</h3>
          </div>
          <div class="overview-content">
            ${this.formatContent(guide.overview)}
          </div>
        </section>
      `;
    }

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quaderno Elettronico - ${this.escapeHtml(guide.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --qe-blue: #377DFF;
      --qe-blue-light: #EAF1FF;
      --qe-blue-hover: #2563EB;
      --qe-magenta: #F80086;
      --qe-magenta-light: #FFE9F4;
      --qe-bg: #F8FAFD;
      --qe-text: #1E2022;
      --qe-text-muted: #64748B;
      --qe-border: #E2E8F0;
      --qe-card-bg: #FFFFFF;
      --qe-card-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--qe-bg);
      color: var(--qe-text);
      line-height: 1.6;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
    }

    /* Top Bar & Print Button */
    .top-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }

    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--qe-blue);
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(55, 125, 255, 0.3);
      transition: all 0.2s ease;
    }

    .btn-print:hover {
      background: var(--qe-blue-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(55, 125, 255, 0.4);
    }

    /* Cards */
    .guide-card {
      background: var(--qe-card-bg);
      border: 1px solid var(--qe-border);
      border-radius: 20px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: var(--qe-card-shadow);
    }

    /* Header Guida */
    .header-badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .system-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--qe-blue-light);
      color: var(--qe-blue);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid rgba(55, 125, 255, 0.2);
    }

    .cat-badge {
      display: inline-flex;
      align-items: center;
      background: #F1F5F9;
      color: #475569;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .date-badge {
      font-size: 11px;
      color: var(--qe-text-muted);
      margin-left: auto;
    }

    .guide-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--qe-text);
      line-height: 1.3;
      margin-bottom: 12px;
    }

    .guide-desc {
      font-size: 15px;
      color: var(--qe-text-muted);
      line-height: 1.6;
    }

    /* Overview Section */
    .overview-card {
      background: linear-gradient(to bottom, #FFFFFF, #F8FAFD);
      border-left: 4px solid var(--qe-blue);
    }

    .overview-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
      color: var(--qe-blue);
    }

    .overview-header h3 {
      font-size: 16px;
      font-weight: 700;
    }

    .overview-icon {
      width: 20px;
      height: 20px;
    }

    .overview-content {
      font-size: 14px;
      color: #334155;
      line-height: 1.7;
    }

    .overview-content p {
      margin-bottom: 10px;
    }

    .overview-content ul, .overview-content ol {
      margin-left: 20px;
      margin-bottom: 10px;
    }

    /* Block Card */
    .block-card {
      border-left: 4px solid var(--qe-blue);
    }

    .block-card-extra {
      border-left: 4px solid var(--qe-magenta);
    }

    .block-header {
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--qe-border);
    }

    .block-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .block-badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .badge-blue {
      background: var(--qe-blue-light);
      color: var(--qe-blue);
    }

    .badge-magenta {
      background: var(--qe-magenta-light);
      color: var(--qe-magenta);
    }

    .block-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--qe-text);
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }

    .tag-pill {
      font-size: 11px;
      font-weight: 500;
      color: var(--qe-text-muted);
      background: #F1F5F9;
      padding: 2px 8px;
      border-radius: 6px;
    }

    /* Steps */
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .step-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
    }

    .step-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--qe-blue);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
      box-shadow: 0 2px 8px rgba(55, 125, 255, 0.3);
    }

    .block-card-extra .step-badge {
      background: var(--qe-magenta);
      box-shadow: 0 2px 8px rgba(248, 0, 134, 0.3);
    }

    .step-content {
      flex: 1;
      min-width: 0;
    }

    .step-text {
      font-size: 14px;
      color: var(--qe-text);
      line-height: 1.6;
    }

    .step-text a {
      color: var(--qe-blue);
      text-decoration: underline;
      font-weight: 600;
    }

    .step-image-wrap {
      margin-top: 12px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--qe-border);
      background: #F8FAFD;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .step-image-wrap img {
      display: block;
      width: 100%;
      max-height: 520px;
      object-fit: contain;
      background-color: #FFFFFF;
    }

    .step-video-wrap {
      margin-top: 10px;
    }

    .video-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--qe-magenta-light);
      color: var(--qe-magenta);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;
      text-decoration: none;
      border: 1px solid rgba(248, 0, 134, 0.2);
      transition: background 0.2s;
    }

    .video-link:hover {
      background: #ffd6eb;
    }

    .video-icon {
      font-size: 10px;
    }

    .empty-notice {
      font-size: 13px;
      color: var(--qe-text-muted);
      font-style: italic;
      padding: 10px 0;
    }

    /* Footer */
    .guide-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--qe-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 11px;
      color: var(--qe-text-muted);
    }

    .footer-left {
      font-weight: 500;
    }

    .footer-right {
      font-weight: 600;
    }

    /* Media Print */
    @media print {
      @page {
        size: A4 portrait;
        margin: 12mm 15mm;
      }

      body {
        background-color: #FFFFFF !important;
        color: #000000 !important;
        padding: 0 !important;
        font-size: 12pt;
      }

      .no-print, .btn-print, .top-actions {
        display: none !important;
      }

      .container {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .guide-card {
        box-shadow: none !important;
        border: 1px solid #CBD5E1 !important;
        border-radius: 12px !important;
        padding: 18px !important;
        margin-bottom: 18px !important;
        page-break-inside: avoid;
      }

      .block-card {
        page-break-inside: avoid;
      }

      .step-item {
        page-break-inside: avoid;
      }

      .step-image-wrap {
        box-shadow: none !important;
        border: 1px solid #CBD5E1 !important;
      }

      .step-image-wrap img {
        max-height: 380px !important;
      }

      .guide-title {
        font-size: 22pt !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Top Action: Stampa / PDF -->
    <div class="top-actions no-print">
      <button onclick="window.print()" class="btn-print" title="Stampa o Salva come PDF">
        <span>🖨️</span>
        <span>Stampa / Salva in PDF</span>
      </button>
    </div>

    <!-- Header Guida -->
    <header class="guide-card">
      <div class="header-badge-row">
        <span class="system-badge">
          <span>📖</span>
          <span>Quaderno Elettronico • Manuale Operativo</span>
        </span>
        <span class="cat-badge">${this.escapeHtml(categoryName)}</span>
        <span class="date-badge">Aggiornato: ${this.escapeHtml(guide.updated || 'Recente')}</span>
      </div>
      <h1 class="guide-title">${this.escapeHtml(guide.title)}</h1>
      ${guide.desc ? `<p class="guide-desc">${this.escapeHtml(guide.desc)}</p>` : ''}
    </header>

    <!-- Panoramica (se presente) -->
    ${overviewHtml}

    <!-- Blocchi Procedure & FAQ -->
    ${blocksHtml}

    <!-- Footer -->
    <footer class="guide-footer">
      <div class="footer-left">
        Documento generato il ${generationDate} da <strong>Wiki 2.0</strong>
      </div>
      <div class="footer-right">
        Quaderno Elettronico • Riservato ad uso interno
      </div>
    </footer>

  </div>
</body>
</html>`;
  }
}
