const JSON_FILE = "AD&D2e_Master_Spell_List.json";
let allSpells = [];

// Load JSON properly
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

// Render cards
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

    // Title line
    const title = `<h2>${spell.name}${spell.components ? ` (${spell.components.toLowerCase().replace(/ /g, "_")})` : ""}</h2>`;

    // Stat block (only show if field exists)
    const fields = [
      ["Level", spell.level],
      ["Class", spell.class],
      ["School", shortenSchool(spell.school)],
      ["Range", spell.range],
      ["Dur", formatDuration(spell.duration)],
      ["AOE", spell.aoe],
      ["CT", formatDuration(spell.ct)],
      ["Save", spell.save],
      ["Src", spell.src]
    ]
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([label, value]) => `<div><strong>${label}:</strong> ${value}</div>`)
      .join("");

    const description = spell.description
      ? `<div class="description">${spell.description}</div>`
      : "";

    card.innerHTML = title + `<div class="stat-block">${fields}</div>` + description;
    container.appendChild(card);
  });
}

// Filter logic
function filterSpells() {
  const classFilter = document.getElementById("classFilter").value;
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    if (classFilter !== "all" && spell.class.toLowerCase() !== classFilter.toLowerCase()) return false;
    if (levelFilter !== "all" && spell.level !== levelFilter) return false;
    if (searchText && !spell.name.toLowerCase().includes(searchText)) return false;
    return true;
  });

  renderSpells(filtered);
}

// === Helpers ===

// Abbreviate schools
function shortenSchool(school) {
  if (!school) return "";
  return school
    .replace(/Enchantment\/Charm/i, "Ench/Charm")
    .replace(/Alteration/i, "Alt")
    .replace(/Conjuration\/Summoning/i, "Conj/Sum")
    .replace(/Divination/i, "Div")
    .replace(/Illusion\/Phantasm/i, "Illus/Phant")
    .replace(/Invocation\/Evocation/i, "Invoc/Evoc")
    .replace(/Necromancy/i, "Necr")
    .replace(/Alchemy/i, "Alch")
    .replace(/Geometry/i, "Geom")
    .replace(/Wild Magic/i, "Wild_M");
}

// Normalize duration/ct spacing (1rd, 1seg, etc.)
function formatDuration(text) {
  if (!text) return "";
  return text
    .replace(/\b(\d+)\s*rds?\b/gi, "$1rd")
    .replace(/\b(\d+)\s*hrs?\b/gi, "$1hr")
    .replace(/\b(\d+)\s*segs?\b/gi, "$1seg")
    .replace(/\b(\d+)\s*turns?\b/gi, "$1t");
}

// Event listeners
document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

// Initialize
loadSpells();
