let phase = 0;

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

let phase2VideoFinished = false;
let phase3VideoFinished = false;
let eggSystemActive = false;


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

  loadCablesPatch().then(() => {
    console.log("[v0] loadCablesPatch promise fulfilled, waiting 1500ms...");
    setTimeout(() => {
      console.log("[v0] Activating phase 1");
      home.style.display = "none";
      fade.classList.remove("active");
      music.play();
      phase = 1;          
      updatePhaseMessage(); 
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
  if (phase === 2 && !phase2VideoFinished) return;
  if (phase === 3 && !phase3VideoFinished) return;

  phase++;

  console.log("PHASE ACTUELLE :", phase);

  if (phase === 2) {
    stopPhase1Completely();
    enterPhase2();
  }
  else if (phase === 3) {
    enterPhase3();
  }
  else if (phase === 4) {
    showThanks();
  }
}



function enterPhase2() {
  console.log("Entree dans la phase 2");

  fade.classList.add("active");

  video2.currentTime = 0;
  video2.play();

  video2.onended = () => {
    console.log("[PHASE 2] video finished");
    phase2VideoFinished = true;
  };


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
  }, 1500);
}

function enterPhase3() {
  console.log("Entree dans la phase 3");

  eggSystemActive = true;
  restoreEggs();
  updateEggs();

  playOverlay3.addEventListener("click", () => {
  playOverlay3.classList.add("hidden");
  video3.play();

    eggSpawned = false;          // reset sécurité
    watchEggSpawnDuringVideo(); // 🥚 démarre ICI
  }, { once: true });

  fade.classList.add("active");

  video3.currentTime = 0;
  video3.play();

  video3.onended = () => {
    console.log("[PHASE 3] video finished");
    phase3VideoFinished = true;
  };


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

  }, 1500);
}

function updateLoaderPosition(e) {
  loader.style.right = "20px";
  loader.style.top = `${e.clientY - 40}px`;
}

function showThanks() {
  eggSystemActive = false;
  fade.classList.add("active");
  setTimeout(() => {
    phase3.classList.remove("active");
    thanks.classList.add("active");
    fade.classList.remove("active");
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





















const eggLayer = document.getElementById("eggLayer");

const WATER_GRAVITY = 0.08;   
const AIR_DRAG = 0.985;      
const BOUNCE = 0.18;      

const eggs = [];
const FLOOR_Y = () => window.innerHeight - 100;


let eggSpawned = false;


class Egg {

  constructor(x, y = window.innerHeight / 2, settled = false) {
    this.x = x;
    this.y = y;

    this.vx = (Math.random() - 0.5) * 1.2; // dérive latérale
    this.vy = settled ? 0 : Math.random() * 1.5;

    this.size = 15;
    this.settled = settled;

    this.el = document.createElement("img");
    this.el.src = "./assets/OeufSaumon.png";
    this.el.className = "egg";
    this.el.style.width = this.size + "px";

    this.floatPhase = Math.random() * Math.PI * 2;

    eggLayer.appendChild(this.el);

    this.render();
  }

  render() {
    this.el.style.transform =
      `translate(${this.x}px, ${this.y}px)`;
  }

  update() {
    if (this.settled) return;

    this.vy += WATER_GRAVITY;
    this.vx *= AIR_DRAG;
    this.vy *= AIR_DRAG;

    this.x += this.vx;
    this.y += this.vy;

    // sol
    if (this.y + this.size >= FLOOR_Y()) {
      this.y = FLOOR_Y() - this.size;
      this.vy *= -BOUNCE;

      if (Math.abs(this.vy) < 0.15) {
        this.vy = 0;
        this.settled = true;
      }
    }

    // dérive d'eau
    this.floatPhase += 0.02;
    this.vx += Math.sin(this.floatPhase) * 0.02;


    this.checkCollisions();
    this.render();
  }

checkCollisions() {
  for (const other of eggs) {
    if (other === this || !other.settled) continue;

    const leftA = this.x;
    const rightA = this.x + this.size;
    const topA = this.y;
    const bottomA = this.y + this.size;

    const leftB = other.x;
    const rightB = other.x + other.size;
    const topB = other.y;
    const bottomB = other.y + other.size;

    const overlapX = rightA > leftB && leftA < rightB;
    const overlapY = bottomA > topB && topA < bottomB;

    if (overlapX && overlapY) {
      // Décalage vertical (à ajuster)
      const verticalOffset = 2; 

      this.y = other.y - this.size + verticalOffset;  // Ajuste verticalOffset selon besoin
      this.vy = 0;
      this.vx *= 0.9;
      this.settled = true;

      if (Math.abs((this.x + this.size / 2) - (other.x + other.size / 2)) < 5) {
        this.x += (Math.random() - 0.5) * 4;
      }
      break;
    }
  }
}



}


function updateEggs() {
  if (!eggSystemActive) return;

  eggs.forEach(e => e.update());
  requestAnimationFrame(updateEggs);
}


function spawnEgg() {
  const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
  const y = window.innerHeight / 2;  // milieu vertical

  const egg = new Egg(x, y);
  eggs.push(egg);
}



function restoreEggs() {
  const count = parseInt(localStorage.getItem("eggCount") || "0");

  for (let i = 0; i < count; i++) {
    const x =
      window.innerWidth / 2 +
      (Math.random() - 0.5) * 300;

    const egg = new Egg(x, FLOOR_Y() - 90, true);
    eggs.push(egg);
  }
}


function spawnEggs() {
  let count = parseInt(localStorage.getItem("eggCount") || "0");
  count++;
  localStorage.setItem("eggCount", count);

  spawnEgg();
}

function watchEggSpawnDuringVideo() {
  const triggerTime = video3.duration * 0.5;

  function onTimeUpdate() {
    if (!eggSpawned && video3.currentTime >= triggerTime) {
      eggSpawned = true;
      spawnEggs();
      video3.removeEventListener("timeupdate", onTimeUpdate);
    }
  }

  video3.addEventListener("timeupdate", onTimeUpdate);
}



const returnMenuBtn = document.getElementById("returnMenuBtn");

if (returnMenuBtn) {
  returnMenuBtn.addEventListener("click", () => {
    location.reload();
  });
}






function updatePhaseMessage() {
  const message = document.getElementById("phaseMessage");
  if (phase >= 1 && phase <= 3) {
    message.style.display = "block";
  } else {
    message.style.display = "none";
  }
}

// Appelle cette fonction à chaque changement de phase, par exemple dans goToNextPhase()

// Au démarrage (avant phase 1), appelle-la aussi pour cacher le message :
updatePhaseMessage();


// Appelle cette fonction chaque fois que tu changes de phase :
function goToNextPhase() {
  if (phase === 2 && !phase2VideoFinished) return;
  if (phase === 3 && !phase3VideoFinished) return;

  phase++;

  console.log("PHASE ACTUELLE :", phase);

  updatePhaseMessage();  // <-- ici

  if (phase === 2) {
    stopPhase1Completely();
    enterPhase2();
  }
  else if (phase === 3) {
    enterPhase3();
  }
  else if (phase === 4) {
    showThanks();
  }
}



