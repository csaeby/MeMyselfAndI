import * as THREE from 'three';

/**
 * Gallery World Environment
 * Builds the 3D exhibition hall, architectural lighting, materials, and bounding walls.
 */
export class World {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.colliders = []; // Bounding boxes for collision detection
    this.roomSize = { width: 36, depth: 36, height: 7.5 };

    this.initScene();
    this.initLights();
    this.buildArchitecture();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0b10);
    this.scene.fog = new THREE.FogExp2(0x0a0b10, 0.024);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    // Player eye height
    this.camera.position.set(0, 1.7, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);
  }

  initLights() {
    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);

    // Sky / Ground contrast
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 0.45);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Main overhead skylight
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.65);
    mainLight.position.set(10, 15, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 45;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    mainLight.shadow.bias = -0.0003;
    this.scene.add(mainLight);

    // Central ceiling soft glow
    const centerCeilingGlow = new THREE.PointLight(0x60a5fa, 1.2, 25, 1.5);
    centerCeilingGlow.position.set(0, 6.8, 0);
    this.scene.add(centerCeilingGlow);
  }

  createFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Polished slate background
    ctx.fillStyle = '#0f111a';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle floor tile grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    const tileSize = 64;
    for (let x = 0; x <= 1024; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Micro noise specks for natural stone texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let i = 0; i < 6000; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 1024;
      ctx.fillRect(rx, ry, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(9, 9);
    return texture;
  }

  buildArchitecture() {
    const { width, depth, height } = this.roomSize;

    // 1. Floor
    const floorGeo = new THREE.PlaneGeometry(width, depth);
    const floorTexture = this.createFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.35,
      metalness: 0.15,
      color: 0xcccccc
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Ceiling with glowing architectural recessed channels
    const ceilingGeo = new THREE.PlaneGeometry(width, depth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x11131c,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = height;
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);

    // Ceiling light strips
    const stripGeo = new THREE.BoxGeometry(24, 0.1, 0.6);
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x93c5fd,
      emissiveIntensity: 1.2
    });
    [-8, 0, 8].forEach(zPos => {
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(0, height - 0.05, zPos);
      this.scene.add(strip);
    });

    // 3. Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x141622,
      roughness: 0.85
    });

    const wallThickness = 0.8;
    const halfW = width / 2;
    const halfD = depth / 2;

    const wallsData = [
      // North wall (Z = -halfD)
      { pos: [0, height / 2, -halfD], size: [width, height, wallThickness] },
      // South wall (Z = halfD)
      { pos: [0, height / 2, halfD], size: [width, height, wallThickness] },
      // West wall (X = -halfW)
      { pos: [-halfW, height / 2, 0], size: [wallThickness, height, depth] },
      // East wall (X = halfW)
      { pos: [halfW, height / 2, 0], size: [wallThickness, height, depth] }
    ];

    wallsData.forEach(w => {
      const geo = new THREE.BoxGeometry(...w.size);
      const wall = new THREE.Mesh(geo, wallMat);
      wall.position.set(...w.pos);
      wall.receiveShadow = true;
      this.scene.add(wall);

      // Add to collision bounding boxes
      const box = new THREE.Box3().setFromObject(wall);
      this.colliders.push(box);
    });

    // Glowing baseboard trim along perimeter
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8
    });
    const baseNorth = new THREE.Mesh(new THREE.BoxGeometry(width, 0.15, 0.1), baseboardMat);
    baseNorth.position.set(0, 0.08, -halfD + 0.4);
    this.scene.add(baseNorth);

    const baseSouth = new THREE.Mesh(new THREE.BoxGeometry(width, 0.15, 0.1), baseboardMat);
    baseSouth.position.set(0, 0.08, halfD - 0.4);
    this.scene.add(baseSouth);

    const baseWest = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, depth), baseboardMat);
    baseWest.position.set(-halfW + 0.4, 0.08, 0);
    this.scene.add(baseWest);

    const baseEast = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, depth), baseboardMat);
    baseEast.position.set(halfW - 0.4, 0.08, 0);
    this.scene.add(baseEast);

    // 4. Central Welcome Inlay Platform
    const centerPlatformGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.12, 32);
    const centerPlatformMat = new THREE.MeshStandardMaterial({
      color: 0x1e2235,
      roughness: 0.4,
      metalness: 0.2
    });
    const centerPlatform = new THREE.Mesh(centerPlatformGeo, centerPlatformMat);
    centerPlatform.position.set(0, 0.06, 0);
    centerPlatform.receiveShadow = true;
    this.scene.add(centerPlatform);

    // Glowing ring around center platform
    const ringGeo = new THREE.RingGeometry(3.6, 3.75, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide
    });
    const centerRing = new THREE.Mesh(ringGeo, ringMat);
    centerRing.rotation.x = -Math.PI / 2;
    centerRing.position.set(0, 0.07, 0);
    this.scene.add(centerRing);

    // 5. Architectural Pillars (4 corners to create gallery depth)
    const pillarPositions = [
      [-7, -7],
      [7, -7],
      [-7, 7],
      [7, 7]
    ];
    const pillarGeo = new THREE.BoxGeometry(1.2, height, 1.2);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x161926,
      roughness: 0.7
    });

    const pillarTrimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9
    });

    pillarPositions.forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, height / 2, pz);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);

      // Vertical LED accent slot on pillar
      const trimGeo = new THREE.BoxGeometry(0.1, height * 0.8, 0.1);
      const trim = new THREE.Mesh(trimGeo, pillarTrimMat);
      trim.position.set(px, height / 2, pz + 0.61);
      this.scene.add(trim);

      // Add to colliders with a comfortable safety margin
      const pBox = new THREE.Box3().setFromObject(pillar);
      this.colliders.push(pBox);
    });
  }

  handleResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
