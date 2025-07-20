const JSON_FILE = "AD&D2e_Master_Spell_List.json";

let allSpells = [];
let processedSpells = [];

const knownKeys = [
  "Spell Level", "Class", "School", "Range", "Duration", "AOE",
  "Casting Time", "Save", "Components", "Source"
];

// -------- Load + Preprocess --------
async function loadSpells() {
  try {
    const response = await fetch(JSON_FILE);
    allSpells = await response.json();
    processedSpells = preprocessSpells(allSpells);

    generateFilterOptions();
    renderSpells(processedSpells);
  } catch (e) {
    document.getElementById("spellList").innerHTML =
      `<p style="color:red">Error loading spell list: ${e}</p>`;
  }
}

function preprocessSpells(spells) {
  return spells.map(spell => {
    const keyVals = {};
    const lines = spell.description.split(/\n+/);
    let descriptionLines = [];

    lines.forEach(line => {
      const match = line.match(/^([A-Za-z ]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (knownKeys.includes(key)) {
          keyVals[key] = value;
          return;
        }
      }
      descriptionLines.push(line);
    });

    const level = keyVals["Spell Level"] || "?";
    const cls = keyVals["Class"] || "Unknown";
    const school = (keyVals["School"] || "")
      .split(/[, ]+/)
      .filter(Boolean);

    return {
      ...spell,
      level: parseInt(level) || "?",
      class: cls,
      school,
      keyValues: keyVals,
      descriptionOnly: descriptionLines.join("\n").trim()
    };
  });
}

// -------- Filter UI Generation --------
function generateFilterOptions() {
  const classes = [...new Set(processedSpells.map(s => s.class))].sort();
  const levels = [...new Set(processedSpells.map(s => s.level).filter(Boolean))].sort((a, b) => a - b);
  const schools = [...new Set(processedSpells.flatMap(s => s.school))].sort();

  populateCheckboxGroup("classFilters", classes, "filter-class");
  populateCheckboxGroup("levelFilters", levels, "filter-level");
  populateCheckboxGroup("schoolFilters", schools, "filter-school");

  document.querySelectorAll("input[type='checkbox'], #sortBy, #searchBox")
    .forEach(el => el.addEventListener("change", filterAndRender));
}

function populateCheckboxGroup(containerId, items, className) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  items.forEach(item => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${item}" class="${className}"> ${item}`;
    container.appendChild(label);
  });
}

// -------- Filtering + Sorting --------
function getSelectedValues(className) {
  return [...document.querySelectorAll(`.${className}:checked`)].map(cb => cb.value);
}

function filterAndRender() {
  const selectedClasses = getSelectedValues("filter-class");
  const selectedLevels = getSelectedValues("filter-level").map(Number);
  const selectedSchools = getSelectedValues("filter-school");
  const sortBy = document.getElementById("sortBy").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  let filtered = processedSpells.filter(spell => {
    return (
      (selectedClasses.length === 0 || selectedClasses.includes(spell.class)) &&
      (selectedLevels.length === 0 || selectedLevels.includes(spell.level)) &&
      (selectedSchools.length === 0 || spell.school.some(s => selectedSchools.includes(s))) &&
      (searchText === "" ||
        spell.name.toLowerCase().includes(searchText) ||
        spell.description.toLowerCase().includes(searchText))
    );
  });

  filtered.sort((a, b) => {
    if (sortBy === "level") return (a.level || 0) - (b.level || 0);
    if (sortBy === "school") return (a.school[0] || "").localeCompare(b.school[0] || "");
    return a.name.localeCompare(b.name);
  });

  renderSpells(filtered);
}

// -------- Render --------
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

    let detailsHTML = "";
    for (const key of knownKeys) {
      if (spell.keyValues[key]) {
        detailsHTML += `<p><strong>${key}:</strong> ${spell.keyValues[key]}</p>`;
      }
    }

    card.innerHTML = `
      <h2>${spell.name}</h2>
      <div class="spell-details">
        <p><strong>Level:</strong> ${spell.level}</p>
        <p><strong>Class:</strong> ${spell.class}</p>
        <p><strong>School:</strong> ${spell.school.join(", ")}</p>
        ${detailsHTML}
        <p><strong>Description:</strong> ${spell.descriptionOnly}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// Init
loadSpells();
