const fs = require('fs');

let html = fs.readFileSync('src/app/app.component.html', 'utf8');

// Fix homeSearchResults in html
html = html.replace(/\{\{\s*res\.faq\.q\s*\}\}/g, '{{ res.title }}');
html = html.replace(/\{\{\s*res\.category\.name\s*\}\}\s*&#8250;\s*\{\{\s*res\.guide\.title\s*\}\}/g, '{{ res.category }} &#8250; {{ res.desc }}');

// Fix selectedRealFaq
html = html.replace(/selectedRealFaq/g, 'selectedFaq');

fs.writeFileSync('src/app/app.component.html', html, 'utf8');

let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

// Inject goToCategoryFromFaq if it doesn't exist
if (!ts.includes('goToCategoryFromFaq()')) {
  ts = ts.replace(/logoutAdmin\(\) \{[\s\S]*?\}\n/, match => match + '\n  goToCategoryFromFaq() {}\n');
}

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');

console.log('Fixed compile errors');
