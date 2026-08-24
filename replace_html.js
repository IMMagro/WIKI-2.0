const fs = require('fs');
let content = fs.readFileSync('src/app/app.component.html', 'utf8');

const regex = /  <!-- ADMIN LOGIN OVERLAY -->[\s\S]*?<!-- Main Content Wrapper \(Static padding, non si muove più\) -->/;
const replacement = `  <!-- ADMIN LOGIN OVERLAY -->
  <app-admin-login *ngIf="isAdminRoute && !isAdminAuthenticated" (loginSuccess)="loadAdminData()"></app-admin-login>

  <!-- ADMIN DASHBOARD -->
  <app-admin-layout *ngIf="isAdminRoute && isAdminAuthenticated" (exitAdmin)="exitAdmin()"></app-admin-layout>

  <!-- Main Content Wrapper (Static padding, non si muove più) -->`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/app/app.component.html', content, 'utf8');
  console.log('Success');
} else {
  console.log('Regex did not match');
}
