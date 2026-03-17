let spells = [];
let filteredSpells = [];
let selectedSpellId = null;

async function loadSpells() {
  const count = document.getElementById("resultsCount");
  const list = document.getElementById("spellList");

  try {
    count.textContent = "Loading spells...";
    const response = await fetch("./AD&D2e_Master_Spell_List.json?v=10");

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const rawData = await response.json();

    if (!Array.isArray(rawData)) {
      throw new Error("JSON root is not an array.");
    }

    spells = rawData.map((spell, index) => ({
      ...spell,
      _internalId: spell.spell_id || `spell-${index}`
    }));

    populateDropdown("groupFilter", spells.flatMap(getGroups), "All Groups");
    populateDropdown("deityFilter", spells.flatMap(getDeities), "All Deities");

    applyFilters();
  } catch (error) {
    console.error("LOAD ERROR:", error);
    renderEmptyDetail(`Failed to load spell data. ${error.message}`);
    if (list) list.innerHTML = `<div class="empty-list">Failed to load spell data.</div>`;
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

function getSpellLevelLabel(spell) {
  const level = getSpellLevel(spell);
  return level === "0" ? "Cantrip" : level;
}

function getSchools(spell) {
  return splitTags(spell.school);
}

function getSpheres(spell) {
  return splitTags(spell.sphere);
}

function getGroups(spell) {
  return splitTags(spell.group_targets);
}

function getDeities(spell) {
  return splitTags(spell.deity_targets);
}

function getSettings(spell) {
  return splitTags(spell.setting_targets);
}

function getComponents(spell) {
  return splitTags(spell.components);
}

function getElementalTags(spell) {
  const tags = new Set();

  if (spell.elemental === true || (spell.tags && spell.tags.elemental === true)) {
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
    ...getComponents(spell),
    ...getSchools(spell),
    ...getSpheres(spell),
    ...getElementalTags(spell),
    ...getGroups(spell),
    ...getSettings(spell),
    ...getDeities(spell)
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

function populateDropdown(selectId, values, placeholder) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const currentValue = select.value;

  const uniqueValues = [...new Set(values.map(normalizeText).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = placeholder;
  select.appendChild(defaultOption);

  uniqueValues.forEach(value => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  select.value = uniqueValues.includes(currentValue) ? currentValue : "";
}

function applyFilters() {
  const searchTerm = normalizeText(document.getElementById("searchInput").value).toLowerCase();
  const wizardChecked = document.getElementById("wizard").checked;
  const priestChecked = document.getElementById("priest").checked;
  const levelFilter = normalizeText(document.getElementById("levelFilter").value);
  const sortFilter = document.getElementById("sortFilter").value;
  const groupFilter = normalizeText(document.getElementById("groupFilter").value).toLowerCase();
  const deityFilter = normalizeText(document.getElementById("deityFilter").value).toLowerCase();

  const selectedSchools = getSelectedCheckboxValues("school");
  const selectedSpheres = getSelectedCheckboxValues("sphere");
  const selectedElementals = getSelectedCheckboxValues("elemental");

  filteredSpells = spells.filter(spell => {
    const spellClass = getSpellClass(spell);
    const spellLevel = getSpellLevel(spell);
    const schools = getSchools(spell).map(v => v.toLowerCase());
    const spheres = getSpheres(spell).map(v => v.toLowerCase());
    const elementalTags = getElementalTags(spell).map(v => v.toLowerCase());
    const groups = getGroups(spell).map(v => v.toLowerCase());
    const deities = getDeities(spell).map(v => v.toLowerCase());
    const blob = getSearchBlob(spell);

    if (!wizardChecked && !priestChecked) return false;
    if (!wizardChecked && spellClass === "wizard") return false;
    if (!priestChecked && spellClass === "priest") return false;

    if (levelFilter && spellLevel !== levelFilter) return false;
    if (searchTerm && !blob.includes(searchTerm)) return false;
    if (groupFilter && !groups.some(item => item === groupFilter)) return false;
    if (deityFilter && !deities.some(item => item === deityFilter)) return false;

    if (selectedSchools.length && !selectedSchools.some(item => schools.includes(item))) return false;
    if (selectedSpheres.length && !selectedSpheres.some(item => spheres.includes(item))) return false;
    if (selectedElementals.length && !selectedElementals.some(item => elementalTags.includes(item))) return false;

    return true;
  });

  switch (sortFilter) {
    case "name-desc":
      filteredSpells.sort(compareByNameDesc);
      break;
    case "level-desc":
      filteredSpells.sort(compareByLevelDesc);
      break;
    case "name-asc":
      filteredSpells.sort(compareByNameAsc);
      break;
    case "level-asc":
    default:
      filteredSpells.sort(compareByLevelAsc);
      break;
  }

  renderSpellList(filteredSpells);
  updateResultsCount(filteredSpells.length);

  if (!filteredSpells.length) {
    selectedSpellId = null;
    renderEmptyDetail("No spells matched your filters.");
    return;
  }

  const stillVisible = filteredSpells.find(spell => spell._internalId === selectedSpellId);
  if (stillVisible) {
    renderSpellDetail(stillVisible);
  } else {
    selectSpell(filteredSpells[0]._internalId);
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

    if (spell._internalId === selectedSpellId) {
      button.classList.add("active");

      requestAnimationFrame(() => {
        button.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        });
      });
    }

    const schools = getSchools(spell).join(", ");
    const spheres = getSpheres(spell).join(", ");
    const levelLabel = getSpellLevelLabel(spell);
    const classLabel = titleCase(spell.class || "");

    button.innerHTML = `
      <div class="spell-list-name">${escapeHtml(spell.name)}</div>
      <div class="spell-list-meta">
        ${escapeHtml(classLabel)}${levelLabel !== "" ? ` • ${escapeHtml(levelLabel === "Cantrip" ? "Cantrip" : `Lvl ${levelLabel}`)}` : ""}
      </div>
      <div class="spell-list-submeta">
        ${escapeHtml(schools || spheres || spell.cantrip_category || "")}
      </div>
    `;

    button.addEventListener("click", () => selectSpell(spell._internalId));
    list.appendChild(button);
  });
}

function selectSpell(spellId) {
  selectedSpellId = spellId;
  const spell =
    filteredSpells.find(item => item._internalId === spellId) ||
    spells.find(item => item._internalId === spellId);

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
  const components = getComponents(spell);
  const groupTargets = getGroups(spell);
  const settingTargets = getSettings(spell);
  const deityTargets = getDeities(spell);
  const fandomUrl = normalizeText(spell.fandom_url);
  const levelLabel = getSpellLevelLabel(spell);

  detail.className = "spell-detail";
  detail.innerHTML = `
    <div class="detail-header">
      <h2>${escapeHtml(spell.name)}</h2>
      <div class="detail-subtitle">
        ${escapeHtml(titleCase(spell.class || ""))}
        ${levelLabel !== "" ? ` • ${escapeHtml(levelLabel === "Cantrip" ? "Cantrip" : `Level ${levelLabel}`)}` : ""}
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

    ${fandomUrl ? `
      <div class="detail-block">
        <div class="section-title">Source Link</div>
        <div><a class="source-link" href="${escapeHtml(fandomUrl)}" target="_blank" rel="noopener noreferrer">Open Fandom entry</a></div>
      </div>
    ` : ""}
  `;
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("wizard").checked = true;
  document.getElementById("priest").checked = true;
  document.getElementById("levelFilter").value = "";
  document.getElementById("sortFilter").value = "level-asc";
  document.getElementById("groupFilter").value = "";
  document.getElementById("deityFilter").value = "";

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
document.getElementById("groupFilter").addEventListener("change", applyFilters);
document.getElementById("deityFilter").addEventListener("change", applyFilters);

document.querySelectorAll(".tag-filter").forEach(input => {
  input.addEventListener("change", applyFilters);
});

document.getElementById("resetFilters").addEventListener("click", resetFilters);

loadSpells();
