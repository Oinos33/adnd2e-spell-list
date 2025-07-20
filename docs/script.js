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

function formatStatBlock(spell) {
  // Extract the first lines for stat block (stop at first long text)
  const lines = spell.description.split("\n").map(l => l.trim()).filter(Boolean);

  const titleComponents = lines[0];
  const statLines = lines.slice(1, 12); // basic stat block (first ~10 lines)
  const description = lines.slice(12).join(" ");

  let formattedStats = "";
  statLines.forEach(line => {
    const [label, ...rest] = line.split(/[:\s]+/);
    const value = rest.join(" ");
    if (label && value) {
      formattedStats += `<div class="stat-line"><span class="stat-label">${label}:</span> ${value}</div>`;
    } else {
      formattedStats += `<div class="stat-line">${line}</div>`;
    }
  });

  return `
    <h2 class="spell-title">${spell.name}</h2>
    <div class="spell-stats">
      ${formattedStats}
    </div>
    <div class="spell-desc">${description}</div>
  `;
}

function renderSpells(spells) {
  const container = document.getElementById("spellList");
  container.innerHTML = "";

  spells.forEach(spell => {
    const card = document.createElement("div");
    card.className = "spell-card";
    card.innerHTML = formatStatBlock(spell);
    container.appendChild(card);
  });
}

function filterSpells() {
  const classFilter = document.getElementById("classFilter").value.toLowerCase();
  const levelFilter = document.getElementById("levelFilter").value;
  const searchText = document.getElementById("searchBox").value.toLowerCase();

  const filtered = allSpells.filter(spell => {
    const desc = spell.description.toLowerCase();
    const name = spell.name.toLowerCase();

    if (classFilter !== "all" && !desc.includes(`class\n${classFilter}`)) return false;
    if (levelFilter !== "all" && !desc.includes(`spell level\n${levelFilter}`)) return false;
    if (searchText && !name.includes(searchText)) return false;

    return true;
  });

  renderSpells(filtered);
}

document.getElementById("classFilter").addEventListener("change", filterSpells);
document.getElementById("levelFilter").addEventListener("change", filterSpells);
document.getElementById("searchBox").addEventListener("input", filterSpells);

loadSpells();
