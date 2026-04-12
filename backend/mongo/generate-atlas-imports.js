/**
 * Generates MongoDB Compass–friendly JSON from Resources/Raw/pois.json
 * Run from repo root: node backend/mongo/generate-atlas-imports.js
 * Or: cd backend/mongo && node generate-atlas-imports.js
 *
 * Password for all seeded users: password123
 * bcrypt hash below is $2b$12$... for "password123" (12 rounds, matches User model pre-save).
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const REPO_ROOT = path.join(__dirname, '..', '..');
const POIS_RAW = path.join(REPO_ROOT, 'Resources', 'Raw', 'pois.json');
const OUT_DIR = __dirname;

// Regenerate hash so it always matches bcryptjs in this project
const PASSWORD = 'password123';
const BCRYPT_ROUNDS = 12;

async function main() {
    const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);

    const raw = JSON.parse(fs.readFileSync(POIS_RAW, 'utf8'));

    const users = [
        { email: 'user@vngo.com', password: passwordHash, role: 'USER', isPremium: false },
        { email: 'admin@vngo.com', password: passwordHash, role: 'ADMIN', isPremium: false },
        { email: 'owner@vngo.com', password: passwordHash, role: 'OWNER', isPremium: false }
    ];

    function toPoiDoc(p) {
        const vi = [p.Name, p.Summary, p.NarrationShort, p.NarrationLong].filter(Boolean).join('\n\n');
        const en = [p.Name, p.Summary].filter(Boolean).join('. ');
        return {
            code: p.Code,
            location: {
                type: 'Point',
                coordinates: [Number(p.Longitude), Number(p.Latitude)]
            },
            content: { vi, en },
            isPremiumOnly: false,
            status: 'APPROVED',
            submittedBy: null,
            rejectionReason: null
        };
    }

    const pois = raw.map(toPoiDoc);

    fs.writeFileSync(path.join(OUT_DIR, 'import_users.json'), JSON.stringify(users, null, 2), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'import_pois.json'), JSON.stringify(pois, null, 2), 'utf8');

    console.log(`Wrote ${users.length} users and ${pois.length} pois to ${OUT_DIR}`);
    console.log(`Login: admin@vngo.com / ${PASSWORD}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
