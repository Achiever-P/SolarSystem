import * as THREE from "https://cdn.skypack.dev/three@0.129.0";

export function loadPlanetTexture(path, radius, type = 'standard') {
  // Create a spherical geometry for the planet
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  // Load the planet texture
  const texture = new THREE.TextureLoader().load(path);
  // Choose the material type: Standard for realistic shading, Basic for constant brightness
  const material = type === 'standard'
    ? new THREE.MeshStandardMaterial({ map: texture })
    : new THREE.MeshBasicMaterial({ map: texture });

    // Create and return the planet mesh
  return new THREE.Mesh(geometry, material);
}

export function createOrbitRing(radius) {
  // Create a ring geometry just slightly thick
  const geometry = new THREE.RingGeometry(radius - 0.1, radius, 100);
  // Basic white ring material 
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  // Create the mesh and rotate it to lie flat on the XZ plane
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  return ring;
}

export function revolvePlanet(time, speed, planet, radius, sunPos) {
  // Calculate the angle based on time and speed
  const angle = time * 0.001 * speed;
  // Use polar coordinates to place the planet along a circular orbit
  planet.position.x = sunPos.x + radius * Math.cos(angle);
  planet.position.z = sunPos.z + radius * Math.sin(angle);
  // Y remains unchanged
}
