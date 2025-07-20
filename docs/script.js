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
  font-size: 1.4rem; /* reduced by 1pt */
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
  font-size: 0.9rem; /* reduced body text by 1pt */
}

.spell-title {
  font-size: 1.1rem; /* slightly smaller title */
  font-weight: bold;
  margin-bottom: 6px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 3px;
}

.spell-stats {
  margin-bottom: 8px;
}

.stat-line {
  margin: 2px 0;
}

.stat-label {
  font-weight: bold;
  color: #222;
}

.spell-desc {
  font-size: 0.9rem;
  line-height: 1.3;
  color: #444;
}

footer {
  text-align: center;
  background: #222;
  color: #aaa;
  padding: 10px;
  font-size: 0.8rem;
}
