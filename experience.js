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

const phase1 = document.getElementById("phase1");
const phase2 = document.getElementById("phase2");
const phase3 = document.getElementById("phase3");
const video2 = document.getElementById("video2");
const video3 = document.getElementById("video3");
const playOverlay2 = document.getElementById("playOverlay2");
const playOverlay3 = document.getElementById("playOverlay3");

// Charger la premiere frame des videos au demarrage
video2.addEventListener("loadeddata", () => {
  video2.currentTime = 0.01;
});
video3.addEventListener("loadeddata", () => {
  video3.currentTime = 0.01;
});

// Forcer le chargement
video2.load();
video3.load();

const clickSound = new Audio();
clickSound.src = "water-fountain-healing-music-239455.mp3.mkv.mp3";

// Fonction pour charger et initialiser CABLES (patch.js)
function loadCablesPatch() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "js/patch.js";
    script.async = true;
    script.onload = () => {
      console.log("[v0] patch.js script loaded");

      if (!window.CABLES || !window.CABLES.exportedPatch) {
        console.error("CABLES ou exportedPatch non trouvé !");
        return;
      }

      CABLES.patch = new CABLES.Patch({
        patch: CABLES.exportedPatch,
        prefixAssetPath: "",
        assetPath: "assets/",
        jsPath: "js/",
        glCanvasId: "glcanvas",
        glCanvasResizeToWindow: true,
        onError: function(initiator, ...args) {
          console.error("[CABLES Error]", initiator, ...args);
        },
        canvas: { alpha: true, premultipliedAlpha: true }
      });
      console.log("[v0] CABLES.patch created");

      document.getElementById("glcanvas").addEventListener("touchmove", (e) => {
        e.preventDefault();
      }, false);

      resolve();
    };
    script.onerror = (e) => {
      console.error("[v0] patch.js failed to load", e);
    };
    document.body.appendChild(script);
    console.log("[v0] patch.js script added to DOM");
  });
}

// START BUTTON
startBtn.addEventListener("click", () => {
  console.log("[v0] Start button clicked");
  clickSound.play();
  fade.classList.add("active");

  // Charger CABLES seulement au click
  loadCablesPatch().then(() => {
    console.log("[v0] loadCablesPatch promise fulfilled, waiting 1500ms...");
    setTimeout(() => {
      console.log("[v0] Activating phase 1");
      home.style.display = "none";
      fade.classList.remove("active");
      music.play();
      phase1.classList.add("active");
      console.log("[v0] Phase 1 activated");
    }, 1500);
  });
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
    stopPhase1Completely();  // <== stoppe tout ce qui tourne en phase 1

    enterPhase2();
  }

  if (phase === 3) {
    enterPhase3();
  }
}


function enterPhase2() {
  console.log("Entree dans la phase 2");

  fade.classList.add("active");

  setTimeout(() => {
    phase1.classList.remove("active");
    phase2.classList.add("active");
    fade.classList.remove("active");

    // Afficher l'overlay et attendre le click
    playOverlay2.classList.remove("hidden");

    playOverlay2.addEventListener("click", () => {
      playOverlay2.classList.add("hidden");
      video2.play();
    }, { once: true });

    // When video ends, go to next phase
    video2.addEventListener("ended", () => {
      goToNextPhase();
    }, { once: true });
  }, 1500);
}

function enterPhase3() {
  console.log("Entree dans la phase 3");

  fade.classList.add("active");

  setTimeout(() => {
    phase2.classList.remove("active");
    phase3.classList.add("active");
    fade.classList.remove("active");

    // Afficher l'overlay et attendre le click
    playOverlay3.classList.remove("hidden");

    playOverlay3.addEventListener("click", () => {
      playOverlay3.classList.add("hidden");
      video3.play();
    }, { once: true });

    // When video ends, show thanks screen
    video3.addEventListener("ended", () => {
      showThanks();
    }, { once: true });
  }, 1500);
}

function updateLoaderPosition(e) {
  loader.style.right = "20px";
  loader.style.top = `${e.clientY - 40}px`;
}

function showThanks() {
  fade.classList.add("active");
  setTimeout(() => {
    phase3.classList.remove("active");
    thanks.classList.add("active");
    fade.classList.remove("active");
    music.pause();
  }, 1500);
}

// STORY MODAL
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


function stopPhase1Completely() {
  // 1. Supprimer le canvas (ou juste le cacher)
  const canvas = document.getElementById("glcanvas");
  if (canvas) {
    canvas.remove();  // supprime le canvas du DOM
    console.log("[v0] Canvas phase1 removed from DOM");
  }

  // 2. Supprimer la référence au patch
  if (CABLES.patch) {
    if (typeof CABLES.patch.destroy === "function") {
      CABLES.patch.destroy();
      console.log("[v0] CABLES.patch.destroy() called");
    }
    CABLES.patch = null;
  }

  // 3. Supprimer le script patch.js
  const patchScript = document.querySelector('script[src="js/patch.js"]');
  if (patchScript) {
    patchScript.remove();
    console.log("[v0] patch.js script removed from DOM");
  }

  // 4. Cacher phase1 (au cas où)
  const phase1Div = document.getElementById("phase1");
  if (phase1Div) {
    phase1Div.classList.remove("active");
  }
}
