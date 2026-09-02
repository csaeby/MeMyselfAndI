import * as THREE from 'three';
import { cvData } from './data/cv-data.js';
import { World } from './engine/world.js';
import { FirstPersonController } from './engine/controls.js';
import { Kiosk } from './engine/kiosk.js';
import { HUD } from './ui/hud.js';

/**
 * Main Application Orchestrator
 */
class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.world = null;
    this.controls = null;
    this.hud = null;
    this.kiosks = [];
    this.clock = new THREE.Clock();
    this.prevTime = performance.now();

    this.init();
  }

  init() {
    // 1. Initialize 3D World (scene, camera, lights, floor, walls)
    this.world = new World(this.container);

    // 2. Initialize First Person Camera Controller
    this.controls = new FirstPersonController(
      this.world.camera,
      this.world.renderer.domElement,
      [...this.world.colliders]
    );

    // 3. Build Exhibition Kiosks from data
    cvData.stations.forEach(stationData => {
      const kiosk = new Kiosk(stationData, this.world.scene);
      this.kiosks.push(kiosk);
      // Add kiosk collision box to player controls
      if (kiosk.collider) {
        this.controls.addCollider(kiosk.collider);
      }
    });

    // 4. Initialize HUD (minimap, prompts, modals, 2D view)
    this.hud = new HUD(cvData, this.controls, this.world.roomSize);

    // 5. Setup Start Blocker Screen Interaction
    const blocker = document.getElementById('blocker');
    const enterBtn = document.getElementById('enter-btn');

    const handleStart = (event) => {
      event?.stopPropagation();
      this.controls.lock();
    };

    if (enterBtn) enterBtn.addEventListener('click', handleStart);
    if (blocker) blocker.addEventListener('click', handleStart);

    // 6. Handle Window Resize
    window.addEventListener('resize', () => {
      this.world.handleResize();
    });

    // 7. Start Game Loop
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;
    const delta = Math.min(this.clock.getDelta(), 0.1); // clamp delta

    // 1. Update First Person Controls & Physics
    this.controls.update(delta);

    // 2. Update Kiosks & Check Proximity
    let closestStation = null;
    let minDistance = Infinity;

    this.kiosks.forEach(kiosk => {
      const status = kiosk.update(time, this.world.camera.position);
      if (status.isNearby && status.distance < minDistance) {
        minDistance = status.distance;
        closestStation = kiosk.data;
      }
    });

    // 3. Update HUD Prompt
    if (closestStation && !this.controls.isModalOpen) {
      this.hud.showPrompt(closestStation);
    } else {
      this.hud.hidePrompt();
    }

    // 4. Update Minimap Radar
    this.hud.updateMinimap(this.world.camera);

    // 5. Render Scene
    this.world.render();
  }
}

// Bootstrap on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
