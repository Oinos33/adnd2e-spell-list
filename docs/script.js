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

// Abbreviations map for stat block + descriptions
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
  "(S M V)": "(s_m_v)",
  "(S M)": "(s_m)",
  "(S V)": "(s_v)",
  "(M V)": "(m_v)",
  "(S)": "(s)",
  "(M)": "(m)",
  "(V)": "(v)",
  "1 segment": "1seg",
  "1 segments": "1seg",
  "1 round": "1rd",
  "1 rounds": "1rd",
  "1 turn": "1t",
  "1 turns": "1t",
  "1 hour": "1hr",
  "1 hours": "1hr"
};

function applyAbbreviations(text) {
  let result = text;
  // Replace full words with abbreviations
  for (const [full, abbr] of Object.entries(abbrevMap)) {
    const regex = new RegExp(full, "gi");
    result = result.replace(regex, abbr);
  }
  // Compact patterns like "10 ft." → "10ft", "5 yds." → "5yds"
  result = result.replace(/(\d+)\s*(ft|yds?|yd\.|yd|miles?|mi\.|mi)/gi, "$1$2");
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

    const lines = spell.description
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== "" && !/^details$/i.test(line))
      .map(line => line.replace(/^details[:\s]*/i, ""));

    let statBlockLines = [];
    let descriptionLines = [];
    let isDescription = false;

    lines.forEach(line => {
      if (!isDescription && (/^level|^class|^school|^range|^dur|^aoe|^ct|^save|^src/i.test(line) || line.includes(":"))) {
        statBlockLines.push(line);
      } else {
        isDescription = true;
        descriptionLines.push(line);
      }
    });

    const formattedStatBlock = statBlockLines
      .map(line => applyAbbreviations(line))
      .join("\n");

    const descriptionText = applyAbbreviations(descriptionLines.join("\n"));

    card.innerHTML = `
      <h2>${applyAbbreviations(spell.name)}</h2>
      <pre>${formattedStatBlock}\n\n${descriptionText}</pre>
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
