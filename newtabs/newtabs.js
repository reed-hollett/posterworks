let gui;
let params = {
  // Tab titles
  tab1Title: "Overview",
  tab2Title: "Specifications",
  tab3Title: "Details",
  tab4Title: "Resources",
  
  // Tab structure
  tabCount: 4,
  activeTab: 0,
  
  // Screen size
  screenSize: 500, // Changed from 350 to 500
  
  // Styling
  cornerRadius: 16,
  fontSize: 14,
  textVerticalPosition: 2,
  indicatorHeight: 0,
  showIcons: true,
  
  // Colors
  backgroundColor: "#F5F5F5",
  tabBackgroundColor: "#FFFFFF",
  activeTabBackgroundColor: "#6750A4",
  tabTextColor: "#49454F",
  activeTabTextColor: "#FFFFFF",
  hoverTabBackgroundColor: "#F7F2FA",
  
  // Export
  export: function() {
    saveCanvas('tabs-component', 'png');
  }
};

// Track mouse position and hover state
let mouseOverTab = -1;

// Material Icons for each tab
const tabIcons = ["home", "description", "info", "folder"];
let iconElements = [];

// Color palette with 12 different hues
const colorPalette = [
  "#6750A4", // Purple (original)
  "#B3261E", // Red
  "#E94235", // Google Red
  "#FF8A65", // Orange
  "#FB8C00", // Dark Orange
  "#FFB74D", // Amber
  "#FDD835", // Yellow
  "#7CB342", // Light Green
  "#0F9D58", // Google Green
  "#00BCD4", // Cyan
  "#4285F4"  // Google Blue
];

// Create an array to store tab sets configuration
const tabSets = [];

// Generate 10 random tab set configurations
function generateTabSets() {
  // Clear previous configurations
  tabSets.length = 0;
  
  // Take the first 10 colors from the palette
  // We'll create one tab set per color
  const usedColors = colorPalette.slice(0, 10);
  
  for (let i = 0; i < 10; i++) {
    // Random number of tabs (2-4)
    const tabCount = Math.floor(Math.random() * 3) + 2;
    
    // Random active tab (ensuring it's within the valid range)
    const activeTab = Math.floor(Math.random() * tabCount);
    
    // Calculate hover color based on active color
    const activeColor = color(usedColors[i]);
    const r = red(activeColor);
    const g = green(activeColor);
    const b = blue(activeColor);
    const hoverColor = color(
      r + (255 - r) * 0.85,
      g + (255 - g) * 0.85,
      b + (255 - b) * 0.85
    ).toString('#rrggbb');
    
    // Add to tabSets array
    tabSets.push({
      tabCount: tabCount,
      activeTab: activeTab,
      activeTabBackgroundColor: usedColors[i],
      hoverTabBackgroundColor: hoverColor
    });
  }
}

// Select a random color on load
let randomColorIndex = Math.floor(Math.random() * colorPalette.length);

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto, sans-serif');
  
  // Generate tab sets with random configurations
  generateTabSets();
  
  // Add Material Icons stylesheet to the document
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(link);
  
  // Create icon elements (we'll need more now - 4 icons per tab set)
  for (let i = 0; i < tabSets.length; i++) {
    const tabSetIcons = [];
    for (let j = 0; j < tabIcons.length; j++) {
      const icon = document.createElement('span');
      icon.className = 'material-icons';
      icon.textContent = tabIcons[j];
      icon.style.position = 'absolute';
      icon.style.display = 'none';
      icon.style.color = params.activeTabTextColor;
      icon.style.userSelect = 'none';
      icon.style.pointerEvents = 'none';
      document.body.appendChild(icon);
      tabSetIcons.push(icon);
    }
    iconElements.push(tabSetIcons);
  }
  
  // Setup GUI - single panel with all controls
  gui = new lil.GUI();
  gui.title("Controls");
  
  // Tab content
  gui.add(params, 'screenSize', 320, 800, 1).name('Tab Width (dp)').onChange(redraw);
  gui.add(params, 'cornerRadius', 0, 30, 1).name('Corner Radius').onChange(redraw);
  gui.add(params, 'fontSize', 12, 24, 1).name('Font Size').onChange(redraw);
  gui.add(params, 'showIcons').name('Show Icons').onChange(redraw);
  
  // Export
  gui.add(params, 'export').name('Export as PNG');
  
  // Apply theme
  applyTheme(getCurrentTheme());
  
  // No need for loop() since we're just displaying static tab sets
  noLoop();
  redraw();
}

function draw() {
  // Clear canvas and set background
  background(params.backgroundColor);
  
  const tabTitles = [
    params.tab1Title,
    params.tab2Title,
    params.tab3Title,
    params.tab4Title
  ];
  
  // Set tabs width based on params
  const tabsWidth = params.screenSize;
  const tabsHeight = params.fontSize * 3;
  
  // Calculate spacing between tab sets
  const spacingBetweenSets = tabsHeight * 0.5;
  
  // Calculate total height needed for all tab sets
  const totalHeight = (tabsHeight + spacingBetweenSets) * tabSets.length - spacingBetweenSets;
  
  // Start Y position (centered vertically)
  let startY = (height - totalHeight) / 2;
  
  // Position X (centered horizontally)
  const tabsX = width / 2 - tabsWidth / 2;
  
  // Draw each tab set
  for (let setIndex = 0; setIndex < tabSets.length; setIndex++) {
    const tabSet = tabSets[setIndex];
    const tabsY = startY;
    
    // Calculate tab widths for this set
    const tabWidth = tabsWidth / tabSet.tabCount;
    
    // Draw tabs for this set
    textSize(params.fontSize);
    textAlign(CENTER, CENTER);
    
    // Hide all icons for this set first
    if (iconElements[setIndex]) {
      iconElements[setIndex].forEach(icon => {
        icon.style.display = 'none';
      });
    }
    
    for (let i = 0; i < tabSet.tabCount; i++) {
      const tabX = tabsX + i * tabWidth;
      const isActive = i === tabSet.activeTab;
      
      // Tab background
      if (isActive) {
        fill(tabSet.activeTabBackgroundColor);
      } else {
        fill(params.tabBackgroundColor);
      }
      noStroke();
      
      // Draw rounded rectangles for tabs with proper corner rounding
      if (isActive) {
        // Active tab - use rounded rectangle for all corners
        drawRoundedRect(tabX, tabsY, tabWidth, tabsHeight, params.cornerRadius);
      } else {
        // Inactive tabs - no rounded corners
        rect(tabX, tabsY, tabWidth, tabsHeight);
      }
      
      // Tab text
      fill(isActive ? params.activeTabTextColor : params.tabTextColor);
      
      // Make sure to use the appropriate title for this tab
      const tabTitle = tabTitles[i] || `Tab ${i+1}`;
      
      // If showing icons and this is the active tab
      if (params.showIcons && isActive && iconElements[setIndex] && iconElements[setIndex][i]) {
        // Calculate positions
        const iconSize = params.fontSize * 1.2;
        const spacing = params.fontSize * 0.5;
        const textW = textWidth(tabTitle);
        const totalWidth = iconSize + spacing + textW;
        const startX = tabX + tabWidth / 2 - totalWidth / 2;
        
        // Position and show the icon
        const icon = iconElements[setIndex][i];
        icon.style.display = 'block';
        icon.style.fontSize = `${iconSize}px`;
        icon.style.left = `${startX}px`;
        
        // Adjust icon vertical position to align with text
        icon.style.top = `${tabsY + tabsHeight/2 - iconSize/2 + params.textVerticalPosition - 1}px`;
        icon.style.color = params.activeTabTextColor;
        
        // Draw the text with vertical position adjustment
        text(tabTitle, startX + iconSize + spacing + textW/2, tabsY + tabsHeight / 2 + params.textVerticalPosition);
      } else {
        // Just draw the text centered with vertical position adjustment
        text(tabTitle, tabX + tabWidth / 2, tabsY + tabsHeight / 2 + params.textVerticalPosition);
      }
    }
    
    // Move to the next position for the next tab set
    startY += tabsHeight + spacingBetweenSets;
  }
}

// We no longer need mousePressed for interaction since we're just displaying
// static tab sets, but keep it here for future reference
function mousePressed() {
  // Disabled interaction
}

// Helper function to draw a rounded rectangle with different top and bottom radii
function drawRoundedRect(x, y, w, h, r) {
  // Use the full radius for top corners
  const topRadius = r;
  // Use a smaller radius for bottom corners (about 1/4 of the top radius)
  const bottomRadius = r / 4;
  
  beginShape();
  // Top-left corner
  vertex(x + topRadius, y);
  // Top edge
  vertex(x + w - topRadius, y);
  // Top-right corner
  arc(x + w - topRadius, y + topRadius, topRadius * 2, topRadius * 2, -HALF_PI, 0);
  // Right edge
  vertex(x + w, y + topRadius);
  vertex(x + w, y + h - bottomRadius);
  // Bottom-right corner
  arc(x + w - bottomRadius, y + h - bottomRadius, bottomRadius * 2, bottomRadius * 2, 0, HALF_PI);
  // Bottom edge
  vertex(x + w - bottomRadius, y + h);
  vertex(x + bottomRadius, y + h);
  // Bottom-left corner
  arc(x + bottomRadius, y + h - bottomRadius, bottomRadius * 2, bottomRadius * 2, HALF_PI, PI);
  // Left edge
  vertex(x, y + h - bottomRadius);
  vertex(x, y + topRadius);
  // Top-left corner completion
  arc(x + topRadius, y + topRadius, topRadius * 2, topRadius * 2, PI, PI + HALF_PI);
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

function applyTheme(theme) {
  if (theme === 'dark') {
    applyDarkTheme(gui);
  } else {
    applyLightTheme(gui);
  }
}

function applyDarkTheme(gui) {
  gui.domElement.style.setProperty('--background-color', '#1a1a1a');
  gui.domElement.style.setProperty('--text-color', '#CCCCCC');
  gui.domElement.style.setProperty('--title-background-color', '#2a2a2a');
  gui.domElement.style.setProperty('--title-text-color', '#FFFFFF');
  gui.domElement.style.setProperty('--widget-color', '#3a3a3a');
  gui.domElement.style.setProperty('--hover-color', '#4a4a4a');
  gui.domElement.style.setProperty('--focus-color', '#5a5a5a');
  gui.domElement.style.setProperty('--number-color', '#CCCCCC');
  gui.domElement.style.setProperty('--string-color', '#CCCCCC');
  updateControllerStyles(gui, '#CCCCCC');
}

function applyLightTheme(gui) {
  gui.domElement.style.setProperty('--background-color', '#FAFAFA');
  gui.domElement.style.setProperty('--text-color', '#4D4D4D');
  gui.domElement.style.setProperty('--title-background-color', '#F0F0F0');
  gui.domElement.style.setProperty('--title-text-color', '#262626');
  gui.domElement.style.setProperty('--widget-color', '#f0f0f0');
  gui.domElement.style.setProperty('--hover-color', '#eee');
  gui.domElement.style.setProperty('--focus-color', '#ddd');
  gui.domElement.style.setProperty('--number-color', '#4D4D4D');
  gui.domElement.style.setProperty('--string-color', '#4D4D4D');
  updateControllerStyles(gui, '#4D4D4D');
}

function updateControllerStyles(gui, color) {
  gui.controllers.forEach(controller => {
    if (controller.domElement) {
      controller.domElement.style.color = color;
      if (controller.domElement.querySelector('input')) {
        controller.domElement.querySelector('input').style.color = color;
      }
    }
  });
}

window.addEventListener('storage', function(e) {
  if (e.key === 'theme') {
    applyTheme(e.newValue);
  }
});

// Clean up when the sketch is removed
function remove() {
  // Remove icon elements
  for (let i = 0; i < iconElements.length; i++) {
    if (iconElements[i]) {
      iconElements[i].forEach(icon => {
        if (icon && icon.parentNode) {
          icon.parentNode.removeChild(icon);
        }
      });
    }
  }
  iconElements = [];
  
  // Call the original remove function
  if (typeof p5.prototype.remove === 'function') {
    p5.prototype.remove.call(this);
  }
} 