const CONFIG = {
  expectedDigestHex:
    "2246afd5234815a05498acab2b4b25be948bcdf9913307f4dcffb2efdc21acd4",
  encryptedSegment: "bRTmkmoG",
  nextUrl:
    "aHR0cHM6Ly9yb3lzcHJpbmdlci5naXRodWIuaW8vYm9vdC1zZWN0b3IvY29kZV92YWxpZGF0aW9u",
};

const surnameInput = document.getElementById("surname");
const verifyButton = document.getElementById("verify");
const statusEl = document.getElementById("status");
const terminalEl = document.getElementById("terminal");
const revealEl = document.getElementById("reveal");
const segmentEl = document.getElementById("segment");
const nextLinkEl = document.getElementById("next-link");

function log(message) {
  terminalEl.textContent += `${message}\n`;
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`.trim();
}

function normalizeSurname(value) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

async function sha256Bytes(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function decodeSegment(hashBytes) {
  const encryptedBytes = Uint8Array.from(atob(CONFIG.encryptedSegment), (char) =>
    char.charCodeAt(0)
  );

  return Array.from(encryptedBytes, (byte, index) =>
    String.fromCharCode(byte ^ hashBytes[index])
  ).join("");
}

async function verifySurname() {
  const normalized = normalizeSurname(surnameInput.value);
  revealEl.classList.add("hidden");

  if (!normalized) {
    setStatus("Voer eerst een achternaam in.", "error");
    log("[ERROR] Geen invoer ontvangen.");
    return;
  }

  setStatus("Hashcontrole actief...", "info");
  log(`[SCAN] Forensische match gestart voor ${normalized}...`);

  const digest = await sha256Bytes(normalized);
  const digestHex = toHex(digest);

  if (digestHex !== CONFIG.expectedDigestHex) {
    setStatus("Geen geldige match. Controleer de volledige achternaam.", "error");
    log("[FAIL] Hash mismatch. Segment blijft vergrendeld.");
    return;
  }

  const segment = decodeSegment(digest);
  segmentEl.textContent = segment;
  nextLinkEl.href = atob(CONFIG.nextUrl);
  revealEl.classList.remove("hidden");

  setStatus("Match bevestigd. Segment gedecrypteerd.", "success");
  log("[OK] Verdachte bevestigd.");
  log(`[OK] Segment 4/5 vrijgegeven: ${segment}`);
  log("[NEXT] Mainframe-link ontsleuteld.");
}

document.addEventListener("DOMContentLoaded", () => {
  log("HvA Forensisch Lab initialized.");
  log("Wacht op achternaam van hoofdverdachte...");
  nextLinkEl.href = "#";
  surnameInput.focus();

  verifyButton.addEventListener("click", verifySurname);
  surnameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      verifySurname();
    }
  });

  console.log(
    "%cFORENSISCH LAB // P4",
    "color: #51ffa6; font-size: 18px; font-weight: bold;"
  );
  console.log(
    "%cClient-side checks are digest-based. Plaintext answers are not stored here.",
    "color: #8ba;"
  );
});
