const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'public/Data/guides.json');
const preMigrationPath = path.resolve(process.cwd(), 'public/Data/guides_pre_migration.json');
const scratchPath = path.join(__dirname, '../../../../../../../brain/19083443-1a15-44a4-98d5-4990814e78eb/scratch/migration/servizi_guides.json');

try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const preDb = JSON.parse(fs.readFileSync(preMigrationPath, 'utf8'));
    
    // Find the old servizi category in pre-migration backup
    let serviziCat = preDb.categories.find(c => c.id === 'servizi');
    if (!serviziCat) {
        serviziCat = {
            id: 'servizi',
            name: 'Servizi & Moduli Add-On',
            icon: 'receipt',
            accent: 'blue',
            desc: 'Panoramica di tutti i moduli aggiuntivi integrabili...',
            manuals: []
        };
    }
    
    // Read the newly generated guides
    const newGuides = JSON.parse(fs.readFileSync(scratchPath, 'utf8').replace(/^\uFEFF/, ''));
    
    // Append the new guides to the existing ones
    newGuides.forEach(g => {
        g.status = 'pub';
        if (!g.updated) g.updated = new Date().toLocaleDateString('it-IT');
        serviziCat.manuals.push(g);
    });
    
    // Add the category back to the live database if it's not there
    const existingCatIndex = db.categories.findIndex(c => c.id === 'servizi');
    if (existingCatIndex >= 0) {
        db.categories[existingCatIndex] = serviziCat;
    } else {
        db.categories.push(serviziCat);
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Success! Servizi category restored with ${serviziCat.manuals.length} total manuals.`);
} catch(e) {
    console.error('Error merging servizi:', e);
}
