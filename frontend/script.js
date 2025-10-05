// Camera button and receipt upload logic
// const cameraBtn = document.getElementById('cameraBtn');
// const receiptInput = document.getElementById('receiptInput');
// const resultBox = document.getElementById('resultBox');

// if (cameraBtn && receiptInput) {
//   cameraBtn.addEventListener('click', () => receiptInput.click());
//   receiptInput.addEventListener('change', async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     resultBox.style.display = 'block';
//     resultBox.innerHTML = 'Uploading...';
//     const formData = new FormData();
//     formData.append('receipt', file);
//     try {
//       const res = await fetch('http://localhost:5000/api/items/scan-receipt', {
//         method: 'POST',
//         body: formData,
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Upload failed');
//       let html = `<h4>Purchase Date:</h4><div>${data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString() : 'Not found'}</div>`;
//       html += '<h4>Items:</h4><ul>';
//       if (data.items && data.items.length > 0) {
//         html += data.items.map(item => `<li>${item.name}${item.price ? ` - $${item.price.toFixed(2)}` : ''}</li>`).join('');
//       } else {
//         html += '<li>No items found</li>';
//       }
//       html += '</ul>';
//       resultBox.innerHTML = html;
//     } catch (err) {
//       resultBox.innerHTML = `<span style="color:#ff6b6b">${err.message}</span>`;
//     }
//   });
// }
// const counters = document.querySelectorAll('.count');
// const statsSection = document.querySelector('.growing-library');

// // Animate numbers when section scrolls into view
// function animateCount(el) {
//   const target = +el.getAttribute('data-target');
//   const duration = 2000;
//   const step = target / (duration / 16);

//   let current = 0;
//   const interval = setInterval(() => {
//     current += step;
//     if (current >= target) {
//       el.textContent = target >= 1000 ? (target / 1000) + "K+" : target.toLocaleString();
//       clearInterval(interval);
//     } else {
//       el.textContent = Math.floor(current).toLocaleString();
//     }
//   }, 16);
// }

// // Animate stats when visible
// const observer = new IntersectionObserver(
//   entries => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         document.querySelectorAll('.stat').forEach((el, i) => {
//           setTimeout(() => el.classList.add('visible'), i * 300);
//         });
//         counters.forEach(animateCount);
//         observer.disconnect();
//       }
//     });
//   },
//   { threshold: 0.5 }
// );

// observer.observe(statsSection);

// // Auto-load icons and add floating animation
// async function loadFloatingIcons() {
//   const floatingIconsContainer = document.querySelector('.floating-icons');
//   const iconFilenames = ["passionfruit.svg", "blueberry.svg", "mango.svg", "strawberry.svg"]; // replace with your list

//   iconFilenames.forEach((filename, index) => {
//     const img = document.createElement('img');
//     img.src = `icons/${filename}`;
//     img.classList.add('float-icon', `icon${index+1}`);
//     img.alt = filename.split(".")[0];

//     // Random position
//     img.style.top = `${Math.random() * 80 + 10}%`;
//     img.style.left = `${Math.random() * 80 + 10}%`;

//     // Random drift animation
//     const driftClasses = ["drift1", "drift2", "drift3"];
//     img.style.animation = `${driftClasses[index % driftClasses.length]} ${15 + index*5}s ease-in-out infinite`;

//     floatingIconsContainer.appendChild(img);
//   });
// }

// // Run after DOM loads
// window.addEventListener('DOMContentLoaded', loadFloatingIcons);


// frontend/script.js

const API_BASE_URL = 'http://localhost:5001/api';

// Camera button functionality
document.getElementById('cameraBtn').addEventListener('click', function() {
  // Trigger the hidden file input when camera button is clicked
  document.getElementById('receiptInput').click();
});

// Handle file selection/photo capture
document.getElementById('receiptInput').addEventListener('change', async function(event) {
  const file = event.target.files[0];
  
  if (file) {
    console.log('Photo captured/selected:', file.name);
    
    // Show loading state
    const resultBox = document.getElementById('resultBox');
    resultBox.style.display = 'block';
    resultBox.innerHTML = '<p>Processing receipt...</p>';
    
    try {
      // For hackathon demo - simulate receipt processing
      // In production, you'd send this to an OCR API
      await processReceipt(file);
    } catch (error) {
      console.error('Error processing receipt:', error);
      resultBox.innerHTML = '<p>Error processing receipt. Please try again.</p>';
    }
  }
});

// Process the receipt (simulate for hackathon)
async function processReceipt(file) {
  const resultBox = document.getElementById('resultBox');
  
  // For demo purposes - simulate OCR results
  // In production, you'd use Google Vision API, AWS Textract, or similar
  
  // Simulated scanned items (replace with actual OCR later)
  const mockScannedItems = [
    "chicken breast",
    "rice", 
    "tomatoes",
    "onions",
    "garlic",
    "olive oil"
  ];
  
  // Display scanned items
  resultBox.innerHTML = `
    <h3>📸 Receipt Scanned Successfully!</h3>
    <div class="scanned-items">
      <h4>Items Found:</h4>
      <ul>
        ${mockScannedItems.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </div>
    <button id="findRecipesBtn" class="action-btn">
      🍳 Find Recipes with These Items
    </button>
    <button id="saveItemsBtn" class="action-btn">
      💾 Save to My Pantry
    </button>
  `;
  
  // Add event listeners to new buttons
  document.getElementById('findRecipesBtn').addEventListener('click', () => {
    findRecipes(mockScannedItems);
  });
  
  document.getElementById('saveItemsBtn').addEventListener('click', () => {
    saveItems(mockScannedItems);
  });
}

// Find recipes with scanned items
async function findRecipes(ingredients) {
  const resultBox = document.getElementById('resultBox');
  
  try {
    resultBox.innerHTML += '<p>🔍 Finding recipes...</p>';
    
    const response = await fetch(`${API_BASE_URL}/recipes/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        ingredients: ingredients,
        useAPI: true 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      displayRecipes(data.recipes);
    }
  } catch (error) {
    console.error('Error finding recipes:', error);
    resultBox.innerHTML += '<p>Could not find recipes. Please try again.</p>';
  }
}

// Display recipe results
function displayRecipes(recipes) {
  const resultBox = document.getElementById('resultBox');
  
  let recipesHTML = '<div class="recipes-section"><h3>🍽️ Suggested Recipes:</h3>';
  
  // Show recipes you can make now
  if (recipes.canMakeNow && recipes.canMakeNow.length > 0) {
    recipesHTML += '<h4>✅ You can make now:</h4><ul>';
    recipes.canMakeNow.forEach(recipe => {
      recipesHTML += `<li><strong>${recipe.name}</strong> - ${recipe.prepTime + recipe.cookTime} mins</li>`;
    });
    recipesHTML += '</ul>';
  }
  
  // Show API recipes
  if (recipes.fromAPI && recipes.fromAPI.length > 0) {
    recipesHTML += '<h4>🌟 More suggestions:</h4><ul>';
    recipes.fromAPI.forEach(recipe => {
      recipesHTML += `
        <li>
          <strong>${recipe.name}</strong>
          ${recipe.missedIngredientCount > 0 ? 
            `<br><small>Missing ${recipe.missedIngredientCount} ingredients</small>` : 
            '<br><small>✓ All ingredients available!</small>'}
        </li>`;
    });
    recipesHTML += '</ul>';
  }
  
  recipesHTML += '</div>';
  resultBox.innerHTML += recipesHTML;
}

// Save items to pantry
async function saveItems(items) {
  const resultBox = document.getElementById('resultBox');
  
  // For demo - just show success
  resultBox.innerHTML += '<p>✅ Items saved to your pantry!</p>';
  
  // In production, you'd save to database
  // await fetch(`${API_BASE_URL}/pantry/add`, ...)
}

// Animate stats on page load
document.addEventListener('DOMContentLoaded', function() {
  // Animate counters
  const counters = document.querySelectorAll('.count');
  
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const increment = target / 100;
    
    const updateCounter = () => {
      const current = +counter.innerText;
      
      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCounter, 20);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };
    
    updateCounter();
  });
  
  // Show stats with animation
  const stats = document.querySelectorAll('.stat');
  stats.forEach((stat, index) => {
    setTimeout(() => {
      stat.classList.add('visible');
    }, index * 200);
  });
  
  // Add floating food icons
  addFloatingIcons();
});

// Add floating food icons for visual effect
function addFloatingIcons() {
  const container = document.querySelector('.floating-icons');
  const icons = ['🥗', '🍕', '🍜', '🥘', '🍰', '🥪', '🍲', '🌮'];
  
  icons.forEach((icon, index) => {
    const iconElement = document.createElement('div');
    iconElement.className = 'float-icon';
    iconElement.textContent = icon;
    iconElement.style.left = `${Math.random() * 100}%`;
    iconElement.style.top = `${Math.random() * 100}%`;
    iconElement.style.fontSize = `${30 + Math.random() * 20}px`;
    iconElement.style.animationName = `drift${(index % 3) + 1}`;
    iconElement.style.animationDuration = `${15 + Math.random() * 10}s`;
    iconElement.style.animationIterationCount = 'infinite';
    container.appendChild(iconElement);
  });
}