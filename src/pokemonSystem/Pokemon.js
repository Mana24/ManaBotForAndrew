import { choose, getRandomInt } from "../utils.js";

export default class Pokemon {
  static pokemonList = [
    "Bulbasaur",
    "Charmander",
    "Squirtle",
    "Caterpie",
    "Butterfree",
    "Weedle",
    "Pidgey",
    "Rattata",
    "Pikachu",
    "Sandshrew",
    "Nidoran",
    "Vulpix",
    "Jigglypuff",
    "Oddish",
    "Diglett",
    "Psyduck",
    "Mankey",
    "Abra",
    "Ponyta",
    "Horsea",
    "Magikarp",
    "Staryu",
    "Ditto",
    "Eevee",
    "Snorlax",
    "Articuno",
    "Dratini",
    "Mew",
    "Dragonite",
    "Goldeen",
  ];

  static natureList = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quite",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky",
  ];

  // This could use some major refactoring
  static statNameArray = [
    ["hp", "HP"],
    ["atk", "Attack"],
    ["def", "Defense"],
    ["spatk", "Sp. Atk"],
    ["spdef", "Sp. Def"],
    ["spd", "Speed"],
  ]
  static statNameMap = new Map(Pokemon.statNameArray);
  static genStats(min, max) {
    return {
      hp: getRandomInt(min, max),
      atk: getRandomInt(min, max),
      def: getRandomInt(min, max),
      spatk: getRandomInt(min, max),
      spdef: getRandomInt(min, max),
      spd: getRandomInt(min, max),
    };
  }

  constructor({ type, gender, nature, name, stats } = {}) {
    this.type = type || choose(Pokemon.pokemonList);
    this.gender = gender || Math.random > 0.5 ? "boy" : "girl";
    this.nature = nature || choose(Pokemon.natureList);
    this.stats = stats || Pokemon.genStats(10, 100);
    this.name = name;
  }

  static statSum(pokemon) {
    let sum = 0;
    for (const [key, name] of Pokemon.statNameArray) {
      sum += pokemon.stats[key]; 
    }
    return sum;
  }

  static listStats(pokemon, seperator = ' ') {
    const output = [];
    for (const [key, name] of Pokemon.statNameArray) {
      output.push( `${name}: ${pokemon.stats[key]}`);
    }
    return output.join(seperator);
  }

  static levelUp(pokemon, statIncrease = 1) {
    const [stat, statName] = choose(Pokemon.statNameArray);
    const oldVal = pokemon.stats[stat];
    pokemon.stats[stat] += statIncrease;
    const newVal = pokemon.stats[stat];

    return {stat, newVal, oldVal};
  }

  // Returns true if it won or false if it lost
  static battle(firstPokemon, secondPokemon) {
    return Pokemon.statSum(firstPokemon) > Pokemon.statSum(secondPokemon);
  }
}
