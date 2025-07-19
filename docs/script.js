// Load your master JSON file (must be in the same /docs folder or accessible URL)
const JSON_FILE = "AD&D2e_Master_Spell_List.json";

let allSpells = [];

// Load the spell data
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

// Render the spell cards
function renderSpells(spells) {
  const container = document.getElementById("spellList");
  container.innerHTML = "";

  if (spells.length === 0) {
    container.innerHTML = "<p>No spells match your criteria.</p>";
    return;
  }

  const boldLabels = [
    "Spell Level",
    "Class",
    "School",
    "Range",
    "Duration",
    "AOE",
    "Casting Time",
    "Save",
    "Components",
    "Source",
    "Details",
    "Requirements",
    "Notes"
  ];

  spells.forEach(spell => {
    let desc = spell.description;

    // Bold important labels
    boldLabels.forEach(label => {
      const regex = new RegExp(`(^|\\n)(${label})(\\n)`, "gi");
      desc = desc.replace(regex, `$1<strong>$2</strong>$3`);
    });

    const card = document.createElement("div");
    card.className = "spell-card";
    card.innerHTML = `
      <h2>${spell.name}</h2>
      <pre>${desc}</pre>
    `;
    container.appendChild(card);
  });
}

// Filtering logic
function filterSpells() {
  const classFilter = document.getElementById("classFilter").value;
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const name = spell.name.toLowerCase();

    // Class filter
    if (classFilter !== "all" && !desc.includes(`class\n${classFilter.toLowerCase()}`)) {
      return false;
    }

    // Level filter
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) {
      return false;
    }

    // Search filter
    if (searchText && !name.includes(searchText)) {
      return false;
    }

    return true;
  });

  renderSpells(filtered);
}

// Attach filter listeners
document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

// Initialize
loadSpells();
