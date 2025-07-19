// Load your master JSON file (must be in the same /docs folder or accessible URL)
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

function formatDescription(text) {
  // Map full tags to short labels
  const tagMap = {
    "Spell Level": "Level",
    "Class": "Class",
    "School": "School",
    "Range": "Range",
    "Duration": "Dur",
    "AOE": "AOE",
    "Casting Time": "CT",
    "Save": "Save",
    "Requirements": "Req",
    "Source": "Src",
    "Details": "Details"
  };

  // Replace tags with <strong>Label</strong>
  let formatted = text;
  for (const [full, short] of Object.entries(tagMap)) {
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    formatted = formatted.replace(regex, `<strong>${short}:</strong>`);
  }

  return formatted;
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
    card.innerHTML = `
      <h2>${spell.name}</h2>
      <pre>${formatDescription(spell.description)}</pre>
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

// Attach listeners
document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

// Initialize
loadSpells();
