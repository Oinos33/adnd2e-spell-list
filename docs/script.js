const JSON_FILE = "AD&D2e_Master_Spell_List.json";
let allSpells = [];

async function loadSpells() {
  try {
    const response = await fetch(JSON_FILE);
    const data = await response.json();

    // ✅ Parse and add structured fields (class & level)
    allSpells = data.map(spell => {
      const parsed = parseSpell(spell);
      return { ...spell, ...parsed };
    });

    renderSpells(allSpells);
  } catch (e) {
    document.getElementById("spellList").innerHTML =
      `<p style="color:red">Error loading spell list: ${e}</p>`;
  }
}

// ✅ Extract class & level from description
function parseSpell(spell) {
  const desc = spell.description || "";
  let spellClass = "Unknown";
  let spellLevel = "Unknown";

  // Look for lines like: "Class\nWizard" and "Spell Level\n3"
  const classMatch = desc.match(/Class\s*\n([A-Za-z]+)/i);
  const levelMatch = desc.match(/Spell Level\s*\n(\d+)/i);

  if (classMatch) spellClass = classMatch[1].trim();
  if (levelMatch) spellLevel = levelMatch[1].trim();

  return {
    _class: spellClass,
    _level: spellLevel
  };
}

// ✅ Renders formatted spell cards with 2-column tags
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
      <div class="spell-details">
        ${formatDescription(spell.description)}
      </div>
    `;
    container.appendChild(card);
  });
}

// ✅ Converts raw text to bolded 2-column layout
function formatDescription(desc) {
  if (!desc) return "";
  return desc
    .replace(/Spell Level/g, "<strong>Level:</strong>")
    .replace(/Class/g, "<strong>Class:</strong>")
    .replace(/School/g, "<strong>School:</strong>")
    .replace(/Range/g, "<strong>Range:</strong>")
    .replace(/Duration/g, "<strong>Dur:</strong>")
    .replace(/AOE/g, "<strong>AOE:</strong>")
    .replace(/Casting Time/g, "<strong>CT:</strong>")
    .replace(/Save/g, "<strong>Save:</strong>")
    .replace(/Components/g, "<strong>Comp:</strong>")
    .replace(/Source/g, "<strong>Src:</strong>")
    .replace(/\n/g, "<br>");
}

// ✅ Filters using parsed fields instead of text search
function filterSpells() {
  const classFilter = document.getElementById("classFilter").value;
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    // Class filter
    if (classFilter !== "all" && spell._class.toLowerCase() !== classFilter.toLowerCase()) {
      return false;
    }

    // Level filter
    if (levelFilter !== "all" && spell._level !== levelFilter) {
      return false;
    }

    // Search box
    if (searchText && !spell.name.toLowerCase().includes(searchText)) {
      return false;
    }

    return true;
  });

  renderSpells(filtered);
}

// ✅ Event listeners
document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

// ✅ Initialize
loadSpells();
