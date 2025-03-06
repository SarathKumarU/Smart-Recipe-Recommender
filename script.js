
const apiKey = '7770b739ad564135957d0af272c3d228';  // Replace with your Spoonacular API key
document.getElementById('get-recipes').addEventListener('click', () => {
    const ingredients = document.getElementById('ingredients').value;
    const diet = document.getElementById('diet').value;

    // Check dietary preferences before fetching recipes
    if (validateDietaryPreferences(ingredients, diet)) {
        fetchRecipeFromAPI(ingredients, diet);
    } else {
        displayError(`It seems like the ingredients you entered conflict with the selected '${diet}' diet.`);
    }
});

// Validate the user's input against multiple dietary preferences
function validateDietaryPreferences(ingredients, diet) {
    const nonVegKeywords = ["chicken", "beef", "pork", "fish", "lamb"];
    const nonVeganKeywords = ["egg", "cheese", "milk", "butter", "yogurt", "honey"];
    const glutenKeywords = ["wheat", "barley", "rye", "pasta", "bread"];
    const highCarbKeywords = ["rice", "pasta", "bread", "potato", "sugar", "corn", "oats"];
    
    const ingredientsArray = ingredients.toLowerCase().split(",").map(ingredient => ingredient.trim());

    // Validate for Vegetarian and Vegan diets
    if (diet === "vegetarian") {
        return !ingredientsArray.some(ingredient => nonVegKeywords.includes(ingredient));
    } else if (diet === "vegan") {
        return !ingredientsArray.some(ingredient => nonVegKeywords.includes(ingredient) || nonVeganKeywords.includes(ingredient));
    }
    
    // Validate for Gluten-Free diet
    if (diet === "gluten free") {
        return !ingredientsArray.some(ingredient => glutenKeywords.includes(ingredient));
    }

    // Validate for Keto diet (restricting high-carb ingredients)
    if (diet === "keto") {
        return !ingredientsArray.some(ingredient => highCarbKeywords.includes(ingredient));
    }

    // If no specific diet or valid diet, return true
    return true;
}

// Display error for invalid ingredient entries
function displayError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    setTimeout(() => {
        errorElement.textContent = '';
    }, 3000);
}

async function fetchRecipeFromAPI(ingredients, diet) {
    try {
        document.getElementById('loading').style.display = 'block';
        let url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&apiKey=${apiKey}`;
        if (diet !== "none") {
            url += `&diet=${diet}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        document.getElementById('loading').style.display = 'none';
        displayRecipes(data);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert("Error fetching recipes, please try again later.");
    }
}

function displayRecipes(recipes) {
    const recipesContainer = document.getElementById('recipes-container');
    recipesContainer.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button onclick="fetchInstructions(${recipe.id})">View Instructions</button>
            <button onclick="addToFavorites(${recipe.id})">Add to Favorites</button>
        `;
        recipesContainer.appendChild(recipeCard);
    });
}

async function fetchInstructions(recipeId) {
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipeDetails = await response.json();
        showModal(recipeDetails);
    } catch (error) {
        console.error('Error fetching instructions:', error);
        alert("Failed to fetch recipe instructions.");
    }
}

function showModal(recipeDetails) {
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.querySelector('.close');

    document.getElementById('recipe-title').textContent = recipeDetails.title;
    const ingredientsList = document.getElementById('recipe-ingredients');
    ingredientsList.innerHTML = recipeDetails.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');

    const instructions = document.getElementById('recipe-instructions');
    instructions.innerHTML = recipeDetails.instructions || 'No instructions available';

    modal.style.display = 'block';

    closeBtn.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function addToFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(recipeId)) {
        favorites.push(recipeId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    displayFavorites();
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '';

    favorites.forEach(async recipeId => {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
        const recipe = await response.json();

        const favoriteCard = document.createElement('div');
        favoriteCard.classList.add('recipe-card');
        favoriteCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button onclick="fetchInstructions(${recipe.id})">View Instructions</button>
            <button onclick="removeFromFavorites(${recipe.id})">Remove from Favorites</button>
        `;
        favoritesContainer.appendChild(favoriteCard);
    });
}

function removeFromFavorites(recipeId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(id => id !== recipeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

document.getElementById('clear-shopping-list').addEventListener('click', () => {
    document.getElementById('shopping-list').innerHTML = '';
});

function generateShoppingList(recipeDetails) {
    const shoppingListModal = document.getElementById('shopping-list-modal');
    const closeBtn = shoppingListModal.querySelector('.close');

    const shoppingList = document.getElementById('shopping-list');
    shoppingList.innerHTML = recipeDetails.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');

    shoppingListModal.style.display = 'block';

    closeBtn.onclick = function () {
        shoppingListModal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == shoppingListModal) {
            shoppingListModal.style.display = 'none';
        }
    }
}