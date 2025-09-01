const CONFIG = {
  rootPassword: "SuperGeheimWachtwoord", // Used in code but also hidden as hint
  bootSectorBytes:
    "010001?? 0?00111? 01000?11 01001001 010??110 0100010? 0100010? 01010???",
  expectedPlaintext: "ENGINEER",
  expectedSha256Hex:
    "cafa51a40e34a9536eecbeceb8cb6ee5e961a54daa5b2ba60b00f6c9d8eaeefc",
  segmentReveal: "SEGMENT: ENGINEER",
  colors: { bg: "#0b0f10", fg: "#d2fbd4", accent: "#51ffa6" }, // Terminal style
  nextLevel: "aHR0cHM6Ly9jb2RlcGVuLmlvL01vNEgvcGVuL1hKbVBvd1I=", // Masked URL to next level Console Gate
};

// Terminal state
let terminalState = {
  isRoot: false,
  inRepairMode: false,
  currentBootSector: CONFIG.bootSectorBytes,
  commandHistory: [],
  historyIndex: -1,
  validationPassed: false,
  bootCompleted: false,
};

// Available commands for autocomplete
const commands = [
  "help",
  "scan",
  "read boot-sector",
  "login",
  "su",
  "write boot-sector",
  "repair hint",
  "list",
  "set",
  "preview",
  "validate",
  "boot",
  "clear",
  "exit",
];

// DOM elements
const terminalOutput = document.getElementById("terminalOutput");
const terminalInput = document.getElementById("terminalInput");
const terminalPrompt = document.getElementById("terminalPrompt");
const terminalBody = document.querySelector(".terminal-body");
const hint = document.querySelector(".hidden-hint");

hint.textContent = `No one will find this password: ${CONFIG.rootPassword}`;

// Initialize terminal
function initTerminal() {
  terminalInput.focus();
  terminalInput.addEventListener("keydown", handleKeyDown);
  terminalInput.addEventListener("input", handleInput);
}

// Handle keyboard input
function handleKeyDown(event) {
  if (event.key === "Enter") {
    executeCommand(terminalInput.value.trim());
    terminalInput.value = "";
    terminalState.historyIndex = -1;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    navigateHistory("up");
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    navigateHistory("down");
  } else if (event.key === "Tab") {
    event.preventDefault();
    autocomplete();
  }
}

// Handle input for real-time feedback
function handleInput(event) {
  // Could add real-time command validation here
}

// Navigate command history
function navigateHistory(direction) {
  if (terminalState.commandHistory.length === 0) return;

  if (direction === "up") {
    if (terminalState.historyIndex < terminalState.commandHistory.length - 1) {
      terminalState.historyIndex++;
    }
  } else {
    if (terminalState.historyIndex > 0) {
      terminalState.historyIndex--;
    } else if (terminalState.historyIndex === 0) {
      terminalState.historyIndex = -1;
      terminalInput.value = "";
      return;
    }
  }

  if (terminalState.historyIndex >= 0) {
    terminalInput.value =
      terminalState.commandHistory[terminalState.historyIndex];
  }
}

// Autocomplete functionality
function autocomplete() {
  const currentInput = terminalInput.value.toLowerCase();
  const matchingCommands = commands.filter(
    (cmd) =>
      cmd.toLowerCase().startsWith(currentInput) &&
      cmd.toLowerCase() !== currentInput
  );

  if (matchingCommands.length === 1) {
    terminalInput.value = matchingCommands[0];
  } else if (matchingCommands.length > 1) {
    // Show all matching commands
    addOutput(`\nAvailable completions:\n${matchingCommands.join("  ")}\n`);
  }
}

// Add output to terminal
function addOutput(text, className = "") {
  const outputDiv = document.createElement("div");
  outputDiv.className = `command-output ${className}`;
  outputDiv.textContent = text;
  terminalOutput.appendChild(outputDiv);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

// Update terminal prompt
function updatePrompt() {
  if (terminalState.isRoot) {
    terminalPrompt.textContent = "root@system:/# ";
  } else {
    terminalPrompt.textContent = "guest@system:~$ ";
  }
}

// Execute command
function executeCommand(command) {
  if (!command) return;

  // Add to history
  terminalState.commandHistory.unshift(command);
  if (terminalState.commandHistory.length > 50) {
    terminalState.commandHistory.pop();
  }

  // Show command in output
  addOutput(`\n${terminalPrompt.textContent} ${command}`);

  // Parse and execute command
  const parts = command.split(" ");
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  try {
    switch (cmd) {
      case "help":
        showHelp();
        break;
      case "scan":
        performScan();
        break;
      case "read":
        if (args[0] === "boot-sector") {
          readBootSector();
        } else {
          addOutput(`Error: Unknown read target '${args[0]}'`, "error");
        }
        break;
      case "login":
      case "su":
        performLogin();
        break;
      case "sudo":
        if (args[0] === "write" && args[1] === "boot-sector") {
          enterRepairMode();
        } else {
          addOutput(`Error: Unknown sudo command '${args.join(" ")}'`, "error");
        }
        break;
      case "write":
        if (args[0] === "boot-sector") {
          if (terminalState.isRoot) {
            enterRepairMode();
          } else {
            addOutput(
              "Error: Permission denied. Try 'su' or 'sudo write boot-sector'",
              "error"
            );
          }
        } else {
          addOutput(`Error: Unknown write target '${args[0]}'`, "error");
        }
        break;
      case "repair":
        if (args[0] === "hint") {
          showRepairHint();
        } else {
          addOutput(`Error: Unknown repair command '${args[0]}'`, "error");
        }
        break;
      case "list":
        if (terminalState.inRepairMode) {
          listCorruptedBits();
        } else {
          addOutput(
            "Error: Not in repair mode. Use 'write boot-sector' first.",
            "error"
          );
        }
        break;
      case "set":
        if (terminalState.inRepairMode) {
          setBit(args);
        } else {
          addOutput(
            "Error: Not in repair mode. Use 'write boot-sector' first.",
            "error"
          );
        }
        break;
      case "preview":
        if (terminalState.inRepairMode) {
          previewRepair();
        } else {
          addOutput(
            "Error: Not in repair mode. Use 'write boot-sector' first.",
            "error"
          );
        }
        break;
      case "validate":
        validateRepair();
        break;
      case "boot":
        performBoot();
        break;
      case "clear":
        clearTerminal();
        break;
      case "exit":
        if (terminalState.inRepairMode) {
          exitRepairMode();
        } else {
          addOutput("Error: Not in repair mode.", "error");
        }
        break;
      default:
        addOutput(
          `Error: Command '${cmd}' not found. Try 'help' for available commands.`,
          "error"
        );
    }
  } catch (error) {
    addOutput(`System error: ${error.message}`, "error");
  }
}

// Show help
function showHelp() {
  const helpText = `
Available commands:

HELP COMMANDS:
help                    - Show this help message

SYSTEM COMMANDS:
scan                    - Perform system scan
read boot-sector        - Display current boot sector bytes
login                   - Login as root user
su                      - Switch to root user
write boot-sector  - Enter boot sector repair mode (requires root)

REPAIR MODE COMMANDS:
repair hint             - Show repair instructions
list                    - Show corrupted bit positions
set <pos>=<0|1>         - Set bit at position (e.g., set 3=1)
preview                 - Preview current repair result
exit                    - Exit repair mode

VALIDATION COMMANDS:
validate                - Validate repaired boot sector
boot                    - Boot system (requires validation)

UTILITY COMMANDS:
clear                   - Clear terminal output
      `;
  addOutput(helpText, "info");
}

// Perform system scan
function performScan() {
  addOutput("[SCAN] Initializing system scan...", "system-log");
  setTimeout(() => {
    addOutput("[SCAN] Checking boot sector integrity...", "system-log");
    setTimeout(() => {
      addOutput("[SCAN] ERROR: Boot sector corrupted at offset 0x1A", "error");
      addOutput(
        "[SCAN] Recommendation: Use 'read boot-sector' to inspect damage",
        "warning"
      );
      addOutput("[SCAN] Scan complete.", "system-log");
    }, 500);
  }, 300);
}

// Read boot sector
function readBootSector() {
  addOutput("Reading boot sector...", "info");
  addOutput(
    `\nCurrent boot sector bytes:\n${terminalState.currentBootSector}`,
    "boot-sector-display"
  );
  addOutput("\nStatus: CORRUPTED (unknown bits marked with ?)", "error");
}

// Perform login
function performLogin() {
  const password = prompt("Enter password:");
  if (password === CONFIG.rootPassword) {
    terminalState.isRoot = true;
    updatePrompt();
    addOutput("Login successful. You are now root.", "success");
  } else {
    addOutput("Login failed. Invalid password.", "error");
  }
}

// Enter repair mode
function enterRepairMode() {
  if (!terminalState.isRoot) {
    addOutput(
      "Error: Permission denied. Try 'su' or 'sudo write boot-sector'",
      "error"
    );
    return;
  }

  terminalState.inRepairMode = true;
  addOutput("Entering boot sector repair mode...", "info");
  addOutput(
    "Type 'repair hint' for instructions, 'list' to see corrupted bits, or 'exit' to quit.",
    "info"
  );
}

// Show repair hint
function showRepairHint() {
  const hintText = `
REPAIR INSTRUCTIONS:

The boot sector contains binary data that represents ASCII characters.
Each 8-bit group (byte) represents one character.

Corrupted bits are marked with '?' or '*'.
Your task is to replace these with 0 or 1 to form readable ASCII text.

To repair:
1. Use 'list' to see corrupted positions
2. Use 'set <position>=<0|1>' to fix bits
3. Use 'preview' to see current result
4. Use 'validate' when done
      `;
  addOutput(hintText, "info");
}

// List corrupted bits
function listCorruptedBits() {
  const bytes = terminalState.currentBootSector.split(" ");
  let corruptedPositions = [];

  bytes.forEach((byte, byteIndex) => {
    for (let i = 0; i < byte.length; i++) {
      if (byte[i] === "?" || byte[i] === "*") {
        corruptedPositions.push({
          position: byteIndex * 8 + i + 1,
          byteIndex: byteIndex + 1,
          bitIndex: i + 1,
          currentValue: byte[i],
        });
      }
    }
  });

  if (corruptedPositions.length === 0) {
    addOutput(
      "No corrupted bits found. Boot sector appears intact.",
      "success"
    );
    return;
  }

  addOutput("Corrupted bit positions:", "info");
  corruptedPositions.forEach((pos) => {
    addOutput(
      `  Position ${pos.position}: Byte ${pos.byteIndex}, Bit ${pos.bitIndex} (currently '${pos.currentValue}')`,
      "warning"
    );
  });
  addOutput(`\nUse 'set <position>=<0|1>' to repair bits.`, "info");
}

// Set bit
function setBit(args) {
  if (args.length !== 1) {
    addOutput("Error: Usage: set <position>=<0|1> (e.g., set 3=1)", "error");
    return;
  }

  const match = args[0].match(/^(\d+)=([01])$/);
  if (!match) {
    addOutput("Error: Invalid format. Use: set <position>=<0|1>", "error");
    return;
  }

  const position = parseInt(match[1]);
  const value = match[2];

  // Convert position to byte and bit index
  const byteIndex = Math.floor((position - 1) / 8);
  const bitIndex = (position - 1) % 8;

  const bytes = terminalState.currentBootSector.split(" ");
  if (byteIndex >= bytes.length) {
    addOutput(`Error: Position ${position} is out of range.`, "error");
    return;
  }

  const byte = bytes[byteIndex];
  if (byte[bitIndex] !== "?" && byte[bitIndex] !== "*") {
    addOutput(`Error: Position ${position} is not corrupted.`, "error");
    return;
  }

  // Update the bit
  const newByte =
    byte.substring(0, bitIndex) + value + byte.substring(bitIndex + 1);
  bytes[byteIndex] = newByte;
  terminalState.currentBootSector = bytes.join(" ");

  addOutput(`Bit ${position} set to ${value}.`, "success");
  addOutput(
    `Updated boot sector: ${terminalState.currentBootSector}`,
    "boot-sector-display"
  );
}

// Preview repair
function previewRepair() {
  const bytes = terminalState.currentBootSector.split(" ");
  let result = "";
  let hasCorruption = false;

  for (let byte of bytes) {
    if (byte.includes("?") || byte.includes("*")) {
      hasCorruption = true;
      result += "?";
    } else {
      // Convert binary to ASCII
      const charCode = parseInt(byte, 2);
      if (charCode >= 32 && charCode <= 126) {
        result += String.fromCharCode(charCode);
      } else {
        result += "?";
      }
    }
  }

  addOutput("Current repair preview:", "info");
  addOutput(
    `Binary: ${terminalState.currentBootSector}`,
    "boot-sector-display"
  );
  addOutput(`ASCII:  ${result}`, hasCorruption ? "warning" : "success");

  if (!hasCorruption) {
    addOutput(
      "All corruption repaired. Use 'validate' to check integrity.",
      "success"
    );
  } else {
    addOutput("Corruption still present. Continue repairing.", "warning");
  }
}

// Validate repair
async function validateRepair() {
  const bytes = terminalState.currentBootSector.split(" ");
  let plaintext = "";

  // Check if any corruption remains
  for (let byte of bytes) {
    if (byte.includes("?") || byte.includes("*")) {
      addOutput(
        "Error: Boot sector still contains corrupted bits. Continue repairing.",
        "error"
      );
      return;
    }

    // Convert binary to ASCII
    const charCode = parseInt(byte, 2);
    if (charCode >= 32 && charCode <= 126) {
      plaintext += String.fromCharCode(charCode);
    } else {
      addOutput(
        "Error: Invalid ASCII character detected in boot sector.",
        "error"
      );
      return;
    }
  }

  addOutput("[VALIDATE] Calculating checksum...", "system-log");

  try {
    // Calculate SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    addOutput(`[VALIDATE] Plaintext: ${plaintext}`, "info");
    addOutput(`[VALIDATE] Calculated hash: ${hashHex}`, "info");
    addOutput(`[VALIDATE] Expected hash: ${CONFIG.expectedSha256Hex}`, "info");

    if (hashHex === CONFIG.expectedSha256Hex) {
      addOutput("[VALIDATE] VALIDATION: OK", "success");
      addOutput("[VALIDATE] Boot sector integrity verified.", "success");
      terminalState.validationPassed = true;
    } else {
      addOutput("[VALIDATE] VALIDATION: FAILED", "error");
      addOutput(
        "[VALIDATE] Checksum mismatch: sector still corrupted.",
        "error"
      );
    }
  } catch (error) {
    addOutput(`[VALIDATE] Error calculating hash: ${error.message}`, "error");
  }
}

// Perform boot
function performBoot() {
  if (!terminalState.validationPassed) {
    addOutput(
      "Error: System validation required before boot. Use 'validate' first.",
      "error"
    );
    return;
  }

  if (terminalState.bootCompleted) {
    addOutput("System already booted successfully.", "info");
    return;
  }

  addOutput("[BOOT] Initializing system boot sequence...", "system-log");
  setTimeout(() => {
    addOutput("[BOOT] Loading kernel...", "system-log");
    setTimeout(() => {
      addOutput("[BOOT] Mounting filesystems...", "system-log");
      setTimeout(() => {
        addOutput("[BOOT] Starting system services...", "system-log");
        setTimeout(() => {
          addOutput("[BOOT] Restoring boot sector...", "system-log");
          setTimeout(() => {
            addOutput("[BOOT] System online.", "success");
            addOutput(`\n🎉 CONGRATULATIONS! 🎉`, "success");
            addOutput(
              `You have successfully repaired the boot sector!`,
              "success"
            );
            addOutput(`\n${CONFIG.segmentReveal}`, "success");
            addOutput(
              `\nMission accomplished! The system is now operational.`,
              "success"
            );

            // Add next level link
            setTimeout(() => {
              try {
                const nextLevelUrl = atob(CONFIG.nextLevel);
                addOutput(`\n[SYSTEM] Next level unlocked!`, "info");
                addOutput(`[SYSTEM] Proceed to: ${nextLevelUrl}`, "success");
                addOutput(`\nClick here to continue: `, "info");

                // Create clickable link element
                const linkDiv = document.createElement("div");
                linkDiv.className = "command-output success";
                linkDiv.style.textAlign = "center";
                linkDiv.style.margin = "20px 0";
                linkDiv.innerHTML = `<a href="${nextLevelUrl}" target="_blank" rel="noopener" class="next-level-link">🚀 CONTINUE TO NEXT LEVEL 🚀</a>`;
                terminalOutput.appendChild(linkDiv);
                terminalBody.scrollTop = terminalBody.scrollHeight;
              } catch (error) {
                addOutput(
                  `[SYSTEM] Error decoding next level URL: ${error.message}`,
                  "error"
                );
              }
            }, 1000);

            terminalState.bootCompleted = true;

            // Update terminal status
            document.querySelector(".terminal-status").textContent =
              "SYSTEM: ONLINE";
            document.querySelector(".terminal-status").style.color = "#51ffa6";
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  }, 500);
}

// Clear terminal
function clearTerminal() {
  terminalOutput.innerHTML = "";
  addOutput(
    "Welcome to the Boot Sector Terminal.\nSystem boot sector is corrupted. Manual repair required.\n\nType 'help' for available commands."
  );
}

// Exit repair mode
function exitRepairMode() {
  terminalState.inRepairMode = false;
  addOutput("Exited repair mode.", "info");
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initTerminal);
