#!/usr/bin/env bash
set -e

git init -b main

# ---------------------------------------------------------------
# COLD CASE #042: DE VERDWENEN DEVELOPER
#
# Doel: achternaam ontvoerder = KRANENBURG (9 letters, moeilijk te raden)
# Segment voor boot-run = ORIGIN (via p4_forensisch_lab)
#
# main = ALLEEN README (1 commit)
#
# Docent-spiekbriefje — ketting (fragment 1/9 … 9/9):
#   1. K   serverruimte
#   2. R   tag bewijszak-07
#   3. A   dossierkast (file history)
#   4. N   bureau (base64 Tg==)
#   5. E   koude-zaken
#   6. N   MR teruggave-badge
#   7. B   tag bewijszak-12
#   8. U   forensisch-lab
#   9. G   forensisch-lab
#   → p4_forensisch_lab: KRANENBURG → ORIGIN
#
# Rode haring: P op magazijn (ZAAK #037, naam POLSTRA)
# ---------------------------------------------------------------

make_orphan_tag() {
  local tag_name="$1"
  local dir_name="$2"
  local file_name="$3"
  local file_body="$4"
  local commit_msg="$5"
  local tag_msg="$6"
  local tmp_branch="tmp-${tag_name//\//-}"

  git switch -qc "$tmp_branch" main
  mkdir -p "$dir_name"
  printf '%s\n' "$file_body" > "$dir_name/$file_name"
  git add "$dir_name/$file_name"
  git commit -qm "$commit_msg"
  git tag -a "$tag_name" -m "$tag_msg" HEAD
  git switch -q main
  git branch -qD "$tmp_branch"
}

# -----------------------------
# main: alleen briefing
# -----------------------------
cat > README.md <<'MD'
# HvA Cold Case #042 — De Verdwenen Developer

🕵️ **STATUS: ONOPGELOST**

Om **03:12** vannacht verdween developer **R. de Vries** uit het HvA-gebouw.
Zijn badge lag op zijn bureau. Zijn koffie was nog warm.
Het enige dat hij achterliet: **deze repository**.

Jullie zijn het rechercheteam. Ergens liggen **negen fragmenten** van een
**achternaam** — die van wie De Vries heeft meegenomen. Niet elke letter
die je vindt hoort bij zaak #042.

Als jullie de volledige achternaam hebben, kan het **forensisch lab**
daar het boot-run **segment** van maken. Dat segment is pas de volgende
stap in jullie escape room.

Deze hoofdmap is slechts de ontvangstbalie.
**Het bewijs ligt hier niet.**

**Alles is te vinden in de GitLab web interface (geen terminal nodig).**

### Navigatie voor rechercheurs
- Andere afdelingen: *Code → Branches*
- Verzegelde zaken: *Code → Tags*
- Wat er is gebeurd: *Code → Commits*
- Eerdere versies van een bestand: open bestand → *History*
- Terug in de tijd: open een oude commit → *Browse files*
- Vergelijken & samenvoegen: *Merge requests*

> 📘 Tip: hoe bekijk je eerdere versies van één bestand?  
> Zie: https://docs.gitlab.com/user/project/repository/commits/
> Zie: https://docs.gitlab.com/user/project/repository/files/git_history/

---

> 🔎 Tip: De Vries schreef soms in code: https://www.base64decode.org/

> ⚠️ Forensisch bericht: er is aanwijzing dat iemand **vals bewijs**
> heeft geplant. Controleer zaaknummers en datums voordat je fragmenten
> gebruikt.

---

Het onderzoek begint bij de **receptie**.
MD
git add README.md
git commit -qm "dossier #042 geopend"

# -----------------------------
# 1) BRANCH-DOOLHOF → K op 'serverruimte' (fragment 1/9)
# -----------------------------
git switch -qc receptie main
cat > badgelog.txt <<'TXT'
[BADGELOG — NACHT VAN DE VERDWIJNING]

02:31  DE VRIES, R.   →  kantine
02:58  DE VRIES, R.   →  magazijn
03:09  DE VRIES, R.   →  ███████████
03:12  [SIGNAALVERLIES]

De laatste regel is beschadigd. Volg zijn route.
TXT
cat > ontvangst.txt <<'TXT'
[ONTVANGST — NACHTPORTIER]

"Ik hoorde hem om 02:45 mompelen in zijn telefoon:
 'ze mogen het register niet zien.' Geen idee welk register."
TXT
git add badgelog.txt ontvangst.txt && git commit -qm "receptie: badgelog en ontvangstnotitie veiliggesteld"

git switch -qc kantine main
cat > kassabon.txt <<'TXT'
[KASSABON — KOFFIEAUTOMAAT 2]

03:05   1x koffie, zwart      € 0,80
        (beker meegenomen)

De automaat staat naast het raam. Vanaf hier kijk je recht de
gang in. Waar brengt een developer om 03:05 's nachts een
koffie naartoe?
TXT
cat > schoonmaker.txt <<'TXT'
[NOTITIE — SCHOONMAKER, OCHTENDDIENST]

"Op de tafel in de kantine lag niets vreemds. Wel vond ik
 later in de serverruimte een lege beker — nog nat aan de rand."
TXT
git add kassabon.txt schoonmaker.txt && git commit -qm "kantine: kassabon en getuigenis schoonmaker"

git switch -qc magazijn main
mkdir -p gevonden
cat > gevonden/voorwerp.txt <<'TXT'
┌─────────────────────────────────────┐
│  FRAGMENT ?/9            ZAAK #037  │
│  gedateerd: 14 maart, vorig jaar    │
│  betrokkene: POLSTRA, J.            │
└─────────────────────────────────────┘

P

Aangetroffen op een lege plank, opvallend netjes in het
zicht gelegd. Geen stof eromheen.
TXT
git add gevonden/voorwerp.txt && git commit -qm "magazijn: voorwerp aangetroffen op lege plank"

git switch -qc parkeergarage main
cat > inspectie.txt <<'TXT'
[PARKEERGARAGE — INSPECTIE 06:00]

Geen sporen van De Vries. Zijn auto staat er nog.
Op het dashboard: parkeerkaartje van gisteren, geen nieuwe vingerafdrukken.
Dood spoor voor deze zaak.
TXT
git add inspectie.txt && git commit -qm "parkeergarage: geen bruikbare sporen"

git switch -qc serverruimte main
mkdir -p gevonden forensisch
cat > gevonden/voorwerp.txt <<'TXT'
┌─────────────────────────────────────┐
│  FRAGMENT 1/9            ZAAK #042  │
│  gedateerd: vannacht, 03:12         │
└─────────────────────────────────────┘

K

Aangetroffen op de vloer, naast een omgevallen beker koffie.
De koffie was nog warm.

--------------------------------------------------------------
VERVOLGONDERZOEK
Tijdens de insluiting zijn twaalf bewijszakken verzegeld.
Het verzegelingsregister staat op branch **verzegeling**.
Niet elke zak hoort bij zaak #042.
--------------------------------------------------------------
TXT
cat > forensisch/rapport.txt <<'TXT'
[FORENSISCH KORT RAPPORT — SERVERRUIMTE]

Vingerafdrukken op toetsenbord: De Vries (links), onbekend (rechts).
Geen tekenen van geweld. Badge-lezer: laatste succesvolle scan 03:09.
Scherm: nog actief, sessie verlopen om 03:14.

Onbekende vingerafdruk rechts: doorgestuurd naar **forensisch-lab**
(nog geen match in het systeem).
TXT
git add gevonden/voorwerp.txt forensisch/rapport.txt
git commit -qm "serverruimte: fragment veiliggesteld — forensisch rapport toegevoegd"

# -----------------------------
# Verzegelingsregister
# -----------------------------
git switch -qc verzegeling main
cat > register-zegels.txt <<'TXT'
[VERZEGELINGSREGISTER — NACHT 03:40–04:10]

Nr    Zegelstatus    Zaak        Betrokkene              Inhoud (kort)
----  -------------  ----------  ----------------------  -------------------------
01    gebroken       #018        onbekend                leeg (vernietigd)
02    intact         #018        Jansen, P.              USB-stick
03    intact         #024        externe partij          contractmap
04    intact         #031        Facilitair              stofmonsters
05    intact         #037        POLSTRA, J.             foto's (verouderd)
06    intact         #038        ICT                     kapotte badgelezer
07    intact         #042        De Vries, R.            persoonlijke sleutel
08    gebroken       #042        onbekend                lege envelop
09    intact         #042        De Vries, R.            laptopkabel (reserve)
10    intact         #044        HR                      ongetekend formulier
11    intact         #051        Beveiliging             camerabeelden (export)
12    intact         #042        De Vries, R.            sticky notes (nacht)

Let op: alleen zegels met status **intact** zijn bruikbaar.
Meerdere zakken kunnen dezelfde zaak dragen — lees de kolommen.

--------------------------------------------------------------
VERVOLGONDERZOEK
De fysieke zakken zijn zoek. Alleen de **zegels** staan nog
geregistreerd onder *Code → Tags*. Begin met nr. 07.
--------------------------------------------------------------
TXT
git add register-zegels.txt && git commit -qm "verzegeling: nachtregister twaalf zegels bijgewerkt"

# -----------------------------
# 2) TAG-LABYRINT → R via bewijszak-07 (fragment 2/9)
# -----------------------------
make_orphan_tag "bewijszak-01" "bewijszak-01" "inhoud.txt" \
"ZAAK #018 — bewijszak geleegd na vernietigingsbevel.
Geen bruikbare inhoud meer." \
"verzegeling: zak 01 geregistreerd (leeg)" \
"Zegel #01 — gebroken. Zaak #018. Inhoud vernietigd."

make_orphan_tag "bewijszak-02" "bewijszak-02" "inhoud.txt" \
"ZAAK #018 — USB-stick Jansen, P.
Geen relatie met De Vries." \
"verzegeling: zak 02 geregistreerd" \
"Zegel #02 — intact. Zaak #018. USB-stick."

make_orphan_tag "bewijszak-03" "bewijszak-03" "inhoud.txt" \
"ZAAK #024 — contractmap externe partij.
Vertrouwelijk — andere zaak." \
"verzegeling: zak 03 geregistreerd" \
"Zegel #03 — intact. Zaak #024. Contractmap."

make_orphan_tag "bewijszak-04" "bewijszak-04" "inhoud.txt" \
"ZAAK #031 — stofmonsters facilitair.
Geen forensisch belang voor #042." \
"verzegeling: zak 04 geregistreerd" \
"Zegel #04 — intact. Zaak #031. Stofmonsters."

make_orphan_tag "bewijszak-05" "bewijszak-05" "inhoud.txt" \
"ZAAK #037 — foto's POLSTRA, J. (archief, maart vorig jaar).
Oud dossier — niet mengen met #042." \
"verzegeling: zak 05 geregistreerd" \
"Zegel #05 — intact. Zaak #037. Fotoarchief."

make_orphan_tag "bewijszak-06" "bewijszak-06" "inhoud.txt" \
"ZAAK #038 — kapotte badgelezer ICT.
Materiaalstoring, geen bewijsstuk." \
"verzegeling: zak 06 geregistreerd" \
"Zegel #06 — intact. Zaak #038. Badgelezer."

make_orphan_tag "bewijszak-07" "bewijszak-07" "inhoud.txt" \
"┌─────────────────────────────────────┐
│  FRAGMENT 2/9            ZAAK #042  │
└─────────────────────────────────────┘

R

Persoonlijke sleutel van R. de Vries.
In beslag genomen om 03:40, verzegeld om 03:41.

--------------------------------------------------------------
VERVOLGONDERZOEK
Bij de sleutel zat een uitgeprinte getuigenis. Die is
opgeborgen in de **dossierkast**. Volgens de administratie
is dat dossier daarna nog aangepast.
--------------------------------------------------------------" \
"verzegeling: zak 07 — sleutel De Vries verzegeld" \
"Zegel #07 — intact. Zaak #042. Persoonlijke sleutel R. de Vries."

make_orphan_tag "bewijszak-08" "bewijszak-08" "inhoud.txt" \
"ZAAK #042 — lege envelop.
Zegel was gebroken vóór aankomst forensisch team.
Geen betrouwbare inhoud." \
"verzegeling: zak 08 — gebroken zegel" \
"Zegel #08 — GEBROKEN. Zaak #042. Lege envelop (onbruikbaar)."

make_orphan_tag "bewijszak-09" "bewijszak-09" "inhoud.txt" \
"ZAAK #042 — laptopkabel (reserve).
Technisch hulpmiddel, geen naamfragment." \
"verzegeling: zak 09 geregistreerd" \
"Zegel #09 — intact. Zaak #042. Laptopkabel."

make_orphan_tag "bewijszak-10" "bewijszak-10" "inhoud.txt" \
"ZAAK #044 — HR-formulier (ongetekend).
Administratieve rommel, andere afdeling." \
"verzegeling: zak 10 geregistreerd" \
"Zegel #10 — intact. Zaak #044. HR-formulier."

make_orphan_tag "bewijszak-11" "bewijszak-11" "inhoud.txt" \
"ZAAK #051 — camerabeelden export.
Beelden tonen alleen lege gang om 03:12." \
"verzegeling: zak 11 geregistreerd" \
"Zegel #11 — intact. Zaak #051. Camerabeelden."

make_orphan_tag "bewijszak-12" "bewijszak-12" "inhoud.txt" \
"ZAAK #042 — sticky notes uit serverruimte.

┌─────────────────────────────────────┐
│  FRAGMENT 7/9            ZAAK #042  │
└─────────────────────────────────────┘

B

[Kladjes — relevant fragment]
- backup checken
- **B**el beveiliging na shift
- koffie halen

Overige notities: TODO-lijstjes zonder waarde voor #042.

--------------------------------------------------------------
VERVOLGONDERZOEK
Onbekende vingerafdruk uit serverruimte wacht in **forensisch-lab**
op analyse. Daar staat ook het segment-register.
--------------------------------------------------------------" \
"verzegeling: zak 12 — sticky notes verzegeld" \
"Zegel #12 — intact. Zaak #042. Sticky notes serverruimte."

# -----------------------------
# 3) FILE HISTORY → A (fragment 3/9)
# -----------------------------
git switch -qc dossierkast main
mkdir -p dossier
cat > dossier/getuigenis.txt <<'TXT'
[GETUIGENIS — beveiliger, avonddienst]

"Om 03:11 was alles rustig. Om 03:12 hoorde ik glas breken.
 Toen ik aankwam was De Vries weg. Op zijn scherm stond nog
 precies één teken:"

┌─────────────────────────────────────┐
│  FRAGMENT 3/9            ZAAK #042  │
└─────────────────────────────────────┘

A

--------------------------------------------------------------
VERVOLGONDERZOEK
Het bureau van De Vries is nog niet leeggeruimd.
Kijk daar voordat de opruimploeg langskomt.
--------------------------------------------------------------
TXT
cat > dossier/index.txt <<'TXT'
[DOSSIERKAST — INHOUDSOPGAVE #042]

Lade 1: getuigenis beveiliger (aangepast)
Lade 2: leeg
Lade 3: reservering voor forensisch
TXT
git add dossier/getuigenis.txt dossier/index.txt
git commit -qm "dossierkast: getuigenis beveiliger opgeborgen"
cat > dossier/getuigenis.txt <<'TXT'
[GETUIGENIS — beveiliger, avonddienst]

"Om 03:11 was alles rustig. Om 03:12 ████████████████████.
 ████████████████ De Vries ███. Op zijn scherm stond ███
 ██████████████:"

┌─────────────────────────────────────┐
│  FRAGMENT 3/9            ZAAK #042  │
└─────────────────────────────────────┘

█

--------------------------------------------------------------
VERVOLGONDERZOEK
Het bureau van De Vries is nog niet leeggeruimd.
Kijk daar voordat de opruimploeg langskomt.
--------------------------------------------------------------
TXT
git add dossier/getuigenis.txt && git commit -qm "dossierkast: getuigenis aangepast in opdracht van hogerhand"

# -----------------------------
# 4) BASE64 → N (fragment 4/9)
# -----------------------------
git switch -qc bureau main
mkdir -p lade
cat > lade/briefje.md <<'MD'
Een haastig gekrabbeld briefje, gevonden onder het toetsenbord
van De Vries. Hij schreef in code:

┌─────────────────────────────────────┐
│  FRAGMENT 4/9            ZAAK #042  │
└─────────────────────────────────────┘

**Tg==**

---

VERVOLGONDERZOEK
Op de achterkant, in ander handschrift:
"alles van vóór 2000 staat in de kelder — **koude zaken**."
MD
cat > lade/postits.txt <<'TXT'
[POST-ITS OP MONITOR]

- backup checken
- achternaam??? (weggekrast)
- HR bellen morgen
TXT
git add lade/briefje.md lade/postits.txt && git commit -qm "bureau: briefje en post-its veiliggesteld"

# -----------------------------
# 5) ARCHIEF → E (fragment 5/9)
# -----------------------------
git switch -qc koude-zaken main
mkdir -p kelder
cat > kelder/doos-1998.md <<'MD'
[KELDER — RIJ 12, DOOS "1998"]

Een stoffige doos. Maar de vingerafdrukken in het stof zijn
vers. Iemand is hier onlangs geweest. Bovenop ligt een kaartje:

┌─────────────────────────────────────┐
│  FRAGMENT 5/9            ZAAK #042  │
└─────────────────────────────────────┘

E

---

VERVOLGONDERZOEK
In de doos: memo administratie —
"Verklaring #113 is ingediend via de **HR-portal** (merge-aanvraag)
 en kort daarna ingetrokken. Zie *Merge requests*."
MD
cat > kelder/inventaris-1998.txt <<'TXT'
[INVENTARIS DOOS 1998]

- oude floppy (leeg)
- sleutelbos zonder label
- map "personeelszaken" (doorgestreept)
TXT
git add kelder/doos-1998.md kelder/inventaris-1998.txt
git commit -qm "koude-zaken: doos uit 1998 opnieuw bekeken"

# -----------------------------
# 6) MERGE REQUEST → N (fragment 6/9)
# -----------------------------
git switch -qc teruggave-badge main
mkdir -p hr/aanvragen
cat > hr/aanvragen/teruggave-badge-de-vries.md <<'MD'
# Aanvraag: teruggave personeelsbadge

**Medewerker:** R. de Vries  
**Zaak:** #042 (intern)  
**Status:** wacht op goedkeuring recherche

## Toelichting
Badge na vermissing tijdelijk geblokkeerd. HR wacht op teken
van het rechercheteam dat zaak #042 voldoende is afgehandeld
voordat retour kan worden verwerkt.

## Fragment uit ingetrokken verklaring #113
De anonieme bron liet dit ene teken achter vóór intrekking:

┌─────────────────────────────────────┐
│  FRAGMENT 6/9            ZAAK #042  │
└─────────────────────────────────────┘

**N**

## Vervolg
De rest van de verklaring verwees naar bewijszak **12** in het
verzegelingsregister en daarna naar **forensisch-lab**.
MD
git add hr/aanvragen/teruggave-badge-de-vries.md
git commit -qm "HR: conceptaanvraag teruggave badge De Vries (zaak #042)"

git switch -qc verklaringen main
mkdir -p register
cat > register/REGISTER.txt <<'TXT'
[REGISTER VAN VERKLARINGEN — ZAAK #042]

#113   ingediend 04:15 via HR-portal (merge-aanvraag teruggave-badge)
       ingetrokken 04:32 op verzoek getuige
       tekst niet meer in register — alleen in openstaande aanvraag

Teruggenomen verklaringen worden vernietigd.
Althans, dat denkt de getuige.
TXT
git add register/REGISTER.txt && git commit -qm "verklaringen: status verklaring #113 bijgewerkt"

# -----------------------------
# 7–9) FORENSISCH LAB → U, G + p4_forensisch_lab
# -----------------------------
git switch -qc forensisch-lab main
mkdir -p analyse tools
cat > analyse/sporen.txt <<'TXT'
[FORENSISCH LAB — SPOORANALYSE #042]

Onbekende vingerafdruk (serverruimte, rechts):
- geen match in standaard personeelsregister
- partial lift bruikbaar voor fragmentvergelijking

┌─────────────────────────────────────┐
│  FRAGMENT 8/9            ZAAK #042  │
└─────────────────────────────────────┘

U

Vergelijk met fragment 9/9 in dna-rapport.txt
TXT
cat > analyse/dna-rapport.txt <<'TXT'
[FORENSISCH LAB — DNA-RAPPORT #042]

Monster: vezel op badge-clip De Vries (niet van slachtoffer).
Profiel: onbekend mannelijk, geen DB-hit.

┌─────────────────────────────────────┐
│  FRAGMENT 9/9            ZAAK #042  │
└─────────────────────────────────────┘

G

cat > analyse/README.md <<'MD'
# Forensisch lab — zaak #042

1. Lees `sporen.txt` en `dna-rapport.txt` voor fragment 8/9 en 9/9.
2. Open de externe revealer `p4_forensisch_lab` in je browser:
   https://boot-sector.jump-start.dev/p4_forensisch_lab
3. Voer de volledige achternaam van de hoofdverdachte in.
MD
git add analyse/sporen.txt analyse/dna-rapport.txt analyse/README.md
git commit -qm "forensisch-lab: sporenanalyse afgerond — segment-register online"

git switch -q main

# Docent-materiaal (lokaal, niet gecommit)
mkdir -p docent
cat > docent/MR-beschrijving-042.txt <<'EOF'
## Zaak #042 — teruggave badge R. de Vries

HR heeft een aanvraag klaargezet op branch `teruggave-badge`.

### Context
Badge tijdelijk geblokkeerd na vermissing. Recherche moet bevestigen
dat zaak #042 voldoende is afgehandeld voordat retour kan.

### Fragment uit ingetrokken verklaring #113
De getuige trok de verklaring in. Eén teken overleefde de intrekking:

**N** (fragment 6/9)

### Vervolg
De rest van de verklaring verwees naar bewijszak **12** in het
verzegelingsregister en daarna naar **forensisch-lab**.

---
*Niet mergen — escape-room prop.*
EOF

cat > docent/PUSH-EN-MR.md <<'EOF'
# Docent: publiceren op GitLab

## 1. Push repository
```bash
git remote add origin <JOUW_GITLAB_REPO_URL>
git push -u origin --all
git push origin --tags
```

## 2. Merge request aanmaken
Maak MR van `teruggave-badge` → `main`.
Titel: `Zaak #042 — teruggave badge R. de Vries`
Beschrijving: kopieer `docent/MR-beschrijving-042.txt`

## Oplossing
| # | Letter | Waar | Vaardigheid |
|---|--------|------|-------------|
| 1 | K | `serverruimte` | Branches |
| 2 | R | tag `bewijszak-07` | Tags + `verzegeling` |
| 3 | A | `dossierkast` (history) | File history |
| 4 | N | `bureau` (Tg==) | Base64 |
| 5 | E | `koude-zaken` | Branches |
| 6 | N | MR `teruggave-badge` | Merge requests |
| 7 | B | tag `bewijszak-12` | Tags |
| 8 | U | `forensisch-lab` | Branches |
| 9 | G | `forensisch-lab` | Branches |
| → | **KRANENBURG** | alle fragmenten | — |
| → | **ORIGIN** | `p4_forensisch_lab` | Tool / browser |

Rode haring: `magazijn` (P, POLSTRA, zaak #037)
EOF

echo
echo "✅ Local repo ready."
echo "   Achternaam ontvoerder: KRANENBURG (9 fragmenten)"
echo "   Boot-run segment:      ORIGIN (via p4_forensisch_lab)"
echo
echo "Volgende stappen:"
echo "  1. git remote add origin <YOUR_GITLAB_REPO_URL>"
echo "  2. git push -u origin --all && git push origin --tags"
echo "  3. Maak MR aan: teruggave-badge → main (zie docent/PUSH-EN-MR.md)"
echo
echo "Docent-materiaal staat in ./docent/ (niet gecommit)."
