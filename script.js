// pokemon type colors
const colors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// DOM elements
const searchName = document.getElementById("search-input");
const teamName = document.querySelector(".team-name");
const form = document.querySelector(".search-form");
const loadingEl = document.querySelector(".loading-container");
const errorEl = document.querySelector(".error-container");
const searchContainerEl = document.querySelector(".search-container");

// search result elements
const searchResults = document.querySelector(".searched-pokemon-container");
const pokemonInfo = document.querySelector(".pokemon-info");
const pokemonName = document.querySelector(".pokemon-name");
const spriteEl = document.querySelector(".sprite");
const typeContainer = document.querySelector(".type-container");
const hpEl = document.querySelector(".hp");
const atkEl = document.querySelector(".atk");
const defEl = document.querySelector(".def");
const spAtkEl = document.querySelector(".spAtk");
const spDefEl = document.querySelector(".spDef");
const spdEl = document.querySelector(".spd");
const addBtn = document.querySelector(".add-btn");

// modal elements
const currentTeamSprites = document.querySelector(".team-sprites");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const removeModalBtn = document.getElementById("remove-pokemon-btn");
const modalIdEl = document.querySelector(".modal-id");
const modalPokemonName = document.querySelector(".modal-pokemon-name");
const modalSprite = document.querySelector(".modal-sprite");
const modalTypeContainer = document.querySelector(".modal-types");
const modalAbilities = document.querySelector(".abilities");
const modalHpEl = document.querySelector(".modal-hp");
const hpBar = document.querySelector(".hp-bar");
const modalAtkEl = document.querySelector(".modal-atk");
const atkBar = document.querySelector(".atk-bar");
const modalDefEl = document.querySelector(".modal-def");
const defBar = document.querySelector(".def-bar");
const modalSpAtkEl = document.querySelector(".modal-spAtk");
const spAtkBar = document.querySelector(".spAtk-bar");
const modalSpDefEl = document.querySelector(".modal-spDef");
const spDefBar = document.querySelector(".spDef-bar");
const modalSpdEl = document.querySelector(".modal-spd");
const spdBar = document.querySelector(".spd-bar");
const modalStatTotal = document.querySelector(".modal-stat-total");
const superWeaknessEl = document.querySelector(".super-weakness");
const weaknessEl = document.querySelector(".weakness");
const resistanceEl = document.querySelector(".resistance");
const superResistanceEl = document.querySelector(".super-resistance");
const immunitiesEl = document.querySelector(".immunities");

// global vars
let pokemonCount = 0;
let currentPokemonData;
let latestSearchId = 0;
let latestPokemonId = 0; // variable to store pokemon id for modal deletion
let currentTeamName = JSON.parse(localStorage.getItem("teamName")) || "My Team";
let currentTeam = JSON.parse(localStorage.getItem("team")) || [];

// event listeners
form.addEventListener("submit", pokemonSearch);
addBtn.addEventListener("click", addToTeam);
window.addEventListener("DOMContentLoaded", renderCurrentTeam);
closeModalBtn.addEventListener("click", () => modal.close());

currentTeamSprites.addEventListener("click", (e) => {
  if (e.target.matches("img")) displayPokemonModal(Number(e.target.dataset.id));
  else if (e.target.classList.contains("remove-btn"))
    removeFromTeam(Number(e.target.dataset.id));
  else if (e.target.classList.contains("add-team-icon"))
    searchContainerEl.classList.remove("hidden");
});

removeModalBtn.addEventListener("click", () => {
  removeFromTeam(latestPokemonId);
});

modal.addEventListener("click", (event) => {
  const rect = modal.getBoundingClientRect();
  const isInDialog =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

  if (!isInDialog) {
    modal.close();
  }
});

teamName.addEventListener("click", () => {
  if (teamName.contentEditable === "false" || teamName.contentEditable === "") {
    teamName.contentEditable = "true";
    teamName.classList.add("editing-style");
    teamName.focus();
    document.getSelection().selectAllChildren(teamName);
  }
});
teamName.addEventListener("blur", () => {
  if (teamName.contentEditable === "true") {
    saveTeamName();
  }
});
teamName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    teamName.blur();
  }
});

// functions
async function displayPokemonModal(id) {
  latestPokemonId = id;

  const pokemonData = currentTeam.find((pokemon) => pokemon.id === id);

  modalIdEl.textContent = "#" + String(pokemonData.id).padStart(4, "0");
  modalPokemonName.textContent = pokemonData.name;
  modalSprite.src = pokemonData.sprites.front_default;
  modalSprite.alt = pokemonData.name;

  const hpStat = pokemonData.stats[0].base_stat;
  const atkStat = pokemonData.stats[1].base_stat;
  const defStat = pokemonData.stats[2].base_stat;
  const spAtkStat = pokemonData.stats[3].base_stat;
  const spDefStat = pokemonData.stats[4].base_stat;
  const spdStat = pokemonData.stats[5].base_stat;

  modalHpEl.textContent = hpStat;
  modalAtkEl.textContent = atkStat;
  modalDefEl.textContent = defStat;
  modalSpAtkEl.textContent = spAtkStat;
  modalSpDefEl.textContent = spDefStat;
  modalSpdEl.textContent = spdStat;
  modalStatTotal.textContent = `Total: ${
    hpStat + atkStat + defStat + spAtkStat + spDefStat + spdStat
  }`;

  hpBar.style.width = `${(hpStat / 255) * 100}%`;
  atkBar.style.width = `${(atkStat / 255) * 100}%`;
  defBar.style.width = `${(defStat / 255) * 100}%`;
  spAtkBar.style.width = `${(spAtkStat / 255) * 100}%`;
  spDefBar.style.width = `${(spDefStat / 255) * 100}%`;
  spdBar.style.width = `${(spdStat / 255) * 100}%`;

  colorBar(hpStat, hpBar);
  colorBar(atkStat, atkBar);
  colorBar(defStat, defBar);
  colorBar(spAtkStat, spAtkBar);
  colorBar(spDefStat, spDefBar);
  colorBar(spdStat, spdBar);

  modalTypeContainer.innerHTML = "";
  const typePromises = pokemonData.types.map((type) => {
    const typeName = type.type.name;

    const typeElement = document.createElement("div");
    typeElement.classList.add("modal-type");
    typeElement.textContent = typeName;
    typeElement.style.backgroundColor = colors[typeName];
    modalTypeContainer.appendChild(typeElement);

    return fetchType(typeName);
  });

  let combinedEffectiveness = {};

  try {
    const typeEffectivenessData = await Promise.all(typePromises);
    combinedEffectiveness = calculateTypeEffectiveness(typeEffectivenessData);
  } catch (error) {
    console.log("Error fetching type effectiveness data: ", error);
  }

  // reset type effectiveness elements
  superWeaknessEl.innerHTML = "";
  weaknessEl.innerHTML = "";
  resistanceEl.innerHTML = "";
  superResistanceEl.innerHTML = "";
  immunitiesEl.innerHTML = "";

  superWeaknessEl.parentElement.classList.add("hidden");
  weaknessEl.parentElement.classList.add("hidden");
  resistanceEl.parentElement.classList.add("hidden");
  superResistanceEl.parentElement.classList.add("hidden");
  immunitiesEl.parentElement.classList.add("hidden");

  for (const eff in combinedEffectiveness) {
    combinedEffectiveness[eff].forEach((type) => {
      const typeIcon = document.createElement("img");
      typeIcon.src = `images/${type}.png`;
      typeIcon.alt = type;

      if (eff === "superWeaknesses") {
        superWeaknessEl.appendChild(typeIcon);
        superWeaknessEl.parentElement.classList.remove("hidden");
      } else if (eff === "weaknesses") {
        weaknessEl.appendChild(typeIcon);
        weaknessEl.parentElement.classList.remove("hidden");
      } else if (eff === "resistances") {
        resistanceEl.appendChild(typeIcon);
        resistanceEl.parentElement.classList.remove("hidden");
      } else if (eff === "superResistances") {
        superResistanceEl.appendChild(typeIcon);
        superResistanceEl.parentElement.classList.remove("hidden");
      } else if (eff === "immunities") {
        immunitiesEl.appendChild(typeIcon);
        immunitiesEl.parentElement.classList.remove("hidden");
      }
    });
  }

  modalAbilities.innerHTML = "";
  pokemonData.abilities.forEach((ability) => {
    const abilityName = ability.ability.name;

    const abilityEl = document.createElement("div");
    abilityEl.classList.add("ability");
    abilityEl.textContent = abilityName;
    modalAbilities.appendChild(abilityEl);
  });

  modal.showModal();
  modal.scrollTop = 0;
}

function calculateTypeEffectiveness(effectivenessData) {
  // return vals
  let superWeaknesses = [];
  let weaknesses = [];
  let resistances = [];
  let superResistances = [];
  let immunities = [];

  // temp vals
  let tempWeaknesses = [];
  let tempResistances = [];

  effectivenessData.forEach((type) => {
    type.damage_relations.no_damage_from.forEach((t) => {
      immunities.push(t.name);
    });
  });

  effectivenessData.forEach((type) => {
    type.damage_relations.double_damage_from.forEach((t) => {
      if (!immunities.includes(t.name)) tempWeaknesses.push(t.name);
    });

    type.damage_relations.half_damage_from.forEach((t) => {
      if (!immunities.includes(t.name)) tempResistances.push(t.name);
    });
  });

  let weaknessCounts = {};
  tempWeaknesses.forEach((type) => {
    weaknessCounts[type] = (weaknessCounts[type] || 0) + 1;
  });

  for (const typeName in weaknessCounts) {
    if (weaknessCounts[typeName] === 2) superWeaknesses.push(typeName);
    else weaknesses.push(typeName);
  }

  let resistanceCounts = {};
  tempResistances.forEach((type) => {
    resistanceCounts[type] = (resistanceCounts[type] || 0) + 1;
  });

  for (const typeName in resistanceCounts) {
    if (resistanceCounts[typeName] === 2) superResistances.push(typeName);
    else resistances.push(typeName);
  }

  weaknesses.forEach((type) => {
    // if the type is both a weakness and resistance
    if (resistances.includes(type)) {
      let index = weaknesses.indexOf(type);
      weaknesses.splice(index, 1);

      index = resistances.indexOf(type);
      resistances.splice(index, 1);
    }
  });

  return {
    superWeaknesses,
    weaknesses,
    resistances,
    superResistances,
    immunities,
  };
}

function addToTeam() {
  if (currentTeam.length === 6) {
    // todo: change alert to show up on page
    errorEl.style.display = "block";
    errorEl.textContent = "Cannot have more than 6 pokémon";
    loadingEl.style.display = "none";
    return;
  }

  const duplicate = currentTeam.some((pokemon) => {
    return pokemon.id === currentPokemonData.id;
  });

  if (duplicate) {
    errorEl.style.display = "block";
    errorEl.textContent = "Cannot have more than one of the same species";
    loadingEl.style.display = "none";
    return;
  }

  currentTeam = [...currentTeam, currentPokemonData];

  searchContainerEl.classList.add("hidden");
  searchResults.classList.add("hidden");
  saveToStorage();
  renderCurrentTeam();
}

function removeFromTeam(id) {
  currentTeam = currentTeam.filter((pokemon) => pokemon.id !== id);
  saveToStorage();
  renderCurrentTeam();
  modal.close();
}

function renderCurrentTeam() {
  teamName.textContent = currentTeamName;

  let html = currentTeam
    .map((pokemon) => {
      return `
      <div class="team-icon">
        <span class="remove-btn" data-id="${pokemon.id}">x</span>
        <img data-id="${pokemon.id}" src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
      </div>
    `;
    })
    .join("");

  // fill the remaining sprites with a plus sign
  for (let i = 0; i < 6 - currentTeam.length; i++) {
    html += `
      <div class="team-icon add-team-icon">+</div>
    `;
  }

  currentTeamSprites.innerHTML = html;
}

async function pokemonSearch(e) {
  e.preventDefault();
  searchResults.classList.add("hidden");
  loadingEl.style.display = "block";
  errorEl.style.display = "none";

  const val = searchName.value.trim();
  searchName.value = "";

  if (!val.length) {
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    errorEl.textContent = "Please enter a valid pokémon";
    currentPokemonData = null;
    return;
  }

  const thisSearchId = ++latestSearchId;
  currentPokemonData = null;

  if (pokemonCount === 0) {
    await getPokemonCount();
    if (pokemonCount === 0) {
      errorEl.style.display = "block";
      loadingEl.style.display = "none";
      errorEl.textContent = "Error getting pokémon count :/";
      currentPokemonData = null;
      return;
    }
  }

  const fetchedData = await fetchPokemon(val, thisSearchId);

  if (thisSearchId < latestSearchId) {
    console.log(
      `[ID ${thisSearchId}] Ignoring stale result for ${val}. A newer search (${latestSearchId}) took over.`
    );
    return;
  }

  if (!fetchedData) {
    errorEl.style.display = "block";
    loadingEl.style.display = "none";
    errorEl.textContent = "Error finding pokémon :/";
    currentPokemonData = null;
    return;
  }

  currentPokemonData = fetchedData;

  const { name } = currentPokemonData;
  const { types } = currentPokemonData;
  const sprite = currentPokemonData.sprites.front_default;
  const hpStat = currentPokemonData.stats[0].base_stat;
  const atkStat = currentPokemonData.stats[1].base_stat;
  const defStat = currentPokemonData.stats[2].base_stat;
  const spAtkStat = currentPokemonData.stats[3].base_stat;
  const spDefStat = currentPokemonData.stats[4].base_stat;
  const spdStat = currentPokemonData.stats[5].base_stat;

  hpEl.textContent = `${hpStat} HP`;
  atkEl.textContent = `${atkStat} Attack`;
  defEl.textContent = `${defStat} Defense`;
  spAtkEl.textContent = `${spAtkStat} Sp. Atk`;
  spDefEl.textContent = `${spDefStat} Sp. Def`;
  spdEl.textContent = `${spdStat} Speed`;
  pokemonName.textContent = name;
  spriteEl.src = sprite;
  spriteEl.alt = name;

  typeContainer.innerHTML = "";
  types.forEach((type) => {
    const typeName = type.type.name;
    const typeElement = document.createElement("div");
    typeElement.classList.add("type");
    typeElement.textContent = typeName;
    typeElement.style.backgroundColor = colors[typeName];
    typeContainer.appendChild(typeElement);
  });

  loadingEl.style.display = "none";
  errorEl.style.display = "none";
  searchResults.classList.remove("hidden");
}

async function fetchPokemon(val, searchId) {
  try {
    const pokemonResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${val}/`
    );

    if (searchId < latestSearchId) {
      console.log(
        `[ID ${searchId}] fetchPokemon: Ignoring stale response for ${val}.`
      );
      return null; // Return null to signal that no valid data should be used
    }

    if (!pokemonResponse.ok) {
      throw new Error(
        `Failed to fetch Pokemon with ID/Name ${val}: ${pokemonResponse.status} ${pokemonResponse.statusText}`
      );
    }

    const data = await pokemonResponse.json();

    if (searchId < latestSearchId) {
      console.log(
        `[ID ${searchId}] fetchPokemon: Ignoring stale JSON data for ${val}.`
      );
      return null;
    }

    return data;
  } catch (error) {
    console.log("Error fetching Pokemon:", error);
    return null;
  }
}

async function fetchType(type) {
  try {
    const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}/`);

    if (!typeResponse.ok) {
      throw new Error(
        `Failed to fetch Pokemon type with ID/Name ${type}: ${typeResponse.status} ${typeResponse.statusText}`
      );
    }

    const typeData = await typeResponse.json();
    return typeData;
  } catch (error) {
    console.log("Error fetching type:", error);
    return null;
  }
}

async function getPokemonCount() {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon-species/?limit=1"
    );

    if (!response.ok)
      throw new Error(
        `Failed to fetch total Pokemon count: ${response.status}, ${response.statusText}`
      );

    const data = await response.json();
    pokemonCount = data.count;
    return data;
  } catch (error) {
    console.error("Error initializing Pokemon count:", error);
  }
}

function colorBar(stat, bar) {
  if (stat >= 150) {
    bar.style.backgroundColor = "#00a63e";
  } else if (stat >= 110) {
    bar.style.backgroundColor = "#9ae600";
  } else if (stat >= 75) {
    bar.style.backgroundColor = "#ffe23dff";
  } else if (stat >= 50) {
    bar.style.backgroundColor = "#ffbb00ff";
  } else {
    bar.style.backgroundColor = "#ff6467";
  }
}

function saveTeamName() {
  const newName = teamName.textContent.trim();
  currentTeamName = newName;
  teamName.classList.remove("editing-style");
  teamName.contentEditable = "false";
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem("team", JSON.stringify(currentTeam));
  localStorage.setItem("teamName", JSON.stringify(currentTeamName));
}

// todo ideas: have the option to create multiple teams
