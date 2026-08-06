const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const dataDir = path.join(workspace, 'website', 'data');
const roomsPath = path.join(dataDir, 'rooms.json');
const guestsPath = path.join(dataDir, 'guests.json');
const housesPath = path.join(dataDir, 'houses.json');

const housePageMap = {
  cruzeiro: 'cruzeiro.html',
  pescador: 'pescador.html',
  areia: 'areia.html',
  estrela: 'estrela.html',
  amendoeira: 'amendoeira.html',
  mirante: 'mirante.html',
  corais: 'corais.html'
};

function slugifyName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return []; }
}

let rooms = readJson(roomsPath);
let guests = readJson(guestsPath);
let houses = readJson(housesPath);

const existingGuestKeys = new Set(guests.map(g => `${g.name}||${g.houseId}||${g.roomId}`));
const guestIdSet = new Set(guests.map(g => g.id));

function ensureUniqueId(base) {
  let id = base;
  let i = 1;
  while (guestIdSet.has(id)) {
    id = `${base}-${i}`;
    i++;
  }
  guestIdSet.add(id);
  return id;
}

for (const [houseId, fileName] of Object.entries(housePageMap)) {
  const filePath = path.join(workspace, 'website', fileName);
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, 'utf8');

  // find guest cards section: repeat h5 guest-card-title and following p.text-muted
  const guestRegex = /<h5[^>]*class="guest-card-title"[^>]*>([^<]+)<\/h5>\s*<p[^>]*class="text-muted[^"]*"[^>]*>([^<]+)<\/p>/gi;
  let m;
  while ((m = guestRegex.exec(html)) !== null) {
    const name = m[1].trim();
    let roomText = m[2].trim();
    // roomText might be 'Quarto: Master Suite' or 'Room: Master Suite'
    const rm = roomText.match(/(?:Quarto|Room)[:]?\s*(.*)/i);
    let roomName = rm ? rm[1].trim() : roomText;

    if (!name) continue;

    // find room in rooms list
    const room = rooms.find(r => r.houseId === houseId && r.name.toLowerCase() === roomName.toLowerCase());
    const roomId = room ? room.id : null;

    const key = `${name}||${houseId}||${roomId || roomName}`;
    if (existingGuestKeys.has(key)) continue; // already present (exact match)

    const baseId = slugifyName(name);
    const gid = ensureUniqueId(baseId);

    const newGuest = {
      id: gid,
      name: name,
      houseId: houseId,
      roomId: roomId || '',
      orders: []
    };
    guests.push(newGuest);
    existingGuestKeys.add(key);

    if (roomId) {
      const r = rooms.find(x => x.id === roomId);
      if (r) {
        r.guestIds = r.guestIds || [];
        if (!r.guestIds.includes(gid)) r.guestIds.push(gid);
      }
    } else {
      // try to find by name ignoring accents/case
      const r2 = rooms.find(x => x.houseId === houseId && x.name.toLowerCase().includes(roomName.toLowerCase()));
      if (r2) {
        r2.guestIds = r2.guestIds || [];
        if (!r2.guestIds.includes(gid)) r2.guestIds.push(gid);
        // update guest roomId
        newGuest.roomId = r2.id;
      }
    }
  }
}

// Update houses occupied flag
for (const h of houses) {
  const hasGuests = guests.some(g => g.houseId === h.id);
  h.occupied = !!hasGuests;
}

// Write files back
fs.writeFileSync(guestsPath, JSON.stringify(guests, null, 2), 'utf8');
fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2), 'utf8');
fs.writeFileSync(housesPath, JSON.stringify(houses, null, 2), 'utf8');

console.log('Synced guests and rooms from HTML. Added guests:', guests.length, 'rooms:', rooms.length);
