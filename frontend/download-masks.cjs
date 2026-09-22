const fs = require('fs');
const path = require('path');
const https = require('https');

const MASKS = {
  bateke: 'File:Teke_mask.jpg',
  fang: 'File:Fang_Ngil_mask.jpg',
  kidumu: 'File:Masque_Tsaayi-Teke.jpg',
  kota: 'File:Figure_of_a_Reliquary_Guardian_(bwete).jpg',
  mahongwe: 'File:Reliquary_Guardian_Figure_(Bwete)_LACMA_M.84.31.144.jpg',
  mbete: 'File:Statue_Mbété.jpg',
  punu: 'File:Punu_mask_2.jpg',
  sira: 'File:Masque_Punu-Shira.jpg',
  tsogo: 'File:Mitsogo_mask.jpg',
  vuvi: 'File:Mask_Vuvi_Gabon_19th_c_wood.jpg'
};

const dir = path.join(__dirname, 'src', 'assets', 'masks');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

async function fetchImageInfo(fileName) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;
    https.get(url, { headers: { 'User-Agent': 'AkibarApp/1.0 (contact@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const [name, file] of Object.entries(MASKS)) {
    try {
      const info = await fetchImageInfo(file);
      if (info.error) {
         console.log(`❌ Erreur API pour ${name}: ${info.error.info}`);
         continue;
      }
      const pages = info.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId === '-1' || !pages[pageId].imageinfo) {
        console.log(`❌ Impossible de trouver l'image pour ${name} (${file})`);
        continue;
      }
      const url = pages[pageId].imageinfo[0].url;
      const dest = path.join(dir, `${name}.jpg`);
      await downloadFile(url, dest);
      console.log(`✅ Image téléchargée pour ${name}`);
    } catch (e) {
      console.log(`❌ Erreur pour ${name}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

main();
