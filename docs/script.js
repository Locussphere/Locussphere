// Load mods data
let modsData = [];
let currentFilter = 'all';
let currentSort = 'recent';

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
    let filteredMods = [...modsData];
    
    // Apply filters
    if (currentFilter !== 'all') {
        filteredMods = filteredMods.filter(mod =>
            mod.game.toLowerCase() === currentFilter.toLowerCase() ||
            mod.type.toLowerCase() === currentFilter.toLowerCase()
        );
    }
    
    // Apply sorting
    if (currentSort === 'rating') {
        filteredMods.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (currentSort === 'downloads') {
        filteredMods.sort((a, b) => {
            const aDownloads = parseFloat(a.downloads.replace('k', '')) * 1000;
            const bDownloads = parseFloat(b.downloads.replace('k', '')) * 1000;
            return bDownloads - aDownloads;
        });
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

// Dropdown menus functionality
const dropdownMenus = {
    game: ['All Games', 'minecraft'],
    type: ['All Types', 'Graphic', 'Gameplay', 'Audio', 'Map', 'Script'],
    sort: ['Most Recent', 'Most Downloaded', 'Highest Rated']
};

// Create and show dropdown
function showDropdown(filterType, button) {
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.dropdown-menu');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    
    const options = dropdownMenus[filterType];
    dropdown.innerHTML = options.map(option => `
        <div class="dropdown-item" data-value="${option.toLowerCase()}">${option}</div>
    `).join('');
    
    // Position dropdown
    const rect = button.getBoundingClientRect();
    dropdown.style.top = rect.bottom + 8 + 'px';
    dropdown.style.left = rect.left + 'px';
    dropdown.style.minWidth = rect.width + 'px';
    
    document.body.appendChild(dropdown);
    
    // Add click handlers to dropdown items
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const value = item.dataset.value;
            
            if (filterType === 'game') {
                if (value === 'all games') {
                    currentFilter = 'all';
                } else {
                    currentFilter = value;
                }
                button.innerHTML = `${item.textContent} <span class="arrow-down">▾</span>`;
            } else if (filterType === 'type') {
                if (value === 'all types') {
                    currentFilter = 'all';
                } else {
                    currentFilter = value;
                }
                button.innerHTML = `${item.textContent} <span class="arrow-down">▾</span>`;
            } else if (filterType === 'sort') {
                if (value === 'most recent') {
                    currentSort = 'recent';
                } else if (value === 'most downloaded') {
                    currentSort = 'downloads';
                } else if (value === 'highest rated') {
                    currentSort = 'rating';
                }
                button.innerHTML = `${item.textContent} <span class="arrow-down">▾</span>`;
            }
            
            displayRecentMods();
            dropdown.remove();
        });
    });
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target) && e.target !== button) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 0);
}

// Filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filter = btn.dataset.filter;
        
        if (filter === 'all') {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            currentFilter = 'all';
            displayRecentMods();
        } else if (filter === 'rating') {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            currentSort = 'rating';
            displayRecentMods();
        } else if (btn.classList.contains('dropdown')) {
            showDropdown(filter, btn);
        }
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