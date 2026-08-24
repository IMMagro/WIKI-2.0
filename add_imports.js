const fs = require('fs');

let ts = fs.readFileSync('src/app/app.component.ts', 'utf8');

if (!ts.includes('AdminLoginComponent')) {
  ts = ts.replace(
    /import \{ Component[\s\S]*?@Component/m,
    `import { Component, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GuideComponent } from './components/guide/guide.component';
import { GuideAdminComponent } from './components/guide/guide-admin.component';
import { GuideService } from './services/guide.service';
import { FaqHit, Faq } from './components/guide/guide.models';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './components/admin/admin-layout/admin-layout.component';

@Component`
  );
  
  ts = ts.replace(
    /imports: \[CommonModule, FormsModule, GuideComponent, GuideAdminComponent\]/,
    'imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent]'
  );
}

// In some versions, maybe GuideComponent wasn't imported properly?
// The error also says 'app-guide' is not a known element, which means GuideComponent wasn't in imports.
if (ts.includes('imports: [CommonModule, FormsModule]')) {
  ts = ts.replace(
    /imports: \[CommonModule, FormsModule\]/,
    'imports: [CommonModule, FormsModule, GuideComponent, GuideAdminComponent, AdminLoginComponent, AdminLayoutComponent]'
  );
}

// And check if goToCategoryFromFaq exists, if not add it
if (!ts.includes('goToCategoryFromFaq()')) {
  ts = ts.replace(/logoutAdmin\(\) \{[\s\S]*?\}\n/, match => match + '\n  goToCategoryFromFaq() {}\n');
}

fs.writeFileSync('src/app/app.component.ts', ts, 'utf8');
console.log('Added imports');
