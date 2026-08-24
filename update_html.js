const fs = require('fs');
let html = fs.readFileSync('src/app/app.component.html', 'utf8');

const popupHtml = `
  <!-- Popup News Generale -->
  <div *ngIf="showGeneralNewsPopup && latestGeneralNews" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E2022]/40 backdrop-blur-sm">
    <div class="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl w-[90%] max-w-md p-8 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#377DFF] to-[#F80086]"></div>
      
      <button (click)="showGeneralNewsPopup = false" class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-[#1E2022]/5 text-[#1E2022]/40 hover:bg-[#1E2022]/10 hover:text-[#1E2022] transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div class="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#377DFF]/10 to-[#F80086]/10 text-sm font-semibold text-[#1E2022] mb-6">
        <span class="w-2 h-2 rounded-full bg-[#377DFF] mr-2"></span>
        Comunicazione di Sistema
      </div>

      <h3 class="text-2xl font-bold text-[#1E2022] mb-4">{{latestGeneralNews.title}}</h3>
      <p class="text-[#77838F] text-base leading-relaxed mb-8">{{latestGeneralNews.excerpt || latestGeneralNews.description}}</p>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#377DFF] to-[#F80086] flex items-center justify-center text-white font-bold text-sm shadow-md">
            {{latestGeneralNews.authorInitial || 'AD'}}
          </div>
          <div>
            <p class="text-sm font-bold text-[#1E2022]">{{latestGeneralNews.author || 'Amministratore'}}</p>
            <p class="text-xs font-medium text-[#77838F]">{{latestGeneralNews.date}}</p>
          </div>
        </div>
        <button (click)="showGeneralNewsPopup = false" class="px-5 py-2.5 bg-[#1E2022] hover:bg-[#377DFF] text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#1E2022]/20 hover:shadow-[#377DFF]/30">
          Ho capito
        </button>
      </div>
    </div>
  </div>
`;

if (!html.includes('Popup News Generale')) {
  html = html.replace('<!-- Schermata 0: Home -->', '<!-- Schermata 0: Home -->' + popupHtml);
  fs.writeFileSync('src/app/app.component.html', html, 'utf8');
}
console.log('Popup added');
