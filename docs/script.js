const JSON_FILE = "AD&D2e_Master_Spell_List.json";

let allSpells = [];

// === CENTRALIZED ACRONYMS ===
const acronyms = {
  // Time abbreviations
  "segment": "seg",
  "segments": "seg",
  "round": "rd",
  "rounds": "rd",
  "turn": "t",
  "turns": "t",
  "hour": "hr",
  "hours": "hr",
  // School abbreviations
  "Abjuration": "Abj",
  "Alteration": "Alt",
  "Conjuration/Summoning": "Conj/Sum",
  "Divination": "Div",
  "Enchantment/Charm": "Ench/Charm",
  "Illusion/Phantasm": "Illus/Phant",
  "Invocation/Evocation": "Invoc/Evoc",
  "Necromancy": "Necr",
  "Alchemy": "Alch",
  "Geometry": "Geom",
  "Wild Magic": "Wild_M"
};

// === Utility to replace full terms with acronyms ===
function applyAcronyms(text) {
  if (!text) return "";
  let newText = text;

  // Replace (Reversible) → (Rev)
  newText = newText.replace(/\(Reversible\)/gi, "(Rev)");

  // Replace all school and time terms
  for (const [full, short] of Object.entries(acronyms)) {
    const regex = new RegExp(full, "gi");
    newText = newText.replace(regex, short);
  }

  return newText;
}

// === Load JSON ===
async function loadSpells() {
  try {
    const response = await fetch(JSON_FILE);
    allSpells = await response.json();
    renderSpells(allSpells);
  } catch (e) {
    document.getElementById("spellList").innerHTML =
      `<p style="color:red">Error loading spell list: ${e}</p>`;
  }
}

// === Render Spell Cards ===
function renderSpells(spells) {
  const container = document.getElementById("spellList");
  container.innerHTML = "";

  if (spells.length === 0) {
    container.innerHTML = "<p>No spells match your criteria.</p>";
    return;
  }

  spells.forEach(spell => {
    const card = document.createElement("div");
    card.className = "spell-card";

    const lines = spell.description
  .split("\n")
  .map(line => line.trim())
  .filter(line => line !== "" && !/^details\b/i.test(line)) // removes "Details" or "Details:" lines
  .map(line => line.replace(/^details[:\s]*/i, "")); // removes "Details" at start but keeps the actual value

    let rows = "";
    let titleComponents = "";

    // Extract components from first line (e.g., "(S M V)")
    if (lines.length > 0 && /\(.+\)/.test(lines[0])) {
      const firstLine = lines[0].trim();
      const match = firstLine.match(/\(([^)]+)\)/);
      if (match) titleComponents = ` <span class="components">(${match[1]})</span>`;
      lines.shift(); // Remove first line from details
    }

    for (let i = 0; i < lines.length; i++) {
      let line = applyAcronyms(lines[i].trim()); // Apply acronyms

      // Map labels to short forms
      if (/^Spell Level$/i.test(line)) line = "Level:";
      else if (/^Class$/i.test(line)) line = "Class:";
      else if (/^School$/i.test(line)) line = "School:";
      else if (/^Range$/i.test(line)) line = "Range:";
      else if (/^Duration$/i.test(line)) line = "Dur:";
      else if (/^AOE$/i.test(line)) line = "AOE:";
      else if (/^Casting Time$/i.test(line)) line = "CT:";
      else if (/^Save$/i.test(line)) line = "Save:";
      else if (/^Source$/i.test(line)) line = "Src:";
      else if (/^Requirements$/i.test(line)) { i++; continue; } // Skip redundant Req line

      if (line.endsWith(":") && i + 1 < lines.length) {
        rows += `<div class="row"><strong>${line}</strong><span>${applyAcronyms(lines[i + 1])}</span></div>`;
        i++;
      } else {
        rows += `<div class="row full-line">${line}</div>`;
      }
    }

    card.innerHTML = `
      <h2>${spell.name}${titleComponents}</h2>
      <div class="spell-details">${rows}</div>
    `;
    container.appendChild(card);
  });
}

// === Filter Logic (Class + Level + Search) ===
function filterSpells() {
  const classFilter = document.getElementById("classFilter").value;
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const name = spell.name.toLowerCase();

    if (classFilter !== "all" && !desc.includes(`class\n${classFilter.toLowerCase()}`)) return false;
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) return false;
    if (searchText && !name.includes(searchText)) return false;

    return true;
  });

  renderSpells(filtered);
}

// === Event Listeners ===
document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

// === Initialize ===
loadSpells();
