import * as THREE from 'three';

/**
 * First Person Camera & Input Controller
 * Handles mouse look via Pointer Lock API, WASD keyboard movement,
 * collision sliding with walls and kiosks, and head bobbing.
 */
export class FirstPersonController {
  constructor(camera, domElement, colliders = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.colliders = colliders;

    this.isLocked = false;
    this.enabled = true;

    // Movement speeds
    this.walkSpeed = 6.0; // units / sec
    this.sprintSpeed = 10.5;
    this.jumpSpeed = 7.0;
    this.gravity = 20.0;
    this.playerRadius = 0.55;
    this.playerHeight = 1.7;

    // State
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.isTouchActive = false;
    this.isModalOpen = false;
    this.hasStarted = false;
    this.activeLookPointer = null;
    this.lastPointerX = 0;
    this.lastPointerY = 0;

    // Pointer lock is not available on most mobile browsers. In that case,
    // the controller falls back to drag-to-look and on-screen movement.
    this.supportsPointerLock = Boolean(
      this.domElement.requestPointerLock || this.domElement.mozRequestPointerLock
    );
    this.isTouchMode = (
      window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0 ||
      !this.supportsPointerLock
    );
    document.documentElement.classList.toggle('touch-mode', this.isTouchMode);

    // Head bobbing
    this.bobTimer = 0;
    this.baseCameraY = this.playerHeight;

    // Rotation Euler
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.minPolarAngle = 0.05; // ~3 deg
    this.maxPolarAngle = Math.PI - 0.05; // ~177 deg

    this.initEvents();
  }

  initEvents() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.resetKeys = this.resetKeys.bind(this);

    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);
    document.addEventListener('pointerlockchange', this.onPointerLockChange, false);
    document.addEventListener('mozpointerlockchange', this.onPointerLockChange, false);
    window.addEventListener('blur', this.resetKeys, false);

    this.domElement.addEventListener('pointerdown', this.onPointerDown, false);
    this.domElement.addEventListener('pointermove', this.onPointerMove, false);
    this.domElement.addEventListener('pointerup', this.onPointerUp, false);
    this.domElement.addEventListener('pointercancel', this.onPointerUp, false);

    document.querySelectorAll('[data-move]').forEach(button => {
      const direction = button.dataset.move;
      const startMoving = (event) => {
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture?.(event.pointerId);
        this.setMovement(direction, true);
      };
      const stopMoving = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.setMovement(direction, false);
      };

      button.addEventListener('pointerdown', startMoving, false);
      button.addEventListener('pointerup', stopMoving, false);
      button.addEventListener('pointercancel', stopMoving, false);
      button.addEventListener('lostpointercapture', stopMoving, false);
    });
  }

  resetKeys() {
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.isSprinting = false;
    this.velocity.set(0, 0, 0);
  }

  lock() {
    if (!this.enabled || this.isModalOpen) return;

    if (this.isTouchMode) {
      this.startTouchMode();
      return;
    }

    this.domElement.requestPointerLock =
      this.domElement.requestPointerLock ||
      this.domElement.mozRequestPointerLock;
    if (this.domElement.requestPointerLock) {
      try {
        const lockRequest = this.domElement.requestPointerLock();
        lockRequest?.catch(() => {
          // A resumed desktop session can briefly reject Pointer Lock after
          // Escape. Only use touch controls when desktop mode never started.
          if (!this.hasStarted) this.startTouchMode();
        });

        // Some browsers expose the API but silently decline the request.
        window.setTimeout(() => {
          if (!this.hasStarted && document.pointerLockElement !== this.domElement) {
            this.startTouchMode();
          }
        }, 400);
      } catch {
        if (!this.hasStarted) this.startTouchMode();
      }
    } else {
      this.startTouchMode();
    }
  }

  startTouchMode() {
    // Once Pointer Lock has worked, keep the controller in desktop mode.
    // This prevents a failed resume attempt from changing the control scheme.
    if (this.hasStarted && !this.isTouchMode) return;

    this.isTouchMode = true;
    this.hasStarted = true;
    document.documentElement.classList.add('touch-mode');

    const blocker = document.getElementById('blocker');
    const resumePrompt = document.getElementById('resume-prompt');
    const crosshair = document.getElementById('crosshair');

    if (blocker) blocker.style.display = 'none';
    if (resumePrompt) resumePrompt.style.display = 'none';
    if (crosshair) crosshair.style.opacity = '0.75';

  }

  unlock() {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  onPointerLockChange() {
    this.isLocked = (
      document.pointerLockElement === this.domElement ||
      document.mozPointerLockElement === this.domElement
    );

    const blocker = document.getElementById('blocker');
    const resumePrompt = document.getElementById('resume-prompt');
    const crosshair = document.getElementById('crosshair');

    if (this.isLocked) {
      this.hasStarted = true;
      if (blocker) blocker.style.display = 'none';
      if (resumePrompt) resumePrompt.style.display = 'none';
      if (crosshair) crosshair.style.opacity = '1';
    } else {
      if (crosshair) crosshair.style.opacity = '0.35';
      // Only show initial welcome blocker if the user has never clicked to enter
      if (!this.hasStarted && blocker) {
        blocker.style.display = 'flex';
      } else if (!this.isModalOpen && resumePrompt) {
        resumePrompt.style.display = 'flex';
      }
    }
  }

  onMouseMove(event) {
    if (!this.isLocked || !this.enabled || this.isModalOpen) return;

    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;

    const sensitivity = 0.0022;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * sensitivity;
    this.euler.x -= movementY * sensitivity;

    // Clamp pitch between roughly -85 and +85 degrees
    const maxPitch = Math.PI / 2 - 0.05;
    this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));

    this.camera.quaternion.setFromEuler(this.euler);
  }

  onPointerDown(event) {
    if (!this.isTouchMode || !this.hasStarted || !this.enabled || this.isModalOpen) return;

    this.activeLookPointer = event.pointerId;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
    this.domElement.setPointerCapture?.(event.pointerId);
  }

  onPointerMove(event) {
    if (
      !this.isTouchMode ||
      this.activeLookPointer !== event.pointerId ||
      !this.enabled ||
      this.isModalOpen
    ) return;

    const movementX = event.clientX - this.lastPointerX;
    const movementY = event.clientY - this.lastPointerY;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

    const sensitivity = 0.004;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= movementX * sensitivity;
    this.euler.x -= movementY * sensitivity;

    const maxPitch = Math.PI / 2 - 0.05;
    this.euler.x = Math.max(-maxPitch, Math.min(maxPitch, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  onPointerUp(event) {
    if (this.activeLookPointer === event.pointerId) {
      this.activeLookPointer = null;
    }
  }

  setMovement(direction, isMoving) {
    switch (direction) {
      case 'forward':
        this.moveForward = isMoving;
        break;
      case 'backward':
        this.moveBackward = isMoving;
        break;
      case 'left':
        this.moveLeft = isMoving;
        break;
      case 'right':
        this.moveRight = isMoving;
        break;
    }
  }

  onKeyDown(event) {
    // If modal is open or typing inside an input, ignore movement keys
    if (this.isModalOpen) return;
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = true;
        break;
      case 'Space':
        if (
          !event.repeat &&
          this.isGrounded &&
          this.hasStarted &&
          (this.isLocked || this.isTouchMode)
        ) {
          event.preventDefault();
          this.verticalVelocity = this.jumpSpeed;
          this.isGrounded = false;
        }
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.isSprinting = false;
        break;
    }
  }

  addCollider(box3) {
    this.colliders.push(box3);
  }

  checkCollision(newPosition) {
    const playerBox = new THREE.Box3();
    const min = new THREE.Vector3(
      newPosition.x - this.playerRadius,
      0.1,
      newPosition.z - this.playerRadius
    );
    const max = new THREE.Vector3(
      newPosition.x + this.playerRadius,
      this.playerHeight,
      newPosition.z + this.playerRadius
    );
    playerBox.set(min, max);

    for (let i = 0; i < this.colliders.length; i++) {
      if (playerBox.intersectsBox(this.colliders[i])) {
        return true;
      }
    }
    return false;
  }

  teleportTo(x, z, targetAngleY = null) {
    this.camera.position.x = x;
    this.camera.position.y = this.baseCameraY;
    this.camera.position.z = z;
    this.velocity.set(0, 0, 0);
    this.verticalVelocity = 0;
    this.isGrounded = true;

    if (targetAngleY !== null) {
      this.euler.x = 0;
      this.euler.y = targetAngleY;
      this.camera.quaternion.setFromEuler(this.euler);
    }
  }

  update(delta) {
    if (this.isModalOpen || !this.enabled) {
      this.velocity.x = 0;
      this.velocity.z = 0;
      return;
    }

    // Damping factor for smooth stopping
    const damping = Math.exp(-8.0 * delta);
    this.velocity.x *= damping;
    this.velocity.z *= damping;

    // Movement direction vector
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    const currentSpeed = this.isSprinting ? this.sprintSpeed : this.walkSpeed;

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * currentSpeed * 8.0 * delta;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * currentSpeed * 8.0 * delta;
    }

    // Compute intended displacement relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

    const deltaX = (right.x * (-this.velocity.x) + forward.x * (-this.velocity.z)) * delta;
    const deltaZ = (right.z * (-this.velocity.x) + forward.z * (-this.velocity.z)) * delta;

    // Sliding collision resolution (separate X and Z axis)
    const currentPos = this.camera.position.clone();

    // Try X movement
    const testPosX = currentPos.clone();
    testPosX.x += deltaX;
    if (!this.checkCollision(testPosX)) {
      this.camera.position.x = testPosX.x;
    } else {
      this.velocity.x = 0;
    }

    // Try Z movement
    const testPosZ = currentPos.clone();
    testPosZ.x = this.camera.position.x;
    testPosZ.z += deltaZ;
    if (!this.checkCollision(testPosZ)) {
      this.camera.position.z = testPosZ.z;
    } else {
      this.velocity.z = 0;
    }

    // Apply a simple vertical jump and gravity, landing at eye level.
    if (!this.isGrounded) {
      this.verticalVelocity -= this.gravity * delta;
      this.camera.position.y += this.verticalVelocity * delta;

      if (this.camera.position.y <= this.baseCameraY) {
        this.camera.position.y = this.baseCameraY;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    // Head bob
    const isMoving = (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) &&
                     (Math.abs(this.velocity.x) > 0.4 || Math.abs(this.velocity.z) > 0.4);

    // Jumping controls the camera height until the player lands.
    if (this.isGrounded) {
      if (isMoving) {
        const bobFreq = this.isSprinting ? 14 : 10;
        const bobAmp = this.isSprinting ? 0.06 : 0.035;
        this.bobTimer += delta * bobFreq;
        this.camera.position.y = this.baseCameraY + Math.sin(this.bobTimer) * bobAmp;
      } else {
        // Smoothly return camera to eye level
        this.camera.position.y += (this.baseCameraY - this.camera.position.y) * 0.15;
      }
    }
  }
}
