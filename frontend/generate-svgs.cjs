const fs = require('fs');
const path = require('path');

const masks = [
  'bateke', 'fang', 'kidumu', 'kota', 'mahongwe',
  'mbete', 'punu', 'sira', 'tsogo', 'vuvi'
];

const dir = path.join(__dirname, 'src', 'assets', 'masks');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

masks.forEach(mask => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="100%" height="100%">
  <rect width="200" height="250" fill="#2a2d3e" rx="15"/>
  <text x="100" y="110" font-family="Arial, sans-serif" font-size="16" fill="#8892b0" text-anchor="middle">Visuel manquant</text>
  <text x="100" y="140" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#e2e8f0" text-anchor="middle">${mask.toUpperCase()}</text>
</svg>`;
  fs.writeFileSync(path.join(dir, `${mask}.svg`), svg);
});

console.log("SVGs placeholders générés.");
