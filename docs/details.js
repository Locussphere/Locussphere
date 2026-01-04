// Get mod ID from URL
const urlParams = new URLSearchParams(window.location.search);
const modId = parseInt(urlParams.get('id'));

let currentMod = null;
let currentImageIndex = 0;
let selectedVersion = null;

// Load mod details
async function loadModDetails() {
  try {
    const response = await fetch('mods.json');
    const data = await response.json();
    currentMod = data.mods.find(mod => mod.id === modId);
    
    if (!currentMod) {
      alert('Mod not found!');
      window.location.href = 'index.html';
      return;
    }
    
    // Set default selected version to the latest (first in array)
    selectedVersion = currentMod.versions[0];
    
    displayModDetails();
  } catch (error) {
    console.error('Error loading mod details:', error);
  }
}

// Display mod details
function displayModDetails() {
  // Set title
  document.getElementById('modTitle').textContent = currentMod.title;
  
  // Set author info
  const authorInfo = document.getElementById('authorInfo');
  authorInfo.querySelector('.author-avatar').src = currentMod.authorAvatar;
  authorInfo.querySelector('.author-name').textContent = `By ${currentMod.author}`;
  authorInfo.querySelector('.upload-date').textContent = `• Updated ${currentMod.uploadDate}`;
  
  // Set tags
  const tagsContainer = document.getElementById('modTags');
  let tagsHTML = `<span class="tag version">${currentMod.currentVersion}</span>`;
  tagsHTML += `<span class="tag category">${currentMod.game}</span>`;
  tagsHTML += `<span class="tag type">${currentMod.category}</span>`;
  if (currentMod.verified) {
    tagsHTML += `<span class="tag verified">Verified</span>`;
  }
  tagsContainer.innerHTML = tagsHTML;
  
  // Set stats
  document.getElementById('downloads').textContent = currentMod.downloads;
  document.getElementById('rating').textContent = currentMod.rating;
  document.getElementById('size').textContent = selectedVersion.size;
  
  // Set description
  document.getElementById('modDescription').textContent = currentMod.description;
  
  // Set images
  displayImages();
  
  // Set version selector
  displayVersionSelector();
  
  // Set changelog
  displayChangelog();
  
  // Set comments
  displayComments();
  
  // Set download button
  updateDownloadButton();
}

// Display images
function displayImages() {
  const mainImage = document.getElementById('mainImage');
  const thumbnailStrip = document.getElementById('thumbnailStrip');
  const imageCounter = document.getElementById('imageCounter');
  
  // Set main image background
  mainImage.style.backgroundImage = `url('${currentMod.images[0]}')`;
  mainImage.style.backgroundSize = 'cover';
  mainImage.style.backgroundPosition = 'center';
  
  // Set image counter
  imageCounter.textContent = `1/${currentMod.images.length}`;
  
  // Create thumbnails
  thumbnailStrip.innerHTML = currentMod.images.map((img, index) => `
        <img src="${img}" alt="Thumbnail ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage(${index})" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\'%3E%3Crect fill=\'%232d3142\' width=\'60\' height=\'60\'/%3E%3C/svg%3E'">
    `).join('');
}

// Change image
function changeImage(index) {
  currentImageIndex = index;
  const mainImage = document.getElementById('mainImage');
  const imageCounter = document.getElementById('imageCounter');
  const thumbnails = document.querySelectorAll('.thumbnail');
  
  mainImage.style.backgroundImage = `url('${currentMod.images[index]}')`;
  imageCounter.textContent = `${index + 1}/${currentMod.images.length}`;
  
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Display version selector
function displayVersionSelector() {
  const versionList = document.getElementById('versionList');
  
  versionList.innerHTML = currentMod.versions.map((version, index) => `
        <div class="version-item ${index === 0 ? 'selected' : ''}" onclick="selectVersion(${index})">
            <div class="version-header">
                <span class="version-number">${version.version}</span>
                <div class="version-info">
                    <span>${version.size}</span>
                    <span>•</span>
                    <span>${version.releaseDate}</span>
                </div>
            </div>
            ${version.changelog.length > 0 ? `
                <div class="version-changes">
                    ${version.changelog[0]}
                    ${version.changelog.length > 1 ? ` (+${version.changelog.length - 1} more)` : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Select version
function selectVersion(index) {
  selectedVersion = currentMod.versions[index];
  
  // Update selected state
  const versionItems = document.querySelectorAll('.version-item');
  versionItems.forEach((item, i) => {
    item.classList.toggle('selected', i === index);
  });
  
  // Update size display
  document.getElementById('size').textContent = selectedVersion.size;
  
  // Update download button
  updateDownloadButton();
  
  // Update changelog to show selected version
  displayChangelog();
}

// Update download button
function updateDownloadButton() {
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.href = selectedVersion.downloadPath;
  downloadBtn.download = `${currentMod.title.replace(/\s+/g, '-')}-${selectedVersion.version}.zip`;
}

// Display changelog
function displayChangelog() {
  const changelogSection = document.getElementById('changelogSection');
  const changelogList = document.getElementById('changelogList');
  const versionBadge = document.getElementById('versionBadge');
  
  if (selectedVersion.changelog && selectedVersion.changelog.length > 0) {
    versionBadge.textContent = `Version ${selectedVersion.version}`;
    
    changelogList.innerHTML = selectedVersion.changelog.map(change => `
            <li>${change}</li>
        `).join('');
    changelogSection.style.display = 'block';
  } else {
    changelogSection.style.display = 'none';
  }
}

// Display comments
function displayComments() {
  const commentsList = document.getElementById('commentsList');
  const commentCount = document.getElementById('commentCount');
  
  if (currentMod.comments && currentMod.comments.length > 0) {
    commentCount.textContent = `(${currentMod.comments.length})`;
    
    commentsList.innerHTML = currentMod.comments.map(comment => `
            <div class="comment">
                <img src="${comment.avatar}" alt="${comment.user}" class="comment-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Ccircle fill=\'%232d3142\' cx=\'20\' cy=\'20\' r=\'20\'/%3E%3C/svg%3E'">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-user">${comment.user}</span>
                        <span class="comment-time">${comment.time}</span>
                    </div>
                    <p class="comment-text">${comment.comment}</p>
                    <div class="comment-actions">
                        <div class="comment-action">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            ${comment.likes}
                        </div>
                        <div class="comment-action">Reply</div>
                    </div>
                </div>
            </div>
        `).join('');
  } else {
    commentCount.textContent = '(0)';
    commentsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>';
  }
}

// Read more button
const readMoreBtn = document.getElementById('readMoreBtn');
const modDescription = document.getElementById('modDescription');
let isExpanded = false;

readMoreBtn.addEventListener('click', () => {
  isExpanded = !isExpanded;
  
  if (isExpanded) {
    modDescription.style.display = 'block';
    modDescription.style.webkitLineClamp = 'unset';
    readMoreBtn.textContent = 'Show less';
  } else {
    modDescription.style.display = '-webkit-box';
    modDescription.style.webkitLineClamp = '3';
    readMoreBtn.textContent = 'Read more';
  }
});

// Favorite button
const favoriteBtn = document.getElementById('favoriteBtn');
favoriteBtn.addEventListener('click', () => {
  favoriteBtn.classList.toggle('active');
  
  if (favoriteBtn.classList.contains('active')) {
    favoriteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        `;
  } else {
    favoriteBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        `;
  }
});

// Bookmark button
const bookmarkBtn = document.getElementById('bookmarkBtn');
bookmarkBtn.addEventListener('click', () => {
  bookmarkBtn.classList.toggle('active');
  
  if (bookmarkBtn.classList.contains('active')) {
    bookmarkBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
  } else {
    bookmarkBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
  }
});

// Initialize
loadModDetails();