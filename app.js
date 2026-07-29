const root = document.documentElement;
const body = document.body;
const cover = document.querySelector("#cover");
const about = document.querySelector("#about");
const coverBtn = document.querySelector("#coverBtn");
const snapBtn = document.querySelector("#snapBtn");
const stagePage = document.querySelector("#stagePage");
const stage = document.querySelector("#stage");
const modeBtn = document.querySelector("#modeBtn");
const lightBtn = document.querySelector("#lightBtn");
const toast = document.querySelector("#toast");

let startY = 0;
let dragging = false;
let coverOpen = false;
let coverLeft = false;
let photoTaken = false;
let mode = 0;

const looks = [
  ["character-1.png", "sport mode"],
  ["character-2.png", "formal mode"],
  ["character-3.png", "sleep mode"]
];

function setOpen(value) {
  root.style.setProperty("--open", value.toFixed(2));
}

function openCover() {
  if (coverOpen) return;
  coverOpen = true;
  body.classList.add("open");
  setOpen(1);
  setTimeout(() => about.scrollIntoView({ behavior: "smooth" }), 760);
}

function resetCover() {
  coverOpen = false;
  dragging = false;
  body.classList.remove("open");
  setOpen(0);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("on");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("on"), 1500);
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
  setTimeout(() => stagePage.scrollIntoView({ behavior: "smooth" }), 420);
});

modeBtn.addEventListener("click", () => {
  mode = (mode + 1) % looks.length;
  root.style.setProperty("--stage-photo", `url("${looks[mode][0]}")`);
  showToast(looks[mode][1]);
});

lightBtn.addEventListener("click", () => {
  stage.classList.toggle("dark");
  showToast(stage.classList.contains("dark") ? "light off" : "light on");
});

const watcher = new IntersectionObserver((items) => {
  items.forEach((item) => {
    item.target.classList.toggle("show", item.isIntersecting);

    if (item.target === cover) {
      if (!item.isIntersecting) coverLeft = true;
      if (item.isIntersecting && coverLeft) resetCover();
    }
  });
}, { threshold: .34 });

watcher.observe(cover);
watcher.observe(stagePage);

function moveStageLight() {
  const box = stagePage.getBoundingClientRect();
  const scrollRoom = Math.max(1, box.height - window.innerHeight);
  const amount = Math.min(Math.max(-box.top / scrollRoom, 0), 1);
  root.style.setProperty("--light", amount.toFixed(3));
}

moveStageLight();
window.addEventListener("scroll", moveStageLight, { passive: true });
window.addEventListener("resize", moveStageLight);
