import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import TWEEN from 'https://cdn.skypack.dev/@tweenjs/tween.js';

let isPaused = false;// Global flag to pause/resume the animation

export function createStars(scene, count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  // Generate random coordinates for each star
  for (let i = 0; i < count; i++) {
    vertices.push((Math.random() - 0.5) * 2000);
    vertices.push((Math.random() - 0.5) * 2000);
    vertices.push((Math.random() - 0.5) * 2000);
  }
  // Set the star positions as a buffer attribute
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  // Create white dots as stars
  const material = new THREE.PointsMaterial({ color: 0xffffff });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

/**
 * Sets up the pause/resume button, toggling animation state and icon.
 */
export function setupPauseResumeButton() {
  const btn = document.getElementById("pauseBtn");

  // Helper function to update the Lucide icon
  const updateIcon = () => {
    btn.innerHTML = ""; // Clear previous icon (including SVG)
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", isPaused ? "play" : "pause");
    btn.appendChild(icon);
    lucide.createIcons();
  };

  // Toggle pause state on click
  btn.addEventListener("click", () => {
    isPaused = !isPaused;
    updateIcon();
  });

  updateIcon(); // Initial icon render
}

/**
 * Sets up the theme toggle button for switching between light and dark modes.
 */
export function setupThemeToggleButton() {
  const themeBtn = document.getElementById("themeBtn");

  // Helper function to switch the icon
  const updateThemeIcon = () => {
    themeBtn.innerHTML = "";
    const icon = document.createElement("i");
    const isDark = document.body.classList.contains("dark-theme");
    icon.setAttribute("data-lucide", isDark ? "moon" : "sun");
    themeBtn.appendChild(icon);
    lucide.createIcons();
  };

  // Toggle class on click
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme");
    updateThemeIcon();
  });

  updateThemeIcon(); // Initial icon render
}


/**
 * Returns the current animation pause status.
 */
export function getPauseStatus() {
  return isPaused;
}

export function setupLabels(planets, camera, scene) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  // Create a floating label 
  const labelDiv = document.createElement("div");
  labelDiv.style.position = "absolute";
  labelDiv.style.color = "white";
  labelDiv.style.background = "rgba(0,0,0,0.5)";
  labelDiv.style.padding = "4px";
  labelDiv.style.display = "none";
  labelDiv.style.zIndex = "1";
  document.body.appendChild(labelDiv);

  // Update label position on mouse move
  window.addEventListener("mousemove", (event) => {
    // Normalize mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // Detect planet under mouse
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
      const planet = planets.find(p => p.mesh === intersects[0].object);
      labelDiv.textContent = planet.name;
      labelDiv.style.left = event.clientX + "px";
      labelDiv.style.top = event.clientY + "px";
      labelDiv.style.display = "block";
    } else {
      labelDiv.style.display = "none";
    }
  });
}

/**
 * Adds zoom-in camera animation on clicking a planet.
 */
export function setupClickZoom(planets, camera) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
    if (intersects.length > 0) {
      const target = intersects[0].object.position;
      // Animate the camera to zoom closer to the planet
      new TWEEN.Tween(camera.position)
        .to({ x: target.x + 10, y: target.y + 10, z: target.z + 10 }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  });
}
/**
 * Updates all TWEEN animations.
 * Should be called in the animation loop.
 */
export function updateTweens() {
  TWEEN.update();
}