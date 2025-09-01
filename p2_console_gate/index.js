/* ================================
   PUZZLE CODE — Small bugs inside
   FIX THE BUGS IN THIS PANEL: 
   The following functions in the JS panel of CodePen have bugs.
   Devide the work and debug together to solve each puzzle.
   ================================ */

//-----------------------------------------
// BUG: Onderzoeken waarom de decoder niet werk?
// Hij lijkt verkeerd te decoden
// 1) Decoder: Maakt van een encode word een normaal woord: bijv. "uftu" wordt "test"
//-----------------------------------------
function decodeShift(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i) + 1;
    out += String.fromCharCode(code);
  }
  return out;
}
console.log("1) DecodeShift: " + decodeShift("uftu"));

// BUG: Bug, normalizer doet niks. Ik zie nog steeds spaties en hoofdletters.
// 2) Normalizer: haalt de spaties vooraan en achteraan weg en maakt alles lage letters
function normalize(s) {
  return s;
}
// Open de browser console
console.log("2) Normalize:  '" + normalize("   Test Trim   ") + "'");

//-----------------------------------------
// BUG: Lijkt erop dat hij niet goed opteld alle waardes in een lijst op telt.
// 3) Checksum: telt alle nummers in een lijst bij elkaar op
//-----------------------------------------
function checksum(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    sum += arr[i];
  }
  return sum;
}
// Open de browser console
console.log("3) Checksum: " + checksum([1, 2, 3]));

//-----------------------------------------
// BUG: Hij lijkt hoofdletter gevoelig.
// 4) Email regex: moet alle emails valideren inclusief hoofdletters: "Student@hva.nl"
//-----------------------------------------
function isValidEmail(s) {
  const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  return regex.test(s);
}
// Open de browser console
console.log(
  "4) Is valid email - 'Student@hva.nl': " + isValidEmail("Student@hva.nl")
);

//-----------------------------------------
// BUG: Hij lijkt niet goed te beginnen. :S
// 5) Haalt elke Nde-element uit de lijst (n=1): [a,b,c,d,e], (n=2): [b,d]
//-----------------------------------------
function pickEveryNth(arr, n) {
  const out = [];
  for (let index = 0; index < arr.length; index += n) {
    out.push(arr[index]);
  }
  return out;
}
// Open de browser console
console.log(
  "5) Pick every Nth (n=1): " + pickEveryNth(["a", "b", "c", "d", "e"], 1)
);
console.log(
  "5) Pick every Nth (n=2): " + pickEveryNth(["a", "b", "c", "d", "e"], 2)
);

/* ========= Framework bits ========= */
const EXPECTED_HEX =
  "43f9b89c0b9d22d8110ead813ea3949f20592a8bfc3c777d2d49e64da3b0cc9b";
const NEXT_URL =
  "aHR0cHM6Ly9yb3lzcHJpbmdlci5naXRodWIuaW8vYm9vdC1zZWN0b3IvcDNfY3J5cHRvX2xvY2s=";

const term = document.getElementById("term");
const testsEl = document.getElementById("tests");
const fill = document.getElementById("fill");
const reveal = document.getElementById("reveal");
const todo = document.getElementById("todo");
const nextLink = document.getElementById("nextLink");
const segment = document.querySelector(".seg");

const TESTS = [
  {
    id: "decoder",
    name: "Decoder",
    run: () => decodeShift("Qsftfou") === "Present",
    h1: "Look at char codes.",
    h2: "It’s a Caesar shift by 1. Wrong direction.",
    h3: "Try - 1 instead of + 1",
  },
  {
    id: "normalize",
    name: "Normalizer",
    run: () =>
      normalize("  Hi  ").toLowerCase() === "hi" &&
      normalize("WELCOME") === "welcome",
    h1: "Whitespace & case matter.",
    h2: "Use trim() and toLowerCase().",
    h3: "Add trim().toLowerCase() to 's'",
  },
  {
    id: "sum",
    name: "Checksum",
    run: () => checksum([1, 2, 3, 4]) === 10 && checksum([5]) === 5,
    h1: "Fencepost alert.",
    h2: "Loop should include the last element.",
    h3: "The length is not correct",
  },
  {
    id: "regex",
    name: "Regex",
    run: () =>
      isValidEmail("Student@hva.nl") && isValidEmail("dev.test+1@domain.io"),
    h1: "Case-insensitive emails.",
    h2: "Add the 'i' flag and allow uppercase letters.",
    h3: "Add the 'i' at the end of the regex",
  },
  {
    id: "nth",
    name: "Every Nth",
    run: () =>
      JSON.stringify(pickEveryNth(["a", "b", "c", "d", "e"], 2)) ===
      JSON.stringify(["b", "d"]),
    h1: "Start offset is wrong.",
    h2: "Begin at index n-1, not 0.",
    h3: "Update the begining of the for-loop:`for (let index = 0;`",
  },
];

let hintsUsed = 0;
let hintStage = 0;

function log(s) {
  term.textContent += s + "\n";
  term.scrollTop = term.scrollHeight;
}

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function renderTests(results = []) {
  testsEl.innerHTML = "";
  TESTS.forEach((t, idx) => {
    const ok = results[idx]?.ok ?? false;
    const row = document.createElement("div");
    row.className = "test";
    row.innerHTML = `<span class="name">${idx + 1}. ${t.name}</span>
                     <span class="status ${ok ? "ok" : "bad"}">${
      ok ? "PASS" : "FAIL"
    }</span>`;
    testsEl.appendChild(row);
  });
}

async function runAll() {
  log("[RUN] Executing unit tests…");
  const results = TESTS.map((t) => ({ id: t.id, ok: false }));
  let passed = 0;
  TESTS.forEach((t, i) => {
    try {
      const ok = !!t.run();
      results[i].ok = ok;
      log(` - ${t.name}: ${ok ? "OK" : "FAIL"}`);
      if (ok) passed++;
    } catch (e) {
      results[i].ok = false;
      log(` - ${t.name}: ERROR (${e.message})`);
    }
  });
  renderTests(results);
  const pct = Math.round((100 * passed) / TESTS.length);
  fill.style.width = pct + "%";

  if (passed === TESTS.length) {
    const hx = await sha256Hex(atob("UHJlc2VudA=="));
    if (hx === EXPECTED_HEX) {
      log("[HASH] SHA-256 verification: OK");
      reveal.classList.remove("hidden");
      todo.classList.add("hidden");
      segment.textContent(atob("UHJlc2VudA==").toUpperCase());
      nextLink.href = atob(NEXT_URL);
      // celebratory
      log(`▶ Segment B unlocked: ${atob("UHJlc2VudA==").toUpperCase()}`);
      log("▶ Proceed to Crypto Lock…");
    } else {
      log("[HASH] verification failed (unexpected).");
    }
  } else {
    log(`[INFO] ${passed}/${TESTS.length} passed. Fix remaining tests.`);
  }
}

function giveHint() {
  // one click: show first-level hints for all failing tests; second click: show stronger hints
  hintsUsed++;
  document.getElementById("score").textContent = `Hints used: ${hintsUsed}`;

  const failing = TESTS.filter((t) => !t.run());
  if (failing.length === 0) {
    log("[HINT] All green already — run tests again.");
    return;
  }

  if (hintStage === 0) {
    log("[HINT] First wave:");
    failing.forEach((t) => log(` - ${t.name}: ${t.h1}`));
    hintStage = 1;
  } else if (hintStage === 1) {
    log("[HINT] Second wave:");
    failing.forEach((t) => log(` - ${t.name}: ${t.h2}`));
    hintStage = 2;
  } else {
    log("[HINT] Stronger hints:");
    failing.forEach((t) => log(` - ${t.name}: ${t.h3}`));
  }
}

document.getElementById("run").addEventListener("click", runAll);
document.getElementById("hints").addEventListener("click", giveHint);

// initial render
renderTests([]);
log("HvA SE // Console Gate initialized.");
log("Team of five: each pick a role and fix your tiny defect in the JS.");
log("When all tests pass, the segment will be hash-verified and revealed.");

// Flavor output
setTimeout(
  () => log("Psst… some text hides in plain sight. Try selecting."),
  800
);
