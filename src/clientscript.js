import lunr from 'lunr';

// Load search index and data
let idx;
let searchData = {};
let searchResults = [];

// Initialize search functionality
async function initializeSearch() {
    try {
        // Load the prebuilt lunr index and search data
        const [indexResponse, dataResponse] = await Promise.all([
            fetch('/lunr-index.json'),
            fetch('/search-data.json')
        ]);
        
        if (indexResponse.ok && dataResponse.ok) {
            const prebuiltIndex = await indexResponse.json();
            searchData = await dataResponse.json();
            idx = lunr.Index.load(prebuiltIndex);
        } else {
            console.warn('Search index files not found - search functionality disabled');
        }
    } catch (e) {
        console.warn('Failed to load search index:', e);
    }
}

// Function to check and apply highlighting from URL parameter or sessionStorage
function checkAndApplyUrlHighlighting() {
    try {
        // Method 1: Check URL parameters (Safari-compatible)
        let highlightQuery = '';
        if (window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            highlightQuery = urlParams.get('highlight') || '';
        }
        
        // Method 2: Check sessionStorage as fallback (Safari-compatible)
        let sessionHighlight = '';
        try {
            sessionHighlight = sessionStorage.getItem('searchHighlight') || '';
        } catch (e) {
            console.warn('SessionStorage access failed:', e);
        }
        
        // Use whichever method has a value
        const finalQuery = highlightQuery || sessionHighlight;
        
        if (finalQuery && finalQuery.length > 1) {
            // Safari fix: Add extra delay for content loading
            setTimeout(() => {
                highlightSearchTerms(finalQuery);
            }, 100);
            
            // Clear sessionStorage after use to avoid stale highlights
            if (sessionHighlight && !highlightQuery) {
                try {
                    sessionStorage.removeItem('searchHighlight');
                } catch (e) {
                    console.warn('SessionStorage removal failed:', e);
                }
            }
        }
    } catch (error) {
        console.warn('Highlighting initialization failed:', error);
    }
}

// Initialize search on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    
    // Try highlighting immediately
    checkAndApplyUrlHighlighting();
    
    // Safari fix: More attempts with different timing
    setTimeout(() => {
        checkAndApplyUrlHighlighting();
    }, 250);
    
    setTimeout(() => {
        checkAndApplyUrlHighlighting();
    }, 500);
    
    // Try again after an even longer delay for slow loads
    setTimeout(() => {
        checkAndApplyUrlHighlighting();
    }, 1000);
    
    // Safari fix: Additional late attempt
    setTimeout(() => {
        checkAndApplyUrlHighlighting();
    }, 2000);
});

// Safari fix: Additional initialization on window load
window.addEventListener('load', function() {
    setTimeout(() => {
        checkAndApplyUrlHighlighting();
    }, 100);
});

const MAX_RESULTS = 10;

// Highlight search terms in page content
function highlightSearchTerms(query) {
    // Clear previous highlights
    clearHighlights();
    
    if (!query || query.length < 2) {
        return;
    }
    
    // Find the main content area
    let contentArea = document.querySelector('.prose');
    if (!contentArea) {
        // Try alternative selectors
        contentArea = document.querySelector('main') || document.querySelector('.content') || document.body;
        if (!contentArea) {
            return;
        }
    }
    
    highlightInElement(contentArea, query);
}

// Generic function to highlight terms in any element
function highlightInElement(element, query) {
    // Split query into individual terms
    const terms = query.toLowerCase().trim().split(/\s+/);
    
    terms.forEach(term => {
        if (term.length < 2) return;
        
        // Create a text walker to find text nodes
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        // Highlight matches in text nodes
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
            
            if (regex.test(text)) {
                const highlightedHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedHTML;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
    });
    
    // Scroll to the first highlighted term
    setTimeout(() => {
        const firstHighlight = document.querySelector('.search-highlight');
        if (firstHighlight) {
            firstHighlight.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, 100); // Small delay to ensure highlights are rendered
}

// Clear search highlights
function clearHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize(); // Merge adjacent text nodes
    });
    
    // Remove wrapper spans that might be empty
    const wrappers = document.querySelectorAll('span:empty');
    wrappers.forEach(wrapper => wrapper.remove());
}

// Escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Global search function
window.handleSearch = function(query) {
    // Update all search results containers
    updateSearchResults('search-results', query);
    updateSearchResults('search-results-mobile', query);
    updateSearchResults('search-results-mobile-navbar', query);
}

function updateSearchResults(resultsId, query) {
    const searchResultsContainer = document.getElementById(resultsId);
    
    if (!searchResultsContainer) {
        return;
    }
    
    if (query.length < 2) {
        searchResultsContainer.classList.add('hidden');
        return;
    }

    if (!idx) {
        searchResultsContainer.innerHTML = '<li class="p-4 text-sm opacity-50">Search not available</li>';
        searchResultsContainer.classList.remove('hidden');
        return;
    }

    try {
        // Try multiple search strategies for better matching
        let results = [];
        const cleanQuery = query.trim();
        
        // Strategy 1: Exact match
        try {
            results = idx.search(cleanQuery);
        } catch (e) {
            // Ignore exact search errors
        }
        
        // Strategy 2: If no results, try wildcard on each word
        if (results.length === 0) {
            const wildcardQuery = cleanQuery.split(' ').map(word => `${word}*`).join(' ');
            try {
                results = idx.search(wildcardQuery);
            } catch (e) {
                // Ignore wildcard search errors
            }
        }
        
        // Strategy 3: If still no results, try fuzzy matching
        if (results.length === 0) {
            const fuzzyQuery = cleanQuery.split(' ').map(word => `${word}~1`).join(' ');
            try {
                results = idx.search(fuzzyQuery);
            } catch (e) {
                // Ignore fuzzy search errors
            }
        }
        
        window.searchResults = results; // Store for global access
        
        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<li class="p-4 text-sm opacity-50">No results found</li>';
        } else {
            const displayedResults = results.slice(0, MAX_RESULTS);
            
            searchResultsContainer.innerHTML = displayedResults
                .map(result => {
                    const doc = searchData[result.ref];
                    if (!doc) return '';
                    
                    // Add search query as URL parameter for highlighting on destination page
                    const urlWithSearch = `${doc.path}?highlight=${encodeURIComponent(cleanQuery)}`;
                    
                    return `
                        <li class="overflow-hidden">
                            <a href="${urlWithSearch}" 
                               class="block p-3 hover:bg-base-200 rounded overflow-hidden" 
                               tabindex="0"
                               role="option"
                               onclick="
                                   // Safari-compatible sessionStorage handling
                                   try {
                                       sessionStorage.setItem('searchHighlight', '${cleanQuery.replace(/'/g, "\\'")}');
                                   } catch (e) {
                                       console.warn('Failed to store search highlight:', e);
                                   }
                               ">
                                <div class="font-medium text-base-content truncate" style="max-width: 100%;">${doc.title}</div>
                                ${doc.description ? `<div class="text-sm opacity-70 mt-1" style="word-break: break-word; overflow-wrap: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${doc.description}</div>` : ''}
                                <div class="text-xs opacity-50 mt-1 truncate" style="max-width: 100%;">${doc.path}</div>
                            </a>
                        </li>
                    `;
                }).join('') + 
                (results.length > MAX_RESULTS ? `
                    <li class="p-2 text-center border-t border-base-300">                        
                        <div class="text-sm opacity-70">+${results.length - MAX_RESULTS} more results</div>                        
                    </li>
                ` : '');
        }
        searchResultsContainer.classList.remove('hidden');

    } catch (e) {
        console.error('Search error:', e);
        searchResultsContainer.classList.add('hidden');
    }
}

// Keyboard shortcuts and navigation
document.addEventListener('keydown', function(e) {
    // Check for Command+K (Mac) or Control+K (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus the appropriate search input based on screen size and visibility
        const desktopSearch = document.getElementById('search-desktop');
        const mobileNavbarSearch = document.getElementById('search-mobile-navbar');
        const mobileSearch = document.getElementById('search-mobile');
        
        if (desktopSearch && window.getComputedStyle(desktopSearch).display !== 'none') {
            desktopSearch.focus();
        } else if (mobileNavbarSearch && window.getComputedStyle(mobileNavbarSearch).display !== 'none') {
            mobileNavbarSearch.focus();
        } else if (mobileSearch) {
            mobileSearch.focus();
        }
    }

        // Simplified: Only handle Cmd+K and Ctrl+K shortcuts here
    // Search result navigation is now handled by direct event listeners
});

// Close search results when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        const searchResults = document.getElementById('search-results');
        const searchResultsMobile = document.getElementById('search-results-mobile');
        const searchResultsMobileNavbar = document.getElementById('search-results-mobile-navbar');
        
        if (searchResults) searchResults.classList.add('hidden');
        if (searchResultsMobile) searchResultsMobile.classList.add('hidden');
        if (searchResultsMobileNavbar) searchResultsMobileNavbar.classList.add('hidden');
    }
});

// Function to mark active menu items based on current URL
function markActiveMenuItems() {
    const currentPath = window.location.pathname + window.location.hash;
    const menuItems = document.querySelectorAll('#sidebar-menu ul li a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        
        // Remove .html extension for comparison
        const normalizedHref = href.replace('.html', '');
        const normalizedPath = currentPath.replace('.html', '');
        
        // Check if current path matches or is a child of the menu item's path
        const isActive = normalizedPath === normalizedHref || 
                        (normalizedPath.startsWith(normalizedHref) && normalizedHref !== '/');
        
        if (isActive) {
            item.classList.add('menu-active');
            // If the item is inside a details element, open it
            const details = item.closest('details');
            if (details) {
                details.setAttribute('open', '');
            }
        } else {
            item.classList.remove('menu-active');
        }
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', markActiveMenuItems);

// Safari-specific: Add direct keyboard handlers to search inputs and results
document.addEventListener('DOMContentLoaded', function() {
    const setupSearchNavigation = (inputId, resultsId) => {
        const input = document.getElementById(inputId);
        const results = document.getElementById(resultsId);
        
        if (!input || !results) return;
        
        // Handle navigation from search input
        input.addEventListener('keydown', function(e) {
            console.log('Safari debug - input keydown:', inputId, 'key:', e.key);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                if (!results.classList.contains('hidden')) {
                    const firstLink = results.querySelector('li:first-child a[href]');
                    if (firstLink) {
                        firstLink.focus();
                        console.log('Safari debug - focused first result');
                    }
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                results.classList.add('hidden');
            }
        });
        
        // Handle navigation within search results
        results.addEventListener('keydown', function(e) {
            console.log('Safari debug - results keydown:', resultsId, 'key:', e.key);
            
            // Prevent horizontal navigation
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Escape') {
                return;
            }
            
            const allLinks = Array.from(results.querySelectorAll('li a[href]'));
            const currentFocus = document.activeElement;
            const currentIndex = allLinks.indexOf(currentFocus);
            
            console.log('Safari debug - current index:', currentIndex, 'total links:', allLinks.length);
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentIndex >= 0 && currentIndex < allLinks.length - 1) {
                        allLinks[currentIndex + 1].focus();
                        console.log('Safari debug - moved to next item:', currentIndex + 1);
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    e.stopPropagation();
                    if (currentIndex > 0) {
                        allLinks[currentIndex - 1].focus();
                        console.log('Safari debug - moved to previous item:', currentIndex - 1);
                    } else if (currentIndex === 0) {
                        input.focus();
                        console.log('Safari debug - focused back to input');
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    results.classList.add('hidden');
                    input.focus();
                    console.log('Safari debug - escaped to input');
                    break;
            }
        });
    };
    
    // Setup all search contexts
    setupSearchNavigation('search-desktop', 'search-results');
    setupSearchNavigation('search-mobile-navbar', 'search-results-mobile-navbar');
    setupSearchNavigation('search-mobile', 'search-results-mobile');
});
