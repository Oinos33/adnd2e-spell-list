let spells = [];

const wizardSchoolsList = [
  "Abjuration", "Alteration", "Conjuration/Summoning", "Enchantment/Charm",
  "Illusion/Phantasm", "Invocation/Evocation", "Divination",
  "Necromancy", "Wild Magic", "Elemental Air", "Elemental Earth",
  "Elemental Fire", "Elemental Water"
];

const priestSpheresList = [
  "All", "Animal", "Astral", "Chaos", "Charm", "Combat", "Creation", "Divination",
  "Elemental", "Guardian", "Healing", "Law", "Necromantic", "Numbers", "Plant",
  "Protection", "Summoning", "Sun", "Thought", "Time", "Travelers", "War",
  "Wards", "Weather"
];

// Populate checkboxes
function populateFilters() {
  const wizardContainer = document.getElementById("wizardSchools");
  wizardContainer.innerHTML = wizardSchoolsList
    .map(s => `<label><input type="checkbox" value="${s.toLowerCase()}"> ${s}</label>`)
    .join(" ");

  const priestContainer = document.getElementById("priestSpheres");
  priestContainer.innerHTML = priestSpheresList
    .map(s => `<label><input type="checkbox" value="${s.toLowerCase()}"> ${s}</label>`)
    .join(" ");
}

async function loadSpells() {
  const response = await fetch("AD&D2e_Master_Spell_List.json");
  spells = await response.json();
  renderSpells(spells);
}

function renderSpells(spellArray) {
  const container = document.getElementById("spellContainer");
  container.innerHTML = "";
  document.getElementById("spellCount").innerText =
    `Showing ${spellArray.length} of ${spells.length} spells`;

  spellArray.forEach(spell => {
    const card = document.createElement("div");
    card.className = "spell-card";

    const lines = spell.description.split("\n");
    const meta = [];
    const desc = [];
    let descStart = false;

    for (let line of lines) {
      if (line.startsWith("Description:")) descStart = true;
      if (descStart) {
        desc.push(line.replace("Description:", "").trim());
      } else {
        meta.push(line.trim());
      }
    }

    card.innerHTML = `
      <h2>${spell.name}</h2>
      ${meta.map(l => {
        if (l.includes(":")) {
          const [label, value] = l.split(":");
          return `<div><strong>${label.trim()}:</strong> ${value.trim()}</div>`;
        } else {
          return `<div>${l}</div>`;
        }
      }).join("")}
      <div class="description"><strong>Description:</strong> ${desc.join(" ")}</div>
    `;
    container.appendChild(card);
  });
}

function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const wizard = document.getElementById("wizard").checked;
  const priest = document.getElementById("priest").checked;
  const wizardLevel = document.getElementById("wizardLevelFilter").value;
  const priestLevel = document.getElementById("priestLevelFilter").value;

  const wizardChecks = Array.from(document.querySelectorAll("#wizardSchools input:checked")).map(i => i.value);
  const priestChecks = Array.from(document.querySelectorAll("#priestSpheres input:checked")).map(i => i.value);
  const elementalChecks = Array.from(document.querySelectorAll(".elemental-filters input:checked")).map(i => i.value);

  let filtered = spells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const name = spell.name.toLowerCase();

    // Search filter
    if (searchTerm && !desc.includes(searchTerm) && !name.includes(searchTerm)) return false;

    // Class filter
    if (!wizard && desc.includes("class: wizard")) return false;
    if (!priest && desc.includes("class: priest")) return false;

    // Level filters
    if (wizardLevel && desc.includes("class: wizard") && !desc.includes(`spell level: ${wizardLevel}`)) return false;
    if (priestLevel && desc.includes("class: priest") && !desc.includes(`spell level: ${priestLevel}`)) return false;

    // Wizard school filter
    if (wizardChecks.length && desc.includes("class: wizard") &&
      !wizardChecks.some(s => desc.includes(s))) return false;

    // Priest sphere filter
    if (priestChecks.length && desc.includes("class: priest") &&
      !priestChecks.some(s => desc.includes(s))) return false;

    // Elemental filter
    if (elementalChecks.length && !elementalChecks.some(e => desc.includes(e))) return false;

    return true;
  });

  renderSpells(filtered);
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("wizard").addEventListener("change", applyFilters);
document.getElementById("priest").addEventListener("change", applyFilters);
document.getElementById("wizardLevelFilter").addEventListener("change", applyFilters);
document.getElementById("priestLevelFilter").addEventListener("change", applyFilters);
document.querySelectorAll(".elemental-filters input").forEach(i => i.addEventListener("change", applyFilters));

document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("wizard").checked = true;
  document.getElementById("priest").checked = true;
  document.getElementById("wizardLevelFilter").value = "";
  document.getElementById("priestLevelFilter").value = "";
  document.querySelectorAll("#wizardSchools input, #priestSpheres input, .elemental-filters input")
    .forEach(i => i.checked = false);
  renderSpells(spells);
});

populateFilters();
loadSpells();

