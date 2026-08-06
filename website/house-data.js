(function () {
  const housePageMap = {
    cruzeiro: 'cruzeiro.html',
    pescador: 'pescador.html',
    areia: 'areia.html',
    estrela: 'estrela.html',
    amendoeira: 'amendoeira.html',
    mirante: 'mirante.html',
    corais: 'corais.html'
  };

  function getHouseIdFromPath() {
    const pathName = window.location.pathname.split('/').pop() || '';
    return Object.keys(housePageMap).find((id) => housePageMap[id] === pathName) || '';
  }

  async function loadHouseData() {
    const houseId = getHouseIdFromPath();
    if (!houseId) {
      return;
    }

    try {
      const houseResponse = await fetch('/api/houses/' + houseId);
      const house = await houseResponse.json();
      const roomsResponse = await fetch('/api/rooms/' + houseId);
      let rooms = await roomsResponse.json();
      console.debug('house-data: fetched rooms for', houseId, rooms && rooms.length);
      // fallback: if rooms endpoint returned empty, try fetching all rooms and filter
      if ((!rooms || rooms.length === 0)) {
        try {
          const allRoomsResp = await fetch('/api/rooms');
          const allRooms = await allRoomsResp.json();
          rooms = (allRooms || []).filter((r) => r.houseId === houseId);
        } catch (err) {
          rooms = rooms || [];
        }
      }
      const guestsResponse = await fetch('/api/guests/' + houseId);
      const guests = await guestsResponse.json();
      console.debug('house-data: fetched guests for', houseId, guests && guests.length);

      document.querySelectorAll('[data-house-name]').forEach((element) => {
        element.textContent = house.name;
      });

      const planElement = document.querySelector('[data-house-plan]');
      if (planElement) {
        planElement.textContent = `Plano: ${house.plan}`;
      }

      const roomsContainer = document.querySelector('[data-house-rooms]');
      // Determine effectiveRooms: start with server rooms (if any), then merge DOM-inferred rooms
      let effectiveRooms = (rooms && rooms.length) ? rooms.slice() : [];
      if (roomsContainer) {
        // Merge DOM rooms: prefer server room entries but supplement missing rooms/capacities from DOM
        try {
          const domRoomEls = Array.from(roomsContainer.querySelectorAll('.room-card'));
          const domRooms = domRoomEls.map((el, idx) => {
            const title = el.querySelector('.card-title')?.textContent?.trim() || `room-${idx}`;
            const guestText = el.querySelector('.card-text')?.textContent || '';
            const match = guestText.match(/(\d+)\s*\/\s*(\d+)/);
            const count = match ? Number(match[1]) : 0;
            const cap = match ? Number(match[2]) : 2;
            return { id: `dom-room-${idx}`, houseId, name: title, guestIds: new Array(count), capacity: cap };
          });

          if (!effectiveRooms) effectiveRooms = [];
          // For each dom room, try to merge into effectiveRooms by name; otherwise add it
          domRooms.forEach((d) => {
            const found = effectiveRooms.find((r) => (r.name || '').trim().toLowerCase() === (d.name || '').trim().toLowerCase());
            if (found) {
              // fill missing capacity or guestIds from DOM if server entry lacks them
              if (!('capacity' in found) && d.capacity) found.capacity = d.capacity;
              if ((!found.guestIds || found.guestIds.length === 0) && d.guestIds && d.guestIds.length > 0) found.guestIds = d.guestIds;
            } else {
              effectiveRooms.push(d);
            }
          });
        } catch (err) {
          // ignore DOM parsing problems
        }

        if (effectiveRooms && effectiveRooms.length) {
          roomsContainer.innerHTML = effectiveRooms.map((room) => {
            const roomGuests = guests.filter((guest) => guest.roomId === room.id).map((guest) => guest.name).join(', ');
            return `
              <div class="col-12 col-md-6 col-lg-4 d-flex">
                <div class="card room-card shadow-sm w-100">
                  <img src="${room.image || './Images/placeholder.jpg'}" class="card-img-top" alt="${room.name}">
                  <div class="card-body room-card-body">
                    <h5 class="card-title">${room.name}</h5>
                      <p class="card-text mb-1"><strong>Guests:</strong> ${ (room.guestIds||[]).length } / ${room.capacity || 2}</p>
                    <p class="card-text mb-0">${roomGuests || 'No guests yet'}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      const guestsContainer = document.querySelector('[data-house-guests]');
      if (guestsContainer) {
        const guestCardsHtml = guests.map((guest) => `
          <div class="col-12 col-sm-6 col-lg-4 d-flex">
            <div class="card guest-card shadow-sm w-100" data-guest-id="${guest.id}">
              <div class="card-body guest-card-body d-flex flex-column">
                <h5 class="guest-card-title">${guest.name}</h5>
                <p class="text-muted mb-4">Quarto: ${effectiveRooms.find((room) => room.id === guest.roomId)?.name || '—'}</p>
                <button class="btn btn-outline-primary align-self-start guest-action">Ver pedidos</button>
                <button class="btn btn-outline-danger align-self-start guest-delete mt-2">Excluir</button>
              </div>
            </div>
          </div>
        `).join('');

        // prefer rooms that have available slots (guestIds < 2)
        const availableRooms = (effectiveRooms || []).filter((r) => ((r.guestIds || []).length < (r.capacity || 2)));
        let roomOptions = availableRooms.map((r) => `<option value="${(r.name||'').replace(/"/g,'\\"')}">${(r.name||'')}</option>`).join('');
        // If no available rooms, try to infer room names from existing DOM room cards
        if ((!roomOptions || roomOptions === '') && roomsContainer) {
          try {
            const domRoomEls = roomsContainer.querySelectorAll('.room-card .card-title');
            const domNames = Array.from(domRoomEls).map((el) => el.textContent.trim()).filter(Boolean);
            if (domNames.length > 0) {
              roomOptions = domNames.map((n) => `<option value="${n.replace(/"/g,'\\"')}">${n}</option>`).join('');
            }
          } catch (err) {
            // ignore
          }
        }
        // If still empty, show a disabled option indicating no available rooms
        if (!roomOptions || roomOptions === '') {
          roomOptions = '<option disabled>Sem quartos disponíveis</option>';
        }

        const addGuestCardHtml = `
          <div class="col-12 col-md-6 col-lg-4 d-flex">
            <div class="card guest-card guest-add-card shadow-sm w-100">
              <div class="card-body guest-card-body d-flex flex-column">
                <h5 class="guest-card-title">Adicionar hóspede</h5>
                <label class="form-label small mb-1" for="guestAddName">Nome</label>
                <input id="guestAddName" class="form-control form-control-sm mb-2 guest-add-name" placeholder="Nome do hóspede" />
                <label class="form-label small mb-1" for="guestAddRoom">Quarto</label>
                <select id="guestAddRoomSelect" class="form-select form-select-sm mb-2 guest-add-room">
                  ${roomOptions}
                  <option value="__new__">-- Criar novo quarto --</option>
                </select>
                <input id="guestAddRoomCustom" class="form-control form-control-sm mb-3 guest-add-room-custom" placeholder="Suite Master" style="display:none" />
                <button class="btn btn-primary guest-add-button mt-auto">Adicionar hóspede</button>
              </div>
            </div>
          </div>
        `;

        guestsContainer.innerHTML = guestCardsHtml + addGuestCardHtml;

        // Ensure static or pre-rendered guest cards also get a delete button and a resolved guest id when possible
        document.querySelectorAll('.guest-card').forEach((card) => {
          if (card.classList.contains('guest-add-card')) return;
          const body = card.querySelector('.card-body') || card;
          if (!card.querySelector('.guest-delete')) {
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-outline-danger align-self-start guest-delete mt-2';
            delBtn.textContent = 'Excluir';
            body.appendChild(delBtn);
          }

          // try to set data-guest-id if missing by matching name + room
          if (!card.dataset.guestId) {
            const title = card.querySelector('.guest-card-title')?.textContent?.trim();
            const roomName = (card.querySelector('.text-muted')?.textContent || '').replace(/^(Quarto:\s*)?/i, '').trim();
            if (title) {
              const match = guests.find((g) => {
                  const gRoomName = (effectiveRooms || []).find((r) => r.id === g.roomId)?.name || '';
                  return g.name === title && gRoomName === roomName;
                });
              if (match) {
                card.dataset.guestId = match.id;
              }
            }
          }
        });
        console.debug('house-data: post-rendered guest cards, total:', document.querySelectorAll('.guest-card').length);
      }
    } catch (error) {
      console.error('Unable to load house data', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHouseData);
  } else {
    loadHouseData();
  }
})();
