const JSON_FILE = "AD&D2e_Master_Spell_List.json";

let allSpells = [];
let processedSpells = [];

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

// Parse Level, Class, School from description
function preprocessSpells(spells) {
  return spells.map(spell => {
    const levelMatch = spell.description.match(/Spell Level\s+(\d+)/i);
    const classMatch = spell.description.match(/Class\s+([A-Za-z]+)/i);
    const schoolMatch = spell.description.match(/School\s+([^\n]+)/i);

    return {
      ...spell,
      level: levelMatch ? parseInt(levelMatch[1]) : null,
      class: classMatch ? classMatch[1] : "Unknown",
      school: schoolMatch
        ? schoolMatch[1].split(/[, ]+/).filter(Boolean)
        : []
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

  // Sorting
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
    card.innerHTML = `
      <h2>${spell.name}</h2>
      <p><strong>Level:</strong> ${spell.level || "?"} |
         <strong>Class:</strong> ${spell.class} |
         <strong>School:</strong> ${spell.school.join(", ")}</p>
      <div class="description">${spell.description}</div>
    `;
    container.appendChild(card);
  });
}

// Init
loadSpells();
