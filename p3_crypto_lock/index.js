const CONFIG = {
  segmentReveal: "RlVUVVJF",
  NEXT_URL:
    "aHR0cHM6Ly9ib290LXNlY3Rvci5qdW1wLXN0YXJ0LmRldi9wNF9mb3JlbnNpc2NoX2xhYg==",
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
              `Too many wrong clicks (${MAX_LAYER2_CLICKS}). The page will reload...`,
              "error"
            );
            setTimeout(() => {
              window.location.reload();
            }, 2000);
            return;
          }

          // Show remaining clicks with color coding
          const remainingClicks = MAX_LAYER2_CLICKS - layer2ClickCount;
          let statusType = "info";
          
          if (remainingClicks <= 3) {
            // 3 or less: red and pulsing
            statusType = "critical";
          } else if (remainingClicks <= 5) {
            // 5 or less: orange
            statusType = "warning";
          }
          
          showStatus(
            `Layer 2: ${remainingClicks} wrong clicks left`,
            statusType
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
      const revealedCells = this.gridElement.querySelectorAll(
        ".crypto-cell.revealed"
      );
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
      const revealedCells = this.gridElement.querySelectorAll(
        ".crypto-cell.revealed"
      );
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
        const cells = this.gridElement.querySelectorAll(".crypto-cell.revealed");
        return Array.from(cells).some((cell) => cell.dataset.value === value);
      });
    } else if (this.placementType === "coordinated") {
      return this.targetCoords.filter((coord) => {
        const cell = this.gridElement.querySelector(`[data-coord="${coord}"]`);
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
    layer1Grid = new CryptoGrid("layer1-grid");

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
    layer2Grid = new CryptoGrid("layer2-grid");

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
  layer2ClickCount = 0;

  initCryptoGrid("layer2");
  showLayer1Order();
  markLayerComplete(1);

  const layer2Item = getLayerItem(2);
  if (layer2Item) {
    layer2Item.classList.add("theme-red");
    layer2Item.style.transition = "all 0.5s ease";
    layer2Item.style.transform = "scale(1.01)";
    setTimeout(() => {
      layer2Item.style.transform = "scale(1)";
    }, 500);
  }

  openUnlockedLayer(2);
  const layer1Input = document.getElementById("layer1");
  if (layer1Input) layer1Input.disabled = true;
  showStatus(
    "Layer 2 is open. Use the layer 1 result. You have 8 wrong clicks.",
    "success"
  );
}

// Function to update progress for crypto grid
function updateCryptoProgress() {
  if (layer2Grid) {
    const progress = layer2Grid.getProgressPercentage();
    const progressFill = document.getElementById("layer2-progress-fill");
    if (!progressFill) return;
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
          .getElementById("layer1-grid")
          .setAttribute("data-progress", "step1");
      }
    }

    const progressFill = document.getElementById("progress-fill");
    if (progressFill) {
      progressFill.style.width = progress + "%";
      progressFill.classList.remove("layer2");
    }
  }
}

function updateHint(hintID) {
  const layer1Hint = document.getElementById("current-hint");
  const layer2Hint = document.getElementById("layer2-hint");
  const layer1Hints = {
    1: "<strong>🔍 START:</strong> Open cells in the grid. Keep only the cells that follow a simple order. Close the rest.",
    2: "<strong>PATTERN FOUND:</strong> You found a pattern. Type that order below to continue.",
    3: "<strong>DONE:</strong> This layer is finished.",
  };
  const layer2Hints = {
    4: "<strong>WORD FOUND:</strong> You found the hidden word. Type it below.",
    5: "<strong>‼️ LAYER 2:</strong> You now have a limited number of wrong clicks. Transform the numbers from layer 1.",
    6: "<strong>🔍 NEED HELP:</strong> Change the numbers from layer 1. Open the console (F12) and type help().",
  };

  if (layer1Hints[hintID] && layer1Hint) {
    layer1Hint.innerHTML = layer1Hints[hintID];
  }
  if (layer2Hints[hintID] && layer2Hint) {
    layer2Hint.innerHTML = layer2Hints[hintID];
    layer2Hint.classList.toggle("high-alert", hintID === 5 || hintID === 6);
  }
}

function checkLayer1() {
  const input = document.getElementById("layer1").value.trim().toUpperCase();
  const typedOrder = input.replace(/,/g, "").replace(/ /g, "");
  const expectedOrder = "A1B2C3D4E5F6G7H8";

  if (typedOrder === expectedOrder) {
    showStatus("Correct! Opening layer 2...", "success");

    // Switch to the crypto grid
    setTimeout(() => {
      switchToCryptoGrid();
      updateHint(5);
      const progressFill = document.getElementById("layer2-progress-fill");
      if (progressFill) progressFill.style.width = "0%";
    }, 900);
  } else {
    showStatus(
      "That is not the right order. Try again",
      "error"
    );
  }
}

function checkLayer2() {
  const input = document.getElementById("layer2").value.trim().toLowerCase();

  if (layer2Grid && layer2Grid.isSequenceFound()) {
    // The expected answer is the letters from the hidden word: "cryptolk"
    const expected = "cryptolk";

    if (input === expected) {
      const layer2Item = getLayerItem(2);
      if (layer2Item) layer2Item.classList.add("complete");
      const badge = document.getElementById("layer2-badge");
      if (badge) badge.textContent = "✓";
      const layer2Input = document.getElementById("layer2");
      if (layer2Input) layer2Input.disabled = true;
      showStatus("Correct! You opened the lock.", "success");
      document.getElementById("reveal").classList.remove("hidden");
      document.getElementById("open-vault").href = atob(CONFIG.NEXT_URL);
      document.querySelector(".seg").textContent = atob(CONFIG.segmentReveal);
    } else if (/\d/.test(input)) {
      showStatus("Do not use numbers. Take them out.", "error");
    } else {
      showStatus("That word is not right. Try again.", "error");
    }
  } else {
    showStatus("Open the right cells in the grid first.", "error");
  }
}

function showStatus(message, type) {
  document.querySelectorAll(".layer-status").forEach((el) => {
    if (el.classList.contains("success-card")) return;
    el.textContent = "";
    el.className = "status layer-status";
  });
  const openItem = getOpenLayerItem();
  const status =
    (openItem && openItem.querySelector(".layer-status")) ||
    document.getElementById("status");
  if (!status) return;
  status.textContent = message;
  status.className = `status layer-status ${type}`;
}

function getLayerItem(layer) {
  return document.getElementById(`layer${layer}-item`);
}

function getOpenLayerItem() {
  return document.querySelector(".accordion-item.open, .terminal.open");
}

function setLayerOpen(layer, open) {
  const item = getLayerItem(layer);
  if (!item) return;
  item.classList.toggle("open", open);
  const header = item.querySelector(".accordion-header");
  if (header) header.setAttribute("aria-expanded", open ? "true" : "false");
}

function setLayerLocked(layer, locked) {
  const item = getLayerItem(layer);
  if (!item) return;
  item.classList.toggle("locked", locked);
  item.classList.toggle("unlocked", !locked);
  const header = item.querySelector(".accordion-header");
  if (header) {
    header.disabled = locked;
    header.setAttribute("aria-disabled", locked ? "true" : "false");
  }
  const badge = document.getElementById(`layer${layer}-badge`);
  if (badge && !item.classList.contains("complete")) {
    badge.textContent = locked ? "🔒" : String(layer);
  }
}

function markLayerComplete(layer) {
  const item = getLayerItem(layer);
  if (!item) return;
  item.classList.add("complete");
  const badge = document.getElementById(`layer${layer}-badge`);
  if (badge) badge.textContent = "✓";
  setLayerOpen(layer, false);
}

function openUnlockedLayer(layer) {
  document.querySelectorAll(".accordion-item").forEach((item) => {
    item.classList.remove("open");
    const header = item.querySelector(".accordion-header");
    if (header) header.setAttribute("aria-expanded", "false");
  });
  setLayerLocked(layer, false);
  setLayerOpen(layer, true);
}

function showLayer1Order() {
  if (!window.sequentialPattern) return;
  const order = window.sequentialPattern.join("  ");
  const headerOrder = document.getElementById("layer1-header-order");
  if (headerOrder) {
    headerOrder.textContent = order;
    headerOrder.classList.add("has-value");
  }
  const sequenceText = document.getElementById("layer1-sequence-text");
  const sequenceDisplay = document.getElementById("layer1-sequence-display");
  if (sequenceText && sequenceDisplay) {
    sequenceText.textContent = order;
    sequenceDisplay.classList.remove("hidden");
  }
}

function initAccordion() {
  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", () => {
      const item = header.closest(".accordion-item");
      if (!item || item.classList.contains("locked") || header.disabled) return;
      const layer = Number(item.id.replace("layer", "").replace("-item", ""));
      if (!layer) return;
      if (item.classList.contains("open")) {
        setLayerOpen(layer, false);
      } else {
        openUnlockedLayer(layer);
      }
    });
  });
}

// Initialize everything
document.addEventListener("DOMContentLoaded", () => {
  createMatrixEffect();
  initCryptoGrid(); // Default to layer1
  initAccordion();

  // Allow Enter key to submit
  document.getElementById("layer1").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkLayer1();
  });
  document.getElementById("layer2").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkLayer2();
  });

  // Add cryptic console hints
  console.log(
    "%c🔐 CRYPTO LOCK DEBUG MODE 🔐",
    "color: #00ff00; font-size: 20px; font-weight: bold;"
  );
  console.log(
    "%cType 'help()' here for extra help",
    "color: #00aa00; font-size: 14px;"
  );

  // Add global help function for console hints
  window.help = function () {
    console.log(
      "%c=== EXTRA HELP ===",
      "color: #00ff00; font-weight: bold;"
    );
    console.log(
      "%c1. Layer 1: Find cells that go up in order, like A1 then B2.",
      "color: #00aa00;"
    );
    console.log(
      "%c2. Layer 2: Change the numbers of that list with + and -.",
      "color: #ff0000;"
    );
    console.log(
      "%c3. Layer 2: The open cells hide a word.",
      "color: #ff0000;"
    );
    console.log(
      "%cType hint(1), hint(2) or hint(3) for more help",
      "color: #00aa00;"
    );
  };

  window.hint = function (id) {
    if (id === 3) throw new Error("Do not use numbers. Take them out.");
    const hints = {
      1: "Click cells in the grid. Keep only the ones that go in order. Close the other cells.",
      2: `Change the numbers of the layer 1 cells: ${window.transformationHints.join(", ")}`,
    };
    console.log("%c" + hints[id], "color: #ffaa00; font-weight: bold;");
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
    1: "Look at the letters in order.",
  };

  const hintElement = document.getElementById("current-hint");
  hintElement.innerHTML =
    "<strong>🔍 HIDDEN HINT:</strong> " + crypticHints[currentLayer];

  // Auto-hide after 5 seconds
  setTimeout(() => {
    updateHint(currentLayer);
  }, 5000);
}

// Function to get current layer
function getCurrentLayer() {
  if (document.getElementById("layer1-item")?.classList.contains("open")) {
    return 1;
  }
  if (document.getElementById("layer2-item")?.classList.contains("unlocked")) {
    return 2;
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
    "%cDebug mode on or off - target cells are marked in red",
    "color: #ff0000; font-weight: bold;"
  );
}

// Function to toggle matrix rain
function toggleMatrixRain() {
  const rain = document.getElementById("matrix-rain");
  if (rain.style.display === "none") {
    rain.style.display = "block";
    console.log(
      "%cMatrix rain is on - look for hidden messages",
      "color: #00ff00; font-weight: bold;"
    );
  } else {
    rain.style.display = "none";
    console.log("%cMatrix rain is off", "color: #ff0000; font-weight: bold;");
  }
}

// Function to reveal all hints (secret combination)
function revealAllHints() {
  console.log(
    "%c=== ALL HINTS ===",
    "color: #ff0000; font-size: 16px; font-weight: bold;"
  );
  console.log(
    "%cLayer 1: Find the order: A1, B2, C3, D4, E5, F6, G7, H8",
    "color: #ffaa00; font-weight: bold;"
  );
  console.log(
    "%cLayer 2: Change the numbers and click: A3, C2, G2, B5, E8, F4, H8, D1",
    "color: #ffaa00; font-weight: bold;"
  );
  console.log(
    "%cLayer 2 word: cryptolk",
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
