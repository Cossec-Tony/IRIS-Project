let phase = 1;

let isInEdge = false;
let edgeStartTime = null;
const EDGE_DELAY = 5000;

const loader = document.getElementById("edgeLoader");


const startBtn = document.getElementById("startBtn");
const home = document.getElementById("home");
const fade = document.getElementById("fade");
const music = document.getElementById("bgMusic");
const thanks = document.getElementById("thanks");

const clickSound = new Audio();
clickSound.src = "water-fountain-healing-music-239455.mp3.mkv.mp3"; // simple reuse or replace by click

startBtn.addEventListener("click", () => {
  clickSound.play();

  fade.classList.add("active");

  setTimeout(() => {
    home.style.display = "none";
    fade.classList.remove("active");
    music.play();
  }, 1500);
});

// EDGE DETECTION
window.addEventListener("mousemove", (e) => {
  const edgeZone = 80;
  const isRightEdge = e.clientX >= window.innerWidth - edgeZone;

  if (isRightEdge) {
    if (!isInEdge) {
      isInEdge = true;
      edgeStartTime = performance.now();
      loader.classList.add("loading");
      updateLoaderPosition(e);
      requestAnimationFrame(checkEdgeProgress);
    } else {
      updateLoaderPosition(e);
    }
  } else {
    resetEdge();
  }
});

function checkEdgeProgress(timestamp) {
  if (!isInEdge || !edgeStartTime) return;

  const elapsed = timestamp - edgeStartTime;
  const progress = Math.min(elapsed / EDGE_DELAY, 1);

  const angle = progress * 360;

  loader.style.background = `
    conic-gradient(
      white ${angle}deg,
      rgba(255,255,255,0.15) ${angle}deg
    )
  `;

  if (progress >= 1) {
    resetEdge();
    goToNextPhase();
    return;
  }

  requestAnimationFrame(checkEdgeProgress);
}


function resetEdge() {
  isInEdge = false;
  edgeStartTime = null;
  loader.classList.remove("loading");

  loader.style.background = `
    conic-gradient(
      white 0deg,
      rgba(255,255,255,0.15) 0deg
    )
  `;
}

function goToNextPhase() {
  phase++;

  console.log("PHASE ACTUELLE :", phase);

  if (phase === 2) {
    enterPhase2();
  }

  if (phase === 3) {
    enterPhase3();
  }
}

function enterPhase2() {
  console.log("Entrée dans la phase 2");

  const fade = document.getElementById("fade");
  fade.classList.add("active");

  setTimeout(() => {
    fade.classList.remove("active");

    // ici plus tard :
    // – changer patch CableGL
    // – changer musique
    // – changer mapping
  }, 1500);
}

function updateLoaderPosition(e) {
  loader.style.right = "20px";
  loader.style.top = `${e.clientY - 40}px`;
}


function showThanks() {
  fade.classList.add("active");
  setTimeout(() => {
    thanks.classList.add("active");
    fade.classList.remove("active");
    music.pause();
  }, 1500);
}


const story = document.getElementById("story");
const openStory = document.getElementById("openStory");
const closeStory = document.getElementById("closeStory");

openStory.addEventListener("click", (e) => {
  e.preventDefault();
  story.classList.add("active");
});

closeStory.addEventListener("click", () => {
  story.classList.remove("active");
});
