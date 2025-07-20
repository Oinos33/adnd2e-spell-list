// Load your master JSON file (must be in the same /docs folder or accessible URL)
const JSON_FILE = "AD&D2e_Master_Spell_List.json";

let allSpells = [];

// Acronym mappings for stat blocks (only these are transformed)
const acronyms = {
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
  "Wild Magic": "Wild_M",
  "Reversible": "Rev",
  "1 segment": "1seg",
  "1 round": "1rd",
  "1 turn": "1t",
  "1 hour": "1hr",
  "1 turn/level": "1t/level",
  "1 round/level": "1rd/level",
  "1 hour/level": "1hr/level"
};

function applyAcronyms(text) {
  let updated = text;
  for (const [key, value] of Object.entries(acronyms)) {
    const regex = new RegExp(key, "gi");
    updated = updated.replace(regex, value);
  }
  return updated;
}

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

    // Clean description lines
    const lines = spell.description
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "" && !/^details$/i.test(line)); // remove "Details"

    let rows = "";
    lines.forEach(line => {
      const parts = line.split(/:(.+)/); // try to split at first colon
      if (parts.length > 1) {
        const label = parts[0].trim();
        const value = applyAcronyms(parts[1].trim());
        rows += `<div><strong>${label}:</strong> ${value}</div>`;
      } else {
        rows += `<div>${applyAcronyms(line)}</div>`;
      }
    });

    card.innerHTML = `
      <h2>${spell.name}</h2>
      ${rows}
    `;
    container.appendChild(card);
  });
}

function filterSpells() {
  const classFilter = document.getElementById("classFilter").value.toLowerCase();
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const name = spell.name.toLowerCase();
    const desc = spell.description.toLowerCase();

    if (classFilter !== "all" && !desc.includes(`class\n${classFilter}`)) return false;
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) return false;
    if (searchText && !name.includes(searchText)) return false;

    return true;
  });

  renderSpells(filtered);
}

// Attach listeners
document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

// Initialize
loadSpells();
