const tables = [
  {
    id: 1, 
    name: 'Table-1', 
    totalItems: 0, 
    totalCost: 0, 
    items: []
  },
  {
    id: 2, 
    name: 'Table-2', 
    totalItems: 0, 
    totalCost: 0, 
    items: []
  },
  {
    id: 3, 
    name: 'Table-3', 
    totalItems: 0, 
    totalCost: 0, 
    items: []
  },
];

const menuItems = [
  { id: 1, name: 'Crusty Garlic Focaccia with Melted Cheese', price: 105, type: 'special', category: 'vegetarian' },
  { id: 2, name: 'French Fries', price: 105, type: 'special', category: 'vegetarian' },
  { id: 3, name: 'Chicken Biryani', price: 250, type: 'main course', category: 'non-vegetarian' },
  { id: 4, name: 'Vegetable Biryani', price: 200, type: 'main course', category: 'vegetarian' },
  { id: 5, name: 'Paneer Tikka', price: 180, type: 'starter', category: 'vegetarian' },
  { id: 6, name: 'Chicken Tikka', price: 200, type: 'starter', category: 'non-vegetarian' },
  { id: 7, name: 'Gulab Jamun', price: 90, type: 'dessert', category: 'vegetarian' },
  { id: 8, name: 'Rasgulla', price: 85, type: 'dessert', category: 'vegetarian' },
  { id: 9, name: 'Chocolate Mousse', price: 120, type: 'dessert', category: 'vegetarian' }
];

const tableList = document.getElementById('table-list');
const menuList = document.getElementById('menu-list');
const tableSearch = document.getElementById('table-search');
const menuSearch = document.getElementById('menu-search');
const modal = document.getElementById('order-modal');
const modalTableTitle = document.getElementById('modal-table-title');
const orderDetails = document.getElementById('order-details');
const orderTotal = document.getElementById('order-total');
const closeSessionBtn = document.getElementById('close-session');


function renderTables() {
  tableList.innerHTML = '';
  tables.forEach(table => {
      const tableCard = document.createElement('div');
      tableCard.className = 'table-card';
      tableCard.innerHTML = `
          <h3>${table.name}</h3>
          <p> Rs ${table.totalCost} | Total Items: ${table.totalItems}</p>
      `;
      tableCard.addEventListener('click', () => showOrderDetails(table));
      tableCard.addEventListener('dragover', allowDrop);
      tableCard.addEventListener('drop', (event) => drop(event, table));
      tableList.appendChild(tableCard);
  });
}


function renderMenuItems() {
  menuList.innerHTML = '';
  menuItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      menuItem.draggable = true;
      let subNote = '';
      if (item.name === 'Chicken Biryani' || item.name === 'Vegetable Biryani') {
          subNote = '<p style="font-size: 12px; color: gray;">(Main Course)</p>';
      }else if(item.name==='Crusty Garlic Focaccia with Melted Cheese'||item.name==='French Fries'){
        subNote = '<p style="font-size: 12px; color: gray;">(special)</p>';
      }else if(item.name==='Paneer Tikka'||item.name==='Chicken Tikka'){
        subNote = '<p style="font-size: 12px; color: gray;">(starter)</p>';
      }else{
        subNote = '<p style="font-size: 12px; color: gray;">(dessert)</p>';
      }

      menuItem.innerHTML = `
          <h3>${item.name}</h3>
          <p>Rs ${item.price}</p>
          ${subNote}  <!-- Sub-note for specific item -->
      `;
      menuItem.addEventListener('dragstart', (event) => drag(event, item));
      menuList.appendChild(menuItem);
  });
}

tableSearch.addEventListener('input', () => {
  const searchTerm = tableSearch.value.toLowerCase();
  const filteredTables = tables.filter(table => 
      table.name.toLowerCase().includes(searchTerm)
  );
  renderFilteredTables(filteredTables);
});

menuSearch.addEventListener('input', () => {
  const searchTerm = menuSearch.value.toLowerCase();
  const filteredItems = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm) || 
      item.type.toLowerCase().includes(searchTerm)
  );
  renderFilteredMenuItems(filteredItems);
});


function allowDrop(event) {
  event.preventDefault();
}


function drag(event, item) {
  event.dataTransfer.setData('text/plain', JSON.stringify(item));
}


function drop(event, table) {
  event.preventDefault();
  const item = JSON.parse(event.dataTransfer.getData('text'));
  addItemToTable(item, table);
  renderTables();
}


function addItemToTable(item, table) {
  const existingItem = table.items.find((i) => i.id === item.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    table.items.push({ ...item, quantity: 1 });
  }
  table.totalItems += 1;
  table.totalCost += item.price;
  
}


function showOrderDetails(table) {
  const previouslyHighlighted = document.querySelector('.highlight');
  if (previouslyHighlighted) {
      previouslyHighlighted.classList.remove('highlight');
  }
  const tableCard = Array.from(document.getElementsByClassName('table-card'))
      .find(card => card.querySelector('h3').textContent === table.name);
  if (tableCard) {
      tableCard.classList.add('highlight');
  }
  modalTableTitle.textContent =  `${table.name} | Order Details`;

  orderDetails.innerHTML = '';
  if (table.items.length === 0) {
      orderDetails.innerHTML = '<p>No items ordered yet.</p>';
  } else {
      table.items.forEach((item, index) => {
          const itemElement = document.createElement('tr');
          itemElement.innerHTML = `
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>Rs <span id="price-${index}">${item.price * item.quantity}</span></td>
              <td>
                  <input type="number" id="quantity-${index}" value="${item.quantity}" min="1" style="width: 60px;" />
              </td>
              <td><i class="fas fa-trash delete-icon" data-item-id="${item.id}"></i></td>
          `;

          const quantityInput = itemElement.querySelector(`#quantity-${index}`);
          quantityInput.addEventListener('input', (event) => {
              const newQuantity = parseInt(event.target.value);
              if (newQuantity > 0) {
                  // Update the item's quantity and recalculate the table's total items and total cost
                  const quantityDifference = newQuantity - item.quantity;
                  item.quantity = newQuantity;
                  table.totalItems += quantityDifference;
                  table.totalCost += item.price * quantityDifference;

                  // Update the UI
                  document.getElementById(`price-${index}`).textContent = item.price * newQuantity;
                  orderTotal.textContent = `Total: Rs ${table.totalCost}`;
                  renderTables();
              } else {
                  event.target.value = item.quantity; // Revert to previous quantity if newQuantity is invalid
              }
          });

          orderDetails.appendChild(itemElement);
      });
  }
  orderTotal.textContent = `Total: Rs ${table.totalCost}`;
  modal.style.display = 'block';
}



document.querySelector('.close').onclick = () => {
  modal.style.display = 'none';
};
window.onclick = (event) => {
  if (event.target == modal) {
      modal.style.display = 'none';
  }
};


function renderFilteredMenuItems(filteredItems) {
  menuList.innerHTML = '';
  filteredItems.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      menuItem.draggable = true;
      menuItem.innerHTML = `
          <h3>${item.name}</h3>
          <p>Rs ${item.price}</p>
      `;
      menuItem.addEventListener('dragstart', (event) => drag(event, item));
      menuList.appendChild(menuItem);
  });
}


function renderFilteredTables(filteredTables) {
  tableList.innerHTML = '';
  filteredTables.forEach(table => {
      const tableCard = document.createElement('div');
      tableCard.className = 'table-card';
      tableCard.innerHTML = `
          <h3>${table.name}</h3>
          <p> Rs ${table.totalCost} | Total Items: ${table.totalItems}</p>
      `;
      tableCard.addEventListener('click', () => showOrderDetails(table));
      tableCard.addEventListener('dragover', allowDrop);
      tableCard.addEventListener('drop', (event) => drop(event, table));
      tableList.appendChild(tableCard);
  });
}
renderTables();
renderMenuItems();

orderDetails.addEventListener('input', (event) => {
  if (event.target.classList.contains('quantity-input')) {
      const index = event.target.getAttribute('data-index');
      const newQuantity = parseInt(event.target.value, 10);
      const table = tables.find(t => t.name === modalTableTitle.textContent);
      table.items[index].quantity = newQuantity;
      table.totalCost = table.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      orderTotal.textContent = `Total: Rs ${table.totalCost}`;
      renderTables();
  }
});


function updateOrderTotal(totalCost) {
  orderTotal.textContent = `Total: Rs ${totalCost}`;
}


orderDetails.addEventListener('input', (event) => {
  if (event.target.classList.contains('quantity-input')) {
      const input = event.target;
      const itemId = parseInt(input.getAttribute('data-item-id'));
      const newQuantity = parseInt(input.value);
      updateItemQuantity(itemId, newQuantity);
  }
});


function updateItemQuantity(itemId, newQuantity) {
  tables.forEach(table => {
      const item = table.items.find(i => i.id === itemId);
      if (item) {
          const oldQuantity = item.quantity;
          item.quantity = newQuantity;
          table.totalCost += (newQuantity - oldQuantity) * item.price;
          table.totalItems += (newQuantity - oldQuantity);
          table.totalCost += difference * item.price;
          table.totalItems += difference;
          updateOrderTotal(table.totalCost);
          renderTables(); 
      }
  });
}

orderDetails.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-icon')) {
      const itemId = parseInt(event.target.getAttribute('data-item-id'));
      deleteItemFromTable(itemId);
  }
});


function deleteItemFromTable(itemId) {
  tables.forEach(table => {
      const itemIndex = table.items.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
          const item = table.items[itemIndex];
          table.totalCost -= item.price * item.quantity;
          table.totalItems -= item.quantity;
          table.totalCost = Math.max(0, table.totalCost);
      table.totalItems = Math.max(0, table.totalItems);

          table.items.splice(itemIndex, 1);
          updateOrderTotal(table.totalCost);
          renderTables(); 
          showOrderDetails(table);
      }
  });
}

const generateBillBtn = document.getElementById('generate-bill-btn');
generateBillBtn.addEventListener('click', generateBill);
function generateBill() {
    const tableName = modalTableTitle.textContent.split(' | ')[0];
    console.log(tableName) 
    const table = tables.find(t => t.name === tableName);
    console.log(table.items)
    if (table) {
      let itemsList = table.items
            .map(item => `${item.name} (Quantity: ${item.quantity}): Rs ${item.price * item.quantity}`)
            .join('\n');
        const totalItems = table.totalItems;
        const totalCost = table.totalCost;
        alert(`Bill for ${table.name}:\n\nItems:\n${itemsList}\n\nTotal Items: ${totalItems}\nTotal Cost: Rs ${totalCost}`);  
    } else {
        alert('No table selected or no items ordered.');
    }
}

