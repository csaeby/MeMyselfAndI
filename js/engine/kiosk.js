import * as THREE from 'three';

/**
 * 3D Exhibition Kiosk / Pedestal
 * Interactive monoliths with dynamic canvas signage, floating holographic 3D emblems,
 * localized lighting, and proximity detection.
 */
export class Kiosk {
  constructor(data, scene) {
    this.data = data;
    this.scene = scene;
    this.group = new THREE.Group();
    this.floatingMesh = null;
    this.screenMesh = null;
    this.light = null;
    this.pulseGlow = null;
    this.isNearby = false;
    this.collider = null;

    this.build();
    this.scene.add(this.group);
  }

  build() {
    const { position, rotation, color, accentHex, title, subtitle, number, preview } = this.data;

    this.group.position.set(position.x, 0, position.z);
    this.group.rotation.y = rotation;

    // 1. Pedestal Base
    const baseWidth = 2.4;
    const baseHeight = 1.3;
    const baseDepth = 1.0;

    const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x181a26,
      roughness: 0.4,
      metalness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = baseHeight / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // Glowing plinth rim around bottom
    const plinthGeo = new THREE.BoxGeometry(baseWidth + 0.15, 0.08, baseDepth + 0.15);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.2
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.04;
    this.group.add(plinth);

    // 2. Angled Screen Display
    const screenWidth = 2.1;
    const screenHeight = 1.2;
    const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);

    const screenTexture = this.generateScreenTexture(number, title, subtitle, preview, accentHex);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: screenTexture,
      emissiveIntensity: 0.45
    });

    this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
    // Tilted back on top of pedestal
    this.screenMesh.position.set(0, baseHeight + 0.55, 0.1);
    this.screenMesh.rotation.x = -Math.PI * 0.1;
    this.group.add(this.screenMesh);

    // Screen border housing
    const screenHousingGeo = new THREE.BoxGeometry(screenWidth + 0.15, screenHeight + 0.15, 0.12);
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x12141f,
      roughness: 0.5
    });
    const screenHousing = new THREE.Mesh(screenHousingGeo, housingMat);
    screenHousing.position.set(0, baseHeight + 0.55, 0.04);
    screenHousing.rotation.x = -Math.PI * 0.1;
    screenHousing.castShadow = true;
    this.group.add(screenHousing);

    // 3. Floating Station Text Sign above kiosk (replaces geometric icons)
    this.floatingMesh = this.createFloatingStationSign(title, number, accentHex, color);
    if (this.floatingMesh) {
      this.floatingMesh.position.set(0, baseHeight + 1.8, 0);
      this.group.add(this.floatingMesh);
    }

    // 4. Ground Glow Ring (Proximity indicator)
    const ringGeo = new THREE.RingGeometry(1.6, 1.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    this.pulseGlow = new THREE.Mesh(ringGeo, ringMat);
    this.pulseGlow.rotation.x = -Math.PI / 2;
    this.pulseGlow.position.set(0, 0.02, 0);
    this.group.add(this.pulseGlow);

    // 5. Signature Colored Point Light
    this.light = new THREE.PointLight(color, 1.2, 7, 1.8);
    this.light.position.set(0, baseHeight + 0.8, 0.6);
    this.group.add(this.light);

    // 6. Collision Bounding Box (in world coordinates)
    this.group.updateMatrixWorld(true);
    this.collider = new THREE.Box3();
    this.collider.setFromCenterAndSize(
      new THREE.Vector3(position.x, baseHeight / 2, position.z),
      new THREE.Vector3(baseWidth + 0.5, baseHeight + 1.0, baseDepth + 0.5)
    );
  }

  generateScreenTexture(number, title, subtitle, preview, accentHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 580;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0d16';
    ctx.fillRect(0, 0, 1024, 580);

    // Subtle header gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, accentHex);
    grad.addColorStop(1, '#0a0d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 12);

    // Tech grid subtle background lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < 1024; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 580);
      ctx.stroke();
    }

    // Station Pill Badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    this.drawRoundedRect(ctx, 60, 50, 240, 46, 23);
    ctx.fill();

    ctx.fillStyle = accentHex;
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`STATION ${number} // SECT`, 80, 81);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    ctx.fillText(title, 60, 165);

    // Subtitle
    ctx.fillStyle = accentHex;
    ctx.font = '600 28px system-ui, -apple-system, sans-serif';
    ctx.fillText(subtitle, 60, 215);

    // Separator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 245);
    ctx.lineTo(964, 245);
    ctx.stroke();

    // Summary Teaser text (word wrap)
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'normal 26px system-ui, -apple-system, sans-serif';
    this.wrapText(ctx, preview, 60, 305, 900, 42);

    // Call to action button banner
    ctx.fillStyle = accentHex;
    ctx.beginPath();
    this.drawRoundedRect(ctx, 60, 470, 420, 60, 12);
    ctx.fill();

    ctx.fillStyle = '#0b0f19';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('PRESS [ E ] OR CLICK TO INSPECT', 85, 508);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  createFloatingStationSign(title, number, accentHex, color) {
    const signGroup = new THREE.Group();

    const canvasW = 1024;
    const canvasH = 260;
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');

    // Transparent background
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Glowing dark pill backdrop
    ctx.fillStyle = 'rgba(10, 14, 26, 0.94)';
    this.drawRoundedRect(ctx, 14, 14, canvasW - 28, canvasH - 28, 34);
    ctx.fill();

    // Outer neon glow border
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    this.drawRoundedRect(ctx, 22, 22, canvasW - 44, canvasH - 44, 28);
    ctx.stroke();

    // Station Number badge pill
    ctx.fillStyle = `${accentHex}33`;
    this.drawRoundedRect(ctx, 48, 40, 180, 44, 22);
    ctx.fill();
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STATION ${number}`, 138, 70);

    // Main Station Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    // Dynamically adjust font size for long titles
    const fontSize = title.length > 20 ? 48 : (title.length > 15 ? 54 : 60);
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(title.toUpperCase(), canvasW / 2, 175);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;

    // Sign dimensions in 3D
    const signW = 2.4;
    const signH = 0.62;

    const signMat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: 0.75,
      side: THREE.FrontSide
    });

    // Front sign face
    const frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), signMat);
    frontMesh.position.z = 0.03;
    signGroup.add(frontMesh);

    // Back sign face (so it is right-side-up when viewed from behind)
    const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(signW, signH), signMat);
    backMesh.position.z = -0.03;
    backMesh.rotation.y = Math.PI;
    signGroup.add(backMesh);

    // Dark core between front and back
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d16,
      roughness: 0.8
    });
    const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(signW - 0.02, signH - 0.02, 0.05), coreMat);
    signGroup.add(coreMesh);

    // Outer neon rim frame
    const edgeMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.2
    });
    const edgeMesh = new THREE.Mesh(new THREE.BoxGeometry(signW + 0.04, signH + 0.04, 0.04), edgeMat);
    signGroup.add(edgeMesh);

    return signGroup;
  }

  update(time, cameraPosition) {
    // 1. Animate floating station text sign
    if (this.floatingMesh) {
      // Smooth vertical hover bob
      this.floatingMesh.position.y = 1.3 + 1.8 + Math.sin(time * 1.8) * 0.06;
      // Gentle subtle yaw oscillation so text stays fully readable from the front
      this.floatingMesh.rotation.y = Math.sin(time * 0.8) * 0.16;
    }

    // 2. Pulse ground ring
    if (this.pulseGlow) {
      const scale = 1 + Math.sin(time * 2.5) * 0.05;
      this.pulseGlow.scale.set(scale, scale, scale);
    }

    // 3. Proximity detection
    const dist = cameraPosition.distanceTo(new THREE.Vector3(this.data.position.x, 1.7, this.data.position.z));
    const wasNearby = this.isNearby;
    this.isNearby = dist < 4.2;

    if (this.isNearby) {
      this.light.intensity = 1.8 + Math.sin(time * 4) * 0.3;
      if (this.pulseGlow) this.pulseGlow.material.opacity = 0.8;
    } else {
      this.light.intensity = 1.0;
      if (this.pulseGlow) this.pulseGlow.material.opacity = 0.35;
    }

    return {
      kiosk: this,
      justEntered: !wasNearby && this.isNearby,
      isNearby: this.isNearby,
      distance: dist
    };
  }
}
