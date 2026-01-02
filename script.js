// Load mods data
let modsData = [];

// Fetch mods from JSON file
async function loadMods() {
  try {
    const response = await fetch('mods.json');
    const data = await response.json();
    modsData = data.mods;
    displayFeaturedMods();
    displayRecentMods();
    updateUploadCount();
  } catch (error) {
    console.error('Error loading mods:', error);
  }
}

// Display featured mods
function displayFeaturedMods() {
  const featuredCarousel = document.getElementById('featuredCarousel');
  const featuredMods = modsData.filter(mod => mod.featured || mod.trending);
  
  featuredCarousel.innerHTML = featuredMods.map(mod => `
        <div class="featured-card" onclick="goToDetails(${mod.id})">
            ${mod.trending ? '<span class="trending-badge">TRENDING</span>' : ''}
            <h3>${mod.title}</h3>
            <p>${mod.shortDescription}</p>
        </div>
    `).join('');
}

// Display recent mods
function displayRecentMods() {
  const modsGrid = document.getElementById('modsGrid');
  
  modsGrid.innerHTML = modsData.map(mod => `
        <a href="details.html?id=${mod.id}" class="mod-card">
            <img src="${mod.thumbnail}" alt="${mod.title}" class="mod-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%232d3142\' width=\'200\' height=\'200\'/%3E%3C/svg%3E'">
            <div class="mod-card-content">
                <span class="mod-card-badge">${mod.type}</span>
                <h3 class="mod-card-title">${mod.title}</h3>
                <p class="mod-card-description">${mod.shortDescription}</p>
                <div class="mod-card-footer">
                    <div class="mod-author">
                        <div class="mod-author-avatar" style="background-image: url('${mod.authorAvatar}')"></div>
                        <span>${mod.author}</span>
                    </div>
                    <div class="mod-downloads">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        ${mod.downloads}
                    </div>
                </div>
            </div>
        </a>
    `).join('');
}

// Update upload count
function updateUploadCount() {
  const uploadCount = document.getElementById('uploadCount');
  uploadCount.textContent = `${modsData.length} new`;
}

// Navigate to details page
function goToDetails(modId) {
  window.location.href = `details.html?id=${modId}`;
}

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  if (searchTerm === '') {
    displayRecentMods();
    return;
  }
  
  const filteredMods = modsData.filter(mod =>
    mod.title.toLowerCase().includes(searchTerm) ||
    mod.author.toLowerCase().includes(searchTerm) ||
    mod.game.toLowerCase().includes(searchTerm) ||
    mod.type.toLowerCase().includes(searchTerm)
  );
  
  const modsGrid = document.getElementById('modsGrid');
  
  if (filteredMods.length === 0) {
    modsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">No mods found</p>';
    return;
  }
  
  modsGrid.innerHTML = filteredMods.map(mod => `
        <a href="details.html?id=${mod.id}" class="mod-card">
            <img src="${mod.thumbnail}" alt="${mod.title}" class="mod-card-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%232d3142\' width=\'200\' height=\'200\'/%3E%3C/svg%3E'">
            <div class="mod-card-content">
                <span class="mod-card-badge">${mod.type}</span>
                <h3 class="mod-card-title">${mod.title}</h3>
                <p class="mod-card-description">${mod.shortDescription}</p>
                <div class="mod-card-footer">
                    <div class="mod-author">
                        <div class="mod-author-avatar" style="background-image: url('${mod.authorAvatar}')"></div>
                        <span>${mod.author}</span>
                    </div>
                    <div class="mod-downloads">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        ${mod.downloads}
                    </div>
                </div>
            </div>
        </a>
    `).join('');
});

// Filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    filterButtons.forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    btn.classList.add('active');
    
    const filter = btn.dataset.filter;
    
    if (filter === 'all') {
      displayRecentMods();
      return;
    }
    
    // You can implement more sophisticated filtering here
    // For now, just show all mods
    displayRecentMods();
  });
});

// Load more button
const loadMoreBtn = document.getElementById('loadMoreBtn');
loadMoreBtn.addEventListener('click', () => {
  // In a real app, this would load more mods from the server
  alert('Load more functionality - Add more mods to mods.json to see more results!');
});

// Initialize
loadMods();