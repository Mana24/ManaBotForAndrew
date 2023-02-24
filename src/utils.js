import { fileURLToPath } from "url";
import path from "path";

export function isModOrBroadcaster(msg) {
  return msg.userInfo.isMod || msg.userInfo.isBroadcaster;
}

/**
 * gets a secondary command like the "add" in "!stschant add STS STS STS".
 * Return undefined if there's no secondary command
 * @param { String[] } words
 * */
export function getSecondaryCommand(words) {
  return words[1]?.toLowerCase();
}

export function removeAtSymbol(word) {
  return word?.replace(/^@/g, "");
}

/**
 * Returns a random element from an array
 * @param {any[]} array The array to darw from
 * @returns {any} The element chosen
 */
export function choose(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * A higher order function taht returns a debounced version of another function
 * @param {Number} cooldown The cooldown in milliseconds
 * @param {(any) => any} callback The function to be debounced
 * @param {*} failReturn The return value if the function is called while on cooldown
 * @returns The debounced version of *callback*
 */
export function debounce(cooldown, callback, failReturn) {
  let lastcalled = NaN;
  return function (...args) {
    const now = Date.now();
    const onCooldown = (lastcalled + cooldown) > now;
	 // console.log(lastcalled + cooldown, now, onCooldown);
    if (onCooldown) {
      return failReturn;
    } else {
      lastcalled = now;
      return callback(...args);
    }
  };
}
