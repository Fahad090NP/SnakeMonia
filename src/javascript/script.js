// Enhanced Snake Game with Advanced Features
// Author: Enhanced by AI Assistant

class EnhancedSnakeGame {
  constructor() {
    this.initializeElements();
    this.initializeAudio();
    this.initializeGameState();
    this.initializeSettings();
    this.setupEventListeners();
    this.setupBoard();
    this.showStartMenu();
  }

  initializeElements() {
    // Game board and UI elements
    this.gameBoard = document.getElementById("game-board");
    this.scoreDisplay = document.getElementById("score-count");
    this.hiScoreDisplay = document.getElementById("hi-score-count");
    this.comboDisplay = document.getElementById("combo-count");
    this.fpsDisplay = document.getElementById("fps-value");

    // Menus
    this.startMenu = document.getElementById("start-menu");
    this.pauseMenu = document.getElementById("pause-menu");
    this.gameOverMenu = document.getElementById("game-over-menu");
    this.gameUI = document.getElementById("game-ui");

    // Power-up displays
    this.powerUpIndicator = document.getElementById("power-up-indicator");
    this.comboSection = document.getElementById("combo-sect");
    this.foodIndicator = document.getElementById("food-indicator");

    // New enhanced UI elements
    this.gameControls = document.getElementById("game-controls");
    this.pauseGameBtn = document.getElementById("pause-game-btn");
    this.muteGameBtn = document.getElementById("mute-game-btn");
    this.fullscreenGameBtn = document.getElementById("fullscreen-game-btn");
    this.specialEffects = document.getElementById("special-effects");
    this.screenFlash = document.getElementById("screen-flash");
    this.particleContainer = document.getElementById("particle-container");
    this.achievementPopup = document.getElementById("achievement-popup");

    // Game elements
    this.food = null;
    this.powerUps = [];
    this.obstacles = [];
    this.particles = [];
    this.achievements = [];
    this.streaks = {
      eating: 0,
      perfectTurns: 0,
      speedRuns: 0,
    };

    // Disable food indicator to prevent uneatable food issues
    if (this.foodIndicator) {
      this.foodIndicator.style.display = "none";
      this.foodIndicator.classList.add("hidden");
    }
  }

  initializeAudio() {
    // Initialize audio with only existing sound files
    this.sounds = {
      background: new Audio("./assets/sound/background.mp3"),
      gameOver: new Audio("./assets/sound/game-over.mp3"),
      eat: new Audio("./assets/sound/eat.mp3"),
      move: new Audio("./assets/sound/eat.mp3"), // Use eat sound for move as fallback
    };

    // Set default volumes
    this.sounds.background.volume = 0.6;
    this.sounds.background.loop = true;
    this.sounds.gameOver.volume = 0.5;
    this.sounds.eat.volume = 0.4;
    this.sounds.move.volume = 0.2;

    // Track audio state
    this.isMuted = false;
  }

  initializeGameState() {
    // Board dimensions
    this.boardWidth = window.innerWidth;
    this.boardHeight = window.innerHeight;

    // Adjust cell size for mobile
    const isMobile = window.innerWidth <= 768;
    const cellSize = isMobile ? 30 : 45;

    this.columns = Math.floor(this.boardWidth / cellSize);
    this.rows = Math.floor(this.boardHeight / cellSize);
    this.cellWidth = this.boardWidth / this.columns;
    this.cellHeight = this.boardHeight / this.rows;

    // Game state
    this.snake = [];
    this.snakeElements = [];
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.gameState = "menu"; // menu, playing, paused, gameOver
    this.gameStarted = false;
    this.animationId = null;

    // Cursor management
    this.cursorTimeout = null;
    this.setupCursorManagement();

    // Movement state for pause/resume functionality
    this.waitingForMovement = false;

    // Game stats
    this.score = 0;
    this.highScoreAchieved = false;
    this.level = 1;
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = null;
    this.gameTime = 0;
    this.lastUpdateTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;

    // Power-ups inventory
    this.inventory = {
      speedBoost: 0,
      shield: 0,
      freeze: 0,
    };

    // Active effects
    this.effects = {
      shield: { active: false, duration: 0 },
      speedBoost: { active: false, duration: 0 },
      freeze: { active: false, duration: 0 },
    };

    // Difficulty and settings
    this.baseSpeed = 8;
    this.currentSpeed = 8;
    this.speedMultiplier = 1;
    this.difficulty = "medium";
    this.gameMode = "classic";
  }

  initializeSettings() {
    this.settings = {
      wallCollision: true,
      soundEnabled: true,
      powerUpsEnabled: true,
      showFPS: false,
    };

    // Difficulty settings
    this.difficultySettings = {
      easy: { baseSpeed: 6, speedIncrease: 0.3, obstacles: false },
      medium: { baseSpeed: 8, speedIncrease: 0.5, obstacles: false },
      hard: { baseSpeed: 12, speedIncrease: 0.8, obstacles: true },
      expert: { baseSpeed: 16, speedIncrease: 1.2, obstacles: true },
    };

    // Game mode settings
    this.gameModeSettings = {
      classic: { powerUps: false, obstacles: false, timeLimit: false },
      modern: { powerUps: true, obstacles: false, timeLimit: false },
      survival: { powerUps: true, obstacles: true, timeLimit: true },
    };
  }

  setupBoard() {
    // Ensure proper grid setup for mobile
    const isMobile = window.innerWidth <= 768;

    // Set board size properly
    if (isMobile) {
      this.gameBoard.style.width = "100vw";
      this.gameBoard.style.height = "100vh";
      this.gameBoard.style.padding = "0";
      this.gameBoard.style.margin = "0";
      this.gameBoard.style.boxSizing = "border-box";
    }

    this.gameBoard.style.gridTemplateColumns = `repeat(${this.columns}, 1fr)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;

    // Ensure touch events work
    this.gameBoard.style.touchAction = "none";
    this.gameBoard.style.userSelect = "none";
    this.gameBoard.style.webkitUserSelect = "none";
    this.gameBoard.style.webkitTouchCallout = "none";
  }

  setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));

    // Touch controls for mobile
    this.setupTouchControls();

    // Handle window resize and orientation changes
    this.handleResize = () => {
      if (this.gameState === "playing") {
        // Pause the game during resize to prevent issues
        this.pauseGame();
      }

      // Reinitialize board dimensions
      this.boardWidth = window.innerWidth;
      this.boardHeight = window.innerHeight;

      const isMobile = window.innerWidth <= 768;
      const cellSize = isMobile ? 30 : 45;

      this.columns = Math.floor(this.boardWidth / cellSize);
      this.rows = Math.floor(this.boardHeight / cellSize);
      this.cellWidth = this.boardWidth / this.columns;
      this.cellHeight = this.boardHeight / this.rows;

      // Re-setup the board
      this.setupBoard();

      // Re-render if game is active
      if (this.gameState === "playing" || this.gameState === "paused") {
        this.renderSnake();
      }
    };

    window.addEventListener("resize", this.handleResize);
    window.addEventListener("orientationchange", this.handleResize);

    // Menu buttons
    document
      .getElementById("start-btn")
      .addEventListener("click", () => this.startNewGame());
    document
      .getElementById("resume-btn")
      .addEventListener("click", () => this.resumeGame());
    document
      .getElementById("restart-btn")
      .addEventListener("click", () => this.restartGame());
    document
      .getElementById("main-menu-btn")
      .addEventListener("click", () => this.showStartMenu());
    document
      .getElementById("play-again-btn")
      .addEventListener("click", () => this.startNewGame());
    document
      .getElementById("game-over-main-menu-btn")
      .addEventListener("click", () => this.showStartMenu());

    // Difficulty selection
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.selectDifficulty(e.target.dataset.difficulty)
      );
    });

    // Game mode selection
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.selectGameMode(e.target.dataset.mode)
      );
    });

    // Settings toggles
    document
      .getElementById("wall-collision-toggle")
      .addEventListener("change", (e) => {
        this.settings.wallCollision = e.target.checked;
      });

    document.getElementById("sound-toggle").addEventListener("change", (e) => {
      this.settings.soundEnabled = e.target.checked;
      if (!e.target.checked) {
        this.stopAllSounds();
      }
    });

    document
      .getElementById("power-ups-toggle")
      .addEventListener("change", (e) => {
        this.settings.powerUpsEnabled = e.target.checked;
      });

    // Window resize
    window.addEventListener("resize", () => this.handleResize());
  }

  handleKeyPress(event) {
    if (this.gameState === "menu") return;

    const key = event.key;

    // Prevent default behavior for game keys
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        " ",
        "Escape",
        "r",
        "R",
      ].includes(key)
    ) {
      event.preventDefault();
    }

    switch (key) {
      case "ArrowUp":
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: -1 };
          this.startGameIfNotStarted();
          this.waitingForMovement = false; // Resume movement
        }
        break;
      case "ArrowDown":
        if (this.direction.y === 0) {
          this.nextDirection = { x: 0, y: 1 };
          this.startGameIfNotStarted();
          this.waitingForMovement = false; // Resume movement
        }
        break;
      case "ArrowLeft":
        if (this.direction.x === 0) {
          this.nextDirection = { x: -1, y: 0 };
          this.startGameIfNotStarted();
          this.waitingForMovement = false; // Resume movement
        }
        break;
      case "ArrowRight":
        if (this.direction.x === 0) {
          this.nextDirection = { x: 1, y: 0 };
          this.startGameIfNotStarted();
          this.waitingForMovement = false; // Resume movement
        }
        break;
      case " ":
        this.togglePause();
        break;
      case "Escape":
        if (this.gameState === "playing") {
          this.pauseGame();
        } else if (this.gameState === "paused") {
          this.showStartMenu();
        }
        break;
      case "r":
      case "R":
        this.restartGame();
        break;
      // Power-up activation keys
      case "1":
        this.activatePowerUp("speedBoost");
        break;
      case "2":
        this.activatePowerUp("shield");
        break;
      case "3":
        this.activatePowerUp("freeze");
        break;
    }
  }

  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTap = 0;
    const minSwipeDistance = 30;
    const maxSwipeTime = 300;

    const gameBoard = this.gameBoard;

    // Add touch feedback
    const addTouchFeedback = () => {
      gameBoard.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
      setTimeout(() => {
        gameBoard.style.backgroundColor = "";
      }, 100);
    };

    // Single touchstart event
    gameBoard.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        addTouchFeedback();
      },
      { passive: false }
    );

    // Prevent scrolling during touch
    gameBoard.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false }
    );

    // Single touchend event that handles both swipes and double-tap
    gameBoard.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - lastTap;

        // Handle double-tap for fullscreen
        if (timeSinceLastTap < 500 && timeSinceLastTap > 0) {
          this.toggleFullscreen();
          lastTap = 0; // Reset to prevent triple-tap issues
          return;
        }
        lastTap = currentTime;

        // Handle game state transitions
        if (this.gameState === "menu") {
          this.startNewGame();
          return;
        }

        if (this.gameState === "paused") {
          this.resumeGame();
          return;
        }

        if (this.gameState !== "playing") return;

        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        const touchEndTime = currentTime;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const deltaTime = touchEndTime - touchStartTime;

        // Check if touch was too slow (not a swipe)
        if (deltaTime > maxSwipeTime) {
          this.togglePause();
          return;
        }

        // Determine if swipe is significant enough
        if (
          Math.abs(deltaX) < minSwipeDistance &&
          Math.abs(deltaY) < minSwipeDistance
        ) {
          // Tap to pause/unpause
          this.togglePause();
          return;
        }

        // Determine swipe direction with improved logic
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && this.direction.x !== -1) {
            // Swipe right
            this.setDirection(1, 0);
            this.waitingForMovement = false;
          } else if (deltaX < 0 && this.direction.x !== 1) {
            // Swipe left
            this.setDirection(-1, 0);
            this.waitingForMovement = false;
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && this.direction.y !== -1) {
            // Swipe down
            this.setDirection(0, 1);
            this.waitingForMovement = false;
          } else if (deltaY < 0 && this.direction.y !== 1) {
            // Swipe up
            this.setDirection(0, -1);
            this.waitingForMovement = false;
          }
        }
      },
      { passive: false }
    );
  }

  setDirection(x, y) {
    this.nextDirection = { x, y };
  }

  selectDifficulty(difficulty) {
    this.difficulty = difficulty;
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.difficulty === difficulty);
    });

    const settings = this.difficultySettings[difficulty];
    this.baseSpeed = settings.baseSpeed;
  }

  selectGameMode(mode) {
    this.gameMode = mode;
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });
  }

  showStartMenu() {
    this.gameState = "menu";
    this.stopGame();
    this.clearBoard();
    this.startMenu.classList.remove("hidden");
    this.pauseMenu.classList.add("hidden");
    this.gameOverMenu.classList.add("hidden");
    this.showCursor(); // Always show cursor in menu
  }

  startNewGame() {
    // Stop all sounds from any previous game
    this.stopAllSounds();

    this.initializeGameState();
    this.applyDifficultySettings();
    this.applyGameModeSettings();

    this.startMenu.classList.add("hidden");
    this.pauseMenu.classList.add("hidden");
    this.gameOverMenu.classList.add("hidden");

    this.clearBoard();
    this.spawnSnake();
    this.spawnFood();

    this.gameState = "playing";
    this.gameStarted = true;
    this.startTime = Date.now();
    this.lastUpdateTime = Date.now();

    // Show cursor initially - will hide when snake starts moving
    this.showCursor();

    // Don't start background music immediately - wait for snake to move
    if (this.settings.soundEnabled && !this.isMuted) {
      this.sounds.background.currentTime = 0;
      // Music will start when snake begins moving
    }

    // Initialize enhanced features
    this.initializeEnhancedFeatures();

    this.gameLoop();
    this.updateUI();

    // Initialize mute button display
    this.updateMuteButtonDisplay();
  }

  initializeEnhancedFeatures() {
    // Set up enhanced UI controls
    this.setupEnhancedControls();

    // Initialize achievement system
    this.initializeAchievements();

    // Set up particle system
    this.initializeParticleSystem();

    // Set up special effects
    this.initializeSpecialEffects();

    // Initialize game start time for achievements
    this.gameStartTime = Date.now();
  }

  setupEnhancedControls() {
    // Pause game button
    if (this.pauseGameBtn) {
      this.pauseGameBtn.addEventListener("click", () => {
        this.togglePause();
      });
    }

    // Mute game button - Fixed event listener
    if (this.muteGameBtn) {
      // Remove any existing event listeners
      this.muteGameBtn.replaceWith(this.muteGameBtn.cloneNode(true));
      this.muteGameBtn = document.getElementById("mute-game-btn");

      this.muteGameBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMute();
        // Update button icon and state
        this.updateMuteButtonDisplay();
      });
    }

    // Fullscreen button
    if (this.fullscreenGameBtn) {
      this.fullscreenGameBtn.addEventListener("click", () => {
        this.toggleFullscreen();
      });
    }

    // Enhanced keyboard controls
    document.addEventListener("keydown", (e) => {
      if (
        this.gameState !== "playing" &&
        !["p", "m", "f"].includes(e.key.toLowerCase())
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "p":
          e.preventDefault();
          this.togglePause();
          break;
        case "m":
          e.preventDefault();
          this.toggleMute();
          this.updateMuteButtonDisplay();
          break;
        case "f":
          e.preventDefault();
          this.toggleFullscreen();
          break;
      }
    });
  }

  initializeAchievements() {
    this.achievements = [
      {
        id: "first_food",
        name: "First Bite",
        description: "Eat your first food",
        achieved: false,
      },
      {
        id: "score_100",
        name: "Century",
        description: "Reach 100 points",
        achieved: false,
      },
      {
        id: "score_500",
        name: "High Scorer",
        description: "Reach 500 points",
        achieved: false,
      },
      {
        id: "speed_demon",
        name: "Speed Demon",
        description: "Reach maximum speed",
        achieved: false,
      },
      {
        id: "combo_master",
        name: "Combo Master",
        description: "Get a 10x combo",
        achieved: false,
      },
      {
        id: "perfectionist",
        name: "Perfectionist",
        description: "Complete a perfect run",
        achieved: false,
      },
      {
        id: "survivor",
        name: "Survivor",
        description: "Survive for 5 minutes",
        achieved: false,
      },
      {
        id: "giant_snake",
        name: "Giant Snake",
        description: "Grow to 50 segments",
        achieved: false,
      },
    ];

    this.streaks = {
      eating: 0,
      perfectTurns: 0,
      speedRuns: 0,
    };
  }

  initializeParticleSystem() {
    this.particles = [];
    this.maxParticles = 50;
  }

  initializeSpecialEffects() {
    // Set up screen flash effects
    if (this.screenFlash) {
      this.screenFlash.style.display = "none";
    }

    // Set up achievement popup
    if (this.achievementPopup) {
      this.achievementPopup.style.display = "none";
    }
  }

  // Cursor management methods
  setupCursorManagement() {
    // Mouse movement detection
    document.addEventListener("mousemove", () => {
      this.handleMouseMove();
    });

    // Touch events for mobile - show cursor when touching
    document.addEventListener("touchstart", () => {
      if (this.gameState === "playing") {
        this.showCursor();
        this.scheduleCursorHide();
      }
    });

    // Hide cursor immediately when arrow keys are pressed during gameplay
    document.addEventListener("keydown", (e) => {
      if (
        this.gameState === "playing" &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        // Give a small delay to allow the direction change to register
        setTimeout(() => {
          if (this.isSnakeMoving()) {
            this.hideCursor();
          }
        }, 50);
      }
    });
  }

  showCursor() {
    document.body.style.cursor = "default";
    document.documentElement.style.cursor = "default";
    if (this.gameBoard) {
      this.gameBoard.style.cursor = "default";
    }
    // Remove the game-playing class that hides cursor
    document.body.classList.remove("game-playing");

    // Clear any existing timeout
    if (this.cursorTimeout) {
      clearTimeout(this.cursorTimeout);
      this.cursorTimeout = null;
    }
  }

  hideCursor() {
    if (this.gameState === "playing") {
      document.body.style.cursor = "none";
      document.documentElement.style.cursor = "none";
      if (this.gameBoard) {
        this.gameBoard.style.cursor = "none";
      }
      // Add the game-playing class for CSS cursor hiding
      document.body.classList.add("game-playing");
    }
  }

  scheduleCursorHide() {
    // Clear any existing timeout
    if (this.cursorTimeout) {
      clearTimeout(this.cursorTimeout);
    }

    // Only schedule hide if game is playing and snake is moving
    if (this.gameState === "playing") {
      this.cursorTimeout = setTimeout(() => {
        if (this.gameState === "playing" && this.isSnakeMoving()) {
          this.hideCursor();
        }
      }, 2000); // Hide after 2 seconds of no mouse movement
    }
  }

  handleMouseMove() {
    if (this.gameState === "playing") {
      // Show cursor immediately when mouse moves
      this.showCursor();
      // Schedule to hide it again after 2 seconds
      this.scheduleCursorHide();
    } else {
      // Always show cursor when not playing
      this.showCursor();
    }
  }

  isSnakeMoving() {
    return this.direction.x !== 0 || this.direction.y !== 0;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          if (this.fullscreenGameBtn) {
            this.fullscreenGameBtn.innerHTML = "⛶";
            this.fullscreenGameBtn.title = "Exit Fullscreen";
          }
          this.showToast("Entered fullscreen mode");
        })
        .catch(() => {
          this.showToast("Fullscreen not supported");
        });
    } else {
      document.exitFullscreen().then(() => {
        if (this.fullscreenGameBtn) {
          this.fullscreenGameBtn.innerHTML = "🔲";
          this.fullscreenGameBtn.title = "Enter Fullscreen";
        }
        this.showToast("Exited fullscreen mode");
      });
    }
  }

  showToast(message, duration = 2000) {
    // Create toast notification
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-size: 14px;
      pointer-events: none;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOutRight 0.3s ease-out";
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  createParticle(x, y, type = "eat") {
    if (!this.particleContainer || this.particles.length >= this.maxParticles) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // Remove oldest particle
      }
    }

    const particle = {
      x: x,
      y: y,
      type: type,
      life: 1.0,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
      },
      size: Math.random() * 8 + 4,
      color: this.getParticleColor(type),
    };

    this.particles.push(particle);
    if (this.particleContainer) {
      this.renderParticle(particle);
    }
  }

  getParticleColor(type) {
    const colors = {
      eat: ["#4CAF50", "#8BC34A", "#CDDC39"],
      powerup: ["#FF9800", "#FFC107", "#FFEB3B"],
      combo: ["#9C27B0", "#E91E63", "#F44336"],
      achievement: ["#2196F3", "#03DAC6", "#00BCD4"],
    };

    const typeColors = colors[type] || colors.eat;
    return typeColors[Math.floor(Math.random() * typeColors.length)];
  }

  renderParticle(particle) {
    const particleElement = document.createElement("div");
    particleElement.className = "particle";
    particleElement.style.cssText = `
      position: absolute;
      left: ${particle.x}px;
      top: ${particle.y}px;
      width: ${particle.size}px;
      height: ${particle.size}px;
      background: ${particle.color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: particleFloat 1s ease-out forwards;
      box-shadow: 0 0 10px ${particle.color};
    `;

    this.particleContainer.appendChild(particleElement);

    // Remove particle after animation
    setTimeout(() => {
      if (
        this.particleContainer &&
        this.particleContainer.contains(particleElement)
      ) {
        this.particleContainer.removeChild(particleElement);
      }
    }, 1000);
  }

  triggerScreenFlash(type = "combo") {
    if (!this.screenFlash) return;

    const colors = {
      combo: "rgba(156, 39, 176, 0.3)",
      powerup: "rgba(255, 152, 0, 0.3)",
      achievement: "rgba(33, 150, 243, 0.3)",
      danger: "rgba(244, 67, 54, 0.3)",
    };

    this.screenFlash.style.background = colors[type] || colors.combo;
    this.screenFlash.style.display = "block";
    this.screenFlash.style.animation = "screenFlash 0.3s ease-out";

    setTimeout(() => {
      this.screenFlash.style.display = "none";
    }, 300);
  }

  showAchievement(achievement) {
    if (!this.achievementPopup) return;

    const titleElement =
      this.achievementPopup.querySelector(".achievement-title");
    const descElement =
      this.achievementPopup.querySelector(".achievement-desc");

    if (titleElement) titleElement.textContent = achievement.name;
    if (descElement) descElement.textContent = achievement.description;

    this.achievementPopup.style.display = "flex";
    this.achievementPopup.style.animation = "achievementSlideIn 0.5s ease-out";

    // Play achievement sound
    this.playSound("achievement");

    setTimeout(() => {
      this.achievementPopup.style.animation =
        "achievementSlideOut 0.5s ease-out";
      setTimeout(() => {
        this.achievementPopup.style.display = "none";
      }, 500);
    }, 3000);
  }

  checkAchievements() {
    this.achievements.forEach((achievement) => {
      if (achievement.achieved) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        case "first_food":
          shouldUnlock = this.score > 0;
          break;
        case "score_100":
          shouldUnlock = this.score >= 100;
          break;
        case "score_500":
          shouldUnlock = this.score >= 500;
          break;
        case "speed_demon":
          shouldUnlock = this.currentSpeed >= this.baseSpeed * 2;
          break;
        case "combo_master":
          shouldUnlock = this.combo >= 10;
          break;
        case "perfectionist":
          shouldUnlock = this.score > 200 && this.lives === this.maxLives;
          break;
        case "survivor":
          shouldUnlock = Date.now() - this.gameStartTime >= 300000; // 5 minutes
          break;
        case "giant_snake":
          shouldUnlock = this.snake.body && this.snake.body.length >= 50;
          break;
      }

      if (shouldUnlock) {
        achievement.achieved = true;
        this.showAchievement(achievement);
        this.triggerScreenFlash("achievement");
        this.createParticle(
          this.gameBoard.offsetLeft + this.gameBoard.offsetWidth / 2,
          this.gameBoard.offsetTop + this.gameBoard.offsetHeight / 2,
          "achievement"
        );
      }
    });
  }

  applyDifficultySettings() {
    const settings = this.difficultySettings[this.difficulty];
    this.baseSpeed = settings.baseSpeed;
    this.currentSpeed = settings.baseSpeed;
  }

  applyGameModeSettings() {
    const settings = this.gameModeSettings[this.gameMode];
    this.settings.powerUpsEnabled = settings.powerUps;

    if (this.gameMode === "survival") {
      this.spawnObstacles();
    }
  }

  startGameIfNotStarted() {
    if (!this.gameStarted && this.gameState === "menu") {
      this.startNewGame();
    }
  }

  pauseGame() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      this.sounds.background.pause();
      this.pauseMenu.classList.remove("hidden");
      cancelAnimationFrame(this.animationId);
      this.showCursor(); // Show cursor when paused
    }
  }

  resumeGame() {
    if (this.gameState === "paused") {
      this.gameState = "playing";
      this.pauseMenu.classList.add("hidden");
      this.waitingForMovement = true; // Wait for user input before moving
      // Don't start background music until snake starts moving
      this.lastUpdateTime = Date.now();
      this.showCursor(); // Show cursor initially, will hide when snake moves
      this.gameLoop();
    }
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.pauseGame();
    } else if (this.gameState === "paused") {
      this.resumeGame();
    }
  }

  restartGame() {
    // Stop all sounds from previous game
    this.stopAllSounds();
    this.stopGame();
    this.startNewGame();
  }

  stopGame() {
    this.gameState = "menu";
    this.gameStarted = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.stopAllSounds();
    this.showCursor();
  }

  gameOver() {
    this.gameState = "gameOver";
    this.stopAllSounds();
    this.showCursor(); // Always show cursor when game is over

    if (this.settings.soundEnabled && !this.isMuted) {
      this.sounds.gameOver.currentTime = 0;
      this.sounds.gameOver.play().catch(() => {});
    }

    // Update high score
    const currentHighScore = parseInt(localStorage.getItem("hi-score") || 0);
    const isNewRecord = this.score > currentHighScore;

    if (isNewRecord) {
      localStorage.setItem("hi-score", this.score.toString());
      document.getElementById("new-record").classList.remove("hidden");
    } else {
      document.getElementById("new-record").classList.add("hidden");
    }

    document.getElementById("final-score-value").textContent = this.score;
    this.gameOverMenu.classList.remove("hidden");

    // Store game statistics
    this.saveGameStats();
  }

  gameLoop() {
    if (this.gameState !== "playing") return;

    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    // Calculate FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
      if (this.settings.showFPS) {
        this.fpsDisplay.textContent = this.fps;
      }
    }

    // Update game at target speed
    if (deltaTime >= 1000 / this.currentSpeed) {
      this.update(deltaTime);
      this.lastUpdateTime = currentTime;
    }

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  update(deltaTime) {
    this.updateEffects(deltaTime);
    this.updateDirection();
    this.moveSnake();
    this.updatePowerUps();
    this.updateParticles();
    this.updateUI();
    this.checkLevelUp();
  }

  updateDirection() {
    if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
      this.direction = { ...this.nextDirection };
      // Hide cursor immediately when direction changes (snake starts moving)
      if (this.gameState === "playing") {
        this.hideCursor();
      }
    }
  }

  moveSnake() {
    // If waiting for movement input after resume, don't move until user presses key
    if (this.waitingForMovement) {
      // Pause background music when not moving
      if (!this.sounds.background.paused) {
        this.sounds.background.pause();
      }
      return;
    }

    if (this.direction.x === 0 && this.direction.y === 0) {
      // Snake is not moving - pause background music and show cursor
      if (!this.sounds.background.paused) {
        this.sounds.background.pause();
      }
      return;
    }

    // Snake is moving - play background music and hide cursor
    if (
      this.settings.soundEnabled &&
      !this.isMuted &&
      this.sounds.background.paused
    ) {
      this.sounds.background.play().catch(() => {});
    }

    // Hide cursor when snake is moving
    if (this.gameState === "playing" && this.isSnakeMoving()) {
      this.hideCursor();
    }

    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // Handle wall collision/wrapping
    if (this.settings.wallCollision) {
      if (
        newHead.x < 1 ||
        newHead.x > this.columns ||
        newHead.y < 1 ||
        newHead.y > this.rows
      ) {
        this.gameOver();
        return;
      }
    } else {
      newHead.x = ((newHead.x - 1 + this.columns) % this.columns) + 1;
      newHead.y = ((newHead.y - 1 + this.rows) % this.rows) + 1;
    }

    // Check self collision (unless shielded)
    if (
      !this.effects.shield.active &&
      this.isPositionOnSnake(newHead.x, newHead.y)
    ) {
      this.gameOver();
      return;
    }

    // Check obstacle collision (unless shielded)
    if (
      !this.effects.shield.active &&
      this.isPositionOnObstacle(newHead.x, newHead.y)
    ) {
      this.gameOver();
      return;
    }

    this.snake.unshift(newHead);

    // Check food collision
    if (this.isPositionOnFood(newHead.x, newHead.y)) {
      this.eatFood();
    } else {
      this.snake.pop();
    }

    // Check power-up collision
    this.checkPowerUpCollision(newHead);

    this.renderSnake();

    // Play movement sounds only when moving
    if (this.settings.soundEnabled && this.isMoving) {
      this.playMoveSound();
    }
  }

  spawnSnake() {
    const startX = Math.floor(this.columns / 2);
    const startY = Math.floor(this.rows / 2);
    this.snake = [{ x: startX, y: startY }];
    this.renderSnake();
  }

  renderSnake() {
    // Remove existing snake elements
    this.snakeElements.forEach((element) => element.remove());
    this.snakeElements = [];

    // Create new snake elements
    this.snake.forEach((segment, index) => {
      const element = document.createElement("div");
      element.className = index === 0 ? "snake-head" : "snake-segment";

      // Apply effects
      if (this.effects.shield.active) {
        element.classList.add("shielded");
      }
      if (this.effects.speedBoost.active) {
        element.classList.add("speed-boosted");
      }

      // Add rotation to snake head based on direction
      if (index === 0) {
        let rotation = 0;
        if (this.direction.x === 1) rotation = 90; // Right
        else if (this.direction.x === -1) rotation = 270; // Left
        else if (this.direction.y === -1) rotation = 0; // Up
        else if (this.direction.y === 1) rotation = 180; // Down

        element.style.transform = `rotate(${rotation}deg)`;
        element.dataset.direction = `${this.direction.x},${this.direction.y}`;
      }

      element.style.gridColumn = segment.x;
      element.style.gridRow = segment.y;
      this.gameBoard.appendChild(element);
      this.snakeElements.push(element);
    });
  }

  spawnFood() {
    if (this.food) {
      this.food.remove();
    }

    let foodX, foodY;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      foodX = this.randomNumber(1, this.columns);
      foodY = this.randomNumber(1, this.rows);
      attempts++;
    } while (this.isPositionOccupied(foodX, foodY) && attempts < maxAttempts);

    this.food = document.createElement("div");
    this.food.className = "food";
    this.food.style.gridColumn = foodX;
    this.food.style.gridRow = foodY;
    this.food.style.position = "relative";
    this.food.style.zIndex = "10";

    this.gameBoard.appendChild(this.food);

    this.foodPosition = { x: foodX, y: foodY };
    // Removed problematic food indicator system
  }

  eatFood() {
    this.score++;
    this.combo++;
    this.streaks.eating++;

    // Create particles at food location
    const foodRect = this.food.getBoundingClientRect();
    const gameBoardRect = this.gameBoard.getBoundingClientRect();
    const foodX = foodRect.left - gameBoardRect.left + foodRect.width / 2;
    const foodY = foodRect.top - gameBoardRect.top + foodRect.height / 2;

    // Create multiple particles for enhanced effect
    for (let i = 0; i < 8; i++) {
      this.createParticle(foodX, foodY, "eat");
    }

    // Combo scoring
    if (this.combo > 1) {
      this.score += Math.floor(this.combo / 2);
      this.comboSection.classList.remove("hidden");
      this.comboDisplay.textContent = this.combo;

      // Apply combo visual effects
      this.gameBoard.className = `combo-x${Math.min(this.combo, 4)}`;

      // Enhanced combo effects
      if (this.combo >= 5) {
        this.triggerScreenFlash("combo");
        this.createParticle(foodX, foodY, "combo");
        this.playSound("combo");
      }

      if (this.combo >= 10) {
        this.showToast(`Amazing! ${this.combo}x Combo!`, 3000);
        // Create extra particles for high combos
        for (let i = 0; i < 15; i++) {
          setTimeout(() => {
            this.createParticle(
              foodX + (Math.random() - 0.5) * 40,
              foodY + (Math.random() - 0.5) * 40,
              "combo"
            );
          }, i * 50);
        }
      }

      if (this.combo >= 20) {
        this.showToast(`INCREDIBLE! ${this.combo}x MEGA COMBO!`, 4000);
        this.triggerScreenFlash("achievement");
      }
    }

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    this.spawnFood();
    this.createEatParticles();

    if (this.settings.soundEnabled) {
      this.sounds.eat.currentTime = 0;
      this.sounds.eat.play().catch(() => {});
    }

    // Spawn power-ups occasionally
    if (this.settings.powerUpsEnabled && Math.random() < 0.15) {
      this.spawnPowerUp();
    }

    // Check achievements after eating
    this.checkAchievements();

    // Increase speed gradually
    const difficultySettings = this.difficultySettings[this.difficulty];
    this.currentSpeed += difficultySettings.speedIncrease;
  }

  spawnPowerUp() {
    if (this.powerUps.length >= 3) return; // Max 3 power-ups at once

    let powerUpX, powerUpY;
    do {
      powerUpX = this.randomNumber(1, this.columns);
      powerUpY = this.randomNumber(1, this.rows);
    } while (this.isPositionOccupied(powerUpX, powerUpY));

    const types = ["speed-boost", "shield", "freeze", "multi-food"];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp = document.createElement("div");
    powerUp.className = `power-up ${type}`;
    powerUp.style.gridColumn = powerUpX;
    powerUp.style.gridRow = powerUpY;
    powerUp.dataset.type = type;
    powerUp.dataset.x = powerUpX;
    powerUp.dataset.y = powerUpY;

    this.gameBoard.appendChild(powerUp);
    this.powerUps.push(powerUp);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (powerUp.parentNode) {
        powerUp.remove();
        this.powerUps = this.powerUps.filter((p) => p !== powerUp);
      }
    }, 10000);
  }

  checkPowerUpCollision(position) {
    this.powerUps.forEach((powerUp, index) => {
      const powerUpX = parseInt(powerUp.dataset.x);
      const powerUpY = parseInt(powerUp.dataset.y);

      if (position.x === powerUpX && position.y === powerUpY) {
        // Create collection particles
        const powerUpRect = powerUp.getBoundingClientRect();
        const gameBoardRect = this.gameBoard.getBoundingClientRect();
        const x = powerUpRect.left - gameBoardRect.left + powerUpRect.width / 2;
        const y = powerUpRect.top - gameBoardRect.top + powerUpRect.height / 2;

        // Create particles at power-up location
        for (let i = 0; i < 10; i++) {
          this.createParticle(x, y, "powerup");
        }

        this.collectPowerUp(powerUp.dataset.type);
        powerUp.remove();
        this.powerUps.splice(index, 1);
        this.showPowerUpIndicator(powerUp.dataset.type);
      }
    });
  }

  collectPowerUp(type) {
    // Show collection effect
    this.showToast(
      `Power-up collected: ${type.replace("-", " ").toUpperCase()}!`
    );

    switch (type) {
      case "speed-boost":
        this.inventory.speedBoost++;
        break;
      case "shield":
        this.inventory.shield++;
        break;
      case "freeze":
        this.inventory.freeze++;
        break;
      case "multi-food":
        // Instant effect - spawn multiple foods with enhanced visuals
        this.showToast("Multi-food activated! Triple food incoming!", 3000);
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.spawnFood();
            // Create sparkle effect for each new food
            const foods = document.querySelectorAll(".food");
            const latestFood = foods[foods.length - 1];
            if (latestFood) {
              const rect = latestFood.getBoundingClientRect();
              const boardRect = this.gameBoard.getBoundingClientRect();
              const x = rect.left - boardRect.left + rect.width / 2;
              const y = rect.top - boardRect.top + rect.height / 2;
              for (let j = 0; j < 6; j++) {
                this.createParticle(x, y, "powerup");
              }
            }
          }, i * 200);
        }
        break;
    }

    // Play power-up collection sound
    if (this.settings.soundEnabled) {
      this.sounds.eat.currentTime = 0;
      this.sounds.eat.playbackRate = 1.5; // Higher pitch for power-ups
      this.sounds.eat.play().catch(() => {});
      setTimeout(() => {
        this.sounds.eat.playbackRate = 1; // Reset playback rate
      }, 100);
    }
  }

  activatePowerUp(type) {
    if (this.inventory[type] > 0 && !this.effects[type].active) {
      this.inventory[type]--;
      this.effects[type] = { active: true, duration: 5000 }; // 5 seconds

      // Create power-up activation effects
      const snakeHead = this.snake[0];
      if (snakeHead) {
        const headElement = document.querySelector(
          `[data-x="${snakeHead.x}"][data-y="${snakeHead.y}"]`
        );
        if (headElement) {
          const rect = headElement.getBoundingClientRect();
          const gameBoardRect = this.gameBoard.getBoundingClientRect();
          const x = rect.left - gameBoardRect.left + rect.width / 2;
          const y = rect.top - gameBoardRect.top + rect.height / 2;

          // Create multiple particles for power-up activation
          for (let i = 0; i < 12; i++) {
            this.createParticle(x, y, "powerup");
          }
        }
      }

      // Trigger screen flash and toast
      this.triggerScreenFlash("powerup");
      this.showToast(`${type.toUpperCase()} activated!`, 2000);

      switch (type) {
        case "speedBoost":
          this.currentSpeed *= 1.5;
          this.gameBoard.classList.add("game-board-speed");
          break;
        case "shield":
          break;
        case "freeze":
          this.currentSpeed *= 0.5;
          this.gameBoard.classList.add("game-board-frozen");
          break;
      }

      this.renderSnake(); // Update visual effects
    }
  }

  updateEffects(deltaTime) {
    Object.keys(this.effects).forEach((effectType) => {
      const effect = this.effects[effectType];
      if (effect.active) {
        effect.duration -= deltaTime;

        if (effect.duration <= 0) {
          this.deactivateEffect(effectType);
        }
      }
    });
  }

  deactivateEffect(type) {
    this.effects[type] = { active: false, duration: 0 };

    switch (type) {
      case "speedBoost":
        this.currentSpeed =
          this.baseSpeed +
          (this.level - 1) *
            this.difficultySettings[this.difficulty].speedIncrease;
        this.gameBoard.classList.remove("game-board-speed");
        break;
      case "freeze":
        this.currentSpeed =
          this.baseSpeed +
          (this.level - 1) *
            this.difficultySettings[this.difficulty].speedIncrease;
        this.gameBoard.classList.remove("game-board-frozen");
        break;
    }

    this.renderSnake(); // Update visual effects
  }

  spawnObstacles() {
    const obstacleCount = Math.floor(this.rows * this.columns * 0.05); // 5% of board

    for (let i = 0; i < obstacleCount; i++) {
      let obstacleX, obstacleY;
      do {
        obstacleX = this.randomNumber(1, this.columns);
        obstacleY = this.randomNumber(1, this.rows);
      } while (
        this.isPositionOccupied(obstacleX, obstacleY) ||
        Math.abs(obstacleX - Math.floor(this.columns / 2)) < 3 ||
        Math.abs(obstacleY - Math.floor(this.rows / 2)) < 3
      );

      const obstacle = document.createElement("div");
      obstacle.className = "obstacle";
      obstacle.style.gridColumn = obstacleX;
      obstacle.style.gridRow = obstacleY;
      obstacle.dataset.x = obstacleX;
      obstacle.dataset.y = obstacleY;

      this.gameBoard.appendChild(obstacle);
      this.obstacles.push(obstacle);
    }
  }

  createEatParticles() {
    const head = this.snake[0];
    const colors = ["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71"];

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.position = "absolute";
      particle.style.width = "4px";
      particle.style.height = "4px";
      particle.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      particle.style.left =
        (head.x - 1) * this.cellWidth + this.cellWidth / 2 + "px";
      particle.style.top =
        (head.y - 1) * this.cellHeight + this.cellHeight / 2 + "px";
      particle.style.setProperty(
        "--random-x",
        `${(Math.random() - 0.5) * 100}px`
      );
      particle.style.setProperty(
        "--random-y",
        `${(Math.random() - 0.5) * 100}px`
      );

      this.gameBoard.appendChild(particle);
      this.particles.push(particle);

      setTimeout(() => {
        particle.remove();
        this.particles = this.particles.filter((p) => p !== particle);
      }, 1000);
    }
  }

  showPowerUpIndicator(type) {
    const icons = {
      "speed-boost": "⚡",
      shield: "🛡️",
      freeze: "❄️",
      "multi-food": "🍎",
    };

    this.powerUpIndicator.textContent = icons[type];
    this.powerUpIndicator.classList.remove("hidden");

    setTimeout(() => {
      this.powerUpIndicator.classList.add("hidden");
    }, 1500);
  }

  updatePowerUps() {
    // Remove expired power-ups and update visual effects
    this.powerUps.forEach((powerUp, index) => {
      if (!powerUp.parentNode) {
        this.powerUps.splice(index, 1);
      }
    });
  }

  updateParticles() {
    // Particles are automatically removed via CSS animation and setTimeout
  }

  checkLevelUp() {
    const newLevel = Math.floor(this.score / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.gameBoard.classList.add("level-up-flash");
      setTimeout(() => {
        this.gameBoard.classList.remove("level-up-flash");
      }, 1000);

      // Add more obstacles in survival mode
      if (this.gameMode === "survival" && Math.random() < 0.3) {
        this.spawnObstacles();
      }
    }
  }

  updateUI() {
    this.scoreDisplay.textContent = this.score;

    // Update high score
    const currentHighScore = parseInt(localStorage.getItem("hi-score") || 0);
    if (this.score > currentHighScore && this.score > 0) {
      localStorage.setItem("hi-score", this.score.toString());
      this.hiScoreDisplay.textContent = this.score;
      this.hiScoreDisplay.parentElement.style.color = "#e74c3c";

      // Show high score effect only once per achievement
      if (!this.highScoreAchieved) {
        this.showHighScoreEffect();
        this.highScoreAchieved = true;
      }
    } else {
      this.hiScoreDisplay.textContent = currentHighScore;
      this.hiScoreDisplay.parentElement.style.color = "#333";
    }

    // Hide combo if broken
    if (this.combo === 0 && !this.comboSection.classList.contains("hidden")) {
      this.comboSection.classList.add("hidden");
      this.gameBoard.className = "";
    }

    // Check achievements periodically
    if (this.gameState === "playing" && this.achievements) {
      this.checkAchievements();
    }
  }

  showHighScoreEffect() {
    // Create high score notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: #333;
      padding: 20px 40px;
      border-radius: 15px;
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      z-index: 10000;
      border: 3px solid #ffd700;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
      animation: highScoreEffect 3s ease-in-out;
    `;
    notification.innerHTML = "🏆 NEW HIGH SCORE! 🏆";

    // Add animation keyframes if they don't exist
    if (!document.querySelector("#highScoreStyle")) {
      const style = document.createElement("style");
      style.id = "highScoreStyle";
      style.textContent = `
        @keyframes highScoreEffect {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.5); 
          }
          20% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.2); 
          }
          80% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Add screen flash effect
    const flash = document.createElement("div");
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 215, 0, 0.3);
      z-index: 9999;
      pointer-events: none;
      animation: flashEffect 0.5s ease-in-out;
    `;

    if (!document.querySelector("#flashStyle")) {
      const flashStyle = document.createElement("style");
      flashStyle.id = "flashStyle";
      flashStyle.textContent = `
        @keyframes flashEffect {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(flashStyle);
    }

    document.body.appendChild(flash);

    // Remove elements after animation
    setTimeout(() => {
      notification.remove();
      flash.remove();
    }, 3000);

    // Play special sound if available
    if (this.powerUpSound) {
      this.powerUpSound.currentTime = 0;
      this.powerUpSound.play().catch(() => {});
    }
  }

  // Utility methods
  randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  isPositionOnSnake(x, y) {
    return this.snake.some((segment) => segment.x === x && segment.y === y);
  }

  isPositionOnFood(x, y) {
    return (
      this.foodPosition &&
      this.foodPosition.x === x &&
      this.foodPosition.y === y
    );
  }

  isPositionOnObstacle(x, y) {
    return this.obstacles.some(
      (obstacle) =>
        parseInt(obstacle.dataset.x) === x && parseInt(obstacle.dataset.y) === y
    );
  }

  isPositionOccupied(x, y) {
    return (
      this.isPositionOnSnake(x, y) ||
      this.isPositionOnFood(x, y) ||
      this.isPositionOnObstacle(x, y) ||
      this.powerUps.some(
        (powerUp) =>
          parseInt(powerUp.dataset.x) === x && parseInt(powerUp.dataset.y) === y
      )
    );
  }

  clearBoard() {
    this.gameBoard.innerHTML = "";
    this.snakeElements = [];
    this.powerUps = [];
    this.obstacles = [];
    this.particles = [];
    this.food = null;
    this.gameBoard.className = "";

    // Hide food indicator if it exists
    if (this.foodIndicator) {
      this.foodIndicator.classList.add("hidden");
    }
  }

  // Audio methods
  playMoveSound() {
    if (this.settings.soundEnabled && this.isMoving) {
      this.sounds.move.currentTime = 0;
      this.sounds.move.play().catch(() => {});
    }
  }

  stopAllSounds() {
    Object.values(this.sounds).forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
    this.isMoving = false;
  }

  toggleSound() {
    this.settings.soundEnabled = !this.settings.soundEnabled;
    const btn = document.getElementById("mute-btn");
    btn.textContent = this.settings.soundEnabled ? "🔊 Sound" : "🔇 Muted";

    if (!this.settings.soundEnabled) {
      this.stopAllSounds();
    } else if (this.gameState === "playing") {
      this.sounds.background.play().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.settings.soundEnabled = !this.isMuted;

    if (this.isMuted) {
      this.stopAllSounds();
    } else {
      if (this.gameState === "playing" && this.isSnakeMoving()) {
        // Reset and play background sound properly
        this.sounds.background.currentTime = 0;
        this.sounds.background.play().catch(() => {});
      }
    }

    // Update settings toggle if it exists
    const soundToggle = document.getElementById("sound-toggle");
    if (soundToggle) {
      soundToggle.checked = this.settings.soundEnabled;
    }
  }

  updateMuteButtonDisplay() {
    if (this.muteGameBtn) {
      if (this.isMuted) {
        this.muteGameBtn.style.backgroundColor = "#ff6b6b";
        this.muteGameBtn.innerHTML = "🔇";
        this.muteGameBtn.title = "Unmute";
        this.muteGameBtn.classList.add("muted");
      } else {
        this.muteGameBtn.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        this.muteGameBtn.innerHTML = "🔊";
        this.muteGameBtn.title = "Mute";
        this.muteGameBtn.classList.remove("muted");
      }
    }
  }

  playSound(soundType) {
    if (!this.settings.soundEnabled || this.isMuted) return;

    switch (soundType) {
      case "achievement":
        // Use a higher pitch eat sound for achievements
        if (this.sounds.eat) {
          this.sounds.eat.currentTime = 0;
          this.sounds.eat.playbackRate = 2;
          this.sounds.eat.play().catch(() => {});
          setTimeout(() => {
            if (this.sounds.eat) this.sounds.eat.playbackRate = 1;
          }, 200);
        }
        break;
      case "powerup":
        if (this.sounds.eat) {
          this.sounds.eat.currentTime = 0;
          this.sounds.eat.playbackRate = 1.5;
          this.sounds.eat.play().catch(() => {});
          setTimeout(() => {
            if (this.sounds.eat) this.sounds.eat.playbackRate = 1;
          }, 100);
        }
        break;
      case "combo":
        if (this.sounds.move) {
          this.sounds.move.currentTime = 0;
          this.sounds.move.playbackRate = 1.8;
          this.sounds.move.play().catch(() => {});
          setTimeout(() => {
            if (this.sounds.move) this.sounds.move.playbackRate = 1;
          }, 150);
        }
        break;
      default:
        if (this.sounds[soundType]) {
          this.sounds[soundType].currentTime = 0;
          this.sounds[soundType].play().catch(() => {});
        }
        break;
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  handleResize() {
    this.boardWidth = window.innerWidth;
    this.boardHeight = window.innerHeight;
    this.columns = Math.floor(this.boardWidth / 45);
    this.rows = Math.floor(this.boardHeight / 45);
    this.cellWidth = this.boardWidth / this.columns;
    this.cellHeight = this.boardHeight / this.rows;
    this.setupBoard();
  }

  saveGameStats() {
    const stats = {
      score: this.score,
      level: this.level,
      maxCombo: this.maxCombo,
      gameTime: this.gameTime,
      difficulty: this.difficulty,
      gameMode: this.gameMode,
      snakeLength: this.snake.length,
      timestamp: Date.now(),
    };

    // Save to localStorage for statistics tracking
    const savedStats = JSON.parse(localStorage.getItem("gameStats") || "[]");
    savedStats.push(stats);

    // Keep only last 50 games
    if (savedStats.length > 50) {
      savedStats.splice(0, savedStats.length - 50);
    }

    localStorage.setItem("gameStats", JSON.stringify(savedStats));
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  window.snakeGame = new EnhancedSnakeGame();
});

// Initialize high score display
document.addEventListener("DOMContentLoaded", () => {
  const hiScoreDisplay = document.getElementById("hi-score-count");
  if (hiScoreDisplay) {
    hiScoreDisplay.textContent = localStorage.getItem("hi-score") || "0";
  }
});
