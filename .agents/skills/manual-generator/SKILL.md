---
name: manual-generator
description: Crea o formatta nuovi manuali (file .mdx) per la Wiki utilizzando lo standard HTML/MDX richiesto (frontmatter, tag HTML, emoji, formattazione video/note).
---

# Manual Generator Skill

Questa skill deve essere invocata ogni volta che l'utente richiede di "creare un manuale", "scrivere una guida" o "formattare un documento per la wiki".

La Wiki 2.0 utilizza file con estensione `.mdx` che combinano un frontmatter YAML e un corpo del testo formattato esclusivamente in **HTML** (non Markdown standard).

## Regole di Formattazione (.mdx)

Quando generi un nuovo manuale, DEVI rispettare rigorosamente questa struttura:

### 1. Frontmatter YAML
Ogni file deve iniziare con il seguente blocco:
```mdx
---
title: "📑 Titolo del Manuale con Emoji Iniziale"
description: "Breve descrizione opzionale"
published: true
---
```

### 2. Contenuto in HTML
Tutto il contenuto del manuale deve essere scritto usando tag HTML validi. NON usare la sintassi Markdown (es. `##`, `**`, `>`) nel corpo del documento.
- Usa `<p>` per i paragrafi.
- Usa `<h2><strong>Emoji Titolo Sezione</strong></h2>` per i titoli principali.
- Usa `<h3><strong>Emoji Sottotitolo</strong></h3>` per le sezioni secondarie.
- Usa `<ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Testo</li></ol>` per le liste ordinate o non ordinate (simulando l'editor Quill).
- Usa `<strong>` per il grassetto.
- Usa `&nbsp;` per forzare gli spazi.

### 3. Note e Avvisi (Blockquote)
Usa il tag `<blockquote>` combinato con emoji per dare risalto a note, suggerimenti o avvisi importanti:
```html
<blockquote>⚠️&nbsp;Nota sulla Scadenza&nbsp;Testo dell'avviso.</blockquote>
<blockquote>💡&nbsp;Tip:&nbsp;Testo del suggerimento.</blockquote>
<blockquote>✅ Nota Bene:&nbsp;Testo della nota.</blockquote>
```

### 4. Inserimento Video / Immagini
Se devi inserire un video esplicativo, usa ESATTAMENTE questo tag strutturato con le classi e gli stili della Wiki:
```html
<video src="/Data/docs/03_Guide_Tecniche/CARTELLA/images/nome_video.mp4" autoplay="true" loop="true" muted="true" playsinline="true" class="wiki-zoomable" style="border-radius: 8px; max-width: 100%; margin: 20px auto; display: block; cursor: zoom-in;"></video>
```
Sostituisci il path `src` con il percorso corretto.

## Flusso Operativo
1. **Analizza** il testo o le istruzioni fornite dall'utente.
2. **Struttura** il contenuto logicamente in Fasi (Fase 1, Fase 2) o sezioni se si tratta di una procedura guidata.
3. **Applica** emoji descrittive per ogni titolo (es. 🔐, 🔄, 🌐, 💾).
4. **Genera** il file `.mdx` nella directory di destinazione usando il tool `write_to_file`. Non usare file Markdown puri (`.md`).
