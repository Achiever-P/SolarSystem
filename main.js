// Importing Three.js and OrbitControls for 3D scene modifications
import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// Custom modules for texture loading, orbits, and features
import { loadPlanetTexture, createOrbitRing, revolvePlanet } from './planets.js';
import {
  createStars,
  setupLabels,
  setupClickZoom,
  setupPauseResumeButton,
  setupThemeToggleButton,
  getPauseStatus,
  updateTweens
} from './features.js';

// Declaring global variables
let scene, camera, renderer, controls, sun;
let planets = [];

// Planet configuration data
const orbitData = [
  { name: 'Mercury', radius: 2, orbit: 50, speed: 2, texture: './assets/textures/mercury_hd.jpg' },
  { name: 'Venus', radius: 3, orbit: 60, speed: 1.5, texture: './assets/textures/venus_hd.jpg' },
  { name: 'Earth', radius: 4, orbit: 70, speed: 1, texture: './assets/textures/earth_hd.jpg' },
  { name: 'Mars', radius: 3.5, orbit: 80, speed: 0.8, texture: './assets/textures/mars_hd.jpg' },
  { name: 'Jupiter', radius: 10, orbit: 100, speed: 0.7, texture: './assets/textures/jupiter_hd.jpg' },
  { name: 'Saturn', radius: 8, orbit: 120, speed: 0.6, texture: './assets/textures/saturn_hd.jpg' },
  { name: 'Uranus', radius: 6, orbit: 140, speed: 0.5, texture: './assets/textures/uranus_hd.jpg' },
  { name: 'Neptune', radius: 5, orbit: 160, speed: 0.4, texture: './assets/textures/neptune_hd.jpg' },
];

// Initialize the 3D scene
function init() {
  scene = new THREE.Scene();

  // Set up camera
  camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 100;

  // Create and configure renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Set up orbit controls for mouse interaction
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Add the sun
  sun = loadPlanetTexture('./assets/textures/sun_hd.jpg', 20, 'basic');
  scene.add(sun);

  // Light source positioned at the sun's location
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.copy(sun.position);
  scene.add(light);

  // Loop through each planet and add it to the scene
  orbitData.forEach(({ name, radius, orbit, speed, texture }) => {
    const mesh = loadPlanetTexture(texture, radius);

    // Add Saturn's ring
    if (name === 'Saturn') {
      const ringGeometry = new THREE.RingGeometry(radius + 0.5, radius + 4.5, 70, 1);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xf0e68c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = THREE.MathUtils.degToRad(75);
      ring.rotation.z = THREE.MathUtils.degToRad(30);
      mesh.add(ring);
    }

    // Add Uranus's ring
    if (name === 'Uranus') {
      const ringGeometry = new THREE.RingGeometry(radius + 0.5, radius + 0.7, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xadd8e6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = THREE.MathUtils.degToRad(10);
      ring.rotation.z = THREE.MathUtils.degToRad(45);
      mesh.add(ring);
    }

    // Add planet and its orbit ring to the scene
    scene.add(mesh);
    scene.add(createOrbitRing(orbit));
    // Store the planet and its properties
    planets.push({ name, mesh, orbit, speed, speedMultiplier: 1 });
  });

  // Add background stars and setup features
  createStars(scene);
  setupLabels(planets, camera, scene);
  setupClickZoom(planets, camera);
  setupPauseResumeButton();
  setupThemeToggleButton();
  window.lucide.createIcons();// Icon rendering for buttons

  createSpeedControlUI();// Add speed control UI

  // Event listeners
  window.addEventListener("click", onClick);// For clicking on planets
  window.addEventListener("resize", onWindowResize, false);// For responsive resizing
}

// UI Elements for speed control
let speedControlContainer, speedSlider, speedLabel;
let selectedPlanet = null;

// UI for controlling speed of planets
function createSpeedControlUI() {
  speedControlContainer = document.createElement('div');
  speedControlContainer.style.position = 'fixed';
  speedControlContainer.style.transform = 'translateX(-50%)';
  speedControlContainer.style.background = 'rgba(0,0,0,0.7)';
  speedControlContainer.style.color = 'white';
  speedControlContainer.style.padding = '10px 20px';
  speedControlContainer.style.borderRadius = '10px';
  speedControlContainer.style.fontFamily = 'Arial, sans-serif';
  speedControlContainer.style.display = 'none';
  speedControlContainer.style.zIndex = '1000';

  speedControlContainer.innerHTML = `
    <label style="margin-right: 10px;" id="speedLabel">Speed: 1</label>
    <input type="range" id="planetSpeedSlider" min="0" max="5" step="0.1" value="1" />
  `;

  document.body.appendChild(speedControlContainer);

  speedSlider = speedControlContainer.querySelector('#planetSpeedSlider');
  speedLabel = speedControlContainer.querySelector('#speedLabel');

  // Update speed multiplier on slider input
  speedSlider.addEventListener('input', (e) => {
    if (!selectedPlanet) return;
    const val = parseFloat(e.target.value);
    selectedPlanet.speedMultiplier = val;
    speedLabel.textContent = `Speed: ${val.toFixed(1)}`;
  });

  // Prevent OrbitControls from interfering with slider interaction
  speedSlider.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    controls.enabled = false;
  });

  speedSlider.addEventListener('pointermove', (e) => {
    e.stopPropagation();
  });

  speedSlider.addEventListener('pointerup', (e) => {
    e.stopPropagation();
    controls.enabled = true;
  });

  speedSlider.addEventListener('pointercancel', (e) => {
    e.stopPropagation();
    controls.enabled = true;
  });

  speedSlider.addEventListener('pointerleave', (e) => {
    controls.enabled = true;
  });
}

//Raycasting for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Click handler to detect selected planet and show slider
function onClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const meshes = planets.map(p => p.mesh);
  const intersects = raycaster.intersectObjects(meshes);

  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    const planet = planets.find(p => p.mesh === clickedMesh);
    if (planet) {
      selectedPlanet = planet;

      // Position slider above the planet
      const vector = planet.mesh.position.clone().project(camera);
      const screenX = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-vector.y * 0.5 + 0.5) * window.innerHeight;

      speedControlContainer.style.left = `${screenX}px`;
      speedControlContainer.style.top = `${screenY - 60}px`;

      speedSlider.value = planet.speedMultiplier;
      speedLabel.textContent = `Speed: ${planet.speedMultiplier.toFixed(1)}`;
      speedControlContainer.style.display = 'block';
    }
  } else {
    // Hide if clicked on empty space
    speedControlContainer.style.display = 'none';
    selectedPlanet = null;
  }
}

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);

  // Only animate if not paused
  if (!getPauseStatus()) {
    planets.forEach(p => {
      p.mesh.rotation.y += 0.005 * p.speedMultiplier;
      revolvePlanet(time, p.speed * p.speedMultiplier, p.mesh, p.orbit, sun.position);
    });
    sun.rotation.y += 0.005;// Sun rotates too
  }

  controls.update();//Smooth camera controls
  updateTweens();// For Tween animations
  renderer.render(scene, camera);// Draw the frame
}

// Resize handler
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//start the application
init();
animate(0);
