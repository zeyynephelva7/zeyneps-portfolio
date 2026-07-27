const root = document.documentElement;
const cover = document.querySelector("#cover");
const coverBtn = document.querySelector("#coverBtn");
const blankPage = document.querySelector("#blankPage");

let startY = 0;
let isDragging = false;
let isOpen = false;
let hasLeftCover = false;

function setOpen(amount) {
  root.style.setProperty("--open", amount.toFixed(2));
}

function openCover() {
  if (isOpen) return;
  isOpen = true;
  document.body.classList.add("open");
  setOpen(1);
  setTimeout(() => blankPage.scrollIntoView({ behavior: "smooth" }), 760);
}

function resetCover() {
  isOpen = false;
  isDragging = false;
  document.body.classList.remove("open");
  setOpen(0);
}

function blockClosedCoverScroll(event) {
  const coverBox = cover.getBoundingClientRect();
  const coverIsVisible = coverBox.top > -8 && coverBox.bottom > window.innerHeight * .7;

  if (!isOpen && coverIsVisible) {
    event.preventDefault();
  }
}

window.addEventListener("wheel", blockClosedCoverScroll, { passive: false });
window.addEventListener("touchmove", blockClosedCoverScroll, { passive: false });

coverBtn.addEventListener("pointerdown", (event) => {
  isDragging = true;
  startY = event.clientY;
  coverBtn.setPointerCapture(event.pointerId);
});

coverBtn.addEventListener("pointermove", (event) => {
  if (!isDragging || isOpen) return;
  const amount = Math.min(Math.max((startY - event.clientY) / 220, 0), 1);
  setOpen(amount);
  if (amount > .82) openCover();
});

coverBtn.addEventListener("pointerup", () => {
  if (!isDragging || isOpen) return;
  isDragging = false;
  const amount = parseFloat(getComputedStyle(root).getPropertyValue("--open")) || 0;
  amount > .55 ? openCover() : setOpen(0);
});

coverBtn.addEventListener("click", openCover);

new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) {
    hasLeftCover = true;
  } else if (hasLeftCover) {
    hasLeftCover = false;
    resetCover();
  }
}, { threshold: .34 }).observe(cover);
