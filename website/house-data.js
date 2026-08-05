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
      const rooms = await roomsResponse.json();
      const guestsResponse = await fetch('/api/guests/' + houseId);
      const guests = await guestsResponse.json();

      document.querySelectorAll('[data-house-name]').forEach((element) => {
        element.textContent = house.name;
      });

      const planElement = document.querySelector('[data-house-plan]');
      if (planElement) {
        planElement.textContent = `Plano: ${house.plan}`;
      }

      const roomsContainer = document.querySelector('[data-house-rooms]');
      if (roomsContainer) {
        roomsContainer.innerHTML = rooms.map((room) => {
          const roomGuests = guests.filter((guest) => guest.roomId === room.id).map((guest) => guest.name).join(', ');
          return `
            <div class="col-12 col-md-6 col-lg-4 d-flex">
              <div class="card room-card shadow-sm w-100">
                <img src="${room.image || './Images/placeholder.jpg'}" class="card-img-top" alt="${room.name}">
                <div class="card-body room-card-body">
                  <h5 class="card-title">${room.name}</h5>
                  <p class="card-text mb-1"><strong>Guests:</strong> ${room.guestIds.length} / 2</p>
                  <p class="card-text mb-0">${roomGuests || 'No guests yet'}</p>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      const guestsContainer = document.querySelector('[data-house-guests]');
      if (guestsContainer) {
        const guestCardsHtml = guests.map((guest) => `
          <div class="col-12 col-sm-6 col-lg-4 d-flex">
            <div class="card guest-card shadow-sm w-100" data-guest-id="${guest.id}">
              <div class="card-body guest-card-body d-flex flex-column">
                <h5 class="guest-card-title">${guest.name}</h5>
                <p class="text-muted mb-4">Quarto: ${rooms.find((room) => room.id === guest.roomId)?.name || '—'}</p>
                <button class="btn btn-outline-primary align-self-start guest-action">Ver pedidos</button>
                <button class="btn btn-outline-danger align-self-start guest-delete mt-2">Excluir</button>
              </div>
            </div>
          </div>
        `).join('');

        const roomOptions = (rooms || []).map((r) => `<option value="${(r.name||'').replace(/"/g,'\\"')}">${(r.name||'')}</option>`).join('');

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
