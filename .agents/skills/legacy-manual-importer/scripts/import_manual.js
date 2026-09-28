const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
    console.error('Usage: node import_manual.js <category_id> <path_to_guide_json>');
    process.exit(1);
}

const catId = process.argv[2];
const guideJsonPath = process.argv[3];

// We expect to be in project root usually, but let's be safe and resolve relative to process.cwd()
// Alternatively, look for public/Data/guides.json relative to the script path
const possibleDbPaths = [
    path.resolve(process.cwd(), 'public/Data/guides.json'),
    path.join(__dirname, '../../../../../public/Data/guides.json'),
    path.join(__dirname, '../../../../public/Data/guides.json')
];

let dbPath = possibleDbPaths.find(p => fs.existsSync(p));
if (!dbPath) {
    console.error('Non riesco a trovare public/Data/guides.json!');
    process.exit(1);
}

try {
    const guideData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), guideJsonPath), 'utf8'));
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    let category = db.categories.find(c => c.id === catId || c.name.toLowerCase() === catId.toLowerCase() || c.id.toLowerCase().includes(catId.toLowerCase()));
    
    if (!category) {
        console.warn(`Categoria non trovata: ${catId}. Creazione automatica...`);
        category = {
            id: catId.replace(/\s+/g, '-').toLowerCase(),
            name: catId,
            desc: '',
            manuals: []
        };
        db.categories.push(category);
    }

    if (!category.manuals) category.manuals = [];
    
    // Add unique ID and status
    if (!guideData.id) guideData.id = 'guide-' + Date.now();
    guideData.status = 'pub';
    guideData.updated = new Date().toLocaleDateString('it-IT');

    category.manuals.push(guideData);

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log(`Success! Guide "${guideData.title}" added to category "${category.name}".`);
} catch(e) {
    console.error('Error importing manual:', e);
    process.exit(1);
}
