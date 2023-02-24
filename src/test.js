import { debounce } from "./utils.js";
const x = (y, z) => y + z;
const debouncedX = debounce(1000, x, "on cooldown");
console.log(debouncedX(1, 2));
console.log(debouncedX(1, 2));
setTimeout(() => {
  console.log(debouncedX(1, 2));
  console.log(debouncedX(1, 2));
}, 1000);
