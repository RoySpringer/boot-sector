const CONFIG = {
  segmentReveal: "RlVUVVJF",
  NEXT_URL:
    "aHR0cHM6Ly9yb3lzcHJpbmdlci5naXRodWIuaW8vYm9vdC1zZWN0b3IvcDNfY3J5cHRvX2xvY2s=",
};

// Matrix background effect
function createMatrixEffect() {
  const bg = document.getElementById("matrix-bg");
  const chars =
    "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

  setInterval(() => {
    const char = document.createElement("div");
    char.className = "matrix-char";
    char.textContent = chars[Math.floor(Math.random() * chars.length)];
    char.style.left = Math.random() * 100 + "%";
    char.style.animationDelay = Math.random() * 3 + "s";
    bg.appendChild(char);

    setTimeout(() => char.remove(), 3000);
  }, 100);
}

// Mouse hover hint system
function setupMouseHints() {
  const hint1 = document.getElementById("cryptic-hint-1");
  let hintId;

  // Add hover triggers to specific elements
  const header = document.querySelector(".header h1");
  header.classList.add("hint-trigger");
  header.addEventListener("mouseenter", (e) => {
    hintId = setTimeout(() => {
      if (!hint1) return;
      hint1.style.left = e.pageX + 10 + "px";
      hint1.style.top = e.pageY + 10 + "px";
      hint1.classList.add("show");
    }, 30000);
  });
  header.addEventListener("mouseleave", () => {
    clearTimeout(hintId);
    if (!hint1) return;
    hint1.classList.remove("show");
  });
}

// CryptoGrid Class - handles grid creation, sequence placement, and checking
class CryptoGrid {
  constructor(
    gridElementId,
    columns = ["A", "B", "C", "D", "E", "F", "G", "H"],
    rows = ["1", "2", "3", "4", "5", "6", "7", "8"]
  ) {
    this.gridElement = document.getElementById(gridElementId);
    this.columns = columns;
    this.rows = rows;
    this.gridData = {};
    this.targetSequence = [];
    this.targetCoords = [];
    this.placementType = "random"; // 'random' or 'coordinated'
    this.onProgressUpdate = null;
    this.onCellClick = null;
  }

  // Set the target sequence and placement type
  setTargetSequence(sequence, placementType = "random", coords = []) {
    this.targetSequence = sequence;
    this.placementType = placementType;
    this.targetCoords = coords;
  }

  // Generate random positions for the grid
  generateRandomPositions() {
    const positions = [];
    for (let i = 0; i < this.columns.length * this.rows.length; i++) {
      positions.push(i);
    }
    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return positions;
  }

  // Generate random letter+number combination
  generateRandomValue(excludeValues = []) {
    let randomValue;
    do {
      const randomLetter = String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      );
      const randomNumber = Math.floor(Math.random() * 10);
      randomValue = randomLetter + randomNumber;
    } while (excludeValues.includes(randomValue));
    return randomValue;
  }

  // Create the grid data
  createGridData() {
    this.gridData = {};

    if (this.placementType === "random") {
      // Place sequence randomly in the grid
      const randomPositions = this.generateRandomPositions();

      for (let i = 0; i < this.targetSequence.length; i++) {
        const pos = randomPositions[i];
        const row = Math.floor(pos / this.columns.length);
        const col = pos % this.columns.length;
        const coord = this.columns[col] + this.rows[row];
        this.gridData[coord] = this.targetSequence[i];
      }
    } else if (this.placementType === "coordinated") {
      // Place sequence on specific coordinates
      for (let i = 0; i < this.targetSequence.length; i++) {
        const coord = this.targetCoords[i];
        this.gridData[coord] = this.targetSequence[i];
      }
    }

    // Fill remaining cells with random values
    for (let col = 0; col < this.columns.length; col++) {
      for (let row = 0; row < this.rows.length; row++) {
        const coord = this.columns[col] + this.rows[row];
        if (!this.gridData[coord]) {
          this.gridData[coord] = this.generateRandomValue(this.targetSequence);
        }
      }
    }
  }

  // Render the grid to the DOM
  render() {
    this.gridElement.innerHTML = "";
    this.createGridData();

    // Add layer class to grid element for styling
    if (this.placementType === "coordinated") {
      this.gridElement.classList.add("layer2");
    } else {
      this.gridElement.classList.remove("layer2");
    }

    for (let row = 0; row < this.rows.length; row++) {
      for (let col = 0; col < this.columns.length; col++) {
        const coord = this.columns[col] + this.rows[row];
        const cell = this.createCell(coord, row, col);
        this.gridElement.appendChild(cell);
      }
    }
  }

  // Create a single cell
  createCell(coord, row, col) {
    const cell = document.createElement("div");
    const cellContent = document.createElement("div");
    cellContent.className = "cell-content";
    cellContent.textContent = "██";
    cell.className = "crypto-cell";
    cell.appendChild(cellContent);
    cell.dataset.coord = coord;
    cell.dataset.value = this.gridData[coord];
    cell.dataset.row = row;
    cell.dataset.col = col;

    // Add coordinate labels
    if (col === 0) {
      const rowLabel = document.createElement("div");
      rowLabel.className = "coordinate-label row";
      rowLabel.textContent = this.rows[row];
      cell.appendChild(rowLabel);
    }
    if (row === 0) {
      const colLabel = document.createElement("div");
      colLabel.className = "coordinate-label col";
      colLabel.textContent = this.columns[col];
      cell.appendChild(colLabel);
    }

    // Add click event
    cell.addEventListener("click", () => this.handleCellClick(cell, coord));

    return cell;
  }

  // Handle cell click
  handleCellClick(cell, coord) {
    if (cell.classList.contains("revealed")) {
      // Close the tile
      cell.classList.remove("revealed");
      cell.querySelector(".cell-content").textContent = "██";
      // Remove red background when closing
      cell.style.background = "";
      cell.style.borderColor = "";
    } else {
      // Open the tile
      cell.classList.add("revealed");
      cell.querySelector(".cell-content").textContent = this.gridData[coord];

      // Check if this is a correct click (target coordinate)
      const isCorrectClick = this.targetCoords.includes(coord);

      // Highlight target cells with different colors based on placement type
      if (this.placementType === "random") {
        if (this.targetSequence.includes(this.gridData[coord])) {
          // Layer 1: Green theme for correct
          cell.style.background = "#006600";
          cell.style.borderColor = "#00ff00";
        }
      } else if (this.placementType === "coordinated") {
        // Layer 2: Check if this is a correct coordinate
        if (isCorrectClick) {
          // Correct click: Red theme
          cell.style.background = "#006600";
          cell.style.borderColor = "#00ff00";
        } else {
          // Wrong click: Bright red background
          cell.style.background = "#ff0000";
          cell.style.borderColor = "#ff6666";

          // Only count wrong clicks for layer 2
          layer2ClickCount++;

          // Check if max wrong clicks reached
          if (layer2ClickCount > MAX_LAYER2_CLICKS) {
            showStatus(
              `Maximum wrong clicks (${MAX_LAYER2_CLICKS}) reached! Refreshing page...`,
              "error"
            );
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          }

          // Show remaining clicks
          const remainingClicks = MAX_LAYER2_CLICKS - layer2ClickCount;
          showStatus(
            `Layer 2: ${remainingClicks} wrong clicks remaining`,
            "info"
          );
          if (remainingClicks < MAX_LAYER2_CLICKS / 2) {
            updateHint(6);
          }
        }
      }
    }

    // Call custom click handler if provided
    if (this.onCellClick) {
      this.onCellClick(cell, coord);
    }

    // Update progress
    if (this.onProgressUpdate) {
      this.onProgressUpdate();
    }
  }

  // Check if the target sequence is found
  isSequenceFound() {
    if (this.placementType === "random") {
      // Check if all target values are revealed AND no extra cells are revealed
      const revealedCells = document.querySelectorAll(".crypto-cell.revealed");
      const revealedValues = Array.from(revealedCells).map(
        (cell) => cell.dataset.value
      );

      // Check if all target values are revealed
      const allTargetsRevealed = this.targetSequence.every((value) =>
        revealedValues.includes(value)
      );

      // Check if no extra cells are revealed (exactly the right number)
      const noExtraCells = revealedValues.length === this.targetSequence.length;

      return allTargetsRevealed && noExtraCells;
    } else if (this.placementType === "coordinated") {
      // Check if all target coordinates are revealed AND no extra cells are revealed
      const revealedCells = document.querySelectorAll(".crypto-cell.revealed");
      const revealedCoords = Array.from(revealedCells).map(
        (cell) => cell.dataset.coord
      );

      // Check if all target coordinates are revealed
      const allTargetsRevealed = this.targetCoords.every((coord) =>
        revealedCoords.includes(coord)
      );

      // Check if no extra cells are revealed (exactly the right number)
      const noExtraCells = revealedCoords.length === this.targetCoords.length;

      return allTargetsRevealed && noExtraCells;
    }
    return false;
  }

  // Get revealed target values
  getRevealedTargetValues() {
    if (this.placementType === "random") {
      return this.targetSequence.filter((value) => {
        const cells = document.querySelectorAll(".crypto-cell.revealed");
        return Array.from(cells).some((cell) => cell.dataset.value === value);
      });
    } else if (this.placementType === "coordinated") {
      return this.targetCoords.filter((coord) => {
        const cell = document.querySelector(`[data-coord="${coord}"]`);
        return cell && cell.classList.contains("revealed");
      });
    }
    return [];
  }

  // Get progress percentage
  getProgressPercentage() {
    const revealed = this.getRevealedTargetValues();
    return Math.floor((revealed.length / this.targetSequence.length) * 100);
  }

  // Clear the grid
  clear() {
    this.gridElement.innerHTML = "";
    this.gridData = {};
  }
}

// Global grid instances
let layer1Grid = null;
let layer2Grid = null;
let layer2ClickCount = 0; // Track clicks for layer 2
const MAX_LAYER2_CLICKS = 8; // Maximum clicks allowed for layer 2

// Initialize the crypto grid - now using the CryptoGrid class
function initCryptoGrid(gridType = "layer1") {
  if (gridType === "layer1") {
    // Initialize layer 1 grid
    layer1Grid = new CryptoGrid("crypto-grid");

    // Set up layer 1 data
    const sequentialPattern = ["A1", "B2", "C3", "D4", "E5", "F6", "G7", "H8"];
    const transformationHints = [
      "A+2",
      "C-1",
      "G-5",
      "B+3",
      "E+3",
      "F-2",
      "H",
      "D-3",
    ];
    const transformedCoords = ["A3", "B5", "C2", "D1", "E8", "F4", "G2", "H8"];
    const cryptoWithNumbers = [
      "C8",
      "R10",
      "Y3",
      "P7",
      "T12",
      "O5",
      "L9",
      "K4",
    ];

    // Store data globally
    window.sequentialPattern = sequentialPattern;
    window.transformationHints = transformationHints;
    window.transformedCoords = transformedCoords;
    window.cryptoWithNumbers = cryptoWithNumbers;

    // Configure layer 1 grid
    layer1Grid.setTargetSequence(sequentialPattern, "random");
    layer1Grid.onProgressUpdate = updateProgress;
    layer1Grid.render();
  } else if (gridType === "layer2") {
    // Initialize layer 2 grid
    layer2Grid = new CryptoGrid("crypto-grid");

    // Configure layer 2 grid
    layer2Grid.setTargetSequence(
      window.cryptoWithNumbers,
      "coordinated",
      window.transformedCoords
    );
    layer2Grid.onProgressUpdate = updateCryptoProgress;
    layer2Grid.render();
  }
}

// Function to switch to the second grid (crypto word grid) - now simplified
function switchToCryptoGrid() {
  // Reset click counter for layer 2
  layer2ClickCount = 0;

  initCryptoGrid("layer2");
  updateLayerIndicator(2);
  showStatus(
    "Crypto grid loaded! Find the hidden word using the transformation hints. You have 8 wrong clicks remaining.",
    "success"
  );
  document.getElementById("layer2-group").classList.remove("hidden");
}

// Function to update progress for crypto grid
function updateCryptoProgress() {
  if (layer2Grid) {
    const progress = layer2Grid.getProgressPercentage();
    const progressFill = document.getElementById("progress-fill");
    progressFill.style.width = progress + "%";
    progressFill.classList.add("layer2"); // Add red theme

    if (layer2Grid.isSequenceFound()) {
      updateHint(4);
    }
  }
}

function updateProgress() {
  if (layer1Grid) {
    let progress = 0;

    // Step 1: Check for sequential pattern (A1, B2, C3, D4, E5, F6, G7, H8)
    const revealedSequential = layer1Grid.getRevealedTargetValues();
    progress = Math.floor((revealedSequential.length / 8) * 100);

    if (revealedSequential.length === 8) {
      if (!document.querySelector('[data-progress="step1"]')) {
        updateHint(2);
        document
          .querySelector(".crypto-grid")
          .setAttribute("data-progress", "step1");
      }
    }

    const progressFill = document.getElementById("progress-fill");
    progressFill.style.width = progress + "%";
    progressFill.classList.remove("layer2"); // Remove red theme for layer 1
  }
}

function updateHint(hintID) {
  const hintElement = document.getElementById("current-hint");
  const hints = {
    1: "<strong>🔍 INITIAL SCAN:</strong> Coordinates dance in sequence. Only the ones that make progress are the One",
    2: "<strong>PATTERN DETECTED: </strong> A pattern is detected.</strong>",
    3: "<strong>‼️ TRANSFORMATION COMPLETE:</strong> System is compromised.",
    4: "<strong>FINAL DECRYPTION:</strong> The crypto word is complete. Enter it to finalize the breach sequence.",
    5: "<strong>‼️ HIGH ALERT:</strong> The sequence is complete. Going is high alert mode. Limited clicks are activated. Now the grid speaks in transformations. Only A real inspector can solve this.",
    6: "<strong>🔍 TRANSFORMATIONS NEEDED:</strong> Transformations are needed to solve this layer. Only A real INSPECTor can solve this.",
  };

  if (hints[hintID]) {
    hintElement.innerHTML = hints[hintID];
  }
}

function checkLayer1() {
  const input = document.getElementById("layer1").value.trim().toUpperCase();

  // Check if the sequential pattern is found using the grid class
  if (
    layer1Grid &&
    layer1Grid.isSequenceFound() &&
    input.replace(/,/g, "").replace(/ /g, "") === "A1B2C3D4E5F6G7H8"
  ) {
    showStatus(
      "Sequential pattern discovered! Switching to crypto grid...",
      "success"
    );

    // Switch to the crypto grid
    setTimeout(() => {
      switchToCryptoGrid();
      showStatus(
        "Crypto grid loaded! Second encryption layer activated.",
        "success"
      );
      document.getElementById("layer2-group").classList.remove("hidden");
      updateHint(5);
      const progressFill = document.getElementById("progress-fill");
      progressFill.style.width = 0 + "%";
      document.querySelector(".terminal").classList.add("red");
    }, 2000);
  } else {
    showStatus("Incorrect pattern. Try again.", "error");
  }
}

function checkLayer2() {
  const input = document.getElementById("layer2").value.trim().toLowerCase();

  // Check if the crypto word is found using the grid class
  if (layer2Grid && layer2Grid.isSequenceFound()) {
    // The expected answer is the letters from the crypto word: "cryptolk"
    const expected = "cryptolk";

    if (input === expected) {
      showStatus(
        "Crypto word discovered! You've successfully breached the system!",
        "success"
      );
      updateLayerIndicator(3);
      document.getElementById("layer3-group").classList.remove("hidden");
    } else {
      showStatus("Incorrect. Try again.", "error");
    }
  } else {
    showStatus("Incorrect. Try again.", "error");
  }
}

function checkLayer3() {
  const input = document.getElementById("layer3").value.trim().toLowerCase();

  // Final confirmation - any confirmation word
  const expected = "confirm";

  if (input === expected) {
    showStatus("🎉 All layers breached! Access granted!", "success");
    document.getElementById("reveal").classList.remove("hidden");
    document.getElementById("open-vault").href = atob(CONFIG.NEXT_URL);
    document.querySelector(".seg").textContent = atob(CONFIG.segmentReveal);
  } else {
    throw new Error("Confirmation word is is not matching `confirm`.");
  }
}

function showStatus(message, type) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = `status ${type}`;
}

// Function to update layer indicator
function updateLayerIndicator(layer) {
  const layerIndicator = document.getElementById("layer-indicator");
  if (layerIndicator) {
    layerIndicator.textContent = `Layer ${layer}`;
    layerIndicator.className = `layer-indicator layer-${layer}`;
  }
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  createMatrixEffect();
  initCryptoGrid(); // Default to layer1
  updateLayerIndicator(1); // Set initial layer indicator

  // Allow Enter key to submit
  document.getElementById("layer1").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkLayer1();
  });
  document.getElementById("layer2").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkLayer2();
  });
  document.getElementById("layer3").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkLayer3();
  });

  // Add cryptic console hints
  console.log(
    "%c🔐 CRYPTO LOCK DEBUG MODE 🔐",
    "color: #00ff00; font-size: 20px; font-weight: bold;"
  );
  console.log(
    "%cType 'help()' in console for cryptic assistance",
    "color: #00aa00; font-size: 14px;"
  );

  // Add global help function for console hints
  window.help = function () {
    console.log(
      "%c=== CRYPTIC ASSISTANCE ===",
      "color: #00ff00; font-weight: bold;"
    );
    console.log(
      "%cLayer 1: Which numbers make the progression?",
      "color: #00aa00;"
    );
    console.log(
      "%cLayer 2: Mathematical transformations reveal new coordinates",
      "color: #00aa00;"
    );
    console.log("%cLayer 2: Look for the hidden word", "color: #00aa00;");
    console.log(
      "%cType 'hint(1)', 'hint(2)', or 'hint(3)' for specific guidance",
      "color: #00aa00;"
    );
  };

  window.hint = function (layer) {
    if (layer === 3) throw new Error("numbers are not allowed. remove them.");
    const hints = {
      1: "Find each number in the sequence by clicking on the grid",
      2: `Transform coordinates: ${window.transformationHints.map(
        (hint) => `${hint}`
      )}`,
    };
    console.log("%c" + hints[layer], "color: #ffaa00; font-weight: bold;");
  };

  // Add keyboard shortcuts for cryptic hints
  document.addEventListener("keydown", (e) => {
    // Ctrl+Shift+H for hidden hint
    if (e.ctrlKey && e.shiftKey && e.key === "H") {
      e.preventDefault();
      showCrypticHint();
    }
    // Ctrl+Shift+D for debug mode
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      e.preventDefault();
      toggleDebugMode();
    }
    // Ctrl+Shift+M for matrix rain toggle
    if (e.ctrlKey && e.shiftKey && e.key === "M") {
      e.preventDefault();
      toggleMatrixRain();
    }
    // Secret combination: Ctrl+Alt+Shift+H for all hints
    if (e.ctrlKey && e.altKey && e.shiftKey && e.key === "H") {
      e.preventDefault();
      revealAllHints();
    }
  });

  // Initialize cryptic hint systems
  setupMouseHints();
});

// Function to show cryptic hint
function showCrypticHint() {
  const currentLayer = getCurrentLayer();
  if (currentLayer != 1) return;
  const crypticHints = {
    1: "The grid whispers: 'A.B..C...D....E.....F......G.......H........'",
  };

  const hintElement = document.getElementById("current-hint");
  hintElement.innerHTML =
    "<strong>🔍 CRYPTIC WHISPER:</strong> " + crypticHints[currentLayer];

  // Auto-hide after 5 seconds
  setTimeout(() => {
    updateHint(currentLayer);
  }, 5000);
}

// Function to get current layer
function getCurrentLayer() {
  if (
    layer2Grid &&
    document.getElementById("layer2-group").classList.contains("hidden") ===
      false
  ) {
    return 2;
  } else if (layer1Grid) {
    return 1;
  }
  return 1;
}

// Function to toggle debug mode
function toggleDebugMode() {
  const cells = document.querySelectorAll(".crypto-cell");
  cells.forEach((cell) => {
    if (cell.style.border === "2px solid red") {
      cell.style.border = "";
    } else {
      cell.style.border = "2px solid red";
    }
  });
  console.log(
    "%cDebug mode toggled - target cells highlighted",
    "color: #ff0000; font-weight: bold;"
  );
}

// Function to toggle matrix rain
function toggleMatrixRain() {
  const rain = document.getElementById("matrix-rain");
  if (rain.style.display === "none") {
    rain.style.display = "block";
    console.log(
      "%cMatrix rain enabled - look for hidden messages",
      "color: #00ff00; font-weight: bold;"
    );
  } else {
    rain.style.display = "none";
    console.log("%cMatrix rain disabled", "color: #ff0000; font-weight: bold;");
  }
}

// Function to reveal all hints (secret combination)
function revealAllHints() {
  console.log(
    "%c=== ALL HINTS REVEALED ===",
    "color: #ff0000; font-size: 16px; font-weight: bold;"
  );
  console.log(
    "%cLayer 1: Click A1, B2, C3, D4, E5, F6, G7, H8 in sequence",
    "color: #ffaa00; font-weight: bold;"
  );
  console.log(
    "%cLayer 2: Transform coordinates and click: A3, C2, G2, B5, E8, F4, H8, D1",
    "color: #ffaa00; font-weight: bold;"
  );
  console.log(
    "%cLayer 3: The crypto word is 'cryptolk'",
    "color: #ffaa00; font-weight: bold;"
  );
  console.log(
    "%cFinal: Enter 'confirm' to complete",
    "color: #ffaa00; font-weight: bold;"
  );

  // Show all cryptic hints at once
  const hints = document.querySelectorAll(".cryptic-hint");
  hints.forEach((hint) => {
    hint.style.opacity = "1";
    hint.style.position = "fixed";
    hint.style.top = "50%";
    hint.style.left = "50%";
    hint.style.transform = "translate(-50%, -50%)";
    hint.style.zIndex = "9999";
    hint.style.background = "rgba(0, 0, 0, 0.95)";
    hint.style.border = "2px solid #ff0000";
    hint.style.fontSize = "16px";
    hint.style.padding = "20px";
  });

  // Auto-hide after 10 seconds
  setTimeout(() => {
    hints.forEach((hint) => {
      hint.style.opacity = "0";
      hint.style.position = "absolute";
      hint.style.top = "-9999px";
      hint.style.left = "-9999px";
    });
  }, 10000);
}
