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
      <pre>${spell.description}</pre>
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

    // Class check
    if (classFilter !== "all" && !desc.includes(`class\n${classFilter.toLowerCase()}`)) {
      return false;
    }

    // Level check (searches for "\nX" after "Spell Level")
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) {
      return false;
    }

    // Search box
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
