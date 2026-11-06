/**
 * Le Black & White (Bouaké · 1986)
 * Bespoke Three.js 3D Sculptural Centerpiece for Chapitre I.
 *
 * Models the house's iconic Black Volcanic Basalt Pierrade & 1986 Noir/Ivoire
 * Brushed-Brass Heritage Medallion on a chamfered Iroko wood plinth, with
 * procedural cellular stone micro-relief, warm woodfire key light, and subtle
 * rising ember motes.
 *
 * Strictly obeys Scrollcraft & Approved Collection §3-4 rules:
 *  - Zero external texture fetches (procedural offscreen canvases only)
 *  - Pixel ratio capped at 2
 *  - Pauses rendering completely when offscreen or document hidden
 *  - Respects prefers-reduced-motion (renders one crisp still frame, then halts)
 *  - Never locks or captures native pointer
 *  - Exposes window.__bwCapture3DPoster() for generating exact fallback posters
 */
import * as THREE from "./vendor/three.module.js";

function createBasaltTextures() {
  const size = 512;
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext("2d");

  const roughCanvas = document.createElement("canvas");
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rctx = roughCanvas.getContext("2d");

  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, size, size);
  rctx.fillStyle = "#c8c8c8";
  rctx.fillRect(0, 0, size, size);

  // Deterministic pseudo-random generator so every load looks identical
  let seed = 198607;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Fine mineral grain + volcanic basalt pores
  for (let i = 0; i < 4200; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 0.6 + rand() * 2.4;
    const dark = rand() > 0.35;
    const v = dark ? Math.floor(28 + rand() * 55) : Math.floor(145 + rand() * 55);
    bctx.fillStyle = `rgba(${v},${v},${v},${(0.18 + rand() * 0.32).toFixed(2)})`;
    bctx.beginPath();
    bctx.arc(x, y, r, 0, Math.PI * 2);
    bctx.fill();

    const rv = Math.floor(155 + rand() * 85);
    rctx.fillStyle = `rgba(${rv},${rv},${rv},0.22)`;
    rctx.beginPath();
    rctx.arc(x, y, r * 1.2, 0, Math.PI * 2);
    rctx.fill();
  }

  // Subtle mineral veins
  bctx.strokeStyle = "rgba(195,195,195,0.09)";
  bctx.lineWidth = 1.1;
  for (let k = 0; k < 18; k++) {
    bctx.beginPath();
    let vx = rand() * size;
    let vy = rand() * size;
    bctx.moveTo(vx, vy);
    for (let s = 0; s < 6; s++) {
      vx += (rand() - 0.5) * 90;
      vy += (rand() - 0.5) * 90;
      bctx.lineTo(vx, vy);
    }
    bctx.stroke();
  }

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(2.2, 2.2);

  const roughTex = new THREE.CanvasTexture(roughCanvas);
  roughTex.wrapS = THREE.RepeatWrapping;
  roughTex.wrapT = THREE.RepeatWrapping;
  roughTex.repeat.set(2.2, 2.2);

  return { bumpTex, roughTex };
}

function createWoodTexture() {
  const w = 512;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#2b1911";
  ctx.fillRect(0, 0, w, h);

  let seed = 8619;
  const rand = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let y = 0; y < h; y += 2) {
    const tone = 24 + Math.sin(y * 0.065) * 8 + (rand() - 0.5) * 7;
    const r = Math.max(12, Math.min(68, Math.round(tone * 1.55)));
    const g = Math.max(8, Math.min(44, Math.round(tone * 0.92)));
    const b = Math.max(6, Math.min(30, Math.round(tone * 0.62)));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, w, 2);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createDialTexture() {
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  const cx = size / 2;
  const cy = size / 2;
  const rad = size * 0.46;

  ctx.clearRect(0, 0, size, size);

  // Left half: Warm Bone Ivory (#F2EBE0)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rad, Math.PI * 0.5, Math.PI * 1.5, false);
  ctx.closePath();
  ctx.fillStyle = "#F2EBE0";
  ctx.fill();
  ctx.restore();

  // Right half: Deep Matte Basalt (#14110F)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rad, -Math.PI * 0.5, Math.PI * 0.5, false);
  ctx.closePath();
  ctx.fillStyle = "#14110F";
  ctx.fill();
  ctx.restore();

  // Fine inner editorial hairline rings
  ctx.strokeStyle = "#C89D54";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, rad - 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(200, 157, 84, 0.52)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, rad - 28, 0, Math.PI * 2);
  ctx.stroke();

  // Center vertical split seam in warm brass
  ctx.strokeStyle = "#C89D54";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - rad + 10);
  ctx.lineTo(cx, cy + rad - 10);
  ctx.stroke();

  // Apatam roof chevron across both halves
  ctx.strokeStyle = "#E05328";
  ctx.lineWidth = 14;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 190, cy - 32);
  ctx.lineTo(cx, cy - 150);
  ctx.lineTo(cx + 190, cy - 32);
  ctx.stroke();

  // Ember diamond at center
  ctx.fillStyle = "#E05328";
  ctx.beginPath();
  ctx.moveTo(cx, cy - 72);
  ctx.lineTo(cx + 34, cy + 4);
  ctx.lineTo(cx, cy + 80);
  ctx.lineTo(cx - 34, cy + 4);
  ctx.closePath();
  ctx.fill();

  // Heritage monogram B & W + 19 · 86
  ctx.font = "700 168px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#14110F";
  ctx.fillText("B", cx - 142, cy + 56);
  ctx.fillStyle = "#F2EBE0";
  ctx.fillText("W", cx + 146, cy + 56);

  ctx.font = "600 44px 'Plus Jakarta Sans', sans-serif";
  ctx.fillStyle = "#2B241E";
  ctx.fillText("19", cx - 115, cy + 210);
  ctx.fillStyle = "#D9CFC1";
  ctx.fillText("86", cx + 115, cy + 210);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createEmberSprite() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(255, 214, 150, 1)");
  g.addColorStop(0.35, "rgba(235, 98, 42, 0.82)");
  g.addColorStop(1, "rgba(235, 98, 42, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

export function mountHero3D(hostEl) {
  if (!hostEl) return null;
  const fallbackImg = hostEl.querySelector(".bw-hero-3d__fallback");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forceNoWebGL = new URLSearchParams(window.location.search).has("nowebgl");

  if (forceNoWebGL) {
    hostEl.classList.add("is-fallback");
    return null;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
  } catch {
    hostEl.classList.add("is-fallback");
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.domElement.className = "bw-hero-3d__canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  hostEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0.32, 1.55, 5.35);

  const root = new THREE.Group();
  scene.add(root);

  const { bumpTex, roughTex } = createBasaltTextures();
  const woodTex = createWoodTexture();
  const dialTex = createDialTexture();

  // 1. Chamfered Iroko Wood Plinth
  const woodGeo = new THREE.ExtrudeGeometry(roundedRectShape(3.08, 2.24, 0.26), {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.045,
    bevelSize: 0.045,
    bevelSegments: 4,
  });
  woodGeo.center();
  woodGeo.rotateX(-Math.PI / 2);
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.62,
    metalness: 0.06,
    bumpMap: bumpTex,
    bumpScale: 0.008,
  });
  const woodMesh = new THREE.Mesh(woodGeo, woodMat);
  woodMesh.position.y = -0.22;
  root.add(woodMesh);

  // 2. Recessed glowing ember channel between wood and volcanic stone
  const emberRimGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.74, 1.94, 0.2), {
    depth: 0.05,
    bevelEnabled: false,
  });
  emberRimGeo.center();
  emberRimGeo.rotateX(-Math.PI / 2);
  const emberRimMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#E85D2A"),
  });
  const emberRim = new THREE.Mesh(emberRimGeo, emberRimMat);
  emberRim.position.y = -0.09;
  root.add(emberRim);

  // 3. Thick Black Volcanic Basalt Pierrade Stone Slab
  const stoneGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.64, 1.84, 0.18), {
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 5,
  });
  stoneGeo.center();
  stoneGeo.rotateX(-Math.PI / 2);
  const stoneMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#181513"),
    roughness: 0.78,
    roughnessMap: roughTex,
    metalness: 0.12,
    bumpMap: bumpTex,
    bumpScale: 0.032,
  });
  const stoneMesh = new THREE.Mesh(stoneGeo, stoneMat);
  stoneMesh.position.y = 0.07;
  root.add(stoneMesh);

  // 4. Brushed Brass Bezel & Inlaid 1986 Noir-Ivoire Medallion
  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#D4A559"),
    metalness: 0.86,
    roughness: 0.27,
  });
  const ringGeo = new THREE.TorusGeometry(0.72, 0.038, 24, 96);
  ringGeo.rotateX(Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, brassMat);
  ringMesh.position.y = 0.245;
  root.add(ringMesh);

  // Two brass handles on the basalt slab sides
  const handleGeo = new THREE.TorusGeometry(0.16, 0.022, 14, 36, Math.PI);
  const handleLeft = new THREE.Mesh(handleGeo, brassMat);
  handleLeft.position.set(-1.38, 0.08, 0);
  handleLeft.rotation.set(Math.PI / 2, 0, Math.PI / 2);
  root.add(handleLeft);

  const handleRight = new THREE.Mesh(handleGeo, brassMat);
  handleRight.position.set(1.38, 0.08, 0);
  handleRight.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  root.add(handleRight);

  const dialGeo = new THREE.CylinderGeometry(0.705, 0.705, 0.025, 72);
  const dialSideMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2A221B"),
    roughness: 0.6,
    metalness: 0.2,
  });
  const dialTopMat = new THREE.MeshStandardMaterial({
    map: dialTex,
    roughness: 0.36,
    metalness: 0.14,
    bumpMap: bumpTex,
    bumpScale: 0.005,
  });
  const dialMesh = new THREE.Mesh(dialGeo, [dialSideMat, dialTopMat, dialSideMat]);
  dialMesh.position.y = 0.238;
  dialMesh.rotation.y = Math.PI / 2;
  root.add(dialMesh);

  // 5. Subtle Warm Rising Ember Particles
  const particleCount = 26;
  const pPositions = new Float32Array(particleCount * 3);
  const pSeeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = ((i * 73) % 100) / 50 - 1.0;
    pPositions[i * 3 + 1] = ((i * 37) % 100) / 70 + 0.15;
    pPositions[i * 3 + 2] = ((i * 53) % 100) / 65 - 0.75;
    pSeeds[i] = (i * 0.37) % 1;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({
    map: createEmberSprite(),
    size: 0.09,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const embers = new THREE.Points(pGeo, pMat);
  root.add(embers);

  // Sculptural presentation tilt so the 1986 Noir/Ivoire face greets the visitor
  root.rotation.set(0.62, -0.32, 0.06);

  // Lighting matched to our 35mm warm tungsten + twilight apatam plates
  const ambient = new THREE.AmbientLight(0x524844, 0.95);
  scene.add(ambient);

  const keyLight = new THREE.SpotLight(0xffb473, 18, 16, Math.PI * 0.32, 0.55, 1.4);
  keyLight.position.set(3.4, 4.1, 3.6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x7c93b8, 1.35);
  rimLight.position.set(-3.6, 2.4, -2.5);
  scene.add(rimLight);

  const emberUnderLight = new THREE.PointLight(0xe85826, 4.2, 5.5, 1.8);
  emberUnderLight.position.set(0.1, -0.55, 1.15);
  scene.add(emberUnderLight);

  let width = 1;
  let height = 1;
  function resize() {
    const rect = hostEl.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Responsive framing: place centerpiece on the right half on desktop, centered upper on phone
    const isPhone = window.innerWidth <= 860;
    if (isPhone) {
      camera.position.set(0, 1.95, 7.85);
      camera.lookAt(0, -0.72, 0);
    } else {
      camera.position.set(-0.82, 1.42, 5.25);
      camera.lookAt(-0.55, -0.06, 0);
    }
    camera.updateProjectionMatrix();
  }

  let ptrX = 0;
  let ptrY = 0;
  let curPtrX = 0;
  let curPtrY = 0;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (finePointer && !reduceMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        ptrX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        ptrY = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      },
      { passive: true }
    );
  }

  const heroSection = hostEl.closest("[data-sc-act]");
  let visible = true;
  let rafId = 0;
  const tStart = performance.now();

  function renderFrame(now) {
    const p = heroSection
      ? parseFloat(heroSection.style.getPropertyValue("--sc-p") || "0") || 0
      : 0;

    curPtrX += (ptrX - curPtrX) * 0.06;
    curPtrY += (ptrY - curPtrY) * 0.06;

    const elapsed = (now - tStart) * 0.001;
    const idleBreath = reduceMotion ? 0 : Math.sin(elapsed * 0.9) * 0.025;

    root.rotation.x = 0.64 - p * 0.28 + curPtrY * 0.07;
    root.rotation.y = -0.34 + p * 0.78 + curPtrX * 0.12 + idleBreath;
    root.rotation.z = 0.05 - p * 0.04;
    root.position.y = p * 0.18;

    keyLight.position.x = 3.4 - p * 2.1 + curPtrX * 0.6;
    emberUnderLight.intensity = 3.9 + p * 1.8 + (reduceMotion ? 0 : Math.sin(elapsed * 2.6) * 0.35);

    if (!reduceMotion) {
      const posAttr = pGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let py = posAttr.getY(i) + 0.0035 + pSeeds[i] * 0.002;
        if (py > 1.55) py = 0.12;
        posAttr.setY(i, py);
        posAttr.setX(i, posAttr.getX(i) + Math.sin(elapsed + i) * 0.0007);
      }
      posAttr.needsUpdate = true;
    }

    renderer.render(scene, camera);
    hostEl.classList.add("is-live");
    if (fallbackImg) fallbackImg.style.opacity = "0";

    if (!reduceMotion && heroSection) {
      const hr = heroSection.getBoundingClientRect();
      if (hr.top <= 2 && hr.bottom >= window.innerHeight - 2) {
        hostEl.setAttribute(
          "data-sc-verify-state",
          `hero3d:${root.rotation.y.toFixed(3)}:${root.rotation.x.toFixed(3)}`
        );
      } else {
        hostEl.removeAttribute("data-sc-verify-state");
      }
    }
  }

  function loop(now) {
    rafId = 0;
    if (!visible || document.hidden) return;
    renderFrame(now);
    if (!reduceMotion) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function start() {
    if (!rafId && visible && !document.hidden) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  resize();
  renderFrame(performance.now());
  if (!reduceMotion) start();

  window.addEventListener("resize", () => {
    resize();
    renderFrame(performance.now());
  }, { passive: true });

  window.addEventListener("scroll", () => {
    if (visible && !reduceMotion) {
      renderFrame(performance.now());
    }
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  if ("IntersectionObserver" in window && heroSection) {
    const obs = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) start();
        else stop();
      },
      { rootMargin: "150px 0px" }
    );
    obs.observe(heroSection);
  }

  // Poster export utility so we can capture pixel-identical WebGL fallback posters
  window.__bwCapture3DPoster = () => {
    const tmpRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    tmpRenderer.setPixelRatio(2);
    tmpRenderer.outputColorSpace = THREE.SRGBColorSpace;
    tmpRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    tmpRenderer.toneMappingExposure = 1.14;
    tmpRenderer.setSize(width, height, false);
    tmpRenderer.render(scene, camera);
    const dataUrl = tmpRenderer.domElement.toDataURL("image/png");
    tmpRenderer.dispose();
    return dataUrl;
  };

  return { renderFrame, resize };
}
