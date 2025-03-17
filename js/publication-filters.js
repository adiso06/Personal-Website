document.addEventListener('DOMContentLoaded', function() {
  // Add a back-to-top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'back-to-top';
  backToTopBtn.innerHTML = '<span class="arrow-up">↑</span>';
  backToTopBtn.title = 'Back to Top';
  document.body.appendChild(backToTopBtn);
  
  /**
   * Check if an element is in the viewport
   * @param {HTMLElement} el - The element to check
   * @returns {boolean} - True if the element is in the viewport
   */
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  // Show/hide back-to-top button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });
  
  // Scroll to top when the button is clicked
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Intersection Observer to detect when publications section enters viewport
  const pubsContainer = document.getElementById('publications-container');
  if (pubsContainer) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // When publications container enters viewport
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          // Calculate position to scroll to (top of filter)
          const scrollToPosition = pubsContainer.getBoundingClientRect().top + window.pageYOffset - 20;
          
          // Scroll to show filter at top
          window.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
          });
          
          // Disconnect after scrolling once
          observer.disconnect();
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is visible
    });
    
    // Start observing the publications container
    observer.observe(pubsContainer);
  }

  // Reference to the filter container and its content area
  const stickyFilter = document.getElementById('sticky-filter');
  const dynamicFilters = document.getElementById('dynamic-filters');
  
  // References to relevant sections
  const publicationsSection = document.getElementById('publications');
  const abstractsSection = document.getElementById('abstracts');
  const postersSection = document.getElementById('posters');
  
  // Get all items that have data-field attributes
  const items = document.querySelectorAll('[data-field]');
  
  // Extract unique fields from all items
  const allFields = new Set();
  items.forEach(item => {
    const fields = item.getAttribute('data-field').split(',');
    fields.forEach(field => allFields.add(field.trim()));
  });
  
  // Create filter options
  const sortedFields = Array.from(allFields).sort();
  
  // Add "All" option first
  const allOption = document.createElement('div');
  allOption.className = 'filter-option active';
  allOption.textContent = 'All';
  allOption.setAttribute('data-filter', 'all');
  dynamicFilters.appendChild(allOption);
  
  // Add individual field options
  sortedFields.forEach(field => {
    const option = document.createElement('div');
    option.className = 'filter-option';
    option.textContent = field.replace(/-/g, ' '); // Replace hyphens with spaces for display
    option.setAttribute('data-filter', field);
    dynamicFilters.appendChild(option);
  });
  
  // Add click handlers to filter options
  const filterOptions = document.querySelectorAll('.filter-option');
  filterOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all options
      filterOptions.forEach(opt => opt.classList.remove('active'));
      
      // Add active class to clicked option
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Show all items if "All" selected
      if (filter === 'all') {
        items.forEach(item => item.style.display = '');
        return;
      }
      
      // Otherwise filter based on selected category
      items.forEach(item => {
        const itemFields = item.getAttribute('data-field').split(',');
        if (itemFields.some(field => field.trim() === filter)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
  
  // Helper function to check if user is scrolled into a section
  function isInSection(section) {
    if (!section) return false;
    
    // Check if the section is hidden via CSS
    const computedStyle = window.getComputedStyle(section);
    if (computedStyle.display === 'none') return false;
    
    const rect = section.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Check if a significant portion of the section is visible
    return (
      (rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2) ||
      (rect.top >= 0 && rect.top <= windowHeight * 0.5) ||
      (rect.bottom >= windowHeight * 0.5 && rect.bottom <= windowHeight)
    );
  }
  
  // Check if we're in any of the relevant sections
  function isInRelevantSection() {
    const publicationsSection = document.getElementById('publications');
    const abstractsSection = document.getElementById('abstracts');
    const postersSection = document.getElementById('posters');
    
    return (
      isInSection(publicationsSection) || 
      isInSection(abstractsSection) || 
      isInSection(postersSection)
    );
  }
  
  // Function to check filter visibility
  function checkFilterVisibility() {
    const stickyFilter = document.getElementById('sticky-filter');
    if (!stickyFilter) return;
    
    // Check if on mobile (width <= 768px)
    const isMobile = window.innerWidth <= 768;
    
    // Always hide on mobile devices
    if (isMobile) {
      stickyFilter.classList.remove('visible');
      stickyFilter.classList.add('hidden');
      return;
    }
    
    if (isInRelevantSection()) {
      stickyFilter.classList.add('visible');
      stickyFilter.classList.remove('hidden');
    } else {
      stickyFilter.classList.remove('visible');
      stickyFilter.classList.add('hidden');
    }
  }
  
  // Check visibility on scroll
  window.addEventListener('scroll', checkFilterVisibility);
  
  // Check visibility on page load and resize
  window.addEventListener('load', checkFilterVisibility);
  window.addEventListener('resize', checkFilterVisibility);

  // First, generate the filter buttons
  const filterContainer = document.getElementById('dynamic-filters');
  
  if (filterContainer) {
    // Get all items with data-field attributes
    const items = document.querySelectorAll('.view-list-item[data-field], li[data-field]');
    
    // Create a Set to store unique categories
    const categories = new Set();
    categories.add('All'); // Add default "All" category
    
    // Collect all unique categories from data-field attributes
    items.forEach(item => {
      const fields = item.getAttribute('data-field');
      if (fields) {
        fields.split(',').forEach(field => {
          categories.add(field.trim());
        });
      }
    });
    
    // Count publications by category for frequency ordering
    const categoryCount = {};
    categories.forEach(category => {
      if (category !== 'All') {
        categoryCount[category] = 0;
      }
    });
    
    // Count occurrences of each category
    items.forEach(item => {
      const fields = item.getAttribute('data-field');
      if (fields) {
        fields.split(',').forEach(field => {
          const trimmedField = field.trim();
          if (trimmedField !== 'All') {
            categoryCount[trimmedField] = (categoryCount[trimmedField] || 0) + 1;
          }
        });
      }
    });
    
    // Custom ordering: predefined order for specific categories, then by frequency
    const predefinedOrder = ['All', 'Gastroenterology', 'Hematology', 'Oncology'];
    const remainingCategories = Array.from(categories)
      .filter(category => !predefinedOrder.includes(category))
      .sort((a, b) => {
        // Sort by count (higher first)
        return categoryCount[b] - categoryCount[a];
      });
    
    // Combine predefined and remaining categories
    const customOrderedCategories = [
      ...predefinedOrder.filter(cat => categories.has(cat)),
      ...remainingCategories
    ];
    
    // Clear any existing content
    filterContainer.innerHTML = '';
    
    // Create and append filter buttons
    customOrderedCategories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'filter-button';
      button.setAttribute('data-field', category);
      
      // Display full category name without truncation
      const displayName = category === 'All' ? 'All' : category.replace(/-/g, ' ');
      
      button.textContent = displayName;
      filterContainer.appendChild(button);
    });
  }

  // Get all filter buttons
  const filterButtons = document.querySelectorAll('.filter-button');
  
  // Get all category headings
  const categoryHeadings = document.querySelectorAll('.category-heading');
  
  // Add click event listeners to each filter button
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const field = this.getAttribute('data-field');
      
      // Deactivate all buttons first
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Activate the clicked button
      this.classList.add('active');
      
      // Apply visual styling to active button
      filterButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
          btn.style.backgroundColor = '#33B38D';
          btn.style.color = 'white';
        } else {
          btn.style.backgroundColor = '';
          btn.style.color = '';
        }
      });
      
      // Handle the filtering
      if (field === 'All') {
        showAllItems();
        showAllCategoryHeadings();
        showAllSections();
      } else {
        filterItemsByField(field);
        toggleCategoryHeadings();
        toggleSectionVisibility();
      }
      
      // Add this line to update numbering after filtering
      setTimeout(updateResearchNumbering, 100);
      
      // No need to scroll - we're already in the publications section
      // Just make sure we stay at the top of the publications with the filter visible
      const stickyFilter = document.getElementById('sticky-filter');
      if (stickyFilter) {
        // Ensure filter is visible in viewport
        if (!isElementInViewport(stickyFilter)) {
          stickyFilter.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Function to show all sections
  function showAllSections() {
    if (publicationsSection) publicationsSection.style.display = '';
    if (abstractsSection) abstractsSection.style.display = '';
    if (postersSection) postersSection.style.display = '';
  }

  // Function to check if a section has any visible items
  function hasSectionVisibleItems(section) {
    if (!section) return false;
    
    // Check regular view-list-items
    const viewItems = section.querySelectorAll('.view-list-item');
    for (const item of viewItems) {
      if (!item.classList.contains('hidden') && window.getComputedStyle(item).display !== 'none') {
        return true;
      }
    }
    
    // Check list items with data-field
    const listItems = section.querySelectorAll('li[data-field]');
    for (const item of listItems) {
      if (window.getComputedStyle(item).display !== 'none') {
        return true;
      }
    }
    
    return false;
  }

  // Function to toggle section visibility based on visible content
  function toggleSectionVisibility() {
    // For each section, check if it has visible content
    if (publicationsSection) {
      publicationsSection.style.display = hasSectionVisibleItems(publicationsSection) ? '' : 'none';
    }
    
    if (abstractsSection) {
      abstractsSection.style.display = hasSectionVisibleItems(abstractsSection) ? '' : 'none';
    }
    
    if (postersSection) {
      const hasVisibleItems = hasSectionVisibleItems(postersSection);
      const hasVisibleHeadings = Array.from(postersSection.querySelectorAll('.category-heading'))
        .some(heading => window.getComputedStyle(heading).display !== 'none');
        
      postersSection.style.display = (hasVisibleItems || hasVisibleHeadings) ? '' : 'none';
    }
  }

  // Function to show all items across all sections
  function showAllItems() {
    // Show all publication and abstract items
    const items = document.querySelectorAll('.view-list-item');
    items.forEach(item => {
      item.classList.remove('hidden');
      item.style.display = '';
    });
    
    // Show all poster list items
    const listItems = document.querySelectorAll('li[data-field]');
    listItems.forEach(item => {
      item.style.display = '';
    });
  }
  
  // Function to show all category headings
  function showAllCategoryHeadings() {
    categoryHeadings.forEach(heading => {
      heading.style.display = '';
    });
  }
  
  // Function to toggle category headings based on visible child elements
  function toggleCategoryHeadings() {
    categoryHeadings.forEach(heading => {
      // Check if there are any visible items under this heading
      let hasVisibleItem = false;
      
      // First, check if the next element is a UL (posters section)
      let nextElement = heading.nextElementSibling;
      if (nextElement && nextElement.tagName === 'UL') {
        // Check list items under this heading
        const listItems = nextElement.querySelectorAll('li[data-field]');
        for (const item of listItems) {
          if (window.getComputedStyle(item).display !== 'none') {
            hasVisibleItem = true;
            break;
          }
        }
      } else {
        // Otherwise, check all following siblings until the next heading
        let current = heading.nextElementSibling;
        while (current && !current.classList.contains('category-heading')) {
          // Check for view-list-items
          if (current.classList && current.classList.contains('view-list-item')) {
            if (!current.classList.contains('hidden') && window.getComputedStyle(current).display !== 'none') {
              hasVisibleItem = true;
              break;
            }
          }
          
          // Check for nested items
          const nestedItems = current.querySelectorAll('.view-list-item:not(.hidden), li[data-field]');
          for (const item of nestedItems) {
            if (window.getComputedStyle(item).display !== 'none') {
              hasVisibleItem = true;
              break;
            }
          }
          
          if (hasVisibleItem) break;
          current = current.nextElementSibling;
          if (!current) break;
        }
      }
      
      // Show/hide the heading based on whether it has visible items
      heading.style.display = hasVisibleItem ? '' : 'none';
    });
  }

  // Function to filter items by field
  function filterItemsByField(field) {
    // Filter publication and abstract items
    const items = document.querySelectorAll('.view-list-item');
    items.forEach(item => {
      const itemField = item.getAttribute('data-field');
      
      // Check if the item has the specified field
      let hasField = false;
      if (itemField) {
        const fields = itemField.split(',').map(f => f.trim());
        hasField = fields.includes(field);
      }
      
      if (hasField) {
        item.classList.remove('hidden');
        item.style.display = '';
      } else {
        item.classList.add('hidden');
        item.style.display = 'none';
      }
    });
    
    // Filter poster list items
    const listItems = document.querySelectorAll('li[data-field]');
    listItems.forEach(item => {
      const itemField = item.getAttribute('data-field');
      
      // Check if the item has the specified field
      let hasField = false;
      if (itemField) {
        const fields = itemField.split(',').map(f => f.trim());
        hasField = fields.includes(field);
      }
      
      item.style.display = hasField ? '' : 'none';
    });
  }
  
  // Set the default filter to "All"
  const allButton = document.querySelector('[data-field="All"]');
  if (allButton) {
    allButton.click();
  }

  // Function to update numbering for visible research items
  let lastNumberedCount = 0; // Track last count to prevent unnecessary updates
  
  function updateResearchNumbering() {
    // Get all visible research items across all sections
    const visibleItems = document.querySelectorAll('.view-list-item:not(.hidden):not([style*="display: none"])');
    
    // Only update if the count has changed
    if (visibleItems.length === lastNumberedCount) {
      return; // No change in visible items, skip update
    }
    
    // Save new count
    lastNumberedCount = visibleItems.length;
    
    // Remove any existing numbering
    document.querySelectorAll('.research-number').forEach(el => el.remove());
    
    // Add numbering to visible items
    visibleItems.forEach((item, index) => {
      const numberElement = document.createElement('span');
      numberElement.className = 'research-number';
      numberElement.textContent = `${index + 1}. `;
      numberElement.style.fontWeight = 'bold';
      numberElement.style.marginRight = '5px';
      
      // Get the title element (first a > span) and insert number before it
      const titleElement = item.querySelector('a > span');
      if (titleElement) {
        titleElement.parentNode.insertBefore(numberElement, titleElement);
      }
    });
    
    // Log only when debugging or during initial load
    console.log(`Numbered ${visibleItems.length} visible publication items`);
  }

  // Call when page loads
  updateResearchNumbering();
  
  // Replace this section with the correct class name
  document.querySelectorAll('.filter-button').forEach(btn => {
    btn.addEventListener('click', function() {
      // Small delay to let the filter effect complete
      setTimeout(updateResearchNumbering, 100);
    });
  });

  // Use MutationObserver to catch any other ways the visibility might change
  const publicationsContainer = document.getElementById('publications');
  if (publicationsContainer) {
    // Add debounce to prevent too many updates
    let updateTimeout = null;
    const debouncedUpdate = function() {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      updateTimeout = setTimeout(updateResearchNumbering, 200);
    };

    const observer = new MutationObserver(function(mutations) {
      let shouldUpdate = false;
      
      // Check if we have visibility-related mutations
      for (let i = 0; i < mutations.length; i++) {
        const mutation = mutations[i];
        
        // Only care about style or class changes that affect visibility
        if (mutation.type === 'attributes' && 
           (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          const target = mutation.target;
          if (target.classList.contains('view-list-item') || 
              target.classList.contains('hidden') ||
              target.style.display === 'none') {
            shouldUpdate = true;
            break;
          }
        } else if (mutation.type === 'childList' && 
                  (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
          // Only update if actual view-list-items were added or removed
          const hasRelevantNodes = Array.from(mutation.addedNodes || []).some(node => 
            node.nodeType === 1 && node.classList && node.classList.contains('view-list-item')
          ) || Array.from(mutation.removedNodes || []).some(node => 
            node.nodeType === 1 && node.classList && node.classList.contains('view-list-item')
          );
          
          if (hasRelevantNodes) {
            shouldUpdate = true;
            break;
          }
        }
      }
      
      if (shouldUpdate) {
        debouncedUpdate();
      }
    });
    
    // Observe changes on publications items, but be more selective
    observer.observe(publicationsContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  // Hook into existing filter functionality (assuming filterPublications is the existing function)
  const originalFilterFunction = window.filterPublications || function(){};
  window.filterPublications = function(...args) {
    // Call the original function
    originalFilterFunction.apply(this, args);
    // Update numbering
    setTimeout(updateResearchNumbering, 100);
  };

  // Add the ability to collapse/expand the filter bar when scrolling
  let lastScrollTop = 0;
  let compactModeApplied = false;
  
  window.addEventListener('scroll', function() {
    const filterContainer = document.getElementById('sticky-filter');
    if (!filterContainer) return;
    
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const pubsContainer = document.getElementById('publications-container');
    const pubsPosition = pubsContainer ? pubsContainer.getBoundingClientRect().top : -1;
    
    // Apply compact mode when:
    // 1. We've scrolled down more than 50px
    // 2. The publications container is at or above the viewport top
    if (st > 50 && pubsPosition <= 0) {
      if (!compactModeApplied) {
        filterContainer.classList.add('compact-mode');
        compactModeApplied = true;
      }
    } else {
      if (compactModeApplied) {
        filterContainer.classList.remove('compact-mode');
        compactModeApplied = false;
      }
    }
    
    lastScrollTop = st <= 0 ? 0 : st;
  }, { passive: true });

  // Handle smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}); 