const fs = require('fs');
let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

// 1. Fix Imports
if (!ts.includes('GuideComponent')) {
  ts = ts.replace(
    /import { FormsModule } from '@angular\/forms';/,
    `import { FormsModule } from '@angular/forms';\nimport { GuideComponent } from './components/guide/guide.component';\nimport { GuideAdminComponent } from './components/guide/guide-admin.component';\nimport { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';\nimport { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';`
  );
}

if (!ts.includes('AdminLoginComponent')) {
  ts = ts.replace(
    /imports: \[CommonModule, FormsModule\]/,
    `imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent]`
  );
}

// 2. Fix EOF
if (!ts.includes('goToCategoryFromFaq() {')) {
  const lastBraceIndex = ts.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    ts = ts.substring(0, lastBraceIndex) + `
  goToCategoryFromFaq() {
    this.activeFaqCategory = 'General';
  }
}
`;
  }
}

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');
