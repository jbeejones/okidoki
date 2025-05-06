import Handlebars from 'handlebars';

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
//import { marked } from 'marked';
function registerTabs(marked) {
  Handlebars.registerHelper('tabs', function (options) {
    // Initialize the tabs array at the root level
    options.data.root.tabs = [];
    
    // Execute the block content which will populate the tabs array
    options.fn(this);
    
    const tabs = options.data.root.tabs || [];
    const tabId = `tabs_${Math.random().toString(36).substring(2, 11)}`;

    let html = []
    html.push(`<div class="tabs tabs-border">`);
    // Generate tab inputs and content
    tabs.forEach((tab, index) => {
      const isChecked = index === 0 ? 'checked="checked"' : '';
      html.push(`<input type="radio" name="${tabId}" class="tab" aria-label="${tab.title}" ${isChecked}/>`);
      //const sanitizedContent = marked.parse(tab.content); 
      const sanitizedContent = marked.parse(tab.content.replace(/\n\s*\n/g, '\n'));
      html.push(`<div class="tab-content border-base-300 bg-base-100 p-0">${sanitizedContent}</div>`);
    });

    html.push(`</div>`);
    console.log('code html', html);
    return new Handlebars.SafeString(html.join('\n'));
  });

  /**
   * Helper for individual tab content
   */
  Handlebars.registerHelper('tab', function (options) {
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