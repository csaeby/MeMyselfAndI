/**
 * Heads-Up Display (HUD) & Modal Manager
 * Manages minimap radar, interaction prompts, detailed modal reader dialog,
 * quick teleportation dock, and the 2D Classic CV view toggle.
 */
export class HUD {
  constructor(cvData, controls, roomSize) {
    this.cvData = cvData;
    this.controls = controls;
    this.roomSize = roomSize;

    this.activeStation = null;
    this.is2DMode = false;
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
    this.promptEl = document.getElementById('interaction-prompt');
    this.modal = document.getElementById('cv-modal');
    this.modalBody = document.getElementById('modal-body');

    this.initEventListeners();
    this.renderQuickTravelBar();
    this.render2DCVContent();
  }

  initEventListeners() {
    // Modal close button
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Modal background click or Escape key
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
      this.modal.addEventListener('close', () => {
        this.onModalClosed();
      });
      this.modal.addEventListener('cancel', () => {
        this.onModalClosed();
      });
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger if user is interacting with form inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // [E] to inspect nearby station or close modal
      if (e.code === 'KeyE') {
        if (this.modal && this.modal.hasAttribute('open')) {
          this.closeModal();
        } else if (this.activeStation && !this.controls.isModalOpen) {
          this.openModal(this.activeStation);
        }
      }

      // Number keys jump to the corresponding station
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= this.cvData.stations.length) {
        if (this.modal && this.modal.hasAttribute('open')) {
          this.closeModal();
        }
        this.teleportToStation(this.cvData.stations[keyNum - 1]);
      }
    });

    // 2D CV Mode switch button
    const toggle2DBtn = document.getElementById('toggle-2d-mode-btn');
    if (toggle2DBtn) {
      toggle2DBtn.addEventListener('click', () => this.toggle2DMode());
    }

    const backTo3DBtn = document.getElementById('back-to-3d-btn');
    if (backTo3DBtn) {
      backTo3DBtn.addEventListener('click', () => this.toggle2DMode());
    }

    // Clicking interaction prompt pill directly opens modal
    if (this.promptEl) {
      this.promptEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.activeStation && !this.controls.isModalOpen) {
          this.openModal(this.activeStation);
        }
      });
    }

    // Clicking anywhere on the 3D canvas locks the camera
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      canvasContainer.addEventListener('click', () => {
        if (!this.controls.isModalOpen && !this.is2DMode) {
          this.controls.lock();
        }
      });
    }

    // Clicking resume prompt also locks the camera
    const resumePrompt = document.getElementById('resume-prompt');
    if (resumePrompt) {
      resumePrompt.addEventListener('click', () => {
        if (!this.controls.isModalOpen && !this.is2DMode) {
          this.controls.lock();
        }
      });
    }
  }

  showPrompt(station) {
    if (this.controls.isModalOpen) return;
    this.activeStation = station;
    if (this.promptEl) {
      const promptKey = this.controls.isTouchMode ? 'TAP' : 'E';
      const promptVerb = this.controls.isTouchMode ? 'Open' : 'Inspect';
      this.promptEl.style.display = 'flex';
      this.promptEl.innerHTML = `
        <span class="prompt-key">${promptKey}</span>
        <span class="prompt-text">${promptVerb} <strong>${station.title}</strong></span>
      `;
    }
  }

  hidePrompt() {
    this.activeStation = null;
    if (this.promptEl) {
      this.promptEl.style.display = 'none';
    }
  }

  openModal(station) {
    if (!this.modal) return;

    this.controls.isModalOpen = true;
    this.controls.resetKeys();
    this.controls.unlock();
    this.hidePrompt();

    this.populateModal(station);
    this.modal.showModal();

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (!this.modal || !this.modal.hasAttribute('open')) return;
    this.modal.close();
  }

  onModalClosed() {
    this.controls.isModalOpen = false;
    this.controls.resetKeys();
    document.body.style.overflow = '';

    // Focus canvas so keyboard events resume immediately
    if (this.controls.domElement) {
      this.controls.domElement.focus();
    }

    // Lock camera
    if (!this.is2DMode) {
      this.controls.lock();
    }
  }

  populateModal(station) {
    const headerEl = document.getElementById('modal-header');
    if (headerEl) {
      headerEl.style.borderBottomColor = station.accentHex;
      headerEl.innerHTML = `
        <div class="modal-badge" style="background: ${station.accentHex}22; color: ${station.accentHex}; border: 1px solid ${station.accentHex}66;">
          STATION ${station.number} // ${station.icon}
        </div>
        <div class="modal-title-group">
          <h2 class="modal-title">${station.title}</h2>
          <p class="modal-subtitle" style="color: ${station.accentHex}">${station.subtitle}</p>
        </div>
      `;
    }

    if (!this.modalBody) return;
    let contentHtml = '';

    switch (station.id) {
      case 'experience': {
        const { roles } = station.content;
        contentHtml = `
          <div class="timeline-container">
            ${roles.map(role => `
              <div class="timeline-item">
                <div class="timeline-marker" style="background: ${station.accentHex};"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <h4 class="role-title">${role.role}</h4>
                    <span class="role-period">${role.period}</span>
                  </div>
                  <div class="company-sub">${role.company} • <span class="role-location">${role.location}</span></div>
                  <p class="role-desc">${role.description}</p>
                  <ul class="role-highlights">
                    ${role.highlights.map(h => `<li>${h}</li>`).join('')}
                  </ul>
                  <div class="tech-tag-row">
                    ${role.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
        break;
      }

      case 'interests': {
        const { headline, intro, sections } = station.content;
        contentHtml = `
          <div class="interests-container">
            <div class="interests-header">
              <h3 class="interests-headline">${headline}</h3>
              <p class="interests-intro">${intro}</p>
            </div>
            <div class="interests-grid">
              ${sections.map(sec => `
                <div class="interest-card" style="border-top: 3px solid ${station.accentHex};">
                  <div class="interest-top">
                    <span class="interest-icon">${sec.icon}</span>
                    <div class="interest-meta">
                      <span class="interest-badge" style="border-color: ${station.accentHex}; color: ${station.accentHex};">${sec.badge}</span>
                      <h4 class="interest-title">${sec.title}</h4>
                      <div class="interest-highlight" style="color: ${station.accentHex};">${sec.highlight}</div>
                    </div>
                  </div>
                  <p class="interest-desc">${sec.description}</p>
                  <ul class="interest-bullets">
                    ${sec.details.map(d => `<li>${d}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;
      }

      case 'skills': {
        const { categories, degrees, certifications, languages } = station.content;
        contentHtml = `
          <div class="skills-grid">
            ${categories.map(cat => `
              <div class="skill-category-card">
                <h4 class="category-name">${cat.name}</h4>
                <div class="skill-bars">
                  ${cat.skills.map(s => `
                    <div class="skill-row">
                      <div class="skill-info">
                        <span class="skill-name">${s.name}</span>
                        <span class="skill-pct">${s.level}%</span>
                      </div>
                      <div class="skill-bar-track">
                        <div class="skill-bar-fill" style="width: ${s.level}%; background: linear-gradient(90deg, ${station.accentHex}88, ${station.accentHex});"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="education-container">
            <div class="edu-section">
              <h4 class="section-subheading">Education</h4>
              ${degrees.map(deg => `
                <div class="edu-card">
                  <div class="edu-header">
                    <h5>${deg.degree}</h5>
                    <span class="edu-year">${deg.year}</span>
                  </div>
                  <div class="edu-institution">${deg.institution}</div>
                  <p class="edu-details">${deg.details}</p>
                </div>
              `).join('')}
            </div>

            <div class="edu-columns">
              <div class="edu-section">
                <h4 class="section-subheading">Credentials</h4>
                <div class="cert-list">
                  ${certifications.map(c => `
                    <div class="cert-item">
                      <strong>${c.name}</strong>
                      <span>${c.issuer} (${c.year})</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="edu-section">
                <h4 class="section-subheading">Languages</h4>
                <div class="lang-list">
                  ${languages.map(l => `
                    <div class="lang-item">
                      <span class="lang-name">${l.language}</span>
                      <span class="lang-level">${l.proficiency}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
        break;
      }

      case 'contact': {
        const { callToAction, links, availability } = station.content;
        contentHtml = `
          <div class="contact-container">
            <p class="contact-cta">${callToAction}</p>
            <div class="contact-cards-grid">
              ${links.map(item => `
                <div class="contact-card">
                  <span class="contact-icon">${item.icon}</span>
                  <div class="contact-info">
                    <span class="contact-label">${item.name}</span>
                    ${item.href ? 
                      `<a href="${item.href}" target="_blank" rel="noopener noreferrer" class="contact-val">${item.value}</a>` : 
                      `<span class="contact-val">${item.value}</span>`
                    }
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="availability-banner">
              <span class="avail-dot"></span>
              <span>${availability}</span>
            </div>
          </div>
        `;
        break;
      }
    }

    // Bottom modal footer with station pagination
    const currentIndex = this.cvData.stations.findIndex(s => s.id === station.id);
    const prevStation = this.cvData.stations[(currentIndex - 1 + this.cvData.stations.length) % this.cvData.stations.length];
    const nextStation = this.cvData.stations[(currentIndex + 1) % this.cvData.stations.length];

    contentHtml += `
      <div class="modal-pagination">
        <button id="modal-prev-btn" class="modal-nav-btn">← Station ${prevStation.number}: ${prevStation.title}</button>
        <button id="modal-next-btn" class="modal-nav-btn">Station ${nextStation.number}: ${nextStation.title} →</button>
      </div>
    `;

    this.modalBody.innerHTML = contentHtml;

    // Attach navigation button handlers
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.populateModal(prevStation));
    if (nextBtn) nextBtn.addEventListener('click', () => this.populateModal(nextStation));
  }

  renderQuickTravelBar() {
    const dock = document.getElementById('quick-travel-dock');
    if (!dock) return;

    dock.innerHTML = `
      <span class="dock-label">Teleport:</span>
      ${this.cvData.stations.map((s, idx) => `
        <button class="dock-item" data-station="${s.id}" title="Jump to ${s.title}">
          <span class="dock-key">${idx + 1}</span>
          <span class="dock-text">${s.title}</span>
        </button>
      `).join('')}
    `;

    dock.querySelectorAll('.dock-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.station;
        const target = this.cvData.stations.find(s => s.id === id);
        if (target) {
          this.teleportToStation(target);
          if (this.controls.isTouchMode) {
            this.openModal(target);
          }
        }
      });
    });
  }

  teleportToStation(station) {
    // Position player ~3m in front of the kiosk facing it
    const angle = station.rotation;
    const forwardX = Math.sin(angle);
    const forwardZ = Math.cos(angle);

    const targetX = station.position.x + forwardX * 2.8;
    const targetZ = station.position.z + forwardZ * 2.8;
    const targetLookAngle = angle + Math.PI;

    this.controls.teleportTo(targetX, targetZ, targetLookAngle);
  }

  updateMinimap(playerCamera) {
    if (!this.minimapCtx) return;

    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const roomW = this.roomSize.width;
    const roomD = this.roomSize.depth;

    ctx.clearRect(0, 0, w, h);

    // Coordinate conversion: 3D world (X, Z) to 2D Canvas (cx, cy)
    const mapX = (x) => ((x + roomW / 2) / roomW) * (w - 24) + 12;
    const mapY = (z) => ((z + roomD / 2) / roomD) * (h - 24) + 12;

    // Room boundary border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Gallery Pillars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(([px, pz]) => {
      ctx.fillRect(mapX(px) - 3, mapY(pz) - 3, 6, 6);
    });

    // Kiosk beacons
    this.cvData.stations.forEach(st => {
      const kx = mapX(st.position.x);
      const ky = mapY(st.position.z);

      ctx.fillStyle = st.accentHex;
      ctx.beginPath();
      ctx.arc(kx, ky, 5, 0, Math.PI * 2);
      ctx.fill();

      // Station number label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(st.number, kx - 5, ky - 8);
    });

    // Player position & orientation cone
    const px = mapX(playerCamera.position.x);
    const py = mapY(playerCamera.position.z);

    // Orientation angle (Euler Y)
    const angle = this.controls.euler.y;

    // FOV cone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 22, -angle - Math.PI / 2 - 0.45, -angle - Math.PI / 2 + 0.45);
    ctx.closePath();
    ctx.fill();

    // Player dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  toggle2DMode() {
    this.is2DMode = !this.is2DMode;
    const view3D = document.getElementById('view-3d');
    const view2D = document.getElementById('view-2d');
    const toggleBtn = document.getElementById('toggle-2d-mode-btn');

    if (this.is2DMode) {
      if (view3D) view3D.style.display = 'none';
      if (view2D) view2D.style.display = 'block';
      if (toggleBtn) toggleBtn.innerHTML = '🎮 Switch to 3D Experience';
      this.controls.unlock();
      this.controls.enabled = false;
      window.scrollTo(0, 0);
    } else {
      if (view3D) view3D.style.display = 'block';
      if (view2D) view2D.style.display = 'none';
      if (toggleBtn) toggleBtn.innerHTML = '📄 Traditional 2D CV';
      this.controls.enabled = true;
    }
  }

  render2DCVContent() {
    const container = document.getElementById('cv-2d-container');
    if (!container) return;

    const { personal, stations } = this.cvData;

    container.innerHTML = `
      <header class="cv-header">
        <div class="cv-header-text">
          <h1 class="cv-name">${personal.name}</h1>
          <h2 class="cv-title">${personal.title}</h2>
          <p class="cv-tagline">${personal.subtitle}</p>
        </div>
        <div class="cv-header-contact">
          <div>📍 ${personal.location}</div>
          <div>📧 <a href="mailto:${personal.email}">${personal.email}</a></div>
          <div>🔗 <a href="${personal.website}" target="_blank">${personal.website}</a></div>
          <div>💼 <span class="cv-badge">${personal.status}</span></div>
        </div>
      </header>

      <section class="cv-section">
        <h3 class="cv-section-title">Personal Statement</h3>
        <p class="cv-summary">${personal.summary}</p>
      </section>

      ${stations.map(st => {
        if (st.id === 'experience') {
          return `
            <section class="cv-section">
              <h3 class="cv-section-title">Work Experience</h3>
              <div class="cv-experience-list">
                ${st.content.roles.map(r => `
                  <div class="cv-job">
                    <div class="cv-job-header">
                      <div>
                        <strong class="cv-job-title">${r.role}</strong>
                        <span class="cv-job-company"> // ${r.company}</span>
                      </div>
                      <span class="cv-job-period">${r.period}</span>
                    </div>
                    <p class="cv-job-desc">${r.description}</p>
                    <ul class="cv-job-bullets">
                      ${r.highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                    <div class="tech-tag-row">
                      ${r.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }

        if (st.id === 'interests') {
          return `
            <section class="cv-section">
              <h3 class="cv-section-title">Personal Interests & Outside of Work</h3>
              <p class="cv-summary" style="margin-bottom: 16px;">${st.content.intro}</p>
              <div class="cv-interests-grid">
                ${st.content.sections.map(sec => `
                  <div class="cv-interest-card" style="background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 18px; margin-bottom: 14px;">
                    <div class="cv-proj-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <h4 style="font-size: 16px; color: #fff;">${sec.icon} ${sec.title}</h4>
                      <span class="project-badge" style="border-color: #8b5cf6; color: #8b5cf6;">${sec.badge}</span>
                    </div>
                    <p style="color: #a78bfa; font-size: 13px; font-weight: 600; margin-bottom: 8px;">${sec.highlight}</p>
                    <p style="font-size: 14px; color: #c9d1d9; margin-bottom: 10px; line-height: 1.6;">${sec.description}</p>
                    <ul class="cv-job-bullets">
                      ${sec.details.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }

        if (st.id === 'skills') {
          return `
            <section class="cv-section">
              <h3 class="cv-section-title">Skills & Background</h3>
              <h4 class="cv-subsection-title">Technical Capabilities</h4>
              <div class="cv-skills-grid">
                ${st.content.categories.map(c => `
                  <div class="cv-skill-col">
                    <h4>${c.name}</h4>
                    <ul>
                      ${c.skills.map(s => `<li>${s.name} (${s.level}%)</li>`).join('')}
                    </ul>
                  </div>
                `).join('')}
              </div>
              <h4 class="cv-subsection-title">Education</h4>
              <div class="cv-edu-list">
                ${st.content.degrees.map(d => `
                  <div class="cv-edu-item">
                    <strong>${d.degree}</strong> — ${d.institution} (${d.year})
                    <p>${d.details}</p>
                  </div>
                `).join('')}
              </div>
              <div class="cv-skills-grid cv-background-grid">
                <div class="cv-skill-col">
                  <h4>Credentials</h4>
                  <ul>
                    ${st.content.certifications.map(c => `<li>${c.name} — ${c.issuer} (${c.year})</li>`).join('')}
                  </ul>
                </div>
                <div class="cv-skill-col">
                  <h4>Languages</h4>
                  <ul>
                    ${st.content.languages.map(l => `<li>${l.language} — ${l.proficiency}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </section>
          `;
        }

        if (st.id === 'contact') {
          return `
            <section class="cv-section">
              <h3 class="cv-section-title">Contact & Networks</h3>
              <p>${st.content.callToAction}</p>
              <div class="cv-contact-row">
                ${st.content.links.map(l => `
                  <div class="cv-contact-chip">
                    <span>${l.icon} <strong>${l.name}:</strong></span>
                    ${l.href ? `<a href="${l.href}" target="_blank">${l.value}</a>` : `<span>${l.value}</span>`}
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        }
        return '';
      }).join('')}
    `;
  }
}
