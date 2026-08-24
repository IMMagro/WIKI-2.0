const fs = require('fs');

// Fix TS
let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

// Inject GuideService
ts = ts.replace(
  /constructor\(private eRef: ElementRef, private cdr: ChangeDetectorRef, private http: HttpClient\) \{\}/,
  'constructor(private eRef: ElementRef, private cdr: ChangeDetectorRef, private http: HttpClient, public guideService: GuideService) {}'
);

// Add missing method
ts = ts.replace(
  /selectMenuItem\(selectedItem: any\) \{/,
  'goToCategoryFromFaq() {\n    // TODO: Implement navigation\n  }\n\n  selectMenuItem(selectedItem: any) {'
);

// Update homeSearchResults getter
ts = ts.replace(
  /get homeSearchResults\(\) \{[\s\S]*?\}\n/,
  `get homeSearchResults() {
    if (!this.homeSearchQuery || this.homeSearchQuery.trim() === '') return [];
    return this.guideService.search(this.homeSearchQuery);
  }\n`
);

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');

// Fix HTML
let html = fs.readFileSync('src/app/app.component.html', 'utf8');
html = html.replace(/selectedRealFaq/g, 'selectedFaq');
fs.writeFileSync('src/app/app.component.html', html, 'utf8');

console.log('Fixes applied');
