let spells = [];

async function loadSpells() {
  const response = await fetch("AD&D2e_Master_Spell_List.json");
  spells = await response.json();
  renderSpells(spells);
}

function renderSpells(spellArray) {
  const container = document.getElementById("spellContainer");
  container.innerHTML = "";

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
  const level = document.getElementById("levelFilter").value;
  const schoolChecks = Array.from(document.querySelectorAll("#filters input:checked")).map(i => i.value.toLowerCase());

  let filtered = spells.filter(spell => {
    const desc = spell.description.toLowerCase();
    if (searchTerm && !desc.includes(searchTerm) && !spell.name.toLowerCase().includes(searchTerm)) return false;
    if (!wizard && desc.includes("class: wizard")) return false;
    if (!priest && desc.includes("class: priest")) return false;
    if (level && !desc.includes(`spell level: ${level}`)) return false;
    if (schoolChecks.length) {
      return schoolChecks.some(school => desc.includes(school));
    }
    return true;
  });

  renderSpells(filtered);
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("wizard").addEventListener("change", applyFilters);
document.getElementById("priest").addEventListener("change", applyFilters);
document.getElementById("levelFilter").addEventListener("change", applyFilters);
document.querySelectorAll("#filters input").forEach(input => input.addEventListener("change", applyFilters));
document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("wizard").checked = true;
  document.getElementById("priest").checked = true;
  document.getElementById("levelFilter").value = "";
  document.querySelectorAll("#filters input").forEach(i => i.checked = false);
  renderSpells(spells);
});

loadSpells();
