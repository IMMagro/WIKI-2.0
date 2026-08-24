const fs = require('fs');
let content = fs.readFileSync('src/app/app.component.ts', 'utf8');

// Remove properties
const propsToRemove = [
  /loginEmail = '';\n/g,
  /loginPassword = '';\n/g,
  /loginLoading = false;\n/g,
  /loginError = '';\n/g,
  /backgroundImages = \[\n\s+'\/assets\/images\/quaderno-bg-left-logo\.jpg'\n\s+\];\n/g,
  /currentBgIndex = 0;\n/g,
  /private bgInterval: any;\n/g,
  /adminDashboardStats: any = null;\n/g,
  /adminNews: any\[\] = \[\];\n/g,
  /adminNotifications: any\[\] = \[\];\n/g,
  /adminServerStats: any = null;\n/g,
  /adminServerServices: any\[\] = \[\];\n/g,
  /adminServerLogs: any\[\] = \[\];\n/g,
  /activeAdminTab: 'dashboard' \| 'manuals' \| 'news' \| 'server' \| 'users' \| 'settings' = 'dashboard';\n/g
];

propsToRemove.forEach(regex => {
  content = content.replace(regex, '');
});

// Remove methods
const methodsToRemove = [
  /startBackgroundRotation\(\) \{[\s\S]*?\}\n/g,
  /stopBackgroundRotation\(\) \{[\s\S]*?\}\n/g,
  /loadAdminData\(\) \{[\s\S]*?\}\n\n/g,
  /handleAuthError\(\) \{[\s\S]*?\}\n/g,
  /loadNotifications\(\) \{[\s\S]*?\}\n/g,
  /loginAdmin\(\) \{[\s\S]*?\}\n\n/g,
  /logoutAdmin\(\) \{[\s\S]*?\}\n/g,
];

methodsToRemove.forEach(regex => {
  content = content.replace(regex, '');
});

// Fix any leftover `this.loadAdminData();`
content = content.replace(/this\.loadAdminData\(\);/g, '');
// Fix any leftover `this.startBackgroundRotation();`
content = content.replace(/this\.startBackgroundRotation\(\);/g, '');
// Fix any leftover `this.stopBackgroundRotation();`
content = content.replace(/this\.stopBackgroundRotation\(\);/g, '');
// Fix any leftover mock data
content = content.replace(/this\.adminDashboardStats = \{[\s\S]*?\};\n/g, '');
content = content.replace(/this\.adminServerStats = \{[\s\S]*?\};\n/g, '');
content = content.replace(/this\.adminServerServices = \[[\s\S]*?\];\n/g, '');
content = content.replace(/this\.adminServerLogs = \[[\s\S]*?\];\n/g, '');
content = content.replace(/this\.adminNews = \[[\s\S]*?\];\n/g, '');
content = content.replace(/this\.adminNotifications = \[[\s\S]*?\];\n/g, '');

fs.writeFileSync('src/app/app.component.ts', content, 'utf8');
console.log('TS Cleanup complete');
