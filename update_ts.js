const fs = require('fs');
let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

// 1. Initialize variables
ts = ts.replace(
  /newsItems = \[[\s\S]*?\];/,
  `allNews: any[] = [];
  latestGeneralNews: any = null;
  showGeneralNewsPopup: boolean = false;
  
  newsItems: any[] = [];`
);

// 2. Add to ngOnInit
if (!ts.includes('this.loadNews();')) {
  ts = ts.replace(
    /ngOnInit\(\) \{/,
    `ngOnInit() {
    this.loadNews();`
  );
}

// 3. Add methods
if (!ts.includes('loadNews() {')) {
  ts = ts.replace(
    /loadServices\(\) \{/,
    `loadNews() {
    this.http.get<any[]>('/api/news.ashx').subscribe({
      next: (data) => {
        this.allNews = data || [];
        const generalNews = this.allNews.filter(n => n.category === 'Generale');
        if (generalNews.length > 0) {
          this.latestGeneralNews = generalNews[0];
          this.showGeneralNewsPopup = true;
        }
        this.updateProgramNews();
      },
      error: (err) => console.error('Errore caricamento news:', err)
    });
  }

  updateProgramNews() {
    const activeProgram = this.programs[this.activeProgramIndex].name;
    this.newsItems = this.allNews.filter(n => n.category === activeProgram);
    if (this.newsItems.length === 0) {
      this.newsItems = [{ title: 'Nessuna news', date: '', description: 'Non ci sono comunicazioni per questo programma.' }];
    }
    this.activeNewsItemIndex = 0;
  }

  loadServices() {`
  );
}

// 4. Update changeProgram
if (!ts.includes('this.updateProgramNews();')) {
  ts = ts.replace(
    /this\.newsOverlayColor = this\.programs\[this\.activeProgramIndex\]\.hexColor;/g,
    `this.newsOverlayColor = this.programs[this.activeProgramIndex].hexColor;
      this.updateProgramNews();`
  );
}

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');
console.log('AppComponent updated');
