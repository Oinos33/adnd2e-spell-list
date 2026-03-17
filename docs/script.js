async function loadSpells() {
  const count = document.getElementById("resultsCount");
  const list = document.getElementById("spellList");
  const detail = document.getElementById("spellDetail");

  try {
    count.textContent = "Fetching JSON...";
    const response = await fetch("./AD&D2e_Master_Spell_List.json?v=4");
    count.textContent = `HTTP ${response.status}`;

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const spells = await response.json();

    if (!Array.isArray(spells)) {
      throw new Error("JSON root is not an array");
    }

    count.textContent = `Loaded ${spells.length} spells`;
    list.innerHTML = `
      <div class="empty-list">
        Success. JSON loaded.<br><br>
        First spell: <strong>${spells[0]?.name || "(missing name)"}</strong>
      </div>
    `;

    detail.className = "spell-detail";
    detail.innerHTML = `
      <div class="detail-block">
        <div class="section-title">Diagnostic Result</div>
        <div class="description-text">
Loaded ${spells.length} spell records successfully.

First record name: ${spells[0]?.name || "(missing)"}
First record class: ${spells[0]?.class || "(missing)"}
First record level: ${spells[0]?.spell_level || "(missing)"}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("DIAGNOSTIC ERROR:", error);
    count.textContent = "Diagnostic failed";
    list.innerHTML = `<div class="empty-list">Diagnostic failed: ${error.message}</div>`;
    detail.className = "spell-detail";
    detail.innerHTML = `
      <div class="detail-block">
        <div class="section-title">Diagnostic Error</div>
        <div class="description-text">${error.message}</div>
      </div>
    `;
  }
}

loadSpells();
