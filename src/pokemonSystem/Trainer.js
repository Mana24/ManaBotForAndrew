export default class Trainer {
  constructor(username, displayName, ...pokemons) {
    this.username = username;
    this.displayName = displayName;
    this.pokemons = pokemons;
  }

  static latestPokemon(trainer) {
    return trainer.pokemons[trainer.pokemons.length - 1];
  }
}
