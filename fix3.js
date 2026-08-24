const fs = require('fs');
let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

// Ensure correct imports
if (!ts.includes('AdminLoginComponent')) {
  ts = ts.replace(
    /imports: \[CommonModule, FormsModule\]/,
    `imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent]`
  );
}

// Add activeFaqCategory
if (!ts.includes('activeFaqCategory: string =')) {
  ts = ts.replace(
    /export class AppComponent implements OnInit \{/,
    `export class AppComponent implements OnInit {\n  activeFaqCategory: string = 'General';`
  );
}

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');
