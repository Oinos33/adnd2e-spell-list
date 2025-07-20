const JSON_FILE = "AD&D2e_Master_Spell_List.json";

let allSpells = [];

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

// Abbreviations map for stat block
const abbrevMap = {
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
  "(Reversible)": "(Rev)",
  "1 segment": "1 seg",
  "1 round": "1 rd",
  "1 turn": "1 t",
  "1 hour": "1 hr"
};

function applyAbbreviations(text) {
  let result = text;
  for (const [full, abbr] of Object.entries(abbrevMap)) {
    const regex = new RegExp(full, "gi");
    result = result.replace(regex, abbr);
  }
  return result;
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

    // Clean lines: remove empty + strip "Details"
    const lines = spell.description
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "" && !/^details$/i.test(line))
      .map(line => line.replace(/^details[:\s]*/i, ""));

    // First line after title is already in description — stat block extraction
    let statBlock = [];
    let descriptionStart = false;
    let descriptionLines = [];

    lines.forEach(line => {
      if (
        /^range|dur|aoe|ct|save|level|class|school|src|req/i.test(line) ||
        /^(wizard|priest|special)/i.test(line)
      ) {
        statBlock.push(line);
      } else {
        descriptionStart = true;
      }
      if (descriptionStart) descriptionLines.push(line);
    });

    // Build formatted stat block
    const formattedBlock = statBlock
      .map(line => {
        if (line.includes(":")) return applyAbbreviations(line);
        return line; // For lines already "key: value"
      })
      .join("\n");

    const descriptionText = applyAbbreviations(descriptionLines.join("\n"));

    card.innerHTML = `
      <h2>${applyAbbreviations(spell.name)}</h2>
      <pre>${formattedBlock}\n\n${descriptionText}</pre>
    `;
    container.appendChild(card);
  });
}

function filterSpells() {
  const classFilter = document.getElementById("classFilter").value;
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const name = spell.name.toLowerCase();

    if (classFilter !== "all" && !desc.includes(`class\n${classFilter.toLowerCase()}`)) {
      return false;
    }
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) {
      return false;
    }
    if (searchText && !name.includes(searchText)) {
      return false;
    }
    return true;
  });

  renderSpells(filtered);
}

document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

loadSpells();
