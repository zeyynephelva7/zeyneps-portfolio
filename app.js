const root = document.documentElement;
const cover = document.querySelector("#cover");
const about = document.querySelector("#about");
const coverBtn = document.querySelector("#coverBtn");
const snapBtn = document.querySelector("#snapBtn");
const blankPage = document.querySelector("#blankPage");

let startY = 0;
let dragging = false;
let coverOpen = false;
let coverLeft = false;
let photoTaken = false;

function setOpen(value) {
  root.style.setProperty("--open", value.toFixed(2));
}

function openCover() {
  if (coverOpen) return;
  coverOpen = true;
  document.body.classList.add("open");
  setOpen(1);
  setTimeout(() => about.scrollIntoView({ behavior: "smooth" }), 760);
}

function resetCover() {
  coverOpen = false;
  dragging = false;
  document.body.classList.remove("open");
  setOpen(0);
}

function stopEarlyScroll(event) {
  const goingDown = event.type !== "wheel" || event.deltaY > 0;
  const onFirstPage = window.scrollY < window.innerHeight * .85;
  const onAboutPage = window.scrollY < window.innerHeight * 1.85;

  if ((!coverOpen && onFirstPage && goingDown) || (coverOpen && !photoTaken && onAboutPage && goingDown)) {
    event.preventDefault();
  }
}

function keepLockedPagesInPlace() {
  if (!coverOpen && window.scrollY > 0) {
    window.scrollTo(0, 0);
  }

  if (coverOpen && !photoTaken && window.scrollY > window.innerHeight) {
    window.scrollTo(0, window.innerHeight);
  }
}

function stopLockedKeys(event) {
  const lockedKeys = ["ArrowDown", "PageDown", " ", "Spacebar", "End"];
  if (lockedKeys.includes(event.key) && (!coverOpen || !photoTaken)) {
    event.preventDefault();
  }
}

window.addEventListener("wheel", stopEarlyScroll, { passive: false });
window.addEventListener("touchmove", stopEarlyScroll, { passive: false });
window.addEventListener("scroll", keepLockedPagesInPlace, { passive: true });
window.addEventListener("keydown", stopLockedKeys);

coverBtn.addEventListener("pointerdown", (event) => {
  dragging = true;
  startY = event.clientY;
  coverBtn.setPointerCapture(event.pointerId);
});

coverBtn.addEventListener("pointermove", (event) => {
  if (!dragging || coverOpen) return;
  const amount = Math.min(Math.max(0, startY - event.clientY) / 220, 1);
  setOpen(amount);
  if (amount > .82) openCover();
});

coverBtn.addEventListener("pointerup", () => {
  if (!dragging || coverOpen) return;
  dragging = false;
  const amount = parseFloat(getComputedStyle(root).getPropertyValue("--open")) || 0;
  amount > .55 ? openCover() : setOpen(0);
});

coverBtn.addEventListener("click", openCover);

snapBtn.addEventListener("click", () => {
  photoTaken = true;
  snapBtn.animate([{ transform: "scale(1)" }, { transform: "scale(.94)" }, { transform: "scale(1)" }], {
    duration: 300,
    easing: "ease-out"
  });
  setTimeout(() => blankPage.scrollIntoView({ behavior: "smooth" }), 420);
});

new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) {
    coverLeft = true;
  } else if (coverLeft) {
    coverLeft = false;
    resetCover();
  }
}, { threshold: .34 }).observe(cover);
