const fs = require('fs');
let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

// Ensure correct imports
if (!ts.includes('AdminLoginComponent')) {
  ts = ts.replace(
    /imports:\s*\[CommonModule,\s*FormsModule\],/,
    `imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent],`
  );
  
  ts = ts.replace(
    /import \{ FormsModule \} from '@angular\/forms';/,
    `import { FormsModule } from '@angular/forms';\nimport { GuideComponent } from './components/guide/guide.component';\nimport { GuideAdminComponent } from './components/guide/guide-admin.component';\nimport { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';\nimport { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';`
  );
}

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');
