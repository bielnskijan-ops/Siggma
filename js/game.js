/**
 * KOZMINSKI ESCAPE: POLOWANIE NA ECTS
 * js/game.js - Główny silnik gry 2D: Kampus Akademii Leona Koźmińskiego,
 * fizyka ruchu wektorowego, kolizje, AI Egzaminatora, power-upy i audio.
 */

(() => {
  // --- STAŁE I KONFIGURACJA ROZGRYWKI ---
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 540;
  const TARGET_ECTS = 30;

  // Autentyczne komiksowe cytaty Egzaminatora ALK
  const PROFESSOR_QUOTES = [
    "„A gdzie przypis harwardzki?!”",
    "„Ten bilans się nie zamyka!”",
    "„Widzę Pana we wrześniu!”",
    "„USOS właśnie zamknął protokół!”",
    "„Czy ten esej pisał Pan, czy ChatGPT?!”",
    "„Brak bibliografii w formacie APA 7th?! Warunek!”",
    "„Statystyka opisowa Pana nie oszczędzi, panie kolego!”",
    "„Ucieczka z kolokwium nie zwalnia z obecności!”"
  ];

  // Pobranie elementów interfejsu (HUD & Modale)
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const ectsCounterEl = document.getElementById("ects-counter");
  const ectsGoalEl = document.getElementById("ects-goal");
  const ectsProgressBarEl = document.getElementById("ects-progress-bar");

  const staminaTextEl = document.getElementById("stamina-text");
  const staminaProgressBarEl = document.getElementById("stamina-progress-bar");

  const campusStatusEl = document.getElementById("campus-status");
  const threatIndicatorEl = document.getElementById("threat-indicator");
  const threatStatusEl = document.getElementById("threat-status");

  const speechBubbleEl = document.getElementById("professorSpeech");
  const speechTextEl = document.getElementById("professorSpeechText");
  const toastEl = document.getElementById("game-toast");

  const startModalEl = document.getElementById("startModal");
  const gameOverModalEl = document.getElementById("gameOverModal");
  const victoryModalEl = document.getElementById("victoryModal");

  const btnStartEl = document.getElementById("btn-start-game");
  const btnRestartEl = document.getElementById("btn-restart-game");
  const btnPlayAgainEl = document.getElementById("btn-play-again");
  const btnAudioToggleEl = document.getElementById("btn-audio-toggle");
  const audioIconEl = document.getElementById("audio-icon");

  const finalEctsFailedEl = document.getElementById("final-ects-failed");
  const survivalTimeFailedEl = document.getElementById("survival-time-failed");
  const examFinalQuoteEl = document.getElementById("exam-final-quote");

  const finalEctsWonEl = document.getElementById("final-ects-won");
  const survivalTimeWonEl = document.getElementById("survival-time-won");

  const btnTouchSprint = document.getElementById("btn-touch-sprint");
  const touchDpadButtons = document.querySelectorAll(".dpad-btn");

  // --- KLAWIATURA I STEROWANIE ---
  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false,
    ShiftLeft: false,
    ShiftRight: false,
    Space: false
  };

  let isTouchSprinting = false;

  // --- 1. UKŁAD KAMPUSU ALK NA CANVASIE ---
  // Sale i aule z wymaganymi nazwami
  const ZONES = [
    { name: "Aula A", x: 24, y: 24, w: 230, h: 200, color: "#002244", label: "AULA A" },
    { name: "Biblioteka", x: 546, y: 24, w: 230, h: 200, color: "#003366", label: "BIBLIOTEKA" },
    { name: "Lab Komputerowy", x: 24, y: 316, w: 230, h: 200, color: "#002855", label: "LAB KOMPUTEROWY" },
    { name: "Dziekanat", x: 546, y: 316, w: 230, h: 200, color: "#001f3f", label: "DZIEKANAT" },
    { name: "Patio ALK 🌿", x: 275, y: 155, w: 250, h: 230, color: "#063d27", isPatio: true, label: "PATIO ALK 🌿" }
  ];

  // Ściany budynków i przeszkody kampusu
  const WALLS = [
    // Obrzeża zewnętrzne
    { x: 0, y: 0, w: CANVAS_WIDTH, h: 14 },
    { x: 0, y: CANVAS_HEIGHT - 14, w: CANVAS_WIDTH, h: 14 },
    { x: 0, y: 0, w: 14, h: CANVAS_HEIGHT },
    { x: CANVAS_WIDTH - 14, y: 0, w: 14, h: CANVAS_HEIGHT },

    // Aula A (lewy górny) - ściany z drzwiami
    { x: 254, y: 14, w: 12, h: 90 },
    { x: 254, y: 154, w: 12, h: 70 },
    { x: 14, y: 224, w: 100, h: 12 },
    { x: 164, y: 224, w: 102, h: 12 },

    // Biblioteka (prawy górny) - ściany z drzwiami
    { x: 534, y: 14, w: 12, h: 90 },
    { x: 534, y: 154, w: 12, h: 70 },
    { x: 534, y: 224, w: 100, h: 12 },
    { x: 684, y: 224, w: 102, h: 12 },

    // Lab Komputerowy (lewy dolny) - ściany z drzwiami
    { x: 14, y: 304, w: 100, h: 12 },
    { x: 164, y: 304, w: 102, h: 12 },
    { x: 254, y: 304, w: 12, h: 90 },
    { x: 254, y: 444, w: 12, h: 82 },

    // Dziekanat (prawy dolny) - ściany z drzwiami
    { x: 534, y: 304, w: 100, h: 12 },
    { x: 684, y: 304, w: 102, h: 12 },
    { x: 534, y: 304, w: 12, h: 90 },
    { x: 534, y: 444, w: 12, h: 82 },

    // Przeszkody stałe Patio (zielone gazony i fontanna)
    { x: 320, y: 210, w: 36, h: 36, isPatioPlant: true },
    { x: 444, y: 210, w: 36, h: 36, isPatioPlant: true },
    { x: 382, y: 300, w: 36, h: 36, isPatioPlant: true }
  ];

  // --- STAN ROZGRYWKI ---
  let isRunning = false;
  let gameStartTime = 0;
  let ectsCount = 0;
  let lastQuoteTime = 0;
  let quoteHideTimeout = null;
  let toastHideTimeout = null;
  let invulnerabilityTimer = 0; // Nietykalność po utracie tarczy

  // --- 2. GRACZ (STUDENT ALK) ---
  const student = {
    x: 400,
    y: 470,
    radius: 14,
    baseSpeed: 3.2,
    sprintSpeed: 5.6,
    stamina: 100,
    maxStamina: 100,
    staminaDrain: 25,          // Zużycie energii na sekundę podczas sprintu
    staminaRecoveryNormal: 14,  // Normalna regeneracja energii
    staminaRecoveryPatio: 32,   // Regeneracja na Patio ALK 🌿 (2x szybsza!)
    coffeeBoostTimer: 0,        // Turbo-szybkość po kawie
    hasShield: false,           // Legitymacja ALK (tarcza absorbująca 1 uderzenie)
    angle: -Math.PI / 2
  };

  // --- 3. PRZECIWNIK (EGZAMINATOR) ---
  const professor = {
    x: 400,
    y: 80,
    radius: 16,
    baseSpeed: 2.15,
    freezeTimer: 0,             // Paraliż przez Gemini AI (3.5s)
    angle: Math.PI / 2,
    speechCooldown: 0
  };

  // --- 4. PRZEDMIOTY (ECTS, KAWA, GEMINI AI, LEGITYMACJA) ---
  let items = [];

  // Pokaż powiadomienie toast na planszy
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    if (toastHideTimeout) clearTimeout(toastHideTimeout);
    toastHideTimeout = setTimeout(() => {
      toastEl.classList.add("hidden");
    }, 2200);
  }

  // Wyświetlenie komiksowego dymka wypowiedzi profesora
  function triggerProfessorSpeech(customText = null) {
    const text = customText || PROFESSOR_QUOTES[Math.floor(Math.random() * PROFESSOR_QUOTES.length)];
    speechTextEl.textContent = text;
    speechBubbleEl.classList.remove("hidden");

    if (window.SoundSystem) {
      window.SoundSystem.play('freeze');
    }

    if (quoteHideTimeout) clearTimeout(quoteHideTimeout);
    quoteHideTimeout = setTimeout(() => {
      speechBubbleEl.classList.add("hidden");
    }, 3800);
  }

  // Sprawdzanie obecności studenta w strefie Patio ALK 🌿
  function isStudentInPatio() {
    const patio = ZONES.find(z => z.isPatio);
    return (
      student.x >= patio.x &&
      student.x <= patio.x + patio.w &&
      student.y >= patio.y &&
      student.y <= patio.y + patio.h
    );
  }

  // Odczyt aktualnej strefy do paska HUD
  function getZoneName(x, y) {
    for (const z of ZONES) {
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
        return z.name;
      }
    }
    return "Korytarz Główny ALK";
  }

  // Precyzyjna kolizja koła ze ścianą (zwraca true w razie przecięcia)
  function testWallCollision(px, py, radius) {
    for (const w of WALLS) {
      const closestX = Math.max(w.x, Math.min(px, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(py, w.y + w.h));
      const dx = px - closestX;
      const dy = py - closestY;
      if (dx * dx + dy * dy < radius * radius) {
        return true;
      }
    }
    return false;
  }

  // Wektorowy ruch z płynnym ślizganiem po ścianach
  function moveWithWallSliding(entity, vx, vy, speed, dt) {
    if (vx === 0 && vy === 0) return;

    // Normalizacja wektora
    const len = Math.hypot(vx, vy);
    const stepX = (vx / len) * speed * 60 * dt;
    const stepY = (vy / len) * speed * 60 * dt;

    entity.angle = Math.atan2(vy, vx);

    // Krok w osi X
    if (!testWallCollision(entity.x + stepX, entity.y, entity.radius)) {
      entity.x += stepX;
    }
    // Krok w osi Y
    if (!testWallCollision(entity.x, entity.y + stepY, entity.radius)) {
      entity.y += stepY;
    }
  }

  // Losowy spawn przedmiotów poza ścianami kampusu
  function spawnItem(itemType) {
    let valid = false;
    let rx = 50, ry = 50;
    let attempts = 0;

    while (!valid && attempts < 80) {
      attempts++;
      rx = 35 + Math.random() * (CANVAS_WIDTH - 70);
      ry = 35 + Math.random() * (CANVAS_HEIGHT - 70);

      // Weryfikacja odległości od ścian
      let collides = false;
      for (const w of WALLS) {
        if (rx >= w.x - 20 && rx <= w.x + w.w + 20 && ry >= w.y - 20 && ry <= w.y + w.h + 20) {
          collides = true;
          break;
        }
      }
      if (!collides) valid = true;
    }

    if (!valid) return;

    if (itemType === "ECTS") {
      const isBonus = Math.random() < 0.2;
      items.push({
        type: "ECTS",
        x: rx,
        y: ry,
        value: isBonus ? 3 : 1,
        radius: isBonus ? 12 : 9,
        symbol: isBonus ? "💎+3" : "💎",
        color: isBonus ? "#ffc740" : "#38bdf8",
        label: isBonus ? "+3 ECTS" : "+1 ECTS"
      });
    } else if (itemType === "COFFEE") {
      items.push({
        type: "COFFEE",
        x: rx,
        y: ry,
        radius: 13,
        symbol: "☕",
        label: "Kawa z Patio ALK"
      });
    } else if (itemType === "GEMINI") {
      items.push({
        type: "GEMINI",
        x: rx,
        y: ry,
        radius: 13,
        symbol: "🤖",
        label: "Gemini AI"
      });
    } else if (itemType === "SHIELD") {
      items.push({
        type: "SHIELD",
        x: rx,
        y: ry,
        radius: 13,
        symbol: "🪪",
        label: "Legitymacja ALK"
      });
    }
  }

  // Zarządzanie stanem i liczebnością przedmiotów na mapie
  function replenishCampusItems() {
    const ectsItems = items.filter(i => i.type === "ECTS");
    const coffeeItems = items.filter(i => i.type === "COFFEE");
    const geminiItems = items.filter(i => i.type === "GEMINI");
    const shieldItems = items.filter(i => i.type === "SHIELD");

    while (ectsItems.length + items.filter(i => i.type === "ECTS").length < 12) {
      spawnItem("ECTS");
    }
    if (coffeeItems.length < 2) spawnItem("COFFEE");
    if (geminiItems.length < 1) spawnItem("GEMINI");
    if (shieldItems.length < 1 && !student.hasShield) spawnItem("SHIELD");
  }

  // --- RESET I START NOWEJ ROZGRYWKI ---
  function startNewGame() {
    isRunning = true;
    gameStartTime = Date.now();
    ectsCount = 0;
    lastQuoteTime = Date.now();
    invulnerabilityTimer = 0;

    student.x = 400;
    student.y = 470;
    student.stamina = 100;
    student.coffeeBoostTimer = 0;
    student.hasShield = false;

    professor.x = 400;
    professor.y = 80;
    professor.freezeTimer = 0;

    items = [];
    for (let i = 0; i < 11; i++) spawnItem("ECTS");
    spawnItem("COFFEE");
    spawnItem("COFFEE");
    spawnItem("GEMINI");
    spawnItem("SHIELD");

    startModalEl.classList.add("hidden");
    gameOverModalEl.classList.add("hidden");
    victoryModalEl.classList.add("hidden");
    speechBubbleEl.classList.add("hidden");

    if (window.SoundSystem) {
      window.SoundSystem.init();
    }

    updateHUD();
    triggerProfessorSpeech("„Egzamin rozpoczęty! Proszę schować notatki!”");
  }

  // Porażka: Kampania Wrześniowa
  function handleGameOver() {
    isRunning = false;
    if (window.SoundSystem) {
      window.SoundSystem.play('hit');
    }

    const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = (elapsedSeconds % 60).toString().padStart(2, "0");

    finalEctsFailedEl.textContent = `${ectsCount} / ${TARGET_ECTS}`;
    survivalTimeFailedEl.textContent = `${mins}:${secs}`;
    examFinalQuoteEl.textContent = PROFESSOR_QUOTES[Math.floor(Math.random() * PROFESSOR_QUOTES.length)];

    gameOverModalEl.classList.remove("hidden");
  }

  // Zwycięstwo: Zaliczony Semestr
  function handleVictory() {
    isRunning = false;
    if (window.SoundSystem) {
      window.SoundSystem.play('win');
    }

    const elapsedSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = (elapsedSeconds % 60).toString().padStart(2, "0");

    finalEctsWonEl.textContent = `${ectsCount} / ${TARGET_ECTS}`;
    survivalTimeWonEl.textContent = `${mins}:${secs}`;

    victoryModalEl.classList.remove("hidden");
  }

  // Aktualizacja Paska Stanu (HUD)
  function updateHUD() {
    ectsCounterEl.textContent = ectsCount;
    ectsGoalEl.textContent = TARGET_ECTS;
    const progressPct = Math.min(100, Math.round((ectsCount / TARGET_ECTS) * 100));
    ectsProgressBarEl.style.width = `${progressPct}%`;

    const staminaPct = Math.max(0, Math.min(100, Math.round(student.stamina)));
    staminaTextEl.textContent = `${staminaPct}%`;
    staminaProgressBarEl.style.width = `${staminaPct}%`;

    if (student.stamina < 20) {
      staminaProgressBarEl.classList.add("tired");
    } else {
      staminaProgressBarEl.classList.remove("tired");
    }

    campusStatusEl.textContent = getZoneName(student.x, student.y);

    const distToProf = Math.hypot(student.x - professor.x, student.y - professor.y);
    if (professor.freezeTimer > 0) {
      threatIndicatorEl.className = "threat-indicator";
      threatStatusEl.textContent = `EGZAMINATOR ZAMROŻONY ❄️ (${professor.freezeTimer.toFixed(1)}s)`;
    } else if (distToProf < 140) {
      threatIndicatorEl.className = "threat-indicator danger";
      threatStatusEl.textContent = "EGZAMINATOR TUŻ OBOK!";
    } else if (distToProf < 280) {
      threatIndicatorEl.className = "threat-indicator caution";
      threatStatusEl.textContent = "KROKI W POBLIŻU";
    } else {
      threatIndicatorEl.className = "threat-indicator";
      threatStatusEl.textContent = "BEZPIECZNIE";
    }
  }

  // --- GŁÓWNA AKTUALIZACJA FIZYKI I LOGIKI ---
  let lastTime = performance.now();

  function updateGame(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;

    if (!isRunning) return;

    if (invulnerabilityTimer > 0) {
      invulnerabilityTimer -= dt;
    }

    // 1. KONTROLA I RUCH STUDENTA (WASD / Strzałki / Dotyk)
    let vx = 0;
    let vy = 0;

    if (keys.ArrowUp || keys.KeyW) vy -= 1;
    if (keys.ArrowDown || keys.KeyS) vy += 1;
    if (keys.ArrowLeft || keys.KeyA) vx -= 1;
    if (keys.ArrowRight || keys.KeyD) vx += 1;

    const isMoving = vx !== 0 || vy !== 0;
    // Sprint pod Spacją lub Shiftem lub przyciskiem dotykowym
    const wantsSprint = (keys.Space || keys.ShiftLeft || keys.ShiftRight || isTouchSprinting) && isMoving && student.stamina > 4;

    let currentSpeed = student.baseSpeed;
    if (student.coffeeBoostTimer > 0) {
      student.coffeeBoostTimer -= dt;
      currentSpeed *= 1.45; // 5s turbo-szybkości po Kawie z Patio ALK
    }

    if (wantsSprint) {
      currentSpeed = student.sprintSpeed * (student.coffeeBoostTimer > 0 ? 1.3 : 1.0);
      student.stamina = Math.max(0, student.stamina - student.staminaDrain * dt);
    } else {
      // Regeneracja energii w spoczynku (na Patio ALK 🌿 regeneracja 2x szybsza!)
      const inPatio = isStudentInPatio();
      const recoveryRate = inPatio ? student.staminaRecoveryPatio : student.staminaRecoveryNormal;
      student.stamina = Math.min(student.maxStamina, student.stamina + recoveryRate * dt);
    }

    if (isMoving) {
      moveWithWallSliding(student, vx, vy, currentSpeed, dt);
    }

    // 2. AI EGZAMINATORA (Śledzenie studenta, przyspiesza z każdym ECTS)
    if (professor.freezeTimer > 0) {
      professor.freezeTimer -= dt;
    } else {
      // Formuła przyspieszenia: bazowa prędkość + bonus skalowany z liczbą zebranych ECTS!
      const ectsSpeedBonus = (ectsCount / TARGET_ECTS) * 1.55;
      const profSpeed = professor.baseSpeed + ectsSpeedBonus;

      // Wektor pościgu
      const dx = student.x - professor.x;
      const dy = student.y - professor.y;
      moveWithWallSliding(professor, dx, dy, profSpeed, dt);

      // Losowe rzucanie akademickich cytatów w pościgu
      if (now - lastQuoteTime > 8000 && Math.random() < 0.35) {
        lastQuoteTime = now;
        triggerProfessorSpeech();
      }
    }

    // 3. KOLIZJA Z PROFESOREM
    const distToStudent = Math.hypot(student.x - professor.x, student.y - professor.y);
    if (distToStudent < student.radius + professor.radius) {
      if (invulnerabilityTimer <= 0) {
        if (student.hasShield) {
          // Legitymacja ALK absorbuje uderzenie!
          student.hasShield = false;
          invulnerabilityTimer = 1.8; // 1.8 sekundy tarczy ochronnej na ucieczkę
          professor.x += (professor.x - student.x) * 1.2;
          professor.y += (professor.y - student.y) * 1.2;

          if (window.SoundSystem) {
            window.SoundSystem.play('shield');
          }
          showToast("🪪 Legitymacja ALK ochroniła Cię przed niezdanym egzaminem!");
        } else {
          // Brak tarczy - schwytanie i Kampania Wrześniowa
          handleGameOver();
          return;
        }
      }
    }

    // 4. ZBIERANIE PRZEDMIOTÓW (ECTS, Kawa, Gemini AI, Legitymacja ALK)
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const d = Math.hypot(student.x - it.x, student.y - it.y);

      if (d < student.radius + it.radius) {
        if (it.type === "ECTS") {
          ectsCount += it.value;
          if (window.SoundSystem) window.SoundSystem.play('ects');
          showToast(`+${it.value} ECTS (${ectsCount}/${TARGET_ECTS})!`);

          if (ectsCount >= TARGET_ECTS) {
            handleVictory();
            return;
          }
        } else if (it.type === "COFFEE") {
          student.coffeeBoostTimer = 5.0; // 5s turbo-szybkości
          student.stamina = student.maxStamina;
          if (window.SoundSystem) window.SoundSystem.play('coffee');
          showToast("☕ Kawa z Patio ALK! Turbo-szybkość na 5 sekund!");
        } else if (it.type === "GEMINI") {
          professor.freezeTimer = 3.5; // Paraliż profesora na 3.5s
          if (window.SoundSystem) window.SoundSystem.play('freeze');
          showToast("🤖 Gemini AI zadało pytanie! Profesor sparaliżowany na 3.5s!");
          triggerProfessorSpeech("„Moment... Czy ten prompt ma błąd logiczny w tokenie?!”");
        } else if (it.type === "SHIELD") {
          student.hasShield = true;
          if (window.SoundSystem) window.SoundSystem.play('shield');
          showToast("🪪 Legitymacja ALK! Tarcza chroni Cię przed 1 uderzeniem!");
        }

        items.splice(i, 1);
        replenishCampusItems();
      }
    }

    updateHUD();
  }

  // --- RENDEROWANIE KAMPUSU ALK NA CANVASIE ---
  function renderGame() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Posadzka korytarzy ALK
    ctx.fillStyle = "#0a1128";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Kafelki i siatka geometryczna
    ctx.strokeStyle = "rgba(242, 169, 0, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Aule i strefy z podpisami
    for (const z of ZONES) {
      ctx.fillStyle = z.color;
      ctx.fillRect(z.x, z.y, z.w, z.h);

      if (z.isPatio) {
        // Patio ALK 🌿 - zielony trawnik, szklane zadaszenie i poświata
        ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
        ctx.lineWidth = 2.5;
        ctx.strokeRect(z.x, z.y, z.w, z.h);

        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.beginPath();
        ctx.arc(z.x + z.w / 2, z.y + z.h / 2, 70, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#34d399";
        ctx.font = "bold 15px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌿 PATIO ALK 🌿", z.x + z.w / 2, z.y + 32);
        ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText("Strefa relaksu: regeneracja energii 2x szybsza", z.x + z.w / 2, z.y + 50);
      } else {
        // Sale: Aula A, Biblioteka, Dziekanat, Lab Komputerowy
        ctx.strokeStyle = "rgba(242, 169, 0, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(z.x, z.y, z.w, z.h);

        ctx.fillStyle = "#ffc740";
        ctx.font = "bold 13px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(z.label, z.x + z.w / 2, z.y + 26);
      }
    }

    // Ściany i rośliny Patio
    for (const w of WALLS) {
      if (w.isPatioPlant) {
        ctx.fillStyle = "#064e3b";
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
        ctx.font = "18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🪴", w.x + w.w / 2, w.y + w.h / 2 + 6);
      } else {
        // Granatowe ściany uczelni ze złotym rantem
        ctx.fillStyle = "#001f3f";
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = "rgba(0, 75, 135, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      }
    }

    // Przedmioty na kampusie (animacja unoszenia)
    const timeSec = performance.now() / 1000;
    for (const it of items) {
      const bob = Math.sin(timeSec * 4 + it.x * 0.1) * 3;

      if (it.type === "ECTS") {
        // Kryształ ECTS
        ctx.fillStyle = "rgba(242, 169, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(it.x, it.y + bob, it.radius * 1.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = it.color;
        ctx.beginPath();
        ctx.arc(it.x, it.y + bob, it.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#002244";
        ctx.font = "bold 10px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(it.symbol, it.x, it.y + bob + 3);
      } else {
        // Kawa, Gemini AI, Legitymacja ALK
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.arc(it.x, it.y + bob, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "17px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(it.symbol, it.x, it.y + bob + 6);
      }
    }

    // RYSOWANIE PROFESORA (EGZAMINATOR)
    ctx.save();
    ctx.translate(professor.x, professor.y);

    if (professor.freezeTimer > 0) {
      // Efekt zamrożenia cyber-freeze
      ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, professor.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 13px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("❄️ ZAMROŻONY", 0, -22);
    } else {
      // Stożek widzenia i radaru egzaminatora
      ctx.fillStyle = "rgba(239, 68, 68, 0.12)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 110, professor.angle - 0.5, professor.angle + 0.5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.rotate(professor.angle);
    ctx.fillStyle = "#831843"; // Bordowy garnitur profesorski
    ctx.beginPath();
    ctx.arc(0, 0, professor.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🧐", 0, 6);
    ctx.restore();

    // RYSOWANIE STUDENTA (GRACZ)
    ctx.save();
    ctx.translate(student.x, student.y);

    // Poświata turbo-kawy
    if (student.coffeeBoostTimer > 0) {
      ctx.fillStyle = "rgba(242, 169, 0, 0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, student.radius * 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tarcza Legitymacji ALK
    if (student.hasShield) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, student.radius * 1.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Miganie podczas nietykalności
    if (invulnerabilityTimer > 0 && Math.floor(timeSec * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.rotate(student.angle);
    ctx.fillStyle = "#004b87"; // Granatowa bluza ALK
    ctx.beginPath();
    ctx.arc(0, 0, student.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f2a900"; // Złote wykończenie
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎒", 0, 5);
    ctx.restore();
  }

  // Pętla animacji gry
  function gameLoop(time) {
    updateGame(time);
    renderGame();
    requestAnimationFrame(gameLoop);
  }

  // --- OBSŁUGA KLAWISZY I STEROWANIA ---
  function setKeyState(e, isPressed) {
    const code = e.code;
    const key = e.key ? e.key.toLowerCase() : "";

    if (code === "ArrowUp" || key === "arrowup" || key === "w") {
      keys.ArrowUp = keys.KeyW = isPressed;
    }
    if (code === "ArrowDown" || key === "arrowdown" || key === "s") {
      keys.ArrowDown = keys.KeyS = isPressed;
    }
    if (code === "ArrowLeft" || key === "arrowleft" || key === "a") {
      keys.ArrowLeft = keys.KeyA = isPressed;
    }
    if (code === "ArrowRight" || key === "arrowright" || key === "d") {
      keys.ArrowRight = keys.KeyD = isPressed;
    }
    if (code === "ShiftLeft" || code === "ShiftRight" || key === "shift") {
      keys.ShiftLeft = keys.ShiftRight = isPressed;
    }
    if (code === "Space" || key === " " || key === "spacebar") {
      keys.Space = isPressed;
    }

    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) ||
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code)) {
      e.preventDefault();
    }
  }

  window.addEventListener("keydown", (e) => setKeyState(e, true));
  window.addEventListener("keyup", (e) => setKeyState(e, false));

  // Obsługa wirtualnego D-pada na dotyk i kliknięcia
  touchDpadButtons.forEach((btn) => {
    const dir = btn.getAttribute("data-dir");

    const press = (e) => {
      e.preventDefault();
      keys[dir] = true;
      btn.classList.add("pressed");
    };

    const release = (e) => {
      e.preventDefault();
      keys[dir] = false;
      btn.classList.remove("pressed");
    };

    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release);
    btn.addEventListener("touchcancel", release);
    btn.addEventListener("mousedown", press);
    btn.addEventListener("mouseup", release);
    btn.addEventListener("mouseleave", release);
  });

  // Wirtualny przycisk sprintu
  if (btnTouchSprint) {
    const startSprint = (e) => {
      e.preventDefault();
      isTouchSprinting = true;
      btnTouchSprint.classList.add("active");
    };
    const stopSprint = (e) => {
      e.preventDefault();
      isTouchSprinting = false;
      btnTouchSprint.classList.remove("active");
    };

    btnTouchSprint.addEventListener("touchstart", startSprint, { passive: false });
    btnTouchSprint.addEventListener("touchend", stopSprint);
    btnTouchSprint.addEventListener("touchcancel", stopSprint);
    btnTouchSprint.addEventListener("mousedown", startSprint);
    btnTouchSprint.addEventListener("mouseup", stopSprint);
    btnTouchSprint.addEventListener("mouseleave", stopSprint);
  }

  // Wyciszanie i włączanie dźwięku
  if (btnAudioToggleEl) {
    btnAudioToggleEl.addEventListener("click", () => {
      if (window.SoundSystem) {
        const isMuted = window.SoundSystem.toggleMute();
        audioIconEl.textContent = isMuted ? "🔇" : "🔊";
      }
    });
  }

  // Przyciski startu i powtórki
  if (btnStartEl) btnStartEl.addEventListener("click", startNewGame);
  if (btnRestartEl) btnRestartEl.addEventListener("click", startNewGame);
  if (btnPlayAgainEl) btnPlayAgainEl.addEventListener("click", startNewGame);

  // Start pętli renderowania
  requestAnimationFrame(gameLoop);
})();
