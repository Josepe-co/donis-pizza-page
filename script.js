/* ============================================================
   DONI'S PIZZA – SCRIPT.JS
   ============================================================ */

/* ---- CONFIGURACIÓN ---------------------------------------- */
const WA_NUMBER          = "529631403622";
const DELIVERY_FEE_LOCAL  = 15;   // dentro de Comalapa
const DELIVERY_FEE_REMOTE = 25;   // fuera de Comalapa

/* ---- DATOS DE PIZZAS -------------------------------------- */
const pizzaData = {
  "Pepperoni":              { price12: 190, price24: 350, onlySize12: false },
  "Mexicana":               { price12: 190, price24: 350, onlySize12: false },
  "Ala Diabla":             { price12: 190, price24: 350, onlySize12: false },
  "Choriqueso":             { price12: 190, price24: 350, onlySize12: false },
  "Hawaiana":               { price12: 190, price24: 350, onlySize12: false },
  "Champiñones":            { price12: 190, price24: 350, onlySize12: false },
  "Pepperoni Carne Molida": { price12: 230, price24: 0,   onlySize12: true  },
};

// Pizzas disponibles para mitad y mitad (solo las regulares)
const REGULAR_PIZZAS = ["Pepperoni","Mexicana","Ala Diabla","Choriqueso","Hawaiana","Champiñones"];

/* ---- INGREDIENTES EXTRA CON PRECIO ------------------------ */
const TOPPINGS = [
  { emoji: "🥩", label: "Jamón",                  price: 15 },
  { emoji: "🍍", label: "Piña",                   price: 15 },
  { emoji: "🐷", label: "Chorizo",                price: 15 },
  { emoji: "🍕", label: "Extra pepperoni",        price: 15 },
  { emoji: "🍄", label: "Champiñones (extra)",    price: 15 },
  { emoji: "🌭", label: "Salchicha a la diabla",  price: 15 },
  { emoji: "🧀", label: "Extra queso",            price: 50 },
  { emoji: "🥩", label: "Carne molida",           price: 40 },
];

/* ---- ESTADO ----------------------------------------------- */
let currentPizza = "";
let currentQty   = 1;
let modalMode    = "normal"; // "normal" | "halfhalf"
let cart         = [];

/* ============================================================
   NAVBAR – efecto scroll
   ============================================================ */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

/* ============================================================
   NAVBAR – mobile toggle
   ============================================================ */
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  const spans = navToggle.querySelectorAll("span");
  spans[0].style.transform = open ? "translateY(7px) rotate(45deg)"   : "";
  spans[1].style.opacity   = open ? "0"                                : "";
  spans[2].style.transform = open ? "translateY(-7px) rotate(-45deg)" : "";
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.querySelectorAll("span").forEach(s => {
      s.style.transform = "";
      s.style.opacity   = "";
    });
  });
});

/* ============================================================
   SIZE TABS – actualizar precios en tarjetas del menú
   ============================================================ */
let currentTabSize = 12;

document.querySelectorAll(".size-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".size-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTabSize = parseInt(tab.dataset.size);
    updateCardPrices();
  });
});

function updateCardPrices() {
  document.querySelectorAll(".pizza-card[data-price-12]").forEach(card => {
    const name = card.dataset.name;
    const data = pizzaData[name];
    if (!data) return;
    const priceEl = card.querySelector(".card-price");
    if (!priceEl) return;
    if (data.onlySize12) {
      priceEl.textContent = `$${data.price12}`;
    } else {
      priceEl.textContent = `$${currentTabSize === 12 ? data.price12 : data.price24}`;
    }
  });
}

/* ============================================================
   PROMO MARTES – detectar día y activar
   ============================================================ */
function initMartesPromo() {
  const isTuesday = new Date().getDay() === 2;
  const section   = document.getElementById("promoMartesSection");
  if (section) section.style.display = isTuesday ? "flex" : "none";
}

/* ============================================================
   MODAL DE PRODUCTO – abrir
   ============================================================ */
function openOrderModal(pizzaName) {
  const data = pizzaData[pizzaName];
  if (!data) return;

  currentPizza = pizzaName;
  currentQty   = 1;
  modalMode    = "normal";

  // Reset modo
  document.getElementById("modeNormal")?.classList.add("active");
  document.getElementById("modeHalf")?.classList.remove("active");
  const hhSection = document.getElementById("halfHalfSection");
  if (hhSection) hhSection.style.display = "none";

  // Poblar selects mitad y mitad
  populateHalfSelects();

  document.getElementById("modalPizzaName").textContent = `Pizza ${pizzaName}`;

  // Radio 24 – deshabilitar si es pizza solo de 12 rebanadas
  const radio24     = document.getElementById("radio24");
  const radio24wrap = radio24?.closest("label");
  if (data.onlySize12) {
    document.getElementById("radio12").checked = true;
    if (radio24wrap) { radio24wrap.style.opacity = "0.35"; radio24wrap.style.pointerEvents = "none"; }
  } else {
    if (radio24wrap) { radio24wrap.style.opacity = ""; radio24wrap.style.pointerEvents = ""; }
    // Pre-seleccionar el tamaño según tab activo
    if (currentTabSize === 24) {
      radio24.checked = true;
    } else {
      document.getElementById("radio12").checked = true;
    }
  }

  document.getElementById("modalPrice12").textContent = `$${data.price12}`;
  document.getElementById("modalPrice24").textContent = data.onlySize12 ? "N/D" : `$${data.price24}`;
  document.getElementById("qtyDisplay").textContent   = "1";

  renderToppings();
  updateModalSubtotal();

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

/* ---- Poblar selects de mitad y mitad ---------------------- */
function populateHalfSelects() {
  ["halfSelect1", "halfSelect2", "halfSelect3", "halfSelect4"].forEach((id, idx) => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = REGULAR_PIZZAS.map((name, i) =>
      `<option value="${name}" ${i === idx ? "selected" : ""}>${name}</option>`
    ).join("");
  });
}

/* ---- Mostrar/ocultar selects 3 y 4 según tamaño ----------- */
function updateHalfSelectsVisibility() {
  if (modalMode !== "halfhalf") return;
  const sizeEl = document.querySelector('input[name="modalSize"]:checked');
  const is24   = sizeEl?.value === "24";
  const row34  = document.getElementById("halfRow34");
  if (row34) row34.style.display = is24 ? "block" : "none";
}

/* ---- Cambiar modo normal / mitad y mitad ------------------ */
function setModalMode(mode) {
  modalMode = mode;
  document.getElementById("modeNormal").classList.toggle("active", mode === "normal");
  document.getElementById("modeHalf").classList.toggle("active",   mode === "halfhalf");
  const hhSection = document.getElementById("halfHalfSection");
  if (hhSection) hhSection.style.display = mode === "halfhalf" ? "block" : "none";
  document.getElementById("modalPizzaName").textContent =
    mode === "halfhalf" ? "Pizza Mitad y Mitad" : `Pizza ${currentPizza}`;
  updateHalfSelectsVisibility();
  updateModalSubtotal();
}

/* ---- Chips de toppings ------------------------------------ */
function renderToppings() {
  const grid = document.getElementById("toppingsGrid");
  grid.innerHTML = "";
  TOPPINGS.forEach(t => {
    const chip = document.createElement("button");
    chip.type          = "button";
    chip.className     = "topping-chip";
    chip.dataset.label = t.label;
    chip.dataset.price = t.price;
    chip.innerHTML     = `${t.emoji} ${t.label} <em class="chip-price">+$${t.price}</em>`;
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
      updateModalSubtotal();
    });
    grid.appendChild(chip);
  });
}

function getSelectedToppings() {
  return [...document.querySelectorAll("#toppingsGrid .topping-chip.selected")]
    .map(c => ({ label: c.dataset.label, price: parseInt(c.dataset.price) }));
}

/* ---- Helper: calcular costo de toppings ------------------- */
function calcToppingsCost(toppings) {
  return toppings.reduce((s, t) => s + t.price, 0);
}

/* ---- Subtotal del modal ----------------------------------- */
function updateModalSubtotal() {
  const sizeEl = document.querySelector('input[name="modalSize"]:checked');
  if (!sizeEl) return;
  const size = sizeEl.value;

  let basePrice;
  if (modalMode === "halfhalf") {
    const h1   = document.getElementById("halfSelect1")?.value || REGULAR_PIZZAS[0];
    const d1   = pizzaData[h1];
    basePrice  = d1 ? (size === "12" ? d1.price12 : d1.price24) : 190;
  } else {
    const data = pizzaData[currentPizza];
    if (!data) return;
    basePrice  = size === "12" ? data.price12 : data.price24;
  }

  const toppings      = getSelectedToppings();
  const toppingsTotal = calcToppingsCost(toppings);

  // Actualizar visibilidad de selects 3 y 4 al cambiar tamaño
  updateHalfSelectsVisibility();

  // Promo martes: mostrar solo si es martes y tamaño 24
  const isTuesday  = new Date().getDay() === 2;
  const promoBox   = document.getElementById("promoMartesModal");
  const promoCheck = document.getElementById("promoMartesCheck");
  let promoExtra   = 0;
  if (isTuesday && size === "24" && promoBox) {
    promoBox.style.display = "flex";
    if (promoCheck?.checked) promoExtra = 10;
  } else if (promoBox) {
    promoBox.style.display = "none";
    if (promoCheck) promoCheck.checked = false;
  }

  document.getElementById("modalSubtotal").textContent =
    `$${(basePrice + toppingsTotal + promoExtra) * currentQty}`;
}

/* ---- Control de cantidad ---------------------------------- */
function changeQty(delta) {
  currentQty = Math.min(20, Math.max(1, currentQty + delta));
  document.getElementById("qtyDisplay").textContent = currentQty;
  updateModalSubtotal();
}

function closeOrderModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

/* ============================================================
   CARRITO – agregar item
   ============================================================ */
function addToCart() {
  const sizeEl   = document.querySelector('input[name="modalSize"]:checked');
  const size     = sizeEl ? sizeEl.value : "12";
  const toppings = getSelectedToppings();
  const topCost  = calcToppingsCost(toppings);
  const topLabel = toppings.map(t => t.label);

  let name, price, key;

  if (modalMode === "halfhalf") {
    const h1    = document.getElementById("halfSelect1")?.value || REGULAR_PIZZAS[0];
    const h2    = document.getElementById("halfSelect2")?.value || REGULAR_PIZZAS[1];
    const d1    = pizzaData[h1];
    const baseP = d1 ? (size === "12" ? d1.price12 : d1.price24) : 190;
    let partsLabel;
    if (size === "24") {
      const h3 = document.getElementById("halfSelect3")?.value || REGULAR_PIZZAS[2];
      const h4 = document.getElementById("halfSelect4")?.value || REGULAR_PIZZAS[3];
      partsLabel = `${h1} / ${h2} / ${h3} / ${h4}`;
    } else {
      partsLabel = `${h1} / ${h2}`;
    }
    name  = `Mitad y Mitad (${partsLabel})`;
    price = baseP + topCost;
    key   = `${name}__${size}__${[...topLabel].sort().join(",")}`;
  } else {
    const data = pizzaData[currentPizza];
    if (!data) return;
    const baseP = size === "12" ? data.price12 : data.price24;
    name  = currentPizza;
    price = baseP + topCost;
    key   = `${currentPizza}__${size}__${[...topLabel].sort().join(",")}`;
  }

  const existing = cart.find(i => i.key === key && i.type === "pizza");
  if (existing) {
    existing.qty = Math.min(20, existing.qty + currentQty);
  } else {
    cart.push({ key, type: "pizza", name, size, price, toppings: topLabel, qty: currentQty });
  }

  // Promo Martes: agregar refresco 2L a $10
  const promoCheck = document.getElementById("promoMartesCheck");
  if (promoCheck?.checked) {
    const dKey = "promo-tuesday";
    const dExist = cart.find(i => i.key === dKey);
    if (dExist) {
      dExist.qty = Math.min(20, dExist.qty + currentQty);
    } else {
      cart.push({ key: dKey, type: "drink", name: "🎉 Promo Martes – Refresco 2L", size: "", price: 10, toppings: [], qty: currentQty });
    }
  }

  updateCartBadge();
  closeOrderModal();
  const fab = document.getElementById("fabCart");
  fab.style.transform = "scale(1.3)";
  setTimeout(() => { fab.style.transform = ""; }, 300);
}

/* ---- Agregar refresco directo ----------------------------- */
function addDrinkToCart(drinkName, drinkPrice, brandSelectId) {
  const brand    = brandSelectId ? (document.getElementById(brandSelectId)?.value || "") : "";
  const fullName = brand ? `${drinkName} (${brand})` : drinkName;
  const key      = `drink__${fullName}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty = Math.min(20, existing.qty + 1);
  } else {
    cart.push({ key, type: "drink", name: fullName, size: "", price: drinkPrice, toppings: [], qty: 1 });
  }
  updateCartBadge();
  const fab = document.getElementById("fabCart");
  fab.style.transform = "scale(1.3)";
  setTimeout(() => { fab.style.transform = ""; }, 300);
}

/* ---- Abrir modal directo en modo mitad y mitad ------------ */
function openHalfHalfModal() {
  // Abre modal con la primera pizza como contexto, luego cambia a modo halfhalf
  openOrderModal("Pepperoni");
  setModalMode("halfhalf");
}

/* ============================================================
   CARRITO FAB – badge
   ============================================================ */
function updateCartBadge() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const fab   = document.getElementById("fabCart");
  const badge = document.getElementById("cartBadge");
  badge.textContent = total;
  if (total > 0) {
    fab.classList.add("visible");
    badge.style.animation = "none";
    badge.offsetHeight;
    badge.style.animation = "";
  } else {
    fab.classList.remove("visible");
  }
}

/* ============================================================
   MODAL CARRITO – abrir / cerrar / renderizar
   ============================================================ */
function openCartModal() {
  document.getElementById("cartRadioLocal").checked = true;
  document.getElementById("cartAddressInput").value = "";
  document.getElementById("cartAddressError").style.display = "none";
  document.getElementById("cartAddressInput").style.borderColor = "";
  renderCartItems();
  updateCartTotal();
  document.getElementById("cartOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCartModal() {
  document.getElementById("cartOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

function renderCartItems() {
  const list = document.getElementById("cartItemsList");

  if (cart.length === 0) {
    list.innerHTML = `<div class="cart-empty"><span>🛒</span>Tu carrito está vacío.<br/>¡Agrega pizzas desde el menú!</div>`;
    const btn = document.getElementById("cartSendBtn");
    btn.disabled = true; btn.style.opacity = "0.45";
    return;
  }

  const btn = document.getElementById("cartSendBtn");
  btn.disabled = false; btn.style.opacity = "";

  list.innerHTML = cart.map((item, idx) => {
    const sizeStr     = item.size ? `${item.size} reb. – ` : "";
    const toppingText = item.toppings.length ? `<br/><small>+ ${item.toppings.join(", ")}</small>` : "";
    const icon        = item.type === "drink" ? "🥤" : "🍕";
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${icon} ${item.name}</div>
          <div class="cart-item-detail">${sizeStr}$${item.price} c/u${toppingText}</div>
        </div>
        <div style="text-align:right;">
          <div class="cart-item-controls">
            <button class="cart-qty-btn" onclick="cartChangeQty(${idx},-1)">−</button>
            <span class="cart-qty-num">${item.qty}</span>
            <button class="cart-qty-btn" onclick="cartChangeQty(${idx},1)">+</button>
            <button class="cart-remove-btn" title="Eliminar" onclick="cartRemoveItem(${idx})">✕</button>
          </div>
          <div class="cart-item-price">$${item.price * item.qty}</div>
        </div>
      </div>`;
  }).join("");

  // Recomendación de refresco si no hay ninguno
  const hasDrink = cart.some(i => i.type === "drink");
  const hasPizza = cart.some(i => i.type === "pizza");
  if (!hasDrink && hasPizza) {
    list.insertAdjacentHTML("beforeend", `
      <div class="drink-recommendation">
        <span>🥤</span>
        <div>
          <strong>¿Le ponemos un refresco?</strong>
          <div class="drink-rec-btns">
            <button class="btn btn-blue btn-sm" onclick="addDrinkToCart('Refresco 2L', 40); renderCartItems(); updateCartTotal();">
              Refresco 2L – $40
            </button>
            <button class="btn btn-blue btn-sm" onclick="addDrinkToCart('Refresco 600ml', 25); renderCartItems(); updateCartTotal();">
              600ml – $25
            </button>
          </div>
        </div>
      </div>`);
  }
}

function cartChangeQty(idx, delta) {
  cart[idx].qty = Math.min(20, Math.max(0, cart[idx].qty + delta));
  if (cart[idx].qty === 0) cart.splice(idx, 1);
  updateCartBadge(); renderCartItems(); updateCartTotal();
}

function cartRemoveItem(idx) {
  cart.splice(idx, 1);
  updateCartBadge(); renderCartItems(); updateCartTotal();
}

function updateCartTotal() {
  const deliveryType = document.querySelector('input[name="cartDelivery"]:checked')?.value;
  let deliveryFee = 0;
  if (deliveryType === "local")  deliveryFee = DELIVERY_FEE_LOCAL;
  if (deliveryType === "remote") deliveryFee = DELIVERY_FEE_REMOTE;

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById("cartTotal").textContent = `$${subtotal + deliveryFee}`;

  const addrGroup = document.getElementById("cartAddressGroup");
  if (addrGroup) {
    const hideAddr = deliveryType === "recoger";
    addrGroup.style.display = hideAddr ? "none" : "block";
    if (hideAddr) {
      document.getElementById("cartAddressError").style.display = "none";
      document.getElementById("cartAddressInput").style.borderColor = "";
    }
  }
}

/* ============================================================
   WHATSAPP – enviar pedido completo
   ============================================================ */
function sendCartWhatsApp() {
  if (cart.length === 0) return;

  const deliveryType = document.querySelector('input[name="cartDelivery"]:checked')?.value;
  const isHome  = deliveryType !== "recoger";
  const address = document.getElementById("cartAddressInput").value.trim();
  const notes   = document.getElementById("cartNotes").value.trim();

  if (isHome && !address) {
    const errEl = document.getElementById("cartAddressError");
    const input = document.getElementById("cartAddressInput");
    errEl.style.display = "block";
    input.style.borderColor = "var(--red)";
    input.focus();
    input.addEventListener("input", () => {
      errEl.style.display = "none";
      input.style.borderColor = "";
    }, { once: true });
    return;
  }

  const itemLines = cart.map((item, i) => {
    const sizeStr = item.size ? ` ${item.size} reb.` : "";
    const extra   = item.toppings.length ? ` + ${item.toppings.join(", ")}` : "";
    const plural  = item.qty > 1 ? ` × ${item.qty}` : "";
    return `${i+1}. *${item.type === "drink" ? "🥤" : "🍕"} ${item.name}*${sizeStr}${extra}${plural} = $${item.price * item.qty}`;
  }).join("\n");

  let deliveryFee = 0;
  if (deliveryType === "local")  deliveryFee = DELIVERY_FEE_LOCAL;
  if (deliveryType === "remote") deliveryFee = DELIVERY_FEE_REMOTE;
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0) + deliveryFee;

  let msg = `¡Hola Doni's Pizza! 🍕 Quiero hacer un pedido:\n\n${itemLines}\n\n`;
  if (deliveryType === "local") {
    msg += `🛵 *Envío – Centro/barrios cercanos* (+$${DELIVERY_FEE_LOCAL})\n📍 *Dirección:* ${address}\n`;
  } else if (deliveryType === "remote") {
    msg += `🛵 *Envío – Fuera de Comalapa* (+$${DELIVERY_FEE_REMOTE})\n📍 *Dirección:* ${address}\n`;
  } else {
    msg += `🏠 *Recoger en local*\n`;
  }
  msg += `💰 *Total:* $${total}`;
  if (notes) msg += `\n📝 *Notas:* ${notes}`;

  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");

  cart = [];
  updateCartBadge();
  closeCartModal();
  document.getElementById("cartNotes").value = "";
}

/* ============================================================
   CERRAR MODALES – overlay o ESC
   ============================================================ */
function closeModalOutside(event, overlayId) {
  if (event.target.id === overlayId) {
    overlayId === "modalOverlay" ? closeOrderModal() : closeCartModal();
  }
}
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  closeOrderModal();
  closeCartModal();
});

/* ============================================================
   ANIMACIONES DE ENTRADA – Intersection Observer
   ============================================================ */
const style = document.createElement("style");
style.textContent = `
  .fade-in { opacity:0; transform:translateY(24px); transition:opacity .55s ease,transform .55s ease; }
  .fade-in.visible { opacity:1; transform:translateY(0); }
`;
document.head.appendChild(style);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

function initFadeIn() {
  [".pizza-card", ".drink-card", ".contact-card",
   ".about-text", ".about-img-wrap", ".section-header"].forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("fade-in");
      el.style.transitionDelay = `${i * 0.07}s`;
      observer.observe(el);
    });
  });
}

/* ============================================================
   INICIALIZAR
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initFadeIn();
  updateCardPrices();
  updateCartBadge();
  initMartesPromo();
});
