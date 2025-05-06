import lunr from 'lunr';

//import prebuiltIndex from './web/js/lunr-index.json';
//import showHitsData from './web/js/show-hits-data.json';
const prebuiltIndex = {};
const showHitsData = {};


const idx = lunr.Index.load(prebuiltIndex);
const searchResults = document.getElementById('search-results');
const MAX_RESULTS = 30;
let results = [];

window.handleSearch = function(query) {
    if (query.length < 2) {
        searchResults.classList.add('hidden');
        return;
    }

    try {
        // AND search: add a plus sign and * to all words in the query  
        const plusQuery = query;//query.trim().split(' ').map(word => '+' + word + '*').join(' ');
        results = idx.search(plusQuery);
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="p-4 text-sm opacity-50">No results found</div>';
        } else {
            const totalResults = results.length;
            const displayedResults = results.slice(0, MAX_RESULTS);
            
            searchResults.innerHTML = displayedResults
                .map(result => `
                    <li>
                        <a href="/listing/${showHitsData[result.ref].categorySlug}/${showHitsData[result.ref].slug}" class="p-4 hover:bg-base-300">
                            <div class="flex gap-4">
                                <div class="avatar">
                                    <div class="w-16 h-16 rounded">
                                        ${showHitsData[result.ref].altImageUrl ? 
                                            `<img src="${showHitsData[result.ref].altImageUrl}" alt="${showHitsData[result.ref].title}" />` :
                                            showHitsData[result.ref].siteUrl ?
                                                `<img src="/screenshot?url=${showHitsData[result.ref].siteUrl}" alt="${showHitsData[result.ref].title}" />` :
                                                `<div class="w-16 h-16 rounded bg-base-300 flex items-center justify-center">
                                                    <span class="text-sm opacity-70">No image</span>
                                                </div>`
                                        }
                                    </div>
                                </div>
                                <div class="text-sm opacity-70 align-top"><b>${showHitsData[result.ref].title}</b><br>${showHitsData[result.ref].content}</div>
                            </div>
                        </a>
                    </li>
                `).join('') + 
                (totalResults > MAX_RESULTS ? `
                    <li class="mt-2 border-t border-base-300">                        
                      <div class="font-medium text-accent">Excluded ${totalResults - MAX_RESULTS} results, narrow your search</div>                        
                    </li>
                ` : '');
        }
        searchResults.classList.remove('hidden');

    } catch (e) {
        console.error('Search error:', e);
        searchResults.classList.add('hidden');
    }
}

document.addEventListener('keydown', function(e) {
  // Check for Command+K (Mac) or Control+K (Windows)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault(); // Prevent default browser behavior
    document.querySelector('input[type="search"]').focus();
  }

  // Handle up/down arrow navigation in search results
  const searchResults = document.getElementById('search-results');
  if (searchResults && !searchResults.classList.contains('hidden')) {
    const items = searchResults.querySelectorAll('a');
    const currentFocus = document.activeElement;
    let currentIndex = Array.from(items).indexOf(currentFocus);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < 0) {
          // If nothing is focused, focus first item
          items[0]?.focus();
        } else if (currentIndex < items.length - 1) {
          // Focus next item
          items[currentIndex + 1].focus();
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          // Focus previous item
          items[currentIndex - 1].focus();
        } else if (currentIndex === 0) {
          // If at first item, move focus back to search input
          const searchInput = document.querySelector('input[type="search"]');
          items[0]?.classList.remove('bg-base-300');
          searchInput.focus();
        }
        break;
    }
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown')) {
        searchResults.classList.add('hidden');
    }
});
// Open dropdown when clicking on search input
document.addEventListener('click', function(event) {
    if (event.target.closest('.dropdown') && results.length > 0) {
      searchResults.classList.remove('hidden');
    }
});

// Initialize command/ctrl + K handler
/*
document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input').focus();
    }
});
*/
/*
const resultsWithMetadata = searchResults.map(result => {
  const doc = documents.find(d => d.id === result.ref);
  return {
    id: doc._id,
    title: doc.title,
    author: doc.content,  // Extra metadata
    
  };
});
*/
