//api stuff for recipes 

// backend/services/spoonacularService.js
const axios = require('axios');

class SpoonacularService {
  constructor() {
    this.apiKey = process.env.SPOONACULAR_API_KEY;
    this.baseUrl = 'https://api.spoonacular.com';
    
    if (!this.apiKey) {
      console.error('WARNING: Spoonacular API key not found!');
    }
  }

  /**
   * Find recipes by ingredients - Main function for your feature
   * @param {Array} ingredients - Array of ingredient strings from scanned receipt
   * @param {Number} number - How many recipes to return
   */
  async findRecipesByIngredients(ingredients, number = 5) {
    try {
      console.log('Searching recipes for ingredients:', ingredients);
      
      const response = await axios.get(
        `${this.baseUrl}/recipes/findByIngredients`,
        {
          params: {
            ingredients: ingredients.join(','),
            number: number,
            ranking: 1, // 1 = maximize used ingredients, 2 = minimize missing ingredients
            ignorePantry: true, // Assumes user has basic pantry items
            apiKey: this.apiKey
          }
        }
      );

      console.log(`Found ${response.data.length} recipes`);
      
      // Transform to simpler format
      const recipes = response.data.map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        usedIngredients: recipe.usedIngredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          original: ing.original
        })),
        missedIngredients: recipe.missedIngredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          original: ing.original
        })),
        unusedIngredients: recipe.unusedIngredients.map(ing => ing.name),
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
        likes: recipe.likes
      }));

      return recipes;
    } catch (error) {
      console.error('Spoonacular API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch recipes from Spoonacular');
    }
  }

  /**
   * Get detailed recipe information including instructions
   * @param {Number} recipeId - The recipe ID from findRecipesByIngredients
   */
  async getRecipeDetails(recipeId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recipes/${recipeId}/information`,
        {
          params: {
            apiKey: this.apiKey,
            includeNutrition: false // Set to true if you want nutrition info
          }
        }
      );
      
      // Parse instructions
      let instructions = [];
      if (response.data.analyzedInstructions && response.data.analyzedInstructions[0]) {
        instructions = response.data.analyzedInstructions[0].steps.map(step => ({
          number: step.number,
          instruction: step.step,
          ingredients: step.ingredients?.map(ing => ing.name) || [],
          equipment: step.equipment?.map(eq => eq.name) || []
        }));
      } else if (response.data.instructions) {
        // Fallback to plain text instructions
        instructions = [{
          number: 1,
          instruction: response.data.instructions,
          ingredients: [],
          equipment: []
        }];
      }
      
      return {
        id: response.data.id,
        name: response.data.title,
        image: response.data.image,
        servings: response.data.servings,
        readyInMinutes: response.data.readyInMinutes,
        prepTime: response.data.preparationMinutes || 'N/A',
        cookTime: response.data.cookingMinutes || 'N/A',
        sourceUrl: response.data.sourceUrl,
        summary: response.data.summary?.replace(/<[^>]*>?/gm, ''), // Remove HTML tags
        dishTypes: response.data.dishTypes || [],
        diets: response.data.diets || [],
        ingredients: response.data.extendedIngredients.map(ing => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          original: ing.original
        })),
        instructions: instructions,
        tips: response.data.winePairing?.pairingText || null
      };
    } catch (error) {
      console.error('Error getting recipe details:', error.response?.data || error.message);
      throw new Error('Failed to get recipe details');
    }
  }

  /**
   * Get multiple recipe details at once
   * @param {Array} recipeIds - Array of recipe IDs
   */
  async getMultipleRecipeDetails(recipeIds) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/recipes/informationBulk`,
        {
          params: {
            ids: recipeIds.join(','),
            apiKey: this.apiKey,
            includeNutrition: false
          }
        }
      );
      
      return response.data.map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        image: recipe.image,
        summary: recipe.summary?.replace(/<[^>]*>?/gm, ''),
        instructions: recipe.instructions
      }));
    } catch (error) {
      console.error('Error getting bulk recipe details:', error);
      throw error;
    }
  }

  /**
   * Search recipes by query (alternative to ingredient-based search)
   * Useful for general searches like "healthy dinner" or "quick breakfast"
   */
  async searchRecipes(query, diet = null, type = null) {
    try {
      const params = {
        query: query,
        number: 10,
        apiKey: this.apiKey
      };
      
      if (diet) params.diet = diet; // vegetarian, vegan, etc.
      if (type) params.type = type; // main course, dessert, etc.
      
      const response = await axios.get(
        `${this.baseUrl}/recipes/complexSearch`,
        { params }
      );
      
      return response.data.results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get random recipes (good for "Discover" or "Try Something New" feature)
   */
  async getRandomRecipes(number = 3, tags = null) {
    try {
      const params = {
        number: number,
        apiKey: this.apiKey
      };
      
      if (tags) params.tags = tags; // e.g., 'vegetarian,dessert'
      
      const response = await axios.get(
        `${this.baseUrl}/recipes/random`,
        { params }
      );
      
      return response.data.recipes;
    } catch (error) {
      console.error('Random recipes error:', error);
      throw error;
    }
  }
}

module.exports = new SpoonacularService();