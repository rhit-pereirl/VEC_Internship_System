(function () {
  const defaultBillItems = [
    { label: 'Breakfast buffet', category: 'Food & beverage', amount: 48.0 },
    { label: 'Fresh coconut drink', category: 'Food & beverage', amount: 16.0 },
    { label: 'Sunset yoga session', category: 'Experience', amount: 35.0 },
    { label: 'Surf lesson', category: 'Experience', amount: 60.0 },
    { label: 'Island tour', category: 'Experience', amount: 90.0 }
  ];

  const guestOrderStore = new Map();

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function getGuestRoom(guestCard) {
    const roomText = guestCard?.querySelector('.text-muted')?.textContent || '';
    const match = roomText.match(/(Quarto|Room):\s*(.*)/i);
    return match ? match[2].trim() : '';
  }

  function makeGuestKey(name, room) {
    return `${name.trim()}||${room.trim()}`;
  }

  function getHouseIdFromPath() {
    const currentPath = window.location.pathname.split('/').pop() || '';
    const houseMap = {
      cruzeiro: 'cruzeiro.html',
      pescador: 'pescador.html',
      areia: 'areia.html',
      estrela: 'estrela.html',
      amendoeira: 'amendoeira.html',
      mirante: 'mirante.html',
      corais: 'corais.html'
    };
    return Object.keys(houseMap).find((id) => houseMap[id] === currentPath) || '';
  }

  async function persistGuestOrders(guestData) {
    if (!guestData?.guestId) {
      return;
    }

    try {
      await fetch('/api/guest-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guestData.guestId, items: guestData.items })
      });
    } catch (error) {
      console.error('Unable to save guest orders', error);
    }
  }

  function cloneDefaultBill() {
    return defaultBillItems.map((item) => ({ ...item }));
  }

  async function initGuestStore() {
    const houseId = getHouseIdFromPath();
    let guests = [];

    if (houseId) {
      try {
        const response = await fetch(`/api/guests/${houseId}`);
        guests = await response.json();
      } catch (error) {
        console.error('Unable to load guests from server', error);
      }
    }

    const guestMap = new Map(guests.map((guest) => [guest.id, guest]));

    document.querySelectorAll('.guest-card').forEach((guestCard) => {
      if (guestCard.classList.contains('guest-add-card')) {
        return;
      }

      const guestTitle = guestCard.querySelector('.guest-card-title');
      const guestName = guestTitle?.textContent?.trim();
      const roomName = getGuestRoom(guestCard);
      const guestId = guestCard.dataset.guestId || '';
      const guestKey = makeGuestKey(guestName, roomName);

      guestCard.dataset.guestKey = guestKey;

      const serverGuest = guestMap.get(guestId) || guests.find((item) => item.name === guestName && item.roomId === guestCard.dataset.roomId);
      const savedItems = serverGuest?.orders && serverGuest.orders.length > 0 ? serverGuest.orders : cloneDefaultBill();

      if (!guestOrderStore.has(guestKey)) {
        guestOrderStore.set(guestKey, {
          guestId: serverGuest?.id || guestId,
          guestName,
          roomName,
          items: savedItems
        });
      }
    });
  }

  function buildGuestAddCard() {
    return `
      <div class="col-12 col-md-6 col-lg-4 d-flex">
        <div class="card guest-card guest-add-card shadow-sm w-100">
          <div class="card-body guest-card-body d-flex flex-column">
            <h5 class="guest-card-title">Adicionar hóspede</h5>
            <label class="form-label small mb-1" for="guestAddName">Nome</label>
            <input id="guestAddName" class="form-control form-control-sm mb-2 guest-add-name" placeholder="Nome do hóspede" />
            <label class="form-label small mb-1" for="guestAddRoom">Quarto</label>
            <input id="guestAddRoom" class="form-control form-control-sm mb-3 guest-add-room" placeholder="Suite Master" />
            <button class="btn btn-primary guest-add-button mt-auto">Adicionar hóspede</button>
          </div>
        </div>
      </div>
    `;
  }

  function ensureAddGuestCard() {
    const guestRow = document.querySelector('.guests-section .row');
    if (!guestRow) {
      return;
    }
    if (!document.querySelector('.guest-add-card')) {
      guestRow.insertAdjacentHTML('beforeend', buildGuestAddCard());
    }
  }

  function buildModalMarkup() {
    return `
      <div class="modal fade" id="guest-orders-modal" tabindex="-1" aria-labelledby="guestOrdersTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header border-0">
              <div>
                <h5 class="modal-title fw-bold" id="guestOrdersTitle">Pedidos do hóspede</h5>
                <p class="mb-0 text-muted small" id="guestOrdersSubtitle">Resumo detalhado das compras da estadia</p>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="guest-bill-header">
                <div>
                  <h6 class="fw-bold mb-1" id="guestOrdersName">Nome do hóspede</h6>
                  <p class="mb-0 text-muted small" id="guestOrdersRoom">Quarto: —</p>
                </div>
                <span class="badge rounded-pill text-bg-primary">Resumo</span>
              </div>

              <div class="list-group guest-bill-list" id="guestOrdersList"></div>

              <div class="guest-bill-add-item mt-3">
                <div class="row g-2 align-items-end">
                  <div class="col-md-5">
                    <label class="form-label small mb-1">Item</label>
                    <input class="form-control form-control-sm guest-order-new-label" placeholder="Nome do item" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label small mb-1">Categoria</label>
                    <select class="form-select form-select-sm guest-order-new-category">
                      <option value="Food & beverage">Food & beverage</option>
                      <option value="Experience">Experience</option>
                    </select>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label small mb-1">Valor</label>
                    <input type="number" step="0.01" min="0" class="form-control form-control-sm guest-order-new-amount" placeholder="0,00" />
                  </div>
                  <div class="col-md-1 d-grid">
                    <button class="btn btn-outline-primary btn-sm guest-order-add-item">Add</button>
                  </div>
                </div>
              </div>

              <div class="guest-bill-total border-top pt-3 mt-4">
                <span class="fw-semibold">Subtotal</span>
                <span class="fw-bold fs-5" id="guestOrdersSubtotal">R$ 0,00</span>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGuestBill(guestKey) {
    const guestData = guestOrderStore.get(guestKey);
    if (!guestData) {
      return;
    }

    const { guestName, roomName, items } = guestData;
    const nameElement = document.getElementById('guestOrdersName');
    const roomElement = document.getElementById('guestOrdersRoom');
    const listElement = document.getElementById('guestOrdersList');
    const subtotalElement = document.getElementById('guestOrdersSubtotal');

    if (!nameElement || !roomElement || !listElement || !subtotalElement) {
      return;
    }

    nameElement.textContent = guestName;
    roomElement.textContent = roomName ? `Quarto: ${roomName}` : 'Quarto: —';

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    listElement.innerHTML = items.map((item, index) => {
      return `
        <div class="list-group-item guest-order-row" data-guest-order-index="${index}">
          <div class="row gy-2 align-items-center">
            <div class="col-md-5">
              <input type="text" class="form-control form-control-sm guest-order-item-input" data-field="label" data-index="${index}" value="${item.label}" />
            </div>
            <div class="col-md-4">
              <select class="form-select form-select-sm guest-order-item-input" data-field="category" data-index="${index}">
                <option value="Food & beverage" ${item.category === 'Food & beverage' ? 'selected' : ''}>Food & beverage</option>
                <option value="Experience" ${item.category === 'Experience' ? 'selected' : ''}>Experience</option>
              </select>
            </div>
            <div class="col-md-2">
              <input type="number" step="0.01" min="0" class="form-control form-control-sm guest-order-item-input" data-field="amount" data-index="${index}" value="${item.amount.toFixed(2)}" />
            </div>
            <div class="col-md-1 d-grid">
              <button class="btn btn-outline-danger btn-sm guest-order-remove" data-index="${index}">×</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    subtotalElement.textContent = formatCurrency(subtotal);
  }

  function openGuestOrders(guestKey, guestId) {
    if (!guestOrderStore.has(guestKey)) {
      const [name, room] = guestKey.split('||');
      guestOrderStore.set(guestKey, { guestId, guestName: name, roomName: room, items: cloneDefaultBill() });
    }

    const modalElement = document.getElementById('guest-orders-modal');
    if (!modalElement) {
      return;
    }

    modalElement.dataset.guestKey = guestKey;
    renderGuestBill(guestKey);

    const bootstrapModal = window.bootstrap?.Modal;
    if (bootstrapModal) {
      const modal = new bootstrapModal(modalElement);
      modal.show();
    }
  }

  async function addGuestCard(guestName, roomName) {
    const guestRow = document.querySelector('.guests-section .row');
    if (!guestRow) {
      return;
    }

    const guestKey = makeGuestKey(guestName, roomName);
    if (guestOrderStore.has(guestKey)) {
      return;
    }

    const houseId = getHouseIdFromPath();
    let createdGuest = null;

    if (houseId) {
      try {
        const response = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: guestName, houseId, roomName })
        });
        createdGuest = await response.json();
      } catch (error) {
        console.error('Unable to create guest', error);
      }
    }

    const newCardHtml = `
      <div class="col-12 col-sm-6 col-lg-4 d-flex">
        <div class="card guest-card shadow-sm w-100" data-guest-key="${guestKey}" data-guest-id="${createdGuest?.id || ''}">
          <div class="card-body guest-card-body d-flex flex-column">
            <h5 class="guest-card-title">${guestName}</h5>
            <p class="text-muted mb-4">Quarto: ${roomName}</p>
            <button class="btn btn-outline-primary align-self-start guest-action">Ver pedidos</button>
          </div>
        </div>
      </div>
    `;

    const addGuestColumn = guestRow.querySelector('.guest-add-card')?.closest('.col-12');
    if (addGuestColumn) {
      addGuestColumn.insertAdjacentHTML('beforebegin', newCardHtml);
    } else {
      guestRow.insertAdjacentHTML('beforeend', newCardHtml);
    }

    guestOrderStore.set(guestKey, { guestId: createdGuest?.id || '', guestName, roomName, items: cloneDefaultBill() });
  }

  function updateGuestStoreItem(guestKey, index, field, value) {
    const guestData = guestOrderStore.get(guestKey);
    if (!guestData || !guestData.items[index]) {
      return;
    }

    if (field === 'amount') {
      const parsed = parseFloat(value);
      guestData.items[index].amount = Number.isNaN(parsed) ? 0 : parsed;
    } else {
      guestData.items[index][field] = value;
    }

    renderGuestBill(guestKey);
    persistGuestOrders(guestData);
  }

  function removeGuestStoreItem(guestKey, index) {
    const guestData = guestOrderStore.get(guestKey);
    if (!guestData) {
      return;
    }
    guestData.items.splice(index, 1);
    renderGuestBill(guestKey);
    persistGuestOrders(guestData);
  }

  function addGuestStoreItem(guestKey, item) {
    const guestData = guestOrderStore.get(guestKey);
    if (!guestData) {
      return;
    }
    guestData.items.push(item);
    renderGuestBill(guestKey);
    persistGuestOrders(guestData);
  }

  function handleGuestActionClick(button) {
    const guestCard = button.closest('.guest-card');
    if (!guestCard || guestCard.classList.contains('guest-add-card')) {
      return;
    }

    const guestKey = guestCard.dataset.guestKey || makeGuestKey(
      guestCard.querySelector('.guest-card-title')?.textContent || 'Hóspede',
      getGuestRoom(guestCard)
    );

    openGuestOrders(guestKey, guestCard.dataset.guestId);
  }

  function handleAddGuestClick(button) {
    const card = button.closest('.guest-add-card');
    if (!card) {
      return;
    }

    const nameInput = card.querySelector('.guest-add-name');
    const roomInput = card.querySelector('.guest-add-room');
    const guestName = nameInput?.value.trim();
    const roomName = roomInput?.value.trim();

    if (!guestName || !roomName) {
      alert('Por favor, informe o nome do hóspede e o quarto.');
      return;
    }

    addGuestCard(guestName, roomName);
    nameInput.value = '';
    roomInput.value = '';
  }

  function handleModalClick(event) {
    const addItemButton = event.target.closest('.guest-order-add-item');
    if (addItemButton) {
      event.preventDefault();
      const modal = document.getElementById('guest-orders-modal');
      const guestKey = modal?.dataset.guestKey;
      if (!guestKey) {
        return;
      }
      const labelInput = modal.querySelector('.guest-order-new-label');
      const categoryInput = modal.querySelector('.guest-order-new-category');
      const amountInput = modal.querySelector('.guest-order-new-amount');
      const label = labelInput?.value.trim();
      const category = categoryInput?.value.trim();
      const amount = parseFloat(amountInput?.value || '0');
      if (!label || !category || Number.isNaN(amount)) {
        alert('Preencha item, categoria e valor antes de adicionar.');
        return;
      }
      addGuestStoreItem(guestKey, { label, category, amount });
      if (labelInput) labelInput.value = '';
      if (categoryInput) categoryInput.value = '';
      if (amountInput) amountInput.value = '';
      return;
    }

    const removeButton = event.target.closest('.guest-order-remove');
    if (removeButton) {
      event.preventDefault();
      const modal = document.getElementById('guest-orders-modal');
      const guestKey = modal?.dataset.guestKey;
      const index = Number(removeButton.dataset.index);
      if (!guestKey || Number.isNaN(index)) {
        return;
      }
      removeGuestStoreItem(guestKey, index);
      return;
    }
  }

  function handleModalInputChange(event) {
    const input = event.target.closest('.guest-order-item-input');
    if (!input) {
      return;
    }

    const modal = document.getElementById('guest-orders-modal');
    const guestKey = modal?.dataset.guestKey;
    const index = Number(input.dataset.index);
    const field = input.dataset.field;
    if (!guestKey || Number.isNaN(index) || !field) {
      return;
    }
    updateGuestStoreItem(guestKey, index, field, input.value);
  }

  function attachEventHandlers() {
    document.addEventListener('click', function (event) {
      const actionButton = event.target.closest('.guest-action');
      if (actionButton) {
        event.preventDefault();
        handleGuestActionClick(actionButton);
        return;
      }

      const addGuestButton = event.target.closest('.guest-add-button');
      if (addGuestButton) {
        event.preventDefault();
        handleAddGuestClick(addGuestButton);
        return;
      }

      handleModalClick(event);
    });

    document.addEventListener('input', function (event) {
      handleModalInputChange(event);
    });
  }

  async function init() {
    if (!document.getElementById('guest-orders-modal')) {
      document.body.insertAdjacentHTML('beforeend', buildModalMarkup());
    }

    await initGuestStore();
    ensureAddGuestCard();
    attachEventHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
