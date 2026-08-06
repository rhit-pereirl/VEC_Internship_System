const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const dataDir = path.join(workspace, 'website', 'data');
const roomsPath = path.join(dataDir, 'rooms.json');

const housePageMap = {
  cruzeiro: 'cruzeiro.html',
  pescador: 'pescador.html',
  areia: 'areia.html',
  estrela: 'estrela.html',
  amendoeira: 'amendoeira.html',
  mirante: 'mirante.html',
  corais: 'corais.html'
};

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return []; } }
let rooms = readJson(roomsPath);

for (const [houseId, fileName] of Object.entries(housePageMap)) {
  const filePath = path.join(workspace, 'website', fileName);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');

  const roomRegex = /<div[^>]*class="card room-card[^"]*">[\s\S]*?<h5[^>]*class="card-title"[^>]*>([^<]+)<\/h5>[\s\S]*?<p[^>]*class="card-text mb-1"[^>]*>\s*<strong>Guests:<\/strong>\s*([^<]+)<\/p>/gi;
  let m;
  while ((m = roomRegex.exec(html)) !== null) {
    const title = m[1].trim();
    const guestText = m[2].trim(); // e.g. '2 / 2' or '0 / 2'
    const match = guestText.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const cap = Number(match[2]);
      const room = rooms.find(r => r.houseId === houseId && r.name.toLowerCase() === title.toLowerCase());
      if (room) {
        room.capacity = cap;
      } else {
        // add a room entry if missing
        const idBase = `${houseId}-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
        rooms.push({ id: idBase, houseId, name: title, image: '', guestIds: [], capacity: cap });
      }
    }
  }
}

fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2), 'utf8');
console.log('Updated room capacities from HTML.');
