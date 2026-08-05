const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'website', 'data');
const housesFile = path.join(dataDir, 'houses.json');
const roomsFile = path.join(dataDir, 'rooms.json');
const guestsFile = path.join(dataDir, 'guests.json');
const menusFile = path.join(dataDir, 'menus.json');
const menuItemsFile = path.join(dataDir, 'menu-items.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedData() {
  const houses = readJson(housesFile, [
    { id: 'cruzeiro', name: 'Casa Cruzeiro', plan: 'Executivo', occupied: true, image: './Images/cruzeiro_pic.jpg' },
    { id: 'pescador', name: 'Casa do Pescador', plan: 'Conforto', occupied: true, image: './Images/pescador_pic.jpeg' },
    { id: 'areia', name: 'Casa Areia Colorida', plan: 'Executivo', occupied: true, image: './Images/area_pic.jpg' },
    { id: 'estrela', name: 'Casa Estrela do Mar', plan: 'Conforto', occupied: true, image: './Images/estrela_pic.jpg' },
    { id: 'amendoeira', name: 'Casa Amendoeira', plan: 'Conforto', occupied: true, image: './Images/amendoeira_pic.jpeg' },
    { id: 'mirante', name: 'Casa Mirante da Gameleira', plan: 'Executivo', occupied: true, image: './Images/mirante_pic.jpg' },
    { id: 'corais', name: 'Casa dos Corais', plan: 'Conforto', occupied: true, image: './Images/corais_pic2.jpg' }
  ]);

  const rooms = readJson(roomsFile, [
    { id: 'cruzeiro-master', houseId: 'cruzeiro', name: 'Master Suite', image: './Images/cruzeiro_rooms/master_suite_pic.jpg', guestIds: ['lucas-silva', 'marina-costa'] },
    { id: 'cruzeiro-acerola', houseId: 'cruzeiro', name: 'Suite Acerola', image: './Images/cruzeiro_rooms/suite_acerola_pic.jpg', guestIds: ['ana-rocha'] },
    { id: 'cruzeiro-caju', houseId: 'cruzeiro', name: 'Suite Caju', image: './Images/cruzeiro_rooms/suite_caju_pic.jpg', guestIds: ['mateus-lima', 'sofia-alves'] }
  ]);

  const guests = readJson(guestsFile, [
    { id: 'lucas-silva', name: 'Lucas Silva', houseId: 'cruzeiro', roomId: 'cruzeiro-master', orders: [] },
    { id: 'marina-costa', name: 'Marina Costa', houseId: 'cruzeiro', roomId: 'cruzeiro-master', orders: [] },
    { id: 'ana-rocha', name: 'Ana Rocha', houseId: 'cruzeiro', roomId: 'cruzeiro-acerola', orders: [] },
    { id: 'mateus-lima', name: 'Mateus Lima', houseId: 'cruzeiro', roomId: 'cruzeiro-caju', orders: [] },
    { id: 'sofia-alves', name: 'Sofia Alves', houseId: 'cruzeiro', roomId: 'cruzeiro-caju', orders: [] }
  ]);

  const menus = readJson(menusFile, [
    { id: 'menu-1', name: 'Menu 1', description: 'Seasonal tasting menu', image: '' }
  ]);

  let menuItems = readJson(menuItemsFile, [
    { id: 'item-1', menuId: 'menu-1', name: 'Breakfast buffet', category: 'Food & beverage', price: 48 }
  ]);

  const migratedItems = menuItems.map((item) => {
    if (item.price === undefined && item.amount !== undefined) {
      return { ...item, price: Number(item.amount) };
    }
    return item;
  });

  if (JSON.stringify(migratedItems) !== JSON.stringify(menuItems)) {
    writeJson(menuItemsFile, migratedItems);
    menuItems = migratedItems;
  }

  return { houses, rooms, guests, menus, menuItems };
}

let state = seedData();

function syncHouseOccupancy(targetState = state) {
  targetState.houses.forEach((house) => {
    const houseGuests = targetState.guests.filter((guest) => guest.houseId === house.id);
    house.occupied = houseGuests.length > 0;
  });
}

function refreshStateFromDisk() {
  const freshState = seedData();
  state = freshState;
  syncHouseOccupancy(state);
  return state;
}

syncHouseOccupancy();

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function resolveFilePath(requestPath) {
  const publicDir = path.join(__dirname, 'website');
  const normalizedPath = requestPath === '/' ? '/houseMenu.html' : requestPath;
  const relativePath = normalizedPath.replace(/^\/+/, '');
  const candidatePath = path.join(publicDir, relativePath);

  if (!candidatePath.startsWith(publicDir)) {
    return null;
  }

  return candidatePath;
}

function serveStaticFile(res, filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  fs.createReadStream(filePath).pipe(res);
}

function handleApi(req, res, pathname) {
  refreshStateFromDisk();

  if (pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (pathname === '/api/houses') {
    sendJson(res, 200, state.houses);
    return true;
  }

  if (pathname.startsWith('/api/houses/')) {
    const houseId = pathname.split('/').pop();
    const house = state.houses.find((item) => item.id === houseId);
    if (!house) {
      sendJson(res, 404, { error: 'House not found' });
      return true;
    }

    sendJson(res, 200, house);
    return true;
  }

  if (pathname === '/api/rooms') {
    sendJson(res, 200, state.rooms);
    return true;
  }

  if (pathname.startsWith('/api/rooms/')) {
    const houseId = pathname.split('/').pop();
    sendJson(res, 200, state.rooms.filter((room) => room.houseId === houseId));
    return true;
  }

  if (pathname === '/api/guests') {
    sendJson(res, 200, state.guests);
    return true;
  }

  if (pathname.startsWith('/api/guests/')) {
    const houseId = pathname.split('/').pop();
    sendJson(res, 200, state.guests.filter((guest) => guest.houseId === houseId));
    return true;
  }

  if (pathname === '/api/guests' && req.method === 'POST') {
    return true;
  }

  if (pathname === '/api/guest-orders' && req.method === 'POST') {
    return true;
  }

  if (pathname === '/api/menus') {
    if (req.method === 'GET') {
      sendJson(res, 200, state.menus);
      return true;
    }

    if (req.method === 'POST') {
      readBody(req)
        .then((body) => {
          const { name, description, image } = body;
          if (!name) {
            sendJson(res, 400, { error: 'Menu name is required' });
            return;
          }

          const menu = {
            id: `menu-${Date.now()}`,
            name,
            description: description || '',
            image: image || ''
          };
          state.menus.push(menu);
          writeJson(menusFile, state.menus);
          sendJson(res, 201, menu);
        })
        .catch((error) => {
          sendJson(res, 400, { error: error.message });
        });
      return true;
    }
  }

  if (pathname.startsWith('/api/menus/')) {
    const parts = pathname.split('/').filter(Boolean);
    const menuId = parts[2];
    if (!menuId) {
      return false;
    }

    if (parts[3] === 'items') {
      if (req.method === 'GET') {
        sendJson(res, 200, state.menuItems.filter((item) => item.menuId === menuId));
        return true;
      }

      if (req.method === 'POST') {
        readBody(req)
          .then((body) => {
            const { name, category, amount, price, image } = body;
            if (!name || !category) {
              sendJson(res, 400, { error: 'Name and category are required' });
              return;
            }

            const rawPrice = String(price ?? amount ?? '').trim().replace(',', '.');
            const parsedPrice = Number(rawPrice);
            const itemPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

            const item = {
              id: `item-${Date.now()}`,
              menuId,
              name,
              category,
              price: itemPrice,
              image: image || ''
            };
            state.menuItems.push(item);
            writeJson(menuItemsFile, state.menuItems);
            sendJson(res, 201, item);
          })
          .catch((error) => {
            sendJson(res, 400, { error: error.message });
          });
        return true;
      }

      if (req.method === 'DELETE' && parts[4]) {
        const itemId = parts[4];
        const itemIndex = state.menuItems.findIndex((item) => item.id === itemId && item.menuId === menuId);
        if (itemIndex === -1) {
          sendJson(res, 404, { error: 'Menu item not found' });
          return true;
        }

        state.menuItems.splice(itemIndex, 1);
        writeJson(menuItemsFile, state.menuItems);
        sendJson(res, 200, { success: true });
        return true;
      }

      return true;
    }

    if (req.method === 'GET') {
      const menu = state.menus.find((item) => item.id === menuId);
      if (!menu) {
        sendJson(res, 404, { error: 'Menu not found' });
        return true;
      }

      sendJson(res, 200, menu);
      return true;
    }
  }

  return false;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    refreshStateFromDisk();
    if (req.method === 'POST' && pathname === '/api/guests') {
      readBody(req)
        .then((body) => {
          const { name, houseId, roomName } = body;
          if (!name || !houseId || !roomName) {
            sendJson(res, 400, { error: 'Name, houseId, and roomName are required' });
            return;
          }

          let room = state.rooms.find((item) => item.houseId === houseId && item.name.toLowerCase() === roomName.toLowerCase());
          if (!room) {
            room = {
              id: `${houseId}-${roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
              houseId,
              name: roomName,
              image: '',
              guestIds: []
            };
            state.rooms.push(room);
          }

          const guest = {
            id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
            name,
            houseId,
            roomId: room.id,
            orders: []
          };

          state.guests.push(guest);
          room.guestIds.push(guest.id);
          syncHouseOccupancy();
          writeJson(guestsFile, state.guests);
          writeJson(roomsFile, state.rooms);
          writeJson(housesFile, state.houses);
          sendJson(res, 201, guest);
        })
        .catch((error) => {
          sendJson(res, 400, { error: error.message });
        });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/guest-orders') {
      readBody(req)
        .then((body) => {
          const { guestId, items } = body;
          const guest = state.guests.find((item) => item.id === guestId);
          if (!guest) {
            sendJson(res, 404, { error: 'Guest not found' });
            return;
          }

          guest.orders = items || [];
          writeJson(guestsFile, state.guests);
          sendJson(res, 200, guest);
        })
        .catch((error) => {
          sendJson(res, 400, { error: error.message });
        });
      return;
    }

    if (handleApi(req, res, pathname)) {
      return;
    }
  }

  const filePath = resolveFilePath(pathname);
  if (filePath) {
    serveStaticFile(res, filePath);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
