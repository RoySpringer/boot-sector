# 🎓 Docentenhandleiding – HvA Boot Run Escape Room

Deze handleiding ondersteunt docenten bij het begeleiden van studenten tijdens de introductieweek escaperoom.

---

## 🔧 Benodigdheden

- 1 goodiebag per klas (kan iets leuks of lekkers bevatten).
- Een **cijferslot met 3 cijfers** (instelbare combinatie, standaard: `438`).
- PC/laptop + beamer/Smartboard **of** studenten laten zelf naar de websites navigeren.
- Internettoegang.
- Optioneel: print de README voor studenten.

---

## Klaar zetten

- Zorg dat je één computer vooraan de klas klaarzet met daarop de code-validator: https://royspringer.github.io/boot-sector/code_validation.
- Zet de goodiebag vooraan op een tafel (naast de computer).

Zodra een groep denkt dat zij alle segmenten gevonden hebben, dan kan de groep naar voren komen om de segmenten in te voeren op de computer. Hieruit komt een code welke ze vervolgens op de goodiebag kunnen testen.
Hebben ze de juiste code. Dan stop het spel.

---

## 🧭 Flow overzicht

Deel de studentuitleg uit en laat ze deze goed lezen. Zodra ze dit hebben gedaan ziet het spel er als volgt uit.

1. **Boot-Sector**

   - URL: https://royspringer.github.io/boot-sector/
   - Studenten voeren terminal-commando’s uit (`scan`, `read boot-sector`, `su`, `write boot-sector`, `set`, `validate`, `boot`).
   - `write boot-sector` vereist sudo. Het wachtwoord zit in de HTML verborden. Het is tekts met dezelfde kleur als de achtergrond. Wordt zichtbaar door te inspecteren of een `CTRL+A`
   - Doel: ontdekken dat de corrupte bytes ASCII vormen → **Segment 1/5: ENGINEER**.

2. **Console Gate (CodePen)**

   - URL: https://codepen.io/Mo4H/pen/OPyaJMN
   - Studenten fixen 5 bugs in JS functies (decoder, normalizer, checksum, regex, nth).
   - Studenten kunnen drie hints in de app activeren elke hint geeft een beetje meer info.
   - Wanneer alle tests slagen + hash check, verschijnt → **Segment 2/5: PRESENT**.

3. **Crypto Lock**

   - URL: https://royspringer.github.io/boot-sector/p3_crypto_lock/
   - Studenten doorlopen grid puzzels in 2 lagen.
   - _Valstrik_: inspector laat het segment `CRYPTO` zien en een Rick Roll link → fout. Dan hebben ze de opdracht niet gespeeld. De link moet namelijk verwijzen naar de Branch Adventure.
   - Correct oplossen onthult → **Segment 3/5: FUTURE**.
   - Op de pagina Cryto Lock zit ook het vijfde segment in een comment onderaan de html pagina met de beschrijving de stad waarin je nu bent → **Segment 5/5: AMSTERDAM**

4. **Branch Adventure (GitLab repo)**

   - URL: https://gitlab.com/r.springer.tijdelijk/branch-explorer
   - Studenten zoeken in **Branches, Tags, Commits en File history** via de GitLab web-UI. Ze zoeken naar verschillende LETTERS.
   - Studenten krijgen een volgorde in de README van de branch-explorer. Dit is tevens ook de hint waar ze moeten wezen op de branch.
   - Laat studenten de history van de `main` en de commit messages goed lezen. termen van de hint worden in de commit message iets anders genoemd.
   - Volgorde van de letters leidt tot → **Segment 4/5: ORIGIN**.

5. **Code Validation**
   - URL: https://royspringer.github.io/boot-sector/code_validation/
   - Studenten vullen de 5 segmenten in LET OP: ALL CAPS:
     1. ENGINEER
     2. PRESENT
     3. FUTURE
     4. ORIGIN
     5. AMSTERDAM
   - Bij correct invullen verschijnt een **3-cijferige code**.
   - Bij incorrect invullen verschijnt er ook een code maar is onjuist. Laat de studenten het gewoon proberen in te vullen voor extra spanning.
   - Deze code opent het slot → goodiebag unlocked.
   - Welke groepje het eerste de goodiebag unlocked krijg de inhoud.

---

## 🔑 Antwoorden

- Boot-Sector → **ENGINEER**
- Console Gate → **PRESENT**
- Crypto Lock → **FUTURE**
- Branch Adventure → **ORIGIN**
- Verborgen in code (of verspreid hint) → **AMSTERDAM**

**Slotcode (standaard):** `438`

---

## 🚨 Hulp bieden

### Boot-Sector

- _studente: Hoe moet ik beginnen?_ Type gewoon iets in de console. Dan krijg je een error met dat ze de `help`-command moeten gebruiken. Laat ze all die command goed bekijken en laat ze gewoon van alles proberen uit te voeren. De meeste command geven namelijk hints als iets niet werkt wat je dan wel zou moeten doen.
- Hint 1: _Studenten komen niet verder bij Boot-Sector:_ wijs op `su`. Wachtwoord is verstopt in de html. Maar met dezelfde kleur als de achtergrond.
- Hint 2: Wachtwoord vinden. Laat ze de `self-destruct`-command eens uitvoeren. Of inspecteren of CTRL+A. Met al deze opties wordt het wachtwoord zichtbaar.
- Hint 3: _student: Hoe moet ik de boot-sector repairen?_ `repair hint`-command geeft een duidelijke uitleg. De ? moeten een 1 of 0 worden in een reeks van 8-bits bijvoorbeeld 010001?1 (Dit is dus een E of een G). Ze kunnen dit testen op een binary converter website en elke reeks de mogelijke letters opschrijven. En daarna met de letters puzzelen. Het woord wat ze zoeken heeft te maken met hun toekomstige opleidings titel: "ENGINEER" (Software Engineer)

### Console Gate

- Zorg dat ze alleen in de JS panel van CodePen werken. Ze kunnen altijd refreshen of opnieuw de link openen als ze opnieuw willen beginnen.
- _Console Gate bugs te lastig:_
  - De code heeft ingebouwt 3 hints laat ze eerst deze hints volgen. Komen ze er dan nog niet uit?
  - hint dat `decodeShift` -1 er staat nu `text.charCodeAt(i) + 1` moet `text.charCodeAt(i) - 1` worden.
  - `normalize` → `trim().toLowerCase()`. Achter `text` zetten oftewl `text.trim().toLowerCase()`
  - `checksum` - Hij telt het laatste nummer nooit op vanwege de `i < list.length - 1` - `-1` weg halen.
  - `regex` - laat ze ook eens googlen naar `js regex isValid email` stackoverflow heeft de oplossing.
  - `pickEveryNth` - `let index = 0` moet `let index = n - 1` worden.

### Crypto Lock

- Hierin zit een misleiding. Als je namelijk inspecteerd is de succes `<div>` als gevult met data en dus een verkeerd SEGMENT(CRYPTO). Studenten moeten de echt het spel oplossen zodat de link naar de Vault en het SEGMENT worden onthult.
- Laat ze de browser console openen. Hierin kunnen ze hints vragen met console commands. `help()` - Let op het moeten `()` bij natuurlijk. Dit geeft ze een help menu waarin ze per layer hints kunnen vragen - `hint(1)`, `hint(2)` en `hint(3)`.
  - Hint 1: **Find each number in the sequence by clicking on the grid** - Bij het klikken op het juiste vakje zien de studenten een progressbar omhoog gaan. Dit zijn de juiste nummers. Laat ze alleen de juiste nummers highlighten. Vervolgens zien ze verschillende items 'C3, A1, B2' op het grid. Deze moeten in sequence - dus gesoorteerd van laag naar hoog 'A1, B2, C3...H8' dit moeten ze invoeren.
  - Hint 2: **Transform coordinates: A+2,C-1,G-5,B+3,E+3,F-2,H,D-3** - Ze moeten de transformatie toepassen op de sequence. Dus
    - (A+2) A1 + 2 = A3
    - (B+3) B2 + 3 = B5
    - (C-1) C3 - 1 = C2
    - (D-3) D4 - 3 = D1
    - (E+3) E5 + 3 = E8
    - (F-2) F6 - 2 = F4
    - (G-5) G7 - 5 = G2
    - ( H ) H8 + 0 = H8
      Dit zijn de coordinaten die ze in layer 2 moeten aanklikken.

### Branch Adventure

- _Branch Adventure verwarrend:_ verwijs naar GitLab UI opties: Branches, Tags, Commits, File History.
- Zorg dat ze goed naar de volgorde kijken van de letters. Gebruik hiervoor de README van de main branch

### Code Validation

- Laat studenten Code validation doen op 1 centraal punt. Zodra ze met 5 segmenten naar je toekomen kan je ze laten invoeren. Vervolgens mag dat groepje als eerste de goodiebag proberen te openen.

---

## 📌 Tips voor begeleiding

- **Gebruik Pen en Papier** - Laat studenten pen en papier bij de hand houden. Maak puzzelen makkelijker.
- **Schrijf URLs op** - Laat studenten elke link naar volgende onderdeel goed opschrijven. Het zou kunnen dat ze opnieuw een puzzel moeten onderzoeken.
- **Groepjes van 5p** - Deel de klas op in groepjes van 5. Laat rollen rouleren.
- **Help waar nodig** - Geef pas hints als ze echt vastlopen. Help studenten waar nodig op weg. Zeker bij de programmeer oefeningen in de Console Gate en de Git Branch Adventure.
- **Code gevonden is gewonnen** - Zorg voor een duidelijke eind-moment: de code invoeren bij het slot aan de goodiebag.

Succes met begeleiden — en veel plezier! 🎉
