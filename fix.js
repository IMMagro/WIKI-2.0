const fs = require('fs');
let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

if (!ts.includes('goToCategoryFromFaq() {')) {
  // Remove trailing braces and append the method
  const lastBraceIndex = ts.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    ts = ts.substring(0, lastBraceIndex) + `
  goToCategoryFromFaq() {
    this.activeFaqCategory = 'General';
  }
}
`;
    fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');
  }
}
