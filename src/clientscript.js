import lunr from 'lunr';

/**
 * Escape HTML attributes to prevent XSS attacks
 * @param {string} unsafe - The unsafe string to escape
 * @returns {string} HTML-escaped string
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Build URLs with proper baseUrl prefix for internal links
 * @param {string} path - The path to build URL for
 * @returns {string} Complete URL with baseUrl prefix
 */
function buildUrl(path) {
    const baseUrl = document.documentElement.getAttribute('data-base-url') || '/';
    
    // Debug logging to help identify path issues
    console.debug('buildUrl called with:', { path, baseUrl });
    
    if (!path) {
        console.warn('buildUrl called with empty/undefined path, returning baseUrl only');
        return baseUrl;
    }
    
    if (path.startsWith('http')) return path; // External URL
    
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    const result = cleanBase + '/' + cleanPath;
    
    console.debug('buildUrl result:', result);
    return result;
}

// Load search index and data
let idx;
let searchData = {};

// Copy code to clipboard function
window.copyCodeToClipboard = function(codeId) {
    const codeElement = document.getElementById(codeId);
    const button = document.querySelector(`button[onclick="copyCodeToClipboard('${codeId}')"]`);
    
    if (codeElement && codeElement.querySelector('code')) {
        const codeText = codeElement.querySelector('code').textContent;
        
        // Use modern clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(codeText).then(() => {
                showCopySuccess(button);
            }).catch(err => {
                console.warn('Failed to copy using clipboard API:', err);
                fallbackCopyToClipboard(codeText, button);
            });
        } else {
            fallbackCopyToClipboard(codeText, button);
        }
    }
};

// Fallback copy method for older browsers or non-HTTPS
function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(button);
        } else {
            console.warn('Fallback copy failed');
        }
    } catch (err) {
        console.warn('Fallback copy error:', err);
    } finally {
        document.body.removeChild(textArea);
    }
}

// Show copy success feedback
function showCopySuccess(button) {
    if (button) {
        button.classList.add('copied');
        setTimeout(() => {
            button.classList.remove('copied');
        }, 2000);
    }
}
let searchResults = [];

// Cache keys for localStorage
const CACHE_KEYS = {
    INDEX: 'okidoki_lunr_index',
    DATA: 'okidoki_search_data',
    META: 'okidoki_search_meta',
    INDEX_ETAG: 'okidoki_lunr_index_etag',
    DATA_ETAG: 'okidoki_search_data_etag',
    TIMESTAMP: 'okidoki_cache_timestamp'
};

// Cache expiry time (24 hours in milliseconds)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// Clear search cache (localStorage and sessionStorage entries)
function clearSearchCache() {
    console.log('🗑️ Clearing search cache...');
    try {
        localStorage.removeItem('okidoki_search_index');
        localStorage.removeItem('okidoki_search_data');
        localStorage.removeItem('okidoki_search_timestamp');
        localStorage.removeItem('okidoki_search_etag');
        console.log('✅ Search cache cleared');
    } catch (e) {
        console.warn('Failed to clear search cache:', e);
    }

}

// Search persistence functions
function saveSearchState(query, results) {
    try {
        if (!query || query.trim().length < 2) {
            // Clear saved state for empty/short queries
            localStorage.removeItem('okidoki_last_search');
            return;
        }
        
        const searchState = {
            query: query.trim(),
            results: results,
            timestamp: Date.now()
        };
        
        localStorage.setItem('okidoki_last_search', JSON.stringify(searchState));
        console.log('💾 Search state saved:', query);
    } catch (e) {
        console.warn('Failed to save search state:', e);
    }
}

function clearSavedSearchState() {
    try {
        localStorage.removeItem('okidoki_last_search');
        console.log('🗑️ Search state cleared');
        
        // Also clear all search inputs on current page
        const searchInputs = document.querySelectorAll('#search-desktop, #search-mobile-navbar');
        searchInputs.forEach(input => {
            if (input && input.value.trim()) {
                // Only clear if it's not the input that triggered this clear (to avoid infinite loops)
                const activeElement = document.activeElement;
                if (input !== activeElement) {
                    input.value = '';
                }
            }
        });
    } catch (e) {
        console.warn('Failed to clear search state:', e);
    }
}

function loadSearchState() {
    try {
        const saved = localStorage.getItem('okidoki_last_search');
        if (!saved) return null;
        
        const searchState = JSON.parse(saved);
        
        // Check if saved state is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - searchState.timestamp > maxAge) {
            localStorage.removeItem('okidoki_last_search');
            return null;
        }
        
        return searchState;
    } catch (e) {
        console.warn('Failed to load search state:', e);
        localStorage.removeItem('okidoki_last_search');
        return null;
    }
}

function restoreSearchState() {
    const savedState = loadSearchState();
    if (!savedState || !idx) return;
    
    console.log('🔄 Restoring search state:', savedState.query);
    
    // Update all search input fields but don't show results immediately
    const searchInputs = document.querySelectorAll('#search-desktop, #search-mobile-navbar');
    searchInputs.forEach(input => {
        if (input) {
            input.value = savedState.query;
            
            // Only add event listeners if not already added
            if (!input.hasAttribute('data-search-listeners-added')) {
                input.setAttribute('data-search-listeners-added', 'true');
                
                // Add focus event listener to show cached results when user focuses on input
                input.addEventListener('focus', function(e) {
                    const currentSavedState = loadSearchState();
                    if (currentSavedState && currentSavedState.query === e.target.value.trim() && e.target.value.trim().length >= 2) {
                        // Show cached results when user focuses on input with saved query
                        showCachedSearchResults(currentSavedState.query, currentSavedState.results);
                    }
                });
                
                // Also trigger on click for better UX
                input.addEventListener('click', function(e) {
                    const currentSavedState = loadSearchState();
                    if (currentSavedState && currentSavedState.query === e.target.value.trim() && e.target.value.trim().length >= 2) {
                        // Show cached results when user clicks on input with saved query
                        showCachedSearchResults(currentSavedState.query, currentSavedState.results);
                    }
                });
            }
        }
    });
}

function showCachedSearchResults(query, results) {
    console.log('📋 Showing cached search results for:', query);
    
    // Show cached results for all containers
    updateSearchResults('search-results', query, results);
    updateSearchResults('search-results-mobile', query, results);
    updateSearchResults('search-results-mobile-navbar', query, results);
}

/**
 * Initialize search functionality with localStorage caching
 * @returns {Promise} Promise that resolves when search is initialized
 */
async function initializeSearch() {
    try {
        console.log('🔍 Initializing search...');
        
        // Try to load from cache first
        const cachedData = await loadFromCache();
        console.log('📦 Cache load result:', cachedData.success ? 'SUCCESS' : 'FAILED', cachedData.reason || '');
        
        if (cachedData.success) {
            idx = cachedData.index;
            searchData = cachedData.data;
            console.log('✅ Search initialized from cache');
            
            // Restore any saved search state
            restoreSearchState();
            return;
        }
        
        // Cache miss or invalid - clear old cache and fetch from server
        console.log('🌐 Cache miss - clearing old cache and fetching search data from server');
        clearSearchCache();
        await fetchAndCacheSearchData();
        
        // Restore any saved search state after fetching data
        restoreSearchState();
        
    } catch (e) {
        console.warn('❌ Failed to initialize search:', e);
    }
}

// Load search data from localStorage cache
async function loadFromCache() {
    try {
        console.log('📦 Attempting to load from cache...');
        
        // Check if localStorage is available
        const localStorageAvailable = isLocalStorageAvailable();
        console.log('💾 localStorage available:', localStorageAvailable);
        
        if (!localStorageAvailable) {
            return { success: false, reason: 'localStorage not available' };
        }
        
        // Try to get cached data
        const cachedIndex = localStorage.getItem(CACHE_KEYS.INDEX);
        const cachedData = localStorage.getItem(CACHE_KEYS.DATA);
        const cachedMeta = localStorage.getItem(CACHE_KEYS.META);
        const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
        
        console.log('📦 Cache check:', {
            hasIndex: !!cachedIndex,
            hasData: !!cachedData,
            hasMeta: !!cachedMeta,
            hasTimestamp: !!timestamp,
            indexSize: cachedIndex ? `${(cachedIndex.length / 1024).toFixed(1)}KB` : 'none',
            dataSize: cachedData ? `${(cachedData.length / 1024).toFixed(1)}KB` : 'none'
        });
        
        if (!cachedIndex || !cachedData || !timestamp) {
            return { success: false, reason: 'missing cached data' };
        }
        
        // Check if we should validate cache with server
        const shouldValidate = await shouldValidateCache(timestamp);
        console.log('🔄 Should validate cache:', shouldValidate);
        
        if (shouldValidate) {
            const isValid = await validateCacheWithServer();
            console.log('✅ Cache validation result:', isValid ? 'VALID' : 'INVALID');
            if (!isValid) {
                console.log('🔄 Server files changed - cache invalid');
                return { success: false, reason: 'server files changed' };
            }
        }
        
        console.log('📊 Parsing cached data...');
        // Parse and validate cached data
        const indexData = JSON.parse(cachedIndex);
        const searchDataParsed = JSON.parse(cachedData);
        const loadedIndex = lunr.Index.load(indexData);
        
        console.log('✅ Successfully loaded from cache');
        return {
            success: true,
            index: loadedIndex,
            data: searchDataParsed
        };
        
    } catch (e) {
        console.warn('❌ Failed to load from cache:', e);
        return { success: false, reason: 'parse error: ' + e.message };
    }
}

// Determine if we should validate cache with server
async function shouldValidateCache(timestamp) {
    const age = Date.now() - parseInt(timestamp);
    const ageHours = age / (1000 * 60 * 60);
    const expiryHours = CACHE_EXPIRY / (1000 * 60 * 60);
    
    console.log('⏰ Cache age check:', {
        ageHours: ageHours.toFixed(2),
        expiryHours,
        expired: age > CACHE_EXPIRY
    });
    
    // Always validate if cache is older than expiry time
    if (age > CACHE_EXPIRY) {
        console.log('⏰ Cache expired - validation required');
        return true;
    }
    
    // For content-hash based validation, check frequently since it's lightweight
    // During development/testing: validate every 1 minute
    // In production: you can increase this to 30-60 minutes
    const contentHashValidationInterval = 1 * 60 * 1000; // 1 minute for testing
    if (age > contentHashValidationInterval) {
        console.log('🔄 Content hash validation interval reached - validation required');
        return true;
    }
    
    console.log('🎲 Cache is very fresh - skipping validation for now');
    return false;
}

// Validate cache using ETags with HEAD requests (lightweight)
async function validateCacheWithServer() {
    try {
        console.log('🔄 Validating cache with server using content hash...');
        
        // First try to get server metadata for content hash validation
        const metaResponse = await fetch(buildUrl('/search-meta.json')).catch(e => {
            console.warn('📡 Meta request failed:', e.message);
            return null;
        });
        
        if (metaResponse && metaResponse.ok) {
            console.log('📊 Got server metadata - using content hash validation');
            const serverMeta = await metaResponse.json();
            const cachedMeta = localStorage.getItem(CACHE_KEYS.META);
            
            console.log('🔍 Content hash validation:', {
                hasServerMeta: !!serverMeta,
                hasCachedMeta: !!cachedMeta
            });
            
            if (cachedMeta) {
                const parsedCachedMeta = JSON.parse(cachedMeta);
                
                console.log('🔍 Hash comparison:', {
                    serverIndexHash: serverMeta.indexHash,
                    cachedIndexHash: parsedCachedMeta.indexHash,
                    serverDataHash: serverMeta.dataHash,
                    cachedDataHash: parsedCachedMeta.dataHash
                });
                
                // Compare content hashes - if either changed, cache is invalid
                if (serverMeta.indexHash !== parsedCachedMeta.indexHash || 
                    serverMeta.dataHash !== parsedCachedMeta.dataHash) {
                    console.log('❌ Content hash mismatch - cache invalid');
                    return false;
                }
                
                console.log('✅ Content hash validation passed - cache is still valid');
                return true;
            } else {
                console.log('❌ No cached metadata - assuming cache is invalid');
                return false;
            }
        }
        
        // Fallback to ETag validation if metadata not available
        console.log('🔄 Falling back to ETag validation...');
        
        const cachedIndexETag = localStorage.getItem(CACHE_KEYS.INDEX_ETAG);
        const cachedDataETag = localStorage.getItem(CACHE_KEYS.DATA_ETAG);
        
        console.log('🏷️ Cached ETags:', { 
            indexETag: cachedIndexETag, 
            dataETag: cachedDataETag 
        });
        
        // If we don't have ETags or metadata, invalidate cache to be safe
        if (!cachedIndexETag && !cachedDataETag) {
            console.log('🏷️ No ETags or metadata available - invalidating cache for safety');
            return false; // Changed: be more aggressive about cache invalidation
        }
        
        console.log('📡 Making HEAD requests for ETag validation...');
        
        // Use HEAD requests for lightweight validation
        const [indexHead, dataHead] = await Promise.all([
            fetch(buildUrl('/lunr-index.json'), { method: 'HEAD' }).catch(e => {
                console.warn('📡 Index HEAD request failed:', e.message);
                return null;
            }),
            fetch(buildUrl('/search-data.json'), { method: 'HEAD' }).catch(e => {
                console.warn('📡 Data HEAD request failed:', e.message);
                return null;
            })
        ]);
        
        console.log('📡 HEAD responses:', {
            indexOk: indexHead?.ok,
            dataOk: dataHead?.ok
        });
        
        // Check if ETags match
        if (indexHead && cachedIndexETag) {
            const serverIndexETag = indexHead.headers.get('etag');
            console.log('🏷️ Index ETag comparison:', { 
                cached: cachedIndexETag, 
                server: serverIndexETag 
            });
            
            if (serverIndexETag && serverIndexETag !== cachedIndexETag) {
                console.log('❌ Index ETag mismatch - cache invalid');
                return false; // Index changed
            }
        }
        
        if (dataHead && cachedDataETag) {
            const serverDataETag = dataHead.headers.get('etag');
            console.log('🏷️ Data ETag comparison:', { 
                cached: cachedDataETag, 
                server: serverDataETag 
            });
            
            if (serverDataETag && serverDataETag !== cachedDataETag) {
                console.log('❌ Data ETag mismatch - cache invalid');
                return false; // Data changed
            }
        }
        
        console.log('✅ ETag validation passed - cache is still valid');
        return true; // Cache is still valid
        
    } catch (e) {
        console.warn('❌ Failed to validate cache with server:', e);
        console.log('🔄 Invalidating cache due to validation error for safety');
        return false; // Changed: invalidate cache on error to be safe
    }
}

// Fetch search data from server and cache it
async function fetchAndCacheSearchData() {
    try {
        console.log('🌐 Fetching search data from server...');
        
        const [indexResponse, dataResponse, metaResponse] = await Promise.all([
            fetch(buildUrl('/lunr-index.json')),
            fetch(buildUrl('/search-data.json')),
            fetch(buildUrl('/search-meta.json')).catch(e => {
                console.warn('📡 Meta fetch failed (this is ok for older builds):', e.message);
                return null;
            })
        ]);
        
        console.log('📡 Fetch responses:', {
            indexOk: indexResponse.ok,
            indexStatus: indexResponse.status,
            dataOk: dataResponse.ok,
            dataStatus: dataResponse.status,
            metaOk: metaResponse?.ok,
            metaStatus: metaResponse?.status
        });
        
        if (indexResponse.ok && dataResponse.ok) {
            console.log('📊 Parsing response data...');
            const prebuiltIndex = await indexResponse.json();
            const fetchedSearchData = await dataResponse.json();
            const fetchedMeta = metaResponse?.ok ? await metaResponse.json() : null;
            
            console.log('📊 Data parsed:', {
                indexKeys: Object.keys(prebuiltIndex).length,
                dataEntries: Object.keys(fetchedSearchData).length,
                hasMeta: !!fetchedMeta
            });
            
            // Load the index
            console.log('🔍 Loading lunr index...');
            idx = lunr.Index.load(prebuiltIndex);
            searchData = fetchedSearchData;
            
            console.log('💾 Caching data...');
            // Cache the data
            await cacheSearchData(prebuiltIndex, fetchedSearchData, fetchedMeta, indexResponse, dataResponse, metaResponse);
            
            console.log('✅ Search data fetched and cached successfully');
        } else {
            console.warn('❌ Search index files not found - search functionality disabled');
        }
        
    } catch (e) {
        console.warn('❌ Failed to fetch search data:', e);
    }
}

// Cache search data in localStorage
async function cacheSearchData(indexData, searchData, metaData, indexResponse, dataResponse, metaResponse) {
    try {
        console.log('💾 Starting cache storage...');
        
        const localStorageAvailable = isLocalStorageAvailable();
        console.log('💾 localStorage check for caching:', localStorageAvailable);
        
        if (!localStorageAvailable) {
            console.warn('❌ localStorage not available - skipping cache');
            return;
        }
        
        console.log('💾 Storing data in localStorage...');
        
        // Store the data
        const indexJson = JSON.stringify(indexData);
        const dataJson = JSON.stringify(searchData);
        const metaJson = metaData ? JSON.stringify(metaData) : null;
        const timestamp = Date.now().toString();
        
        console.log('💾 Data sizes before storage:', {
            indexSize: `${(indexJson.length / 1024).toFixed(1)}KB`,
            dataSize: `${(dataJson.length / 1024).toFixed(1)}KB`,
            metaSize: metaJson ? `${(metaJson.length / 1024).toFixed(1)}KB` : 'none',
            totalSize: `${((indexJson.length + dataJson.length + (metaJson?.length || 0)) / 1024).toFixed(1)}KB`
        });
        
        localStorage.setItem(CACHE_KEYS.INDEX, indexJson);
        localStorage.setItem(CACHE_KEYS.DATA, dataJson);
        localStorage.setItem(CACHE_KEYS.TIMESTAMP, timestamp);
        
        // Store metadata if available
        if (metaJson) {
            localStorage.setItem(CACHE_KEYS.META, metaJson);
            console.log('💾 Metadata stored successfully');
        }
        
        console.log('💾 Basic data stored successfully');
        
        // Store ETags if available for better cache invalidation
        const indexETag = indexResponse.headers.get('etag');
        const dataETag = dataResponse.headers.get('etag');
        
        console.log('🏷️ ETags:', { indexETag, dataETag });
        
        if (indexETag) {
            localStorage.setItem(CACHE_KEYS.INDEX_ETAG, indexETag);
        }
        if (dataETag) {
            localStorage.setItem(CACHE_KEYS.DATA_ETAG, dataETag);
        }
        
        console.log('✅ Search data cached successfully');
        
        // Verify the cache was stored
        const verification = {
            hasIndex: !!localStorage.getItem(CACHE_KEYS.INDEX),
            hasData: !!localStorage.getItem(CACHE_KEYS.DATA),
            hasTimestamp: !!localStorage.getItem(CACHE_KEYS.TIMESTAMP)
        };
        console.log('✅ Cache verification:', verification);
        
    } catch (e) {
        console.error('❌ Failed to cache search data:', e);
        
        // Handle localStorage quota exceeded or other errors
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            console.warn('💾 localStorage quota exceeded - clearing old cache data');
            clearSearchCache();
        } else {
            console.warn('💾 Cache storage failed:', e.name, e.message);
        }
    }
}

// Check if localStorage is available and functional
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// Expose cache management functions globally for debugging
window.clearSearchCache = clearSearchCache;

// Additional cache management utilities for debugging
window.getSearchCacheInfo = function() {
    if (!isLocalStorageAvailable()) {
        return { error: 'localStorage not available' };
    }
    
    const timestamp = localStorage.getItem(CACHE_KEYS.TIMESTAMP);
    const indexSize = localStorage.getItem(CACHE_KEYS.INDEX)?.length || 0;
    const dataSize = localStorage.getItem(CACHE_KEYS.DATA)?.length || 0;
    const indexETag = localStorage.getItem(CACHE_KEYS.INDEX_ETAG);
    const dataETag = localStorage.getItem(CACHE_KEYS.DATA_ETAG);
    
    return {
        cached: !!timestamp,
        timestamp: timestamp ? new Date(parseInt(timestamp)).toISOString() : null,
        age: timestamp ? Date.now() - parseInt(timestamp) : null,
        ageHours: timestamp ? ((Date.now() - parseInt(timestamp)) / (1000 * 60 * 60)).toFixed(2) : null,
        indexSize: `${(indexSize / 1024).toFixed(2)} KB`,
        dataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        totalSize: `${((indexSize + dataSize) / 1024).toFixed(2)} KB`,
        indexETag,
        dataETag,
        expiryHours: CACHE_EXPIRY / (1000 * 60 * 60)
    };
};

// Test cache validation manually
window.testCacheValidation = async function() {
    console.log('🧪 Testing cache validation manually...');
    const isValid = await validateCacheWithServer();
    console.log('🧪 Manual validation result:', isValid ? 'VALID' : 'INVALID');
    return isValid;
};

// Test search functionality with debugging
window.testSearch = function(query) {
    console.log('🧪 Testing search with query:', query);
    if (!idx) {
        console.log('❌ Search index not loaded');
        return null;
    }
    
    const results = updateSearchResults('search-results', query);
    console.log('🧪 Search test completed');
    return results;
};

// Debug function to explore search index contents
window.exploreSearchIndex = function(searchTerm = '') {
    console.log('🕵️ Exploring search index...');
    
    if (!searchData) {
        console.log('❌ Search data not loaded');
        return;
    }
    
    const allDocs = Object.keys(searchData);
    console.log(`📚 Total documents in search index: ${allDocs.length}`);
    
    if (searchTerm) {
        console.log(`🔍 Searching for documents containing "${searchTerm}":`);
        allDocs.forEach(docId => {
            const doc = searchData[docId];
            const allText = Object.values(doc).join(' ').toLowerCase();
            if (allText.includes(searchTerm.toLowerCase())) {
                console.log(`✅ Found in document ${docId}:`, {
                    title: doc.title,
                    description: doc.description,
                    path: doc.path,
                    contentPreview: (doc.content || '').substring(0, 100) + '...'
                });
            }
        });
    } else {
        // Show first 10 documents
        console.log('📄 First 10 documents:');
        allDocs.slice(0, 10).forEach(docId => {
            const doc = searchData[docId];
            console.log(`  - ${docId}: "${doc?.title || 'NO TITLE'}"`);
        });
        
        if (allDocs.length > 10) {
            console.log(`  ... and ${allDocs.length - 10} more documents`);
            console.log('📄 Remaining documents:');
            allDocs.slice(10).forEach(docId => {
                const doc = searchData[docId];
                console.log(`  - ${docId}: "${doc?.title || 'NO TITLE'}"`);
            });
        }
    }
    
    return { totalDocs: allDocs.length, allDocIds: allDocs };
};

// Debug function to examine a specific document
window.examineDocument = function(docId) {
    console.log(`🔍 Examining document ${docId}:`);
    
    if (!searchData) {
        console.log('❌ Search data not loaded');
        return;
    }
    
    const doc = searchData[docId];
    if (!doc) {
        console.log(`❌ Document ${docId} not found`);
        return;
    }
    
    console.log('📄 Document details:');
    Object.keys(doc).forEach(key => {
        const value = doc[key];
        const preview = typeof value === 'string' && value.length > 100 
            ? value.substring(0, 100) + '...' 
            : value;
        console.log(`  ${key}:`, preview);
    });
    
    return doc;
};

// Force refresh search cache
window.forceRefreshSearchCache = async function() {
    console.log('Force refreshing search cache...');
    clearSearchCache();
    await initializeSearch();
    console.log('Search cache refreshed');
    return window.getSearchCacheInfo();
};

// Simple debugging utility to inspect localStorage
window.debugLocalStorage = function() {
    console.log('🔍 localStorage Debug Info:');
    console.log('localStorage available:', isLocalStorageAvailable());
    
    if (!isLocalStorageAvailable()) {
        return { error: 'localStorage not available' };
    }
    
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('okidoki_'));
    console.log('Okidoki cache keys found:', allKeys);
    
    allKeys.forEach(key => {
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        console.log(`- ${key}: ${size} chars (${(size/1024).toFixed(1)}KB)`);
        
        // Show first 100 chars if it's not too long
        if (size > 0 && size < 1000) {
            console.log(`  Value: ${value.substring(0, 100)}${size > 100 ? '...' : ''}`);
        }
    });
    
    return { keys: allKeys, available: true };
};

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

// BASIC DEBUG - Check if this script is running at all
console.log('🚀 OkiDoki clientscript.js is loading...');

// Immediately set up basic debug functions
window.basicDebug = function() {
    console.log('✅ Basic debug function is working!');
    console.log('User agent:', navigator.userAgent);
    console.log('Page title:', document.title);
    console.log('Mobile nav details element:', document.querySelector('.mobile-nav-details'));
    console.log('Mobile nav links:', document.querySelectorAll('.mobile-nav-link'));
    return 'Debug function executed successfully';
};

// Set debug immediately
window.basicDebug();

// Global debugging functions - define them immediately
window.debugMobileNavigation = function() {
    console.log('=== MANUAL MOBILE NAV DEBUG ===');
    
    const allNavLinks = document.querySelectorAll('.mobile-nav-link');
    console.log('Total mobile nav links found:', allNavLinks.length);
    
    if (allNavLinks.length === 0) {
        console.log('❌ No mobile nav links found! Check if page has navigation.');
        
        // Check if any navigation exists at all
        const anyLinks = document.querySelectorAll('a[href^="#"]');
        console.log('Total anchor links found:', anyLinks.length);
        
        // Check the dropdown structure
        const dropdown = document.querySelector('.mobile-nav-details');
        console.log('Dropdown element:', dropdown);
        if (dropdown) {
            console.log('Dropdown HTML:', dropdown.innerHTML.substring(0, 500) + '...');
        }
        return;
    }
    
    allNavLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const targetId = href ? href.substring(1) : null;
        const targetElement = targetId ? document.getElementById(targetId) : null;
        
        console.log(`Link ${index + 1}:`);
        console.log(`  - Href: ${href}`);
        console.log(`  - Target ID: ${targetId}`);
        console.log(`  - Target exists: ${!!targetElement}`);
        
        if (targetElement) {
            console.log(`  - Target element: <${targetElement.tagName.toLowerCase()}>`);
            try {
                console.log(`  - Target position:`, targetElement.getBoundingClientRect());
            } catch(e) {
                console.log(`  - Could not get position:`, e.message);
            }
        }
    });
    
    // Test manual navigation
    const firstLink = allNavLinks[0];
    if (firstLink) {
        const href = firstLink.getAttribute('href');
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            console.log('🧪 Testing manual scroll to first element...');
            try {
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
                
                setTimeout(() => {
                    console.log('✅ Manual scroll test completed');
                }, 1000);
            } catch(e) {
                console.log('❌ Scroll test failed:', e.message);
            }
        }
    }
};

window.testMobileScrollTo = function(targetId) {
    console.log('Testing scroll to:', targetId);
    const element = document.getElementById(targetId);
    if (element) {
        console.log('Element found, scrolling...');
        try {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            console.log('Scroll command executed');
        } catch(e) {
            console.log('❌ Scroll failed:', e.message);
        }
    } else {
        console.log('❌ Element not found:', targetId);
        
        // Show all available IDs for debugging
        const allElementsWithId = document.querySelectorAll('[id]');
        console.log('Available IDs on page:');
        allElementsWithId.forEach(el => {
            console.log(`  - #${el.id} (${el.tagName.toLowerCase()})`);
        });
    }
};

console.log('✅ Debug functions defined globally');

// Initialize search on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 DOMContentLoaded fired - initializing...');
    
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
    const results = updateSearchResults('search-results', query);
    updateSearchResults('search-results-mobile', query, results);
    updateSearchResults('search-results-mobile-navbar', query, results);
    
    // Save or clear search state based on query
    if (query && query.trim().length >= 2 && results) {
        saveSearchState(query, results);
    } else {
        // Clear saved state when input is empty or too short
        clearSavedSearchState();
    }
}

// Hide search results when clicking outside
function handleClickOutside(event) {
    const dropdowns = document.querySelectorAll('.dropdown.dropdown-open');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('dropdown-open');
            const resultsContainer = dropdown.querySelector('[id*="search-results"]');
            if (resultsContainer) {
                resultsContainer.classList.add('hidden');
            }
        }
    });
}

// Add click outside listener
document.addEventListener('click', handleClickOutside);

function updateSearchResults(resultsId, query, cachedResults = null) {
    const searchResultsContainer = document.getElementById(resultsId);
    
    if (!searchResultsContainer) {
        return null;
    }
    
    // Find the parent dropdown element
    const dropdownParent = searchResultsContainer.closest('.dropdown');
    
    // Hide dropdown if query is too short or empty
    if (!query || query.trim().length < 2) {
        searchResultsContainer.classList.add('hidden');
        if (dropdownParent) {
            dropdownParent.classList.remove('dropdown-open');
        }
        return null;
    }

    if (!idx) {
        searchResultsContainer.innerHTML = '<li class="p-4 text-sm opacity-50">Search not available</li>';
        searchResultsContainer.classList.remove('hidden');
        if (dropdownParent) {
            dropdownParent.classList.add('dropdown-open');
        }
        return null;
    }

    try {
        let results = [];
        const cleanQuery = query.trim();
        
        // Use cached results if provided, otherwise perform search
        if (cachedResults) {
            results = cachedResults;
        } else {
            // Try multiple search strategies for better matching
            const words = cleanQuery.split(/\s+/).filter(word => word.length > 0);
            const isMultiWord = words.length > 1;
            

            
            // For multi-word queries, use AND logic by requiring all terms
            if (isMultiWord) {
                // Try exact search first with AND requirement
                const andQuery = words.map(word => `+${word}`).join(' ');
                try {
                    results = idx.search(andQuery);
                } catch (e) {
                    // If AND search fails, fall back to OR search and filter results
                    try {
                        results = idx.search(cleanQuery);
                        // Filter results to ensure all words are present
                        results = results.filter(result => {
                            const doc = searchData[result.ref];
                            if (!doc) return false;
                            
                            // Create searchable text from all document fields
                            const allFields = Object.values(doc).filter(value => 
                                typeof value === 'string' && value.length > 0
                            );
                            const searchableText = allFields.join(' ').toLowerCase();
                            
                            // Check if ALL words are present
                            return words.every(word => 
                                searchableText.includes(word.toLowerCase())
                            );
                        });
                    } catch (e2) {
                        // If all else fails, return empty results
                        results = [];
                    }
                }
            } else {
                // Single word - try multiple search strategies for better partial matching
                try {
                    // First try exact search
                    results = idx.search(cleanQuery);
                    
                    // If no exact results, immediately try wildcard for partial matching
                    if (results.length === 0) {
                        results = idx.search(cleanQuery + '*');
                        
                        // If still no results, try fuzzy match
                        if (results.length === 0) {
                            results = idx.search(cleanQuery + '~1');
                        }
                    }
                } catch (e) {
                    // If any search fails, try the fallback sequence
                    try {
                        results = idx.search(cleanQuery + '*');
                    } catch (e2) {
                        try {
                            results = idx.search(cleanQuery + '~1');
                        } catch (e3) {
                            results = [];
                        }
                    }
                }
            }
        }
        
        window.searchResults = results; // Store for global access
        
        if (results.length === 0) {
            // Hide dropdown if no results found
            searchResultsContainer.classList.add('hidden');
            if (dropdownParent) {
                dropdownParent.classList.remove('dropdown-open');
            }
            return results;
        } else {
            const displayedResults = results.slice(0, MAX_RESULTS);
            
            searchResultsContainer.innerHTML = displayedResults
                .map(result => {
                    const doc = searchData[result.ref];
                    if (!doc) {
                        console.error('No doc found for result.ref:', result.ref);
                        return '';
                    }
                    
                    // Aggressive debugging to catch the issue
                    console.log('=== SEARCH RESULT DEBUG ===');
                    console.log('result.ref:', result.ref);
                    console.log('doc object:', JSON.stringify(doc, null, 2));
                    console.log('doc.path specifically:', typeof doc.path, '|' + doc.path + '|');
                    
                    // Build URL with detailed debugging
                    const builtUrl = buildUrl(doc.path);
                    const urlWithSearch = `${builtUrl}?highlight=${encodeURIComponent(cleanQuery)}`;
                    console.log('URL construction:', {
                        'doc.path': doc.path,
                        'builtUrl': builtUrl,
                        'urlWithSearch': urlWithSearch
                    });
                    console.log('=== END DEBUG ===');
                    
                    // Escape display content only (not URLs which need to work for clicks)
                    const escapedTitle = escapeHtml(doc.title);
                    const escapedDescription = doc.description ? escapeHtml(doc.description) : '';
                    const escapedPath = escapeHtml(doc.path);
                    
                    return `
                        <li>
                            <a href="${urlWithSearch}">
                                <div class="font-medium text-base-content">${escapedTitle}</div>
                                ${escapedDescription ? `<div class="text-sm opacity-70 mt-1">${escapedDescription}</div>` : ''}
                                <div class="text-xs opacity-50 mt-1">${escapedPath}</div>
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
        if (dropdownParent) {
            dropdownParent.classList.add('dropdown-open');
        }
        
        // Add click handlers and keyboard navigation
        setupSearchResultInteractions(searchResultsContainer, cleanQuery);
        
        return results;

    } catch (e) {
        console.error('Search error:', e);
        searchResultsContainer.classList.add('hidden');
        if (dropdownParent) {
            dropdownParent.classList.remove('dropdown-open');
        }
        return null;
    }
}

// Setup interactions for search results
function setupSearchResultInteractions(container, query) {
    const items = container.querySelectorAll('li > a');
    let selectedIndex = -1;
    let keyboardMode = false; // Track if we're using keyboard navigation
    
    // Store the input element that triggered this search
    const inputElement = container.parentElement.querySelector('input');
    const dropdownParent = container.closest('.dropdown');
    
    // Click and hover handlers
    items.forEach((item, index) => {
        // Click handler
        item.addEventListener('click', () => {
            try {
                sessionStorage.setItem('searchHighlight', query);
            } catch (e) {
                console.warn('Failed to store search highlight:', e);
            }
            // Let the anchor tag handle navigation
        });
        
        // Mouse hover handlers
        item.addEventListener('mouseenter', () => {
            // Only respond to mouse if we're not in keyboard mode
            if (!keyboardMode) {
                clearSelected();
                selectedIndex = index;
                item.classList.add('selected');
            }
        });
        
        item.addEventListener('mouseleave', () => {
            // Only clear if we're in mouse mode (not keyboard mode)
            if (!keyboardMode && selectedIndex === index) {
                item.classList.remove('selected');
                selectedIndex = -1;
            }
        });
    });
    
    // Navigation helpers
    function clearSelected() {
        items.forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    function selectItem(index) {
        clearSelected();
        if (index >= 0 && index < items.length) {
            selectedIndex = index;
            keyboardMode = true; // Mark as keyboard mode
            container.classList.add('keyboard-navigation'); // Add CSS class
            items[index].classList.add('selected');
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }
    
    // Keyboard handler - attach to the input element
    const keyboardHandler = (e) => {
        // Exit immediately if not a navigation key - don't interfere with normal typing
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter' && e.key !== 'Escape') {
            return; // Let browser handle all other keys normally
        }
        
        // Only handle navigation keys when results are visible
        if (!container.classList.contains('hidden') && items.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                e.stopPropagation();
                
                if (selectedIndex === -1) {
                    // First time pressing down - select first item
                    selectItem(0);
                } else if (selectedIndex < items.length - 1) {
                    // Move down if not at last item
                    selectItem(selectedIndex + 1);
                }
                // Do nothing if already at last item (stay there)
                
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                e.stopPropagation();
                
                if (selectedIndex === -1) {
                    // No item selected - select last item
                    selectItem(items.length - 1);
                } else if (selectedIndex > 0) {
                    // Move up if not at first item
                    selectItem(selectedIndex - 1);
                }
                // Do nothing if already at first item (stay there)
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                e.stopPropagation();
                try {
                    sessionStorage.setItem('searchHighlight', query);
                } catch (e) {
                    console.warn('Failed to store search highlight:', e);
                }
                items[selectedIndex].click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                container.classList.add('hidden');
                if (dropdownParent) {
                    dropdownParent.classList.remove('dropdown-open');
                }
                clearSelected();
                selectedIndex = -1;
                keyboardMode = false;
                container.classList.remove('keyboard-navigation');
            }
        }
    };
    
    // Click handler to reset keyboard mode
    const clickHandler = (e) => {
        // Switch to mouse mode when user clicks anywhere in the dropdown
        if (keyboardMode) {
            keyboardMode = false;
            container.classList.remove('keyboard-navigation');
        }
    };
    
    // Remove old handlers and add new ones
    if (inputElement.searchKeyboardHandler) {
        inputElement.removeEventListener('keydown', inputElement.searchKeyboardHandler);
    }
    if (container.searchClickHandler) {
        container.removeEventListener('click', container.searchClickHandler);
    }
    
    // Add keyboard handler to input element
    inputElement.searchKeyboardHandler = keyboardHandler;
    inputElement.addEventListener('keydown', keyboardHandler);
    
    // Add click handler to container
    container.searchClickHandler = clickHandler;
    container.addEventListener('click', clickHandler);
    
    // Store reference for cleanup
    container.keyboardHandler = keyboardHandler;
}

// Keyboard shortcuts and navigation
document.addEventListener('keydown', function(e) {
    // Check for Command+K (Mac) or Control+K (Windows)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus the appropriate search input based on screen size and visibility
        const desktopSearch = document.getElementById('search-desktop');
        const mobileNavbarSearch = document.getElementById('search-mobile-navbar');
        
        if (desktopSearch && window.getComputedStyle(desktopSearch).display !== 'none') {
            desktopSearch.focus();
        } else if (mobileNavbarSearch && window.getComputedStyle(mobileNavbarSearch).display !== 'none') {
            mobileNavbarSearch.focus();
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
    const currentPath = window.location.pathname;
    // Try multiple selectors to find menu items - prioritize sidebar navigation
    const possibleSelectors = [
        '.drawer-side a',  // Main sidebar container
        'aside a',         // Sidebar aside element  
        '.menu.p-4 a',     // Specific sidebar menu class
        '#sidebar-menu ul li a',
        '#sidebar-menu a',  
        '.sidebar a',
        'nav a',           // Fallback to nav (may pick up wrong navigation)
        '.menu a'
    ];
    
    let menuItems = [];
    for (const selector of possibleSelectors) {
        const items = document.querySelectorAll(selector);
        if (items.length > 0) {
            menuItems = items;
            break;
        }
    }
    
    if (menuItems.length === 0) {
        return;
    }
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        
        // Normalize paths for comparison
        const normalizedHref = href.replace(/^\//, '').replace(/\.html$/, '');
        const normalizedPath = currentPath.replace(/^\//, '').replace(/\.html$/, '');
        
        // Handle index/home page
        const isHome = (normalizedPath === '' || normalizedPath === 'index') && 
                      (normalizedHref === '' || normalizedHref === 'index');
        
        // Check for exact match or if it's the home page
        const isActive = isHome || normalizedPath === normalizedHref;
        
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



// Note: Layout positioning now handled purely with Tailwind CSS classes
// No JavaScript needed for sidebar height or footer positioning

// Page navigation scroll sync functionality
function initializePageNavigationSync() {
    // Find all headings that have IDs (these are the navigable sections)
    const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
    const navLinks = document.querySelectorAll('.fixed [href^="#"]'); // Page nav links
    
    if (headings.length === 0 || navLinks.length === 0) {
        return; // No headings or nav links to sync
    }
    
    // Create a map of heading IDs to nav links for quick lookup
    const navLinkMap = new Map();
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            navLinkMap.set(targetId, link);
        }
    });
    
    // Function to update active nav item
    function updateActiveNavItem(activeHeadingId) {
        if (!activeHeadingId || !navLinkMap.has(activeHeadingId)) {
            return; // Don't clear selection if we don't have a valid replacement
        }
        
        // Remove active class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('nav-active');
            link.style.fontWeight = '';
            link.style.color = '';
        });
        
        // Add active class to current nav link
        const activeNavLink = navLinkMap.get(activeHeadingId);
        if (activeNavLink) {
            activeNavLink.classList.add('nav-active');
            activeNavLink.style.fontWeight = 'bold';
            activeNavLink.style.color = 'hsl(var(--p))'; // Primary color
            // No auto-scrolling - let users navigate the page nav manually
        }
    }
    
    let currentActiveId = null;
    let updateTimer = null;
    
    // Initialize with first heading to ensure something is always active
    function ensureActiveSelection() {
        if (!currentActiveId && headings.length > 0) {
            currentActiveId = headings[0].id;
            updateActiveNavItem(currentActiveId);
        }
    }
    
    // Debounced function to update active navigation
    function debouncedUpdateActiveItem(headingId) {
        if (updateTimer) clearTimeout(updateTimer);
        
        updateTimer = setTimeout(() => {
            if (headingId && headingId !== currentActiveId && navLinkMap.has(headingId)) {
                currentActiveId = headingId;
                updateActiveNavItem(headingId);
            } else if (!currentActiveId) {
                // Fallback: ensure we always have something active
                ensureActiveSelection();
            }
        }, 100); // 100ms debounce
    }
    
    // More stable heading detection based on scroll position
    function findActiveHeading() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const triggerPoint = scrollTop + viewportHeight * 0.25; // 25% down from top of viewport
        
        // Find the last heading that's above the trigger point
        let activeHeading = null;
        
        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const rect = heading.getBoundingClientRect();
            const headingTop = scrollTop + rect.top;
            
            if (headingTop <= triggerPoint) {
                activeHeading = heading;
                break;
            }
        }
        
        // For the very top of the page, use the first heading
        if (!activeHeading && scrollTop < 100 && headings.length > 0) {
            activeHeading = headings[0];
        }
        
        return activeHeading;
    }
    
    // Use scroll event with throttling instead of Intersection Observer for more stability
    let scrollTimer = null;
    function handleScroll() {
        if (scrollTimer) return;
        
        scrollTimer = setTimeout(() => {
            const activeHeading = findActiveHeading();
            if (activeHeading && activeHeading.id) {
                debouncedUpdateActiveItem(activeHeading.id);
            }
            // If no active heading found, keep the current selection (better UX)
            scrollTimer = null;
        }, 50); // Throttle to every 50ms
    }
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial sync on page load - ensure something is always active
    setTimeout(() => {
        const activeHeading = findActiveHeading();
        if (activeHeading && activeHeading.id && navLinkMap.has(activeHeading.id)) {
            currentActiveId = activeHeading.id;
            updateActiveNavItem(activeHeading.id);
        } else {
            // Fallback: activate the first heading if no clear active heading
            ensureActiveSelection();
        }
    }, 100);
    
    // Cleanup function for page navigation
    return () => {
        window.removeEventListener('scroll', handleScroll);
        if (updateTimer) clearTimeout(updateTimer);
        if (scrollTimer) clearTimeout(scrollTimer);
    };
}

// Initialize page navigation sync when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the page to fully load including dynamic content
    setTimeout(initializePageNavigationSync, 500);
});


