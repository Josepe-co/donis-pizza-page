/* ============================================================
   DONI'S PIZZA – SCRIPT.JS
   ============================================================ */

/* ---- NUMERO DE WHATSAPP ----------------------------------- */
// Cambia este número por el número real de Doni's Pizza
// Formato: código de país + número sin espacios ni guiones
// Ejemplo México: 529XXXXXXXXX (52 = México, luego el número)
const WA_NUMBER = "529631403622";

/* ---- DATOS DEL MENÚ --------------------------------------- */
const menuPizzas = {
  "Pepperoni":    { price12: 190, price24: 350 },
  "Mexicana":     { price12: 190, price24: 350 },
  "Ala Diabla":   { price12: 190, price24: 350 },
  "Choriqueso":   { price12: 190, price24: 350 },
  "Hawaiana":     { price12: 190, price24: 350 },
  "Champiñones":  { price12: 190, price24: 350 },
};

/* ============================================================
   NAVBAR – scroll effect
   ============================================================ */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* ============================================================
   NAVBAR – mobile toggle
   ============================================================ */
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  // Animar hamburguesa → X
  const spans = navToggle.querySelectorAll("span");
  if (navLinks.classList.contains("open")) {
    spans[0].style.transform = "translateY(7px) rotate(45deg)";
    spans[1].style.opacity = "0";
    spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
  } else {
    spans[0].style.transform = "";
    spans[1].style.opacity = "";
    spans[2].style.transform = "";
  }
});

// Cerrar menú al hacer clic en un link
navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    const spans = navToggle.querySelectorAll("span");
    spans[0].style.transform = "";
    spans[1].style.opacity = "";
    spans[2].style.transform = "";
  });
});

/* ============================================================
   SIZE TABS – actualizar precios en las tarjetas
   ============================================================ */
let currentSize = 12; // tamaño seleccionado en la sección menú

document.querySelectorAll(".size-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".size-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentSize = parseInt(tab.dataset.size);
    updateCardPrices();
  });
});

function updateCardPrices() {
  document.querySelectorAll(".pizza-card").forEach(card => {
    const name = card.dataset.name;
    const data = menuPizzas[name];
    if (!data) return;
    const price = currentSize === 12 ? data.price12 : data.price24;
    const priceEl = card.querySelector(".card-price");
    if (priceEl) priceEl.textContent = `$${price}`;
  });
}

/* ============================================================
   MODAL – abrir / cerrar
   ============================================================ */
let currentPizza = "";

function openOrderModal(pizzaName) {
  currentPizza = pizzaName;
  const data = menuPizzas[pizzaName];
  if (!data) return;

  document.getElementById("modalPizzaName").textContent = `Pizza ${pizzaName}`;
  document.getElementById("modalPrice12").textContent = `$${data.price12}`;
  document.getElementById("modalPrice24").textContent = `$${data.price24}`;

  // Resetear selecciones
  document.getElementById("radio12").checked    = true;
  document.getElementById("radioDom").checked   = true;
  document.getElementById("addressInput").value = "";
  document.getElementById("notesInput").value   = "";
  document.getElementById("addressGroup").style.display = "block";

  updateModalPrice();

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeOrderModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

// Cerrar al hacer clic en el overlay (fuera del modal)
function closeModal(event) {
  if (event.target === document.getElementById("modalOverlay")) {
    closeOrderModal();
  }
}

// Cerrar con ESC
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeOrderModal();
});

/* ============================================================
   MODAL – actualizar precio total
   ============================================================ */
function updateModalPrice() {
  const data = menuPizzas[currentPizza];
  if (!data) return;

  const size     = document.querySelector('input[name="modalSize"]:checked').value;
  const delivery = document.querySelector('input[name="modalDelivery"]:checked').value;
  const isHome   = delivery === "domicilio";

  const basePrice  = size === "12" ? data.price12 : data.price24;
  const totalPrice = isHome ? basePrice + 15 : basePrice;

  document.getElementById("modalTotalPrice").textContent = `$${totalPrice}`;

  // Mostrar/ocultar campo dirección
  document.getElementById("addressGroup").style.display = isHome ? "block" : "none";
}

/* ============================================================
   WHATSAPP – generar mensaje y abrir chat
   ============================================================ */
function sendWhatsApp() {
  const data = menuPizzas[currentPizza];
  if (!data) return;

  const sizeRadio  = document.querySelector('input[name="modalSize"]:checked').value;
  const delivery   = document.querySelector('input[name="modalDelivery"]:checked').value;
  const isHome     = delivery === "domicilio";
  const address    = document.getElementById("addressInput").value.trim();
  const notes      = document.getElementById("notesInput").value.trim();
  const basePrice  = sizeRadio === "12" ? data.price12 : data.price24;
  const totalPrice = isHome ? basePrice + 15 : basePrice;
  const slices     = sizeRadio === "12" ? "12 rebanadas" : "24 rebanadas";

  // Validar dirección si es domicilio
  if (isHome && !address) {
    highlightInput("addressInput");
    alert("Por favor ingresa tu dirección para el envío a domicilio. 📍");
    return;
  }

  let message = "";

  if (isHome) {
    message =
      `¡Hola Doni's Pizza! 🍕 Quiero pedir una pizza *${currentPizza}* de *${slices}* ($${basePrice}) ` +
      `con envío a domicilio (+$15).\n\n` +
      `📍 *Mi dirección es:* ${address}\n` +
      `💰 *Total:* $${totalPrice}`;
  } else {
    message =
      `¡Hola Doni's Pizza! 🍕 Quiero pedir una pizza *${currentPizza}* de *${slices}* ($${basePrice}) ` +
      `para *recoger en el local*.\n\n` +
      `💰 *Total:* $${totalPrice}`;
  }

  if (notes) {
    message += `\n\n📝 *Notas:* ${notes}`;
  }

  const encodedMsg = encodeURIComponent(message);
  const url        = `https://wa.me/${WA_NUMBER}?text=${encodedMsg}`;

  window.open(url, "_blank");
  closeOrderModal();
}

/* ============================================================
   HELPER – resaltar input con error
   ============================================================ */
function highlightInput(id) {
  const el = document.getElementById(id);
  el.style.borderColor = "var(--red)";
  el.focus();
  el.addEventListener("input", () => {
    el.style.borderColor = "";
  }, { once: true });
}

/* ============================================================
   ANIMACIONES DE ENTRADA – Intersection Observer
   ============================================================ */
const observerOptions = {
  threshold: 0.12,
  rootMargin: "0px 0px -40px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Agregar clase fade-in a elementos y observarlos
function initFadeIn() {
  const selectors = [
    ".pizza-card",
    ".contact-card",
    ".about-text",
    ".about-img-wrap",
    ".section-header",
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add("fade-in");
      el.style.transitionDelay = `${i * 0.08}s`;
      observer.observe(el);
    });
  });
}

/* ---- CSS dinámico para fade-in ---- */
const style = document.createElement("style");
style.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);

/* ============================================================
   INICIALIZAR
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initFadeIn();
  updateCardPrices();
});
