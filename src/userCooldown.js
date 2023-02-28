const commands = new Map();
// commands
// --    users
// --       -- Date.now() 

export function cooldownCommand(commandHandler, cooldownHandler = () => undefined, cooldown, commandKey) {
   commands.set(commandKey, new Map());
   return async function (args) {
      const commandUsers = commands.get(commandKey);
      const lastcalled = commandUsers.get(args.user);
      let cooldownDisabled = false;
      const cooldownDisabler = () => cooldownDisabled = true;
      const now = Date.now()
      if (!lastcalled) {
         const commandReturn = await commandHandler(args, cooldownDisabler);
         if (!cooldownDisabled) {
         commandUsers.set(args.user, now);
         }
         return commandReturn;
      }
      else if((lastcalled + cooldown) > now) {
         const cooldownData = {
            cooldown, 
            lastcalled, 
            now, 
            timeRemaining: cooldown + lastcalled - now
         };
         return await cooldownHandler(args, cooldownData);
      }
      else {
         commandUsers.set(args.user, now);
         return await commandHandler(args);
      }
   }
}

export function basicCooldownHandler(commandArgs, cooldownData) {
   const {timeRemaining} = cooldownData
   return `${commandArgs.displayName}, the command you used is on cooldown. Try again in ${timeRemaining > 60000 ? `${Math.floor(timeRemaining / 60000)} minutes` : `${Math.floor(timeRemaining / 1000)} seconds` }`
}