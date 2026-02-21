/* ============================================================
   DONI'S PIZZA – SCRIPT.JS
   Sistema: Modal de producto (toppings + qty) + Carrito + WhatsApp
   ============================================================ */

/* ---- CONFIGURACIÓN ---------------------------------------- */
const WA_NUMBER    = "529631403622";
const DELIVERY_FEE = 15;

/* ---- DATOS DE PIZZAS -------------------------------------- */
const pizzaData = {
  "Pepperoni":    { price12: 190, price24: 350 },
  "Mexicana":     { price12: 190, price24: 350 },
  "Ala Diabla":   { price12: 190, price24: 350 },
  "Choriqueso":   { price12: 190, price24: 350 },
  "Hawaiana":     { price12: 190, price24: 350 },
  "Champiñones":  { price12: 190, price24: 350 },
};

/* ---- INGREDIENTES EXTRA DISPONIBLES ----------------------- */
const TOPPINGS = [
  { emoji: "🍕", label: "Extra pepperoni" },
  { emoji: "🧀", label: "Extra queso"     },
  { emoji: "🍄", label: "Champiñones"     },
  { emoji: "🌶️", label: "Jalapeño"        },
  { emoji: "🧅", label: "Cebolla"         },
  { emoji: "🫑", label: "Pimiento morrón" },
  { emoji: "🫒", label: "Aceitunas"       },
  { emoji: "🌽", label: "Elote"           },
  { emoji: "🍗", label: "Pollo"           },
  { emoji: "🐷", label: "Chorizo"         },
];

/* ---- ESTADO ----------------------------------------------- */
let currentPizza = "";
let currentQty   = 1;
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
  document.querySelectorAll(".pizza-card").forEach(card => {
    const name = card.dataset.name;
    const data = pizzaData[name];
    if (!data) return;
    const price   = currentTabSize === 12 ? data.price12 : data.price24;
    const priceEl = card.querySelector(".card-price");
    if (priceEl) priceEl.textContent = `$${price}`;
  });
}

/* ============================================================
   MODAL DE PRODUCTO – abrir
   ============================================================ */
function openOrderModal(pizzaName) {
  const data = pizzaData[pizzaName];
  if (!data) return;

  currentPizza = pizzaName;
  currentQty   = 1;

  document.getElementById("modalTitle").textContent     = "Personaliza tu pizza";
  document.getElementById("modalPizzaName").textContent = `Pizza ${pizzaName}`;
  document.getElementById("modalPrice12").textContent   = `$${data.price12}`;
  document.getElementById("modalPrice24").textContent   = `$${data.price24}`;
  document.getElementById("radio12").checked            = true;
  document.getElementById("qtyDisplay").textContent     = "1";

  renderToppings();
  updateModalSubtotal();

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderToppings() {
  const grid = document.getElementById("toppingsGrid");
  grid.innerHTML = "";
  TOPPINGS.forEach(t => {
    const chip = document.createElement("button");
    chip.type          = "button";
    chip.className     = "topping-chip";
    chip.dataset.label = t.label;
    chip.innerHTML     = `${t.emoji} ${t.label}`;
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
    });
    grid.appendChild(chip);
  });
}

function getSelectedToppings() {
  return [...document.querySelectorAll("#toppingsGrid .topping-chip.selected")]
    .map(c => c.dataset.label);
}

function updateModalSubtotal() {
  const data = pizzaData[currentPizza];
  if (!data) return;
  const sizeEl = document.querySelector('input[name="modalSize"]:checked');
  if (!sizeEl) return;
  const base = sizeEl.value === "12" ? data.price12 : data.price24;
  document.getElementById("modalSubtotal").textContent = `$${base * currentQty}`;
}

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
  const data = pizzaData[currentPizza];
  if (!data) return;

  const sizeEl   = document.querySelector('input[name="modalSize"]:checked');
  const size     = sizeEl ? sizeEl.value : "12";
  const price    = size === "12" ? data.price12 : data.price24;
  const toppings = getSelectedToppings();
  const key      = `${currentPizza}__${size}__${[...toppings].sort().join(",")}`;

  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty = Math.min(20, existing.qty + currentQty);
  } else {
    cart.push({ key, name: currentPizza, size, price, toppings, qty: currentQty });
  }

  updateCartBadge();
  closeOrderModal();

  const fab = document.getElementById("fabCart");
  fab.style.transform = "scale(1.3)";
  setTimeout(() => { fab.style.transform = ""; }, 300);
}

/* ============================================================
   CARRITO FAB – badge y visibilidad
   ============================================================ */
function updateCartBadge() {
  const totalUnits = cart.reduce((sum, i) => sum + i.qty, 0);
  const fab        = document.getElementById("fabCart");
  const badge      = document.getElementById("cartBadge");

  badge.textContent = totalUnits;

  if (totalUnits > 0) {
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
  document.getElementById("cartRadioDom").checked       = true;
  document.getElementById("cartAddressInput").value     = "";
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
    list.innerHTML = `
      <div class="cart-empty">
        <span>🛒</span>
        Tu carrito está vacío.<br />¡Agrega pizzas desde el menú!
      </div>`;
    const btn = document.getElementById("cartSendBtn");
    btn.disabled      = true;
    btn.style.opacity = "0.45";
    return;
  }

  const btn = document.getElementById("cartSendBtn");
  btn.disabled      = false;
  btn.style.opacity = "";

  list.innerHTML = cart.map((item, idx) => {
    const toppingText = item.toppings.length
      ? `<br/>+ ${item.toppings.join(", ")}`
      : "";
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">Pizza ${item.name} (${item.size} reb.)</div>
          <div class="cart-item-detail">$${item.price} c/u${toppingText}</div>
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
}

function cartChangeQty(idx, delta) {
  cart[idx].qty = Math.min(20, Math.max(0, cart[idx].qty + delta));
  if (cart[idx].qty === 0) cart.splice(idx, 1);
  updateCartBadge();
  renderCartItems();
  updateCartTotal();
}

function cartRemoveItem(idx) {
  cart.splice(idx, 1);
  updateCartBadge();
  renderCartItems();
  updateCartTotal();
}

function updateCartTotal() {
  const isHome   = document.getElementById("cartRadioDom").checked;
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total    = subtotal + (isHome ? DELIVERY_FEE : 0);

  document.getElementById("cartTotal").textContent = `$${total}`;

  const addrGroup = document.getElementById("cartAddressGroup");
  if (addrGroup) {
    addrGroup.style.display = isHome ? "block" : "none";
    if (!isHome) {
      document.getElementById("cartAddressError").style.display = "none";
      document.getElementById("cartAddressInput").style.borderColor = "";
    }
  }
}

/* ============================================================
   WHATSAPP – enviar pedido completo del carrito
   ============================================================ */
function sendCartWhatsApp() {
  if (cart.length === 0) return;

  const isHome  = document.getElementById("cartRadioDom").checked;
  const address = document.getElementById("cartAddressInput").value.trim();
  const notes   = document.getElementById("cartNotes").value.trim();

  if (isHome && !address) {
    const errEl = document.getElementById("cartAddressError");
    const input = document.getElementById("cartAddressInput");
    errEl.style.display       = "block";
    input.style.borderColor   = "var(--red)";
    input.focus();
    input.addEventListener("input", () => {
      errEl.style.display     = "none";
      input.style.borderColor = "";
    }, { once: true });
    return;
  }

  const itemLines = cart.map((item, i) => {
    const extra  = item.toppings.length ? ` + ${item.toppings.join(", ")}` : "";
    const plural = item.qty > 1 ? ` × ${item.qty}` : "";
    return `${i + 1}. *Pizza ${item.name}* ${item.size} reb.${extra}${plural} = $${item.price * item.qty}`;
  }).join("\n");

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total    = subtotal + (isHome ? DELIVERY_FEE : 0);

  let msg = `¡Hola Doni's Pizza! 🍕 Quiero hacer un pedido:\n\n${itemLines}\n\n`;
  if (isHome) {
    msg += `🛵 *Envío a domicilio* (+$${DELIVERY_FEE})\n📍 *Dirección:* ${address}\n`;
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
   CERRAR MODALES – clic en overlay o ESC
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
  .fade-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
`;
document.head.appendChild(style);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

function initFadeIn() {
  [".pizza-card", ".contact-card", ".about-text",
   ".about-img-wrap", ".section-header"].forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("fade-in");
      el.style.transitionDelay = `${i * 0.08}s`;
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
});

