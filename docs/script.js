body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
  margin: 0;
  padding: 0;
}

header {
  background: #222;
  color: #fff;
  padding: 10px;
  text-align: center;
}

header h1 {
  margin: 5px 0 10px;
  font-size: 1.5rem;
}

#filters {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 5px;
}

#filters label {
  font-weight: bold;
}

#searchBox, select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #aaa;
}

main {
  padding: 15px;
}

#spellList {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.spell-card {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
  overflow-y: auto;
  max-height: 350px;
}

.spell-card h2 {
  font-size: 1.1rem;
  margin-top: 0;
  color: #444;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
  margin-bottom: 8px;
}

/* ✅ New 2-column table-like layout for spell descriptions */
.spell-card pre {
  display: grid;
  grid-template-columns: 120px 1fr; /* Left: label, Right: value */
  column-gap: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family: monospace;
}

.spell-card strong {
  color: #222;
  font-weight: bold;
  text-align: right; /* Align labels to the right */
  padding-right: 5px;
}

footer {
  text-align: center;
  background: #222;
  color: #aaa;
  padding: 10px;
  font-size: 0.9rem;
}
