let spells = [];
let filteredSpells = [];
let selectedSpellId = null;

async function loadSpells() {
  try {
    const response = await fetch("AD&D2e_Master_Spell_List.json");
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${response.status}`);
    }

    spells = await response.json();
    filteredSpells = [...spells].sort(compareByNameAsc);

    renderSpellList(filteredSpells);

    if (filteredSpells.length) {
      selectSpell(filteredSpells[0].spell_id);
    } else {
      renderEmptyDetail("No spells found.");
    }

    updateResultsCount(filteredSpells.length);
  } catch (error) {
    console.error(error);
    renderEmptyDetail("Failed to load spell data.");
    const list = document.getElementById("spellList");
    if (list) list.innerHTML = `<div class="empty-list">Failed to load spell data.</div>`;
    const count = document.getElementById("resultsCount");
    if (count) count.textContent = "Load failed";
  }
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function splitTags(value) {
  return asArray(value)
    .flatMap(item => normalizeText(item).split(","))
    .map(item => item.trim())
    .filter(Boolean);
}

function getSpellClass(spell) {
  return normalizeText(spell.class || "").toLowerCase();
}

function getSpellLevel(spell) {
  const raw = spell.spell_level;
  if (raw === null || raw === undefined || raw === "") return "";
  return String(raw).trim();
}

function getSchools(spell) {
  return splitTags(spell.school);
}

function getSpheres(spell) {
  return splitTags(spell.sphere);
}

function getElementalTags(spell) {
  const tags = new Set();

  if (spell.elemental === true || spell.tags?.elemental === true) {
    tags.add("Elemental");
  }

  [...getSchools(spell), ...getSpheres(spell)].forEach(value => {
    const lower = value.toLowerCase();
    if (lower.includes("elemental")) {
      tags.add("Elemental");
      if (lower.includes("air")) tags.add("Elemental Air");
      if (lower.includes("earth")) tags.add("Elemental Earth");
      if (lower.includes("fire")) tags.add("Elemental Fire");
      if (lower.includes("water")) tags.add("Elemental Water");
      if (lower.includes("shadow")) tags.add("Elemental Shadow");
    }
  });

  return [...tags];
}

function getSearchBlob(spell) {
  const values = [
    spell.name,
    spell.spell_id,
    spell.class,
    spell.cantrip_category,
    spell.range,
    spell.area_of_effect,
    spell.casting_time,
    spell.source,
    spell.description,
    spell.notes,
    spell.duration,
    spell.saving_throw,
    ...(spell.components || []),
    ...getSchools(spell),
    ...getSpheres(spell),
    ...getElementalTags(spell),
    ...(spell.group_targets || []),
    ...(spell.setting_targets || []),
    ...(spell.deity_targets || [])
  ];

  return values.map(normalizeText).join(" ").toLowerCase();
}

function compareByNameAsc(a, b) {
  return normalizeText(a.name).localeCompare(normalizeText(b.name));
}

function compareByNameDesc(a, b) {
  return normalizeText(b.name).localeCompare(normalizeText(a.name));
}

function compareByLevelAsc(a, b) {
  const levelA = Number.parseFloat(getSpellLevel(a));
  const levelB = Number.parseFloat(getSpellLevel(b));

  const safeA = Number.isNaN(levelA) ? 999 : levelA;
  const safeB = Number.isNaN(levelB) ? 999 : levelB;

  if (safeA !== safeB) return safeA - safeB;
  return compareByNameAsc(a, b);
}

function compareByLevelDesc(a, b) {
  const levelA = Number.parseFloat(getSpellLevel(a));
  const levelB = Number.parseFloat(getSpellLevel(b));

  const safeA = Number.isNaN(levelA) ? -1 : levelA;
  const safeB = Number.isNaN(levelB) ? -1 : levelB;

  if (safeA !== safeB) return safeB - safeA;
  return compareByNameAsc(a, b);
}

function getSelectedCheckboxValues(groupName) {
  return Array.from(document.querySelectorAll(`.tag-filter[data-group="${groupName}"]:checked`))
    .map(input => normalizeText(input.value).toLowerCase());
}

function applyFilters() {
  const searchTerm = normalizeText(document.getElementById("searchInput").value).toLowerCase();
  const wizardChecked = document.getElementById("wizard").checked;
  const priestChecked = document.getElementById("priest").checked;
  const levelFilter = normalizeText(document.getElementById("levelFilter").value);
  const sortFilter = document.getElementById("sortFilter").value;

  const selectedSchools = getSelectedCheckboxValues("school");
  const selectedSpheres = getSelectedCheckboxValues("sphere");
  const selectedElementals = getSelectedCheckboxValues("elemental");

  filteredSpells = spells.filter(spell => {
    const spellClass = getSpellClass(spell);
    const spellLevel = getSpellLevel(spell);
    const schools = getSchools(spell).map(v => v.toLowerCase());
    const spheres = getSpheres(spell).map(v => v.toLowerCase());
    const elementalTags = getElementalTags(spell).map(v => v.toLowerCase());
    const blob = getSearchBlob(spell);

    if (!wizardChecked && spellClass === "wizard") return false;
    if (!priestChecked && spellClass === "priest") return false;
    if (!wizardChecked && !priestChecked) return false;

    if (levelFilter && spellLevel !== levelFilter) return false;

    if (searchTerm && !blob.includes(searchTerm)) return false;

    if (selectedSchools.length && !selectedSchools.some(item => schools.includes(item))) {
      return false;
    }

    if (selectedSpheres.length && !selectedSpheres.some(item => spheres.includes(item))) {
      return false;
    }

    if (selectedElementals.length && !selectedElementals.some(item => elementalTags.includes(item))) {
      return false;
    }

    return true;
  });

  switch (sortFilter) {
    case "name-desc":
      filteredSpells.sort(compareByNameDesc);
      break;
    case "level-asc":
      filteredSpells.sort(compareByLevelAsc);
      break;
    case "level-desc":
      filteredSpells.sort(compareByLevelDesc);
      break;
    case "name-asc":
    default:
      filteredSpells.sort(compareByNameAsc);
      break;
  }

  renderSpellList(filteredSpells);
  updateResultsCount(filteredSpells.length);

  if (!filteredSpells.length) {
    selectedSpellId = null;
    renderEmptyDetail("No spells matched your filters.");
    return;
  }

  const stillVisible = filteredSpells.find(spell => spell.spell_id === selectedSpellId);
  if (stillVisible) {
    renderSpellDetail(stillVisible);
  } else {
    selectSpell(filteredSpells[0].spell_id);
  }
}

function updateResultsCount(count) {
  const resultsCount = document.getElementById("resultsCount");
  if (!resultsCount) return;
  resultsCount.textContent = `${count} spell${count === 1 ? "" : "s"}`;
}

function renderSpellList(spellArray) {
  const list = document.getElementById("spellList");
  list.innerHTML = "";

  if (!spellArray.length) {
    list.innerHTML = `<div class="empty-list">No spells found.</div>`;
    return;
  }

  spellArray.forEach(spell => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "spell-list-item";
    if (spell.spell_id === selectedSpellId) {
      button.classList.add("active");
    }

    const schools = getSchools(spell).join(", ");
    const spheres = getSpheres(spell).join(", ");
    const level = getSpellLevel(spell);
    const classLabel = titleCase(spell.class || "");

    button.innerHTML = `
      <div class="spell-list-name">${escapeHtml(spell.name)}</div>
      <div class="spell-list-meta">
        ${escapeHtml(classLabel)}${level !== "" ? ` • Lvl ${escapeHtml(level)}` : ""}
      </div>
      <div class="spell-list-submeta">
        ${escapeHtml(schools || spheres || spell.cantrip_category || "")}
      </div>
    `;

    button.addEventListener("click", () => selectSpell(spell.spell_id));
    list.appendChild(button);
  });
}

function selectSpell(spellId) {
  selectedSpellId = spellId;
  const spell = filteredSpells.find(item => item.spell_id === spellId) || spells.find(item => item.spell_id === spellId);

  renderSpellList(filteredSpells);

  if (spell) {
    renderSpellDetail(spell);
  } else {
    renderEmptyDetail("Spell not found.");
  }
}

function renderEmptyDetail(message) {
  const detail = document.getElementById("spellDetail");
  detail.className = "spell-detail empty-state";
  detail.innerHTML = `<div class="empty-message">${escapeHtml(message)}</div>`;
}

function renderField(label, value) {
  const clean = normalizeText(value);
  if (!clean) return "";
  return `
    <div class="meta-row">
      <div class="meta-label">${escapeHtml(label)}</div>
      <div class="meta-value">${escapeHtml(clean)}</div>
    </div>
  `;
}

function renderTagList(label, values) {
  const cleanValues = values.map(normalizeText).filter(Boolean);
  if (!cleanValues.length) return "";

  return `
    <div class="detail-block">
      <div class="section-title">${escapeHtml(label)}</div>
      <div class="tag-list">
        ${cleanValues.map(value => `<span class="tag">${escapeHtml(value)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderSpellDetail(spell) {
  const detail = document.getElementById("spellDetail");
  const schools = getSchools(spell);
  const spheres = getSpheres(spell);
  const elementalTags = getElementalTags(spell);

  const components = asArray(spell.components).map(normalizeText).filter(Boolean);
  const groupTargets = asArray(spell.group_targets).map(normalizeText).filter(Boolean);
  const settingTargets = asArray(spell.setting_targets).map(normalizeText).filter(Boolean);
  const deityTargets = asArray(spell.deity_targets).map(normalizeText).filter(Boolean);

  const fandomUrl = normalizeText(spell.fandom_url);

  detail.className = "spell-detail";
  detail.innerHTML = `
    <div class="detail-header">
      <h2>${escapeHtml(spell.name)}</h2>
      <div class="detail-subtitle">
        ${escapeHtml(titleCase(spell.class || ""))}
        ${getSpellLevel(spell) !== "" ? ` • Level ${escapeHtml(getSpellLevel(spell))}` : ""}
        ${spell.cantrip_category ? ` • ${escapeHtml(spell.cantrip_category)}` : ""}
      </div>
    </div>

    <div class="detail-block">
      <div class="section-title">Core Stats</div>
      <div class="meta-grid">
        ${renderField("Range", spell.range)}
        ${renderField("Area of Effect", spell.area_of_effect)}
        ${renderField("Casting Time", spell.casting_time)}
        ${renderField("Duration", spell.duration)}
        ${renderField("Saving Throw", spell.saving_throw)}
        ${renderField("Source", spell.source)}
        ${renderField("Notes", spell.notes)}
      </div>
    </div>

    ${renderTagList("School", schools)}
    ${renderTagList("Sphere", spheres)}
    ${renderTagList("Elemental", elementalTags)}
    ${renderTagList("Components", components)}
    ${renderTagList("Deity Targets", deityTargets)}
    ${renderTagList("Group Targets", groupTargets)}
    ${renderTagList("Setting Targets", settingTargets)}

    <div class="detail-block">
      <div class="section-title">Description</div>
      <div class="description-text">${escapeHtml(spell.description || "No description available.")}</div>
    </div>

    ${
      fandomUrl
        ? `
          <div class="detail-block">
            <div class="section-title">Source Link</div>
            <div><a class="source-link" href="${escapeHtml(fandomUrl)}" target="_blank" rel="noopener noreferrer">Open Fandom entry</a></div>
          </div>
        `
        : ""
    }
  `;
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("wizard").checked = true;
  document.getElementById("priest").checked = true;
  document.getElementById("levelFilter").value = "";
  document.getElementById("sortFilter").value = "name-asc";

  document.querySelectorAll(".tag-filter").forEach(input => {
    input.checked = false;
  });

  applyFilters();
}

document.getElementById("searchInput").addEventListener("input", applyFilters);
document.getElementById("wizard").addEventListener("change", applyFilters);
document.getElementById("priest").addEventListener("change", applyFilters);
document.getElementById("levelFilter").addEventListener("change", applyFilters);
document.getElementById("sortFilter").addEventListener("change", applyFilters);
document.querySelectorAll(".tag-filter").forEach(input => {
  input.addEventListener("change", applyFilters);
});
document.getElementById("resetFilters").addEventListener("click", resetFilters);

loadSpells();
