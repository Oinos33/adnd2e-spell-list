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

function parseSpell(spell) {
  const lines = spell.description
    .split("\n")
    .map(line => line.trim())
    .filter(line => line);

  // Extract (S M V) or similar from first line
  let title = spell.name;
  let components = "";
  if (/\(.*\)/.test(lines[0])) {
    const match = lines[0].match(/\((.*?)\)/);
    if (match) components = match[0];
  }

  // Stat labels we care about
  const labels = [
    "Spell Level", "Class", "School", "Range", "Duration",
    "AOE", "Casting Time", "Save", "Source"
  ];

  const statBlock = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const label = labels.find(lbl =>
      line.toLowerCase().startsWith(lbl.toLowerCase())
    );
    if (label) {
      statBlock[label] = lines[i + 1] || "";
      i += 2;
    } else {
      i++;
    }
  }

  // Build readable stat block
  let statBlockHTML = "";
  for (let key in statBlock) {
    const shortKey = key
      .replace("Spell Level", "Level")
      .replace("Casting Time", "CT")
      .replace("Duration", "Dur");
    statBlockHTML += `<div><strong>${shortKey}:</strong> ${statBlock[key]}</div>`;
  }

  // Description (everything after Source)
  const srcIndex = lines.findIndex(l => l.toLowerCase().startsWith("source"));
  let descriptionText = "";
  if (srcIndex !== -1) {
    descriptionText = lines.slice(srcIndex + 1).join(" ");
  }

  return {
    title: components ? `${title} ${components}` : title,
    statBlock: statBlockHTML,
    description: descriptionText
  };
}

function renderSpells(spells) {
  const container = document.getElementById("spellList");
  container.innerHTML = "";

  if (spells.length === 0) {
    container.innerHTML = "<p>No spells match your criteria.</p>";
    return;
  }

  spells.forEach(spell => {
    const parsed = parseSpell(spell);
    const card = document.createElement("div");
    card.className = "spell-card";
    card.innerHTML = `
      <h2>${parsed.title}</h2>
      <div class="stat-block">${parsed.statBlock}</div>
      <div class="description">${parsed.description}</div>
    `;
    container.appendChild(card);
  });
}

function filterSpells() {
  const classFilter = document.getElementById("classFilter").value.toLowerCase();
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const desc = spell.description.toLowerCase();
    if (classFilter !== "all" && !desc.includes(`class\n${classFilter}`)) return false;
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) return false;
    if (searchText && !spell.name.toLowerCase().includes(searchText)) return false;
    return true;
  });

  renderSpells(filtered);
}

document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

loadSpells();
