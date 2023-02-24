import Repo from "./Repo.js";
export default class TrainerRepo extends Repo {
   constructor(filePath, doBackuptFile) {
      super(filePath, doBackuptFile, []);
   }

   // Add trainer
   async addTrainer(trainer) {
      const repo = await this.getAll();
      repo.push(trainer);
      await this.writeAll(repo);
   }

   // Get trainer
   async getTrainer(username) {
      const repo = await this.getAll();
      return repo.find(trainer => trainer.username === username);
   }

   // Update trainer
   async updateTrainer(username, updatedTrainer) {
      const repo = await this.getAll();
      const trainerIndex = repo.findIndex(trainer => trainer.username === username);
      if (trainerIndex === -1) throw "Trainer not found when trying to update";
      repo[trainerIndex] = updatedTrainer;
      await this.writeAll(repo);
   }

   // Delete trainer
   async deleteTrainer(username) {
      const repo = await this.getAll();
      const trainerIndex = repo.findIndex(trainer => trainer.username === username);
      if (trainerIndex === -1) throw "Trainer not found when trying to delete";
      repo.splice(trainerIndex, 1);
      await this.writeAll(repo);
   }
} 