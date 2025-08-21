/**
 * Handlebars helper for creating tabbed content
 * @param {Array} tabs - Array of tab objects with title and content
 * @param {Object} options - Handlebars options object
 * @returns {string} HTML string for the tabs component
 * 
 * @example
 * {{#tabs}}
 *   {{#tab title="JavaScript"}}
 *     ```js
 *     const x = 42;
 *     ```
 *   {{/tab}}
 *   {{#tab title="Python"}}
 *     ```python
 *     x = 42
 *     ```
 *   {{/tab}}
 * {{/tabs}}
 */

/**
 * Normalize indentation by removing common leading whitespace
 * @param {string} content - The content to normalize
 * @returns {string} Content with normalized indentation
 */
function normalizeIndentation(content) {
  if (!content || typeof content !== 'string') return content;
  
  const lines = content.split('\n');
  
  // Remove empty lines from the beginning and end
  while (lines.length > 0 && lines[0].trim() === '') lines.shift();
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
  
  if (lines.length === 0) return '';
  
  // Find the minimum indentation (ignoring empty lines)
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  if (nonEmptyLines.length === 0) return content;
  
  const minIndent = Math.min(...nonEmptyLines.map(line => {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }));
  
  // Remove the common indentation from all lines
  const normalizedLines = lines.map(line => {
    if (line.trim() === '') return ''; // Convert empty lines to truly empty
    return line.slice(minIndent);
  });
  
  // Join and clean up excessive newlines
  return normalizedLines.join('\n').replace(/\n{3,}/g, '\n\n');
}

function registerTabs(md, handlebarsInstance)  {
  handlebarsInstance.registerHelper('tabs', function (options) {
    // Initialize the tabs array at the root level
    options.data.root.tabs = [];
    
    // Execute the block content which will populate the tabs array
    options.fn(this);
    
    const tabs = options.data.root.tabs || [];
    const tabId = `tabs_${Math.random().toString(36).substring(2, 11)}`;

    let html = []
    html.push(`<div class="tabs tabs-bordered">`);
    // Generate tab inputs and content with proper DaisyUI structure
    tabs.forEach((tab, index) => {
      const isChecked = index === 0 ? 'checked="checked"' : '';
      html.push(`<input type="radio" name="${tabId}" class="tab" aria-label="${tab.title}" ${isChecked}/>`);
      html.push(`<div class="tab-content border-base-300 bg-base-100 p-6">`);
      // Only normalize indentation - let the main markdown pipeline handle all processing
      const normalizedContent = normalizeIndentation(tab.content);
      html.push(`\n\n${normalizedContent}\n\n`);
      html.push(`</div>`);
    });

    html.push(`</div>\n\n`);
    return new handlebarsInstance.SafeString(html.join('\n'));
  });

  /**
   * Helper for individual tab content
   */
  handlebarsInstance.registerHelper('tab', function (options) {
    const tabs = options.data.root.tabs || [];
    tabs.push({
      title: options.hash.title,
      content: options.fn(this)
    });
    options.data.root.tabs = tabs;
    return '';
  });
}

export default registerTabs;