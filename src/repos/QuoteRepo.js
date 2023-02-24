import Repo from './Repo.js';
export default class QuoteRepo extends Repo {
   constructor(filePath, doBackuptFile) {
      super(filePath, doBackuptFile);
   }

   assertCategory(repo, category) {
      const foundCategory = repo[category];
      if (foundCategory === undefined) {
         throw new Error("Category not found");
      }
   }

   // Get Quote Category
   async getCategory(category) {
      const repo = await this.getAll();
      this.assertCategory(repo, category)
      return repo[category];
   }

   // Get Quote from a Category
   async getQuote(category, index) {
      const foundCategory = await this.getCategory(category);
      return foundCategory[index];
   }

   // Add Quote to Category
   async addQuote(category, quote) {
      const repo = await this.getAll();
      this.assertCategory(repo, category)
      repo[category].push(quote);
      await this.writeAll(repo);
      return repo[category].length - 1; // Return index of new quote
   }

   // Add a Category
   async addCategory(category) {
      const repo = await this.getAll();
      if (repo[category.toLowerCase()] !== undefined) {
         throw new Error('Category already exists');
      }
      repo[category.toLowerCase()] = [];
      await this.writeAll(repo);
   }

   // Delete Quote from a Category
   async deleteQuote(category, index) {
      const repo = await this.getAll();
      this.assertCategory(repo, category)
      if (repo[category].length <= index) {
         throw new Error("Index out of bounds");
      }
      repo[category].splice(index, 1);
      await this.writeAll(repo);
   }

   // Delete a Category
   async deleteCategory(category) {
      const repo = await this.getAll();
      delete repo[category];
      await this.writeAll();
   }

   // Update a Quote 
   async updateQuote(category, index, newQuote) {
      const repo = await this.getAll();
      this.assertCategory(repo, category);
      if (repo[category].length <= index) {
         throw new Error("Index out of bounds");
      }
      repo[category][index] = newQuote;
      await this.writeAll(repo);
   }
}