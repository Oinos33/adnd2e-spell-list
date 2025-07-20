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

    const lines = spell.description.split("\n").filter(line => line.trim() !== "");
    let rows = "";
    let titleComponents = "";

    // Check first line for components (e.g., "Spell Name (S M V)")
    if (lines.length > 0 && /\(.+\)/.test(lines[0])) {
      const firstLine = lines[0].trim();
      const match = firstLine.match(/\(([^)]+)\)/);
      if (match) {
        titleComponents = ` <span class="components">(${match[1]})</span>`;
      }
      lines.shift(); // Remove the first line to avoid repeating it
    }

    // Format tags/values
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (/^Spell Level$/i.test(line)) line = "Level:";
      else if (/^Class$/i.test(line)) line = "Class:";
      else if (/^School$/i.test(line)) line = "School:";
      else if (/^Range$/i.test(line)) line = "Range:";
      else if (/^Duration$/i.test(line)) line = "Dur:";
      else if (/^AOE$/i.test(line)) line = "AOE:";
      else if (/^Casting Time$/i.test(line)) line = "CT:";
      else if (/^Save$/i.test(line)) line = "Save:";
      else if (/^Requirements$/i.test(line)) line = "Req:";
      else if (/^Source$/i.test(line)) line = "Src:";

      if (line.endsWith(":") && i + 1 < lines.length) {
        rows += `<div class="row"><strong>${line}</strong><span>${lines[i + 1]}</span></div>`;
        i++;
      } else {
        rows += `<div class="row full-line">${line}</div>`;
      }
    }

    card.innerHTML = `
      <h2>${spell.name}${titleComponents}</h2>
      <div class="spell-details">${rows}</div>
    `;
    container.appendChild(card);
  });
}

function filterSpells() {
  const classFilter = document.getElementById("classFilter").value.toLowerCase();
  const levelFilter = document.getElementById("levelFilter").value.toLowerCase();
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const name = spell.name.toLowerCase();

    if (classFilter !== "all" && !desc.includes(`class\n${classFilter}`)) {
      return false;
    }
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) {
      return false;
    }
    if (searchText && !name.includes(searchText)) {
      return false;
    }

    return true;
  });

  renderSpells(filtered);
}

document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

loadSpells();
