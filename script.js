const pages = [
  { code: "P300", title: "Punto de partida", category: "IDENTIDAD / ORIGEN" },
  { code: "P301", title: "Coordenadas propias", category: "LENGUA / TERRITORIO" },
  { code: "P302", title: "Archivo de memoria", category: "MEMORIA / DETALLE" },
  { code: "P303", title: "Un lenguaje propio", category: "VOZ / EXPRESIÓN" },
  { code: "P304", title: "Líneas invisibles", category: "VÍNCULOS / MAPA" },
  { code: "P305", title: "Deriva consciente", category: "CAMBIO / RUMBO" },
  { code: "P306", title: "Un horizonte abierto", category: "FUTURO / POSIBILIDAD" },
];

const track = document.querySelector("[data-carousel-track]");
const stage = document.querySelector("[data-carousel-stage]");
const counter = document.querySelector(".carousel-counter");
const progress = document.querySelector("[data-progress]");
const previousButton = document.querySelector("[data-previous]");
const nextButton = document.querySelector("[data-next]");
const rotationButton = document.querySelector("[data-toggle-rotation]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentIndex = 0;
let autoplayId;
let pointerStartX = null;
let rotationPaused = false;

function createCards() {
  track.innerHTML = pages.map((page, index) => `
    <button
      class="exercise-card"
      type="button"
      data-page-index="${index}"
      aria-label="${page.code}: ${page.title}. Ejercicio próximamente"
    >
      <span class="exercise-meta"><span>${page.category}</span><span>0${index + 1} / 07</span></span>
      <span class="exercise-number" aria-hidden="true">${page.code}</span>
      <span class="exercise-name">${page.title}</span>
      <span class="exercise-action">EJERCICIO EN PREPARACIÓN <span aria-hidden="true">↗</span></span>
    </button>
  `).join("");
}

function updateCarousel() {
  const halfLength = Math.floor(pages.length / 2);

  track.querySelectorAll(".exercise-card").forEach((card, index) => {
    let relativePosition = (index - currentIndex + pages.length) % pages.length;
    if (relativePosition > halfLength) relativePosition -= pages.length;

    const isVisible = Math.abs(relativePosition) <= 1;
    card.dataset.position = isVisible ? String(relativePosition) : "hidden";
    card.tabIndex = isVisible ? 0 : -1;
    card.setAttribute("aria-hidden", String(!isVisible));
  });

  counter.innerHTML = `${String(currentIndex + 1).padStart(2, "0")} <i>/</i> ${String(pages.length).padStart(2, "0")}`;
  progress.style.transform = `scaleX(${(currentIndex + 1) / pages.length})`;
}

function showPage(direction) {
  currentIndex = (currentIndex + direction + pages.length) % pages.length;
  updateCarousel();
}

function stopAutoplay() {
  window.clearInterval(autoplayId);
}

function startAutoplay() {
  stopAutoplay();
  if (rotationPaused || reducedMotion.matches || document.hidden) return;
  autoplayId = window.setInterval(() => showPage(1), 5200);
}

createCards();
updateCarousel();
startAutoplay();

previousButton.addEventListener("click", () => {
  showPage(-1);
  startAutoplay();
});

nextButton.addEventListener("click", () => {
  showPage(1);
  startAutoplay();
});

rotationButton.addEventListener("click", () => {
  rotationPaused = !rotationPaused;
  rotationButton.setAttribute("aria-pressed", String(rotationPaused));
  rotationButton.setAttribute("aria-label", rotationPaused ? "Reanudar rotación" : "Pausar rotación");
  startAutoplay();
});

stage.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  pointerStartX = event.clientX;
});

stage.addEventListener("pointerup", (event) => {
  if (pointerStartX === null) return;
  const distance = event.clientX - pointerStartX;
  pointerStartX = null;
  if (Math.abs(distance) < 45) return;
  showPage(distance < 0 ? 1 : -1);
  startAutoplay();
});

stage.addEventListener("pointercancel", () => {
  pointerStartX = null;
});

stage.addEventListener("mouseenter", stopAutoplay);
stage.addEventListener("mouseleave", startAutoplay);
stage.addEventListener("focusin", stopAutoplay);
stage.addEventListener("focusout", (event) => {
  if (!stage.contains(event.relatedTarget)) startAutoplay();
});

document.addEventListener("visibilitychange", startAutoplay);
reducedMotion.addEventListener("change", startAutoplay);
