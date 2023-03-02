import path from "path";
import Pokemon from "../pokemonSystem/Pokemon.js";
import Trainer from "../pokemonSystem/Trainer.js";
import TrainerRepo from "../repos/TrainerRepo.js";
import { cooldownCommand } from "../userCooldown.js";
import { __dirname, choose, getSecondaryCommand, removeAtSymbol } from "../utils.js";

const trainerPath = path.join(__dirname, "../trainers.json");
const trainerRepo = new TrainerRepo(trainerPath, true);

const globalCooldown = 2000; // ms
const activityCooldown = 1000 * 60 * 20; // 20 mins

const catchChance = 0.65;
const catchAttemptMessage = (pokename, displayName) =>
   `A wild ${pokename.type} appears! ${displayName} throws a Pokeball! `;

const noPokemonMessage = (displayName) => `Sorry, ${displayName}, you don't currently have a pokemon. Try typing !catch`

async function handleCatch({ user, displayName }) {
   const pokemon = new Pokemon();

   if (Math.random() > catchChance)
      return (
         catchAttemptMessage(pokemon, displayName) +
         "Oh no! The wild Pokemon got away! Better luck next time"
      );

   let trainer = await trainerRepo.getTrainer(user);
   if (trainer) {
      trainer.pokemons.push(pokemon);
      await trainerRepo.updateTrainer(user, trainer);
   } else {
      trainer = new Trainer(user, displayName, pokemon);
      await trainerRepo.addTrainer(trainer);
   }

   return (
      catchAttemptMessage(pokemon, displayName) +
      "Heck yeah! You caught the wild Pokemon!"
   );
}

function handleCatchCooldown({displayName}) {
   return `@${displayName} You didn't see any Pokemon while searching in the tall grass, try again in a short while!`
}

async function handleInfo({ user, displayName }) {
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      return noPokemonMessage(displayName);
   }
   const pokemon = trainer.pokemons[trainer.pokemons.length - 1];
   return `${displayName}, your new Pokemon is a ${pokemon.gender}! Take good care of ${pokemon.gender === 'boy' ? 'him' : 'her'} Your cute Pokemon's nature is ${pokemon.nature}! What a great find! May your adventures together be grand!`;
}

const statComments = [
  "Seems like a good start!",
  "Train your new friend well!",
  "A great new beginning!",
  "You are ready to take on other trainers!",
  "Ooooh, this one likes to be pet!",
  "Looks really strong!",
  "Wow, looks very fast!",
  "This Pokemon seems to have bonded with you right away!",
  "Are you ready to face the challenges that lie ahead?",
];

async function handleStats({user, displayName}) {
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      return noPokemonMessage(displayName);
   }
   const pokemon = trainer.pokemons[trainer.pokemons.length - 1];

   return `${displayName}, your new Pokemon has the following stats: ${Pokemon.listStats(pokemon)} ${choose(statComments)}`
}

const nameFail = (displayName) => `${displayName}, your new Pokemon is unnamed. Try giving it a name like this '!pname Sir McMuffin'`
async function handleName({ user, words, displayName }) { 
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      return noPokemonMessage(displayName);
   }

   // Tell people their pokemon name
   const pokemon = trainer.pokemons[trainer.pokemons.length - 1];
   if (pokemon?.name) return `${displayName}, your Pokemon is named ${pokemon.name}. What a lovely name!`


   // Give pokemon a name
   words.shift(); // remove first element, i.e. the command word
   const name = words.join(' ').trim();
   if (!name) return nameFail(displayName);

   pokemon.name = name;
   await trainerRepo.updateTrainer(user, trainer);
   return `${displayName}, Congratulations on naming your new Pokemon ${name}. A name to remember`
}

async function handleBattle({ user, words, displayName }, disableCooldown) {
   // Check if user has a pokemon
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      disableCooldown?.call();
      return noPokemonMessage(displayName);
   }
   const firstPokemon = Trainer.latestPokemon(trainer);

   // Check if second user has a pokemon
   const secondTrainerUsername = removeAtSymbol(getSecondaryCommand(words))?.toLowerCase();
   if (!secondTrainerUsername) {
      return `${trainer.displayName}, you can battle ${firstPokemon.name || "your " + firstPokemon.type} with another trainer's Pokemon like this -> '!pokebattle @trainerUsername'` // "WIP INSTRUCTIONS" 
   }

   if (secondTrainerUsername === trainer.username) {
      return `${trainer.displayName}, Cheeky but you can't go to battle with yourself LUL`
   }

   const secondTrainer = await trainerRepo.getTrainer(secondTrainerUsername);
   if (!secondTrainer || secondTrainer.pokemons.length === 0) {
      return `${displayName}, your battle target doesn't have a pokemon` //"WIP TARGET DOESN'T HAVE POKEMON"
   }
   const secondPokemon = Trainer.latestPokemon(secondTrainer); 


   // Determine winner
   const won = Pokemon.battle(firstPokemon, secondPokemon);
   const winner = won ? trainer : secondTrainer;
   let wonMessage = `${displayName}, Your Pokemon ${firstPokemon.name || firstPokemon.type} won against ${secondTrainer.displayName}'s Pokemon ${secondPokemon.name || secondPokemon.type}.` // "WIP YOU WIN"
   let lostMessage = `${displayName}, Your Pokemon ${firstPokemon.name || firstPokemon.type} fought bravely but lost against ${secondTrainer.displayName}'s Pokemon ${secondPokemon.name || secondPokemon.type}.` // "WIP YOU LOST"

   // level them up
   const didLevel = Math.random() < 0.3;
   let levelUpData = null;
   let levelMessage = null;
   if (didLevel) {
      const winnerPokemon = Trainer.latestPokemon(winner);
      levelUpData = Pokemon.levelUp(winnerPokemon);
      levelMessage = `${winner.displayName}'s Pokemon ${winnerPokemon.name || winnerPokemon.type} leveled up! ${Pokemon.statNameMap.get(levelUpData.stat)}: ${levelUpData.oldVal} -> ${levelUpData.newVal}` // "WIP YOU LEVELED UP";
      await trainerRepo.updateTrainer(winner.username, winner);
   }
   

   return `${won ? wonMessage : lostMessage} ${didLevel ? levelMessage : ''}`
}

function handleBattleCooldown({displayName}) {
   return `@${displayName} Your Pokemon is too tired to fight right now! Give them a short rest and try again in a short while!`
}

async function handleWalk({user, displayName}, disableCooldown) {
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      disableCooldown?.call();
      return noPokemonMessage(displayName);
   }
   const pokemon = Trainer.latestPokemon(trainer);
   const pokemonPronoun = pokemon.gender === "boy" ? 'he' : 'she';
   
   if (Math.random() > 0.5) {
      return `${displayName} takes ${pokemon.name || 'their ' + pokemon.type} on a walk! It looks like ${pokemonPronoun} has to go! Ah, that was a nice ${Math.random() > 0.5 ? 'poop' : 'pee'}! Good ${pokemon.gender}, ${pokemon.name || pokemon.type}!`;
   }
   else {
      return `${displayName} takes ${pokemon.name || 'their ' + pokemon.type} on a walk! It doesn't look like ${pokemonPronoun} has to go potty yet! Good ${pokemon.gender}, ${pokemon.name || pokemon.type}!`
   }
}

function handleWalkCooldown({displayName}) {
   return `@${displayName} Your Pokemon wants to snuggle with you instead of walking! Maybe try walking them later!`;
}

async function handleFeed({user, displayName}, disableCooldown) {
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      disableCooldown?.call();
      return noPokemonMessage(displayName);
   }
   const pokemon = Trainer.latestPokemon(trainer);
   const pokemonPronoun = pokemon.gender === "boy" ? 'He' : 'She';

   return `${displayName} feeds ${pokemon.name || 'their ' + pokemon.type}! ${pokemon.name || pokemonPronoun} gobbled up the treat! Good ${pokemon.gender}!`
}

async function handleFeedCooldown({user, displayName}) {
   const trainer = await trainerRepo.getTrainer(user);
   if (!trainer || trainer.pokemons.length === 0) {
      return noPokemonMessage(displayName);
   }
   const pokemon = Trainer.latestPokemon(trainer);
   const pokemonPronoun = pokemon.gender === "boy" ? 'He' : 'She';

   return `@${displayName} Oof! Your Pokemon is stuffed! ${pokemonPronoun} is ignoring the treat!`
}

export default [
   // [CommandName in lowerCase, command function]
   ["catch", cooldownCommand(handleCatch, handleCatchCooldown, 5 * 1000 * 60, "catch")],
   ["pinfo", handleInfo],
   ["pstats", handleStats],
   ["pname", handleName],
   ["pbattle", cooldownCommand(handleBattle, handleBattleCooldown, activityCooldown, "pbattle")],
   ["pwalk", cooldownCommand(handleWalk, handleWalkCooldown, activityCooldown, "pwalk")],
   ["pfeed", cooldownCommand(handleFeed, handleFeedCooldown, activityCooldown, "pfeed")]
];
