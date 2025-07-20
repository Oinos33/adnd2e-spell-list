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
  const wizardChecks = Array.from(document.querySelectorAll("#wizardFilters input:checked")).map(i => i.value);
  const priestChecks = Array.from(document.querySelectorAll("#priestFilters input:checked")).map(i => i.value);
  const elementalChecks = Array.from(document.querySelectorAll("#elementalFilters input:checked")).map(i => i.value);

  let filtered = spells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const isWizard = desc.includes("class: wizard");
    const isPriest = desc.includes("class: priest");

    if (searchTerm && !desc.includes(searchTerm) && !spell.name.toLowerCase().includes(searchTerm)) return false;
    if (!wizard && isWizard) return false;
    if (!priest && isPriest) return false;
    if (level && !desc.includes(`spell level: ${level}`)) return false;

    let wizardMatch = !wizardChecks.length || wizardChecks.some(check => desc.includes(check.toLowerCase()));
    let priestMatch = !priestChecks.length || priestChecks.some(check => desc.includes(check.toLowerCase()));
    let elementalMatch = !elementalChecks.length || elementalChecks.some(check => desc.includes(check.toLowerCase()));

    return wizardMatch && priestMatch && elementalMatch;
  });

  renderSpells(filtered);
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("wizard").addEventListener("change", applyFilters);
document.getElementById("priest").addEventListener("change", applyFilters);
document.getElementById("levelFilter").addEventListener("change", applyFilters);
document.querySelectorAll("#wizardFilters input").forEach(input => input.addEventListener("change", applyFilters));
document.querySelectorAll("#priestFilters input").forEach(input => input.addEventListener("change", applyFilters));
document.querySelectorAll("#elementalFilters input").forEach(input => input.addEventListener("change", applyFilters));

document.getElementById("resetFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  document.getElementById("wizard").checked = true;
  document.getElementById("priest").checked = true;
  document.getElementById("levelFilter").value = "";
  document.querySelectorAll("#wizardFilters input, #priestFilters input, #elementalFilters input").forEach(i => i.checked = false);
  renderSpells(spells);
});

loadSpells();
