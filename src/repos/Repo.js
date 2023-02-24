import { promises as fs } from 'fs'
import path from 'path';
export default class Repo {
   constructor(filePath, doBackuptFile, startingObject) {
      this.filePath = filePath;
      this.ready = this.init(doBackuptFile, startingObject);
   }

   async init(doBackuptFile, startingObject) {
      try {
         await fs.access(this.filePath);
      }
      catch (err) {
         if (err.code === 'ENOENT') {
            await this.initRepoFile(startingObject);
         }
         else {
            throw err;
         }
      }
      if (doBackuptFile) {
         await fs.copyFile(this.filePath, this.filePath + '.bkp');
         console.log('Backed up repo file');
      }
      console.log("Initialized a repo");
   }

   async initRepoFile(startingObject) {
      const dirPath = path.dirname(path.resolve(this.filePath))
      await fs.mkdir(dirPath, { recursive: true })
      await fs.writeFile(this.filePath, JSON.stringify(startingObject || {}));
   }

   // Get All
   async getAll() {
      await this.ready;
      return JSON.parse(await fs.readFile(this.filePath));
   }

   // Write All
   async writeAll(repo) {
      await this.ready;
      await fs.writeFile(this.filePath, JSON.stringify(repo));
   }
}