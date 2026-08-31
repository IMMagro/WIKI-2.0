export interface ParsedAiStep {
  t: string;
  img?: boolean;
  imgUrl?: string;
  video?: boolean;
  videoUrl?: string;
}

export interface ParsedAiFaq {
  q: string;
  steps: ParsedAiStep[];
}

export interface ParsedAiDoc {
  title: string;
  description: string;
  overview: string;
  steps: ParsedAiStep[];
  faqs: ParsedAiFaq[];
}

export function parseAiDocument(rawText: string): ParsedAiDoc {
  if (!rawText || !rawText.trim()) {
    return { title: '', description: '', overview: '', steps: [], faqs: [] };
  }

  let text = rawText.trim();
  
  // 0. Prova a parsare come JSON (supporta JSON diretto o blocco Markdown ```json)
  try {
    let jsonStr = text;
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/i, '').replace(/```$/i, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/i, '').replace(/```$/i, '').trim();
    }
    const jsonObj = JSON.parse(jsonStr);
    if (jsonObj && (jsonObj.title !== undefined || jsonObj.steps !== undefined || jsonObj.overview !== undefined)) {
      return {
        title: jsonObj.title || '',
        description: jsonObj.description || '',
        overview: jsonObj.overview || '',
        steps: Array.isArray(jsonObj.steps) ? jsonObj.steps : [],
        faqs: Array.isArray(jsonObj.faqs) ? jsonObj.faqs : []
      };
    }
  } catch (e) {
    // Non è JSON, procedi con il parsing MDX
  }

  let title = '';
  let description = '';

  // 1. Estrazione Frontmatter YAML
  const yamlMatch = text.match(/^---\s*([\s\S]*?)\s*---/);
  if (yamlMatch) {
    const yamlContent = yamlMatch[1];
    const titleMatch = yamlContent.match(/title:\s*["']?(.*?)["']?$/m);
    if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();

    const descMatch = yamlContent.match(/description:\s*["']?(.*?)["']?$/m);
    if (descMatch && descMatch[1]) description = descMatch[1].trim();

    // Rimuovi il blocco frontmatter dal testo rimanente
    text = text.substring(yamlMatch[0].length).trim();
  }

  let overviewHtml = '';
  let steps: ParsedAiStep[] = [];
  let faqs: ParsedAiFaq[] = [];

  // 2. Controllo presenza marcatori espliciti: ===PANORAMICA===, ===PASSAGGI===, ===FAQ===
  const hasExplicitPanoramica = /===PANORAMICA===|<!--\s*PANORAMICA\s*-->/i.test(text);
  const hasExplicitPassaggi = /===PASSAGGI===|<!--\s*PASSAGGI\s*-->/i.test(text);
  const hasExplicitFaq = /===FAQ===|<!--\s*FAQ\s*-->/i.test(text);

  if (hasExplicitPanoramica || hasExplicitPassaggi || hasExplicitFaq) {
    // --- PARSING CON MARCATORI ESPLICITI ---
    const regexPanoramica = /(?:===PANORAMICA===|<!--\s*PANORAMICA\s*-->)([\s\S]*?)(?=(?:===PASSAGGI===|<!--\s*PASSAGGI\s*-->|===FAQ===|<!--\s*FAQ\s*-->|$))/i;
    const regexPassaggi = /(?:===PASSAGGI===|<!--\s*PASSAGGI\s*-->)([\s\S]*?)(?=(?:===FAQ===|<!--\s*FAQ\s*-->|$))/i;
    const regexFaq = /(?:===FAQ===|<!--\s*FAQ\s*-->)([\s\S]*?)$/i;

    const panoMatch = text.match(regexPanoramica);
    if (panoMatch) {
      overviewHtml = panoMatch[1].trim();
    }

    const passMatch = text.match(regexPassaggi);
    if (passMatch) {
      steps = parseStepsBlock(passMatch[1]);
    }

    const faqMatch = text.match(regexFaq);
    if (faqMatch) {
      faqs = parseFaqsBlock(faqMatch[1]);
    }
  } else {
    // --- PARSING SMART DI FALLBACK (HTML / MARKDOWN MISTO) ---
    const faqSplitRegex = /<h[23][^>]*>[\s\S]*?(?:domande\s*frequenti|faq)[\s\S]*?<\/h[23]>|##+.*?(?:domande\s*frequenti|faq)/i;
    const passaggiSplitRegex = /<h[23][^>]*>[\s\S]*?(?:passaggi|procedura\s*operativa|step)[\s\S]*?<\/h[23]>|##+.*?(?:passaggi|procedura\s*operativa|step)/i;

    let preFaqText = text;
    let faqSectionText = '';

    const faqParts = text.split(faqSplitRegex);
    if (faqParts.length > 1) {
      preFaqText = faqParts[0];
      faqSectionText = faqParts.slice(1).join('\n');
      faqs = parseFaqsBlock(faqSectionText);
    }

    const passParts = preFaqText.split(passaggiSplitRegex);
    if (passParts.length > 1) {
      overviewHtml = passParts[0].trim();
      const passSectionText = passParts.slice(1).join('\n');
      steps = parseStepsBlock(passSectionText);
    } else {
      overviewHtml = preFaqText.trim();
    }
  }

  return {
    title,
    description,
    overview: overviewHtml,
    steps,
    faqs
  };
}

function parseStepsBlock(block: string): ParsedAiStep[] {
  if (!block || !block.trim()) return [];

  const rawSteps: ParsedAiStep[] = [];
  const lines = block.split(/\r?\n/);

  let currentStep: ParsedAiStep | null = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const stepMatch = line.match(/^(?:(?:\d+[\.\)])|\[STEP\]|<li>|<li[^>]*>)\s*(.*)/i);
    const mediaMatch = line.match(/(?:\[(?:MEDIA|IMAGE|VIDEO):\s*(.*?)\]|<img[^>]+src=["'](.*?)["']|<video[^>]+src=["'](.*?)["'])/i);

    if (stepMatch) {
      let stepText = stepMatch[1].replace(/<\/li>$/i, '').trim();

      let inlineMediaUrl = '';
      const inlineMedia = stepText.match(/(?:\[(?:MEDIA|IMAGE|VIDEO):\s*(.*?)\]|<img[^>]+src=["'](.*?)["']|<video[^>]+src=["'](.*?)["'])/i);
      if (inlineMedia) {
        inlineMediaUrl = inlineMedia[1] || inlineMedia[2] || inlineMedia[3] || '';
        stepText = stepText.replace(inlineMedia[0], '').trim();
      }

      currentStep = {
        t: stepText
      };

      if (inlineMediaUrl) {
        const isVid = isVideoUrl(inlineMediaUrl);
        if (isVid) {
          currentStep.video = true;
          currentStep.videoUrl = inlineMediaUrl;
        } else {
          currentStep.img = true;
          currentStep.imgUrl = inlineMediaUrl;
        }
      }

      rawSteps.push(currentStep);
    } else if (mediaMatch && currentStep) {
      const mediaUrl = mediaMatch[1] || mediaMatch[2] || mediaMatch[3];
      if (mediaUrl) {
        const isVid = isVideoUrl(mediaUrl);
        if (isVid) {
          currentStep.video = true;
          currentStep.videoUrl = mediaUrl;
        } else {
          currentStep.img = true;
          currentStep.imgUrl = mediaUrl;
        }
      }
    } else if (currentStep) {
      currentStep.t += ' ' + line.replace(/<\/li>$/i, '');
    } else {
      currentStep = { t: line };
      rawSteps.push(currentStep);
    }
  }

  return rawSteps.map(s => ({
    ...s,
    t: s.t.replace(/<\/?(ol|ul|li)[^>]*>/gi, '').trim()
  })).filter(s => !!s.t);
}

function parseFaqsBlock(block: string): ParsedAiFaq[] {
  if (!block || !block.trim()) return [];

  const faqs: ParsedAiFaq[] = [];
  const faqChunks = block.split(/(?:\[FAQ\]|###?\s*D:|###?\s*Q:|<h[34][^>]*>)/i).filter(c => !!c.trim());

  if (faqChunks.length > 0) {
    for (const chunk of faqChunks) {
      const qMatch = chunk.match(/(?:(?:Q:|D:|<h[34][^>]*>|\*\*D:\*\*|\*\*Q:\*\*)\s*)(.*?)(?=(?:\r?\n\s*(?:A:|R:|<p>|\*\*R:\*\*|\*\*A:\*\*)|<\/h[34]>))/i);
      const aMatch = chunk.match(/(?:(?:A:|R:|\*\*R:\*\*|\*\*A:\*\*)\s*)([\s\S]*)/i);
      const mediaMatch = chunk.match(/(?:\[(?:MEDIA|IMAGE|VIDEO):\s*(.*?)\]|<img[^>]+src=["'](.*?)["']|<video[^>]+src=["'](.*?)["'])/i);

      let q = '';
      let a = '';

      if (qMatch) {
        q = qMatch[1].replace(/<\/?[^>]+(>|$)/g, '').trim();
      }
      if (aMatch) {
        a = aMatch[1].trim();
      }

      if (!q && !a) {
        const lines = chunk.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          q = lines[0].replace(/<\/?[^>]+(>|$)/g, '').trim();
          a = lines.slice(1).join(' ').trim();
        } else if (lines.length === 1) {
          q = lines[0].replace(/<\/?[^>]+(>|$)/g, '').trim();
          a = '';
        }
      }

      let mediaUrl = '';
      if (mediaMatch) {
        mediaUrl = mediaMatch[1] || mediaMatch[2] || mediaMatch[3] || '';
        a = a.replace(mediaMatch[0], '').trim();
      }

      a = a.replace(/<\/?(p|h[1-6]|div)[^>]*>/gi, '').trim();

      if (q) {
        const step: ParsedAiStep = { t: a };
        if (mediaUrl) {
          const isVid = isVideoUrl(mediaUrl);
          if (isVid) {
            step.video = true;
            step.videoUrl = mediaUrl;
          } else {
            step.img = true;
            step.imgUrl = mediaUrl;
          }
        }
        faqs.push({ q, steps: [step] });
      }
    }
  }

  return faqs;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
}
