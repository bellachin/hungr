// Camera button and receipt upload logic
const cameraBtn = document.getElementById('cameraBtn');
const receiptInput = document.getElementById('receiptInput');
const resultBox = document.getElementById('resultBox');

if (cameraBtn && receiptInput) {
  cameraBtn.addEventListener('click', () => receiptInput.click());
  receiptInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    resultBox.style.display = 'block';
    resultBox.innerHTML = 'Uploading...';
    const formData = new FormData();
    formData.append('receipt', file);
    try {
      const res = await fetch('http://localhost:5000/api/items/scan-receipt', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      let html = `<h4>Purchase Date:</h4><div>${data.purchaseDate ? new Date(data.purchaseDate).toLocaleDateString() : 'Not found'}</div>`;
      html += '<h4>Items:</h4><ul>';
      if (data.items && data.items.length > 0) {
        html += data.items.map(item => `<li>${item.name}${item.price ? ` - $${item.price.toFixed(2)}` : ''}</li>`).join('');
      } else {
        html += '<li>No items found</li>';
      }
      html += '</ul>';
      resultBox.innerHTML = html;
    } catch (err) {
      resultBox.innerHTML = `<span style="color:#ff6b6b">${err.message}</span>`;
    }
  });
}
const counters = document.querySelectorAll('.count');
const statsSection = document.querySelector('.growing-library');

// Animate numbers when section scrolls into view
function animateCount(el) {
  const target = +el.getAttribute('data-target');
  const duration = 2000;
  const step = target / (duration / 16);

  let current = 0;
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target >= 1000 ? (target / 1000) + "K+" : target.toLocaleString();
      clearInterval(interval);
    } else {
      el.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
}

// Animate stats when visible
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat').forEach((el, i) => {
          setTimeout(() => el.classList.add('visible'), i * 300);
        });
        counters.forEach(animateCount);
        observer.disconnect();
      }
    });
  },
  { threshold: 0.5 }
);

observer.observe(statsSection);

// Auto-load icons and add floating animation
async function loadFloatingIcons() {
  const floatingIconsContainer = document.querySelector('.floating-icons');
  const iconFilenames = ["passionfruit.svg", "blueberry.svg", "mango.svg", "strawberry.svg"]; // replace with your list

  iconFilenames.forEach((filename, index) => {
    const img = document.createElement('img');
    img.src = `icons/${filename}`;
    img.classList.add('float-icon', `icon${index+1}`);
    img.alt = filename.split(".")[0];

    // Random position
    img.style.top = `${Math.random() * 80 + 10}%`;
    img.style.left = `${Math.random() * 80 + 10}%`;

    // Random drift animation
    const driftClasses = ["drift1", "drift2", "drift3"];
    img.style.animation = `${driftClasses[index % driftClasses.length]} ${15 + index*5}s ease-in-out infinite`;

    floatingIconsContainer.appendChild(img);
  });
}

// Run after DOM loads
window.addEventListener('DOMContentLoaded', loadFloatingIcons);
