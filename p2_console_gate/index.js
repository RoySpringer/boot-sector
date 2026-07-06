/* ================================
   PUZZLE CODE — Small bugs inside
   FIX THE BUGS IN THIS PANEL - Scroll Down:
   The following functions in the JS panel of CodePen have bugs.
   Divide the work and debug together to solve each puzzle.

   DEBUG CONSOLE: open the browser console (F12 → Console) or the Console in code pen.
   Every bug prints its own debug line, marked with [BUG x],
   so you can see live what each function returns right now.
   ================================ */

//-----------------------------------------
// BUG 1: De toegangscheck weigert iedereen, zelfs met de juiste
// status "granted". Er lijkt iets mis te zijn in de if-vergelijking…
// 1) AccessCheck: geeft "ACCESS GRANTED" als de status "granted" is,
//    anders "ACCESS DENIED"
//-----------------------------------------
function accessCheck(status) {
  if (status === "grantted") {
    return "ACCESS GRANTED";
  }
  return "ACCESS DENIED";
}
console.log(
  "[BUG 1 · AccessCheck] accessCheck('granted') → '" +
    accessCheck("granted") +
    "'  (verwacht: 'ACCESS GRANTED')"
);

//-----------------------------------------
// BUG 2: De vermenigvuldiging rekent wel, maar er komt niks uit.
// Het antwoord lijkt te verdwijnen in de functie…
// 2) Multiply: vermenigvuldigt twee getallen: multiply(6, 7) wordt 42
//-----------------------------------------
function multiply(a, b) {
  const result = a * b;
}
console.log(
  "[BUG 2 · Multiply] multiply(6, 7) → " +
    multiply(6, 7) +
    "  (verwacht: 42)"
);

//-----------------------------------------
// BUG 3: Het laatste item van de lijst pakken lukt niet.
// Er komt steeds 'undefined' uit. Waar staat het laatste item echt?
// 3) LastItem: pakt het laatste element uit een lijst:
//    getLast(["a", "b", "c"]) wordt "c"
//-----------------------------------------
function getLast(list) {
  return list[list.length];
}
console.log(
  "[BUG 3 · LastItem] getLast(['a', 'b', 'c']) → " +
    getLast(["a", "b", "c"]) +
    "  (verwacht: c)"
);

//-----------------------------------------
// BUG 4: Het gemiddelde klopt niet. Het gemiddelde van 2, 4, 6 en 8 moet
// 5 zijn, maar er komt 14 uit?! Reken maar na…
// 4) Average: berekent het gemiddelde van vier getallen
//-----------------------------------------
function average(a, b, c, d) {
  return a + b + c + d / 4;
}
console.log(
  "[BUG 4 · Average] average(2, 4, 6, 8) → " +
    average(2, 4, 6, 8) +
    "  (verwacht: 5)"
);

//-----------------------------------------
// BUG 5: Het codewoord "openup" werkt alleen als je het precies zo
// typt. Maar "OpenUp" en "OPENUP" moeten óók goedgekeurd worden.
// 5) Keyword: checkt of de invoer het codewoord "openup" is,
//    hoofdletters mogen geen verschil maken
//-----------------------------------------
function checkKeyword(input) {
  return input === "openup";
}
console.log(
  "[BUG 5 · Keyword] checkKeyword('OPENUP') → " +
    checkKeyword("OPENUP") +
    "  (verwacht: true)"
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
    id: "access",
    name: "AccessCheck",
    run: () =>
      accessCheck("granted") === "ACCESS GRANTED" &&
      accessCheck("nope") === "ACCESS DENIED",
    h1: "Computers compare letter by letter, exactly.",
    h2: "Read the word inside the if-statement very carefully.",
    h3: "Dev move: add console.log(status) inside the function, then compare the printed word letter by letter with the word in the if.",
  },
  {
    id: "multiply",
    name: "Multiply",
    run: () => multiply(6, 7) === 42 && multiply(3, 5) === 15,
    h1: "The math is fine, but nothing comes back out.",
    h2: "A function must hand back its answer to the caller.",
    h3: "Dev move: google 'javascript function gives undefined'. Then ask yourself: how does the answer get out of a function?",
  },
  {
    id: "last",
    name: "LastItem",
    run: () => getLast(["a", "b", "c"]) === "c" && getLast([7]) === 7,
    h1: "Counting in a list starts at 0, not at 1.",
    h2: "A list of 3 items has positions 0, 1 and 2.",
    h3: "Dev move: experiment in the browser console. Type ['a','b','c'][0], then [1], [2], [3]. Which position holds the last item, and what is its relation to .length?",
  },
  {
    id: "average",
    name: "Average",
    run: () =>
      average(2, 4, 6, 8) === 5 && average(10, 0, 0, 0) === 2.5,
    h1: "Division goes before addition (order of operations).",
    h2: "Right now only the last number is divided by 4.",
    h3: "Dev move: type 2 + 4 + 6 + 8 / 4 in the browser console. Not what you expected? Think back to math class: how do you force all additions to happen first?",
  },
  {
    id: "keyword",
    name: "Keyword",
    run: () =>
      checkKeyword("openup") &&
      checkKeyword("OpenUp") &&
      checkKeyword("OPENUP") &&
      !checkKeyword("wrong"),
    h1: "Uppercase and lowercase are different characters.",
    h2: "Make the input lowercase before comparing.",
    h3: "Dev move: google 'javascript compare strings ignore case'. Try your find on the input before the comparison.",
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
      log(`▶ Segment 2/5 unlocked: ${atob("UHJlc2VudA==").toUpperCase()}`);
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
    log("[HINT] Third wave — no more answers. Debug it like a developer:");
    failing.forEach((t) => log(` - ${t.name}: ${t.h3}`));
  }
}

document.getElementById("run").addEventListener("click", runAll);
document.getElementById("hints").addEventListener("click", giveHint);

// initial render
renderTests([]);
runAll();
log("HvA SE // Console Gate initialized.");
log("Team of five: each pick a role and fix your tiny defect in the JS.");
log("When all tests pass, the segment will be hash-verified and revealed.");

// Flavor output
setTimeout(
  () => log("Psst… some text hides in plain sight. Try selecting."),
  800
);
