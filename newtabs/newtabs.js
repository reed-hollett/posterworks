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
  screenSize: 620,
  
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
  "#F2B8B5", // Light Red
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

// Select a random color on load
let randomColorIndex = Math.floor(Math.random() * colorPalette.length);

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto, sans-serif');
  
  // Set the active tab color to a random color from the palette
  params.activeTabBackgroundColor = colorPalette[randomColorIndex];
  
  // Calculate a matching hover color (lighter version of the active color)
  const activeColor = color(params.activeTabBackgroundColor);
  const r = red(activeColor);
  const g = green(activeColor);
  const b = blue(activeColor);
  params.hoverTabBackgroundColor = color(
    r + (255 - r) * 0.85,
    g + (255 - g) * 0.85,
    b + (255 - b) * 0.85
  ).toString('#rrggbb');
  
  // Add Material Icons stylesheet to the document
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(link);
  
  // Create icon elements
  for (let i = 0; i < tabIcons.length; i++) {
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = tabIcons[i];
    icon.style.position = 'absolute';
    icon.style.display = 'none';
    icon.style.color = params.activeTabTextColor;
    icon.style.userSelect = 'none';
    icon.style.pointerEvents = 'none';
    document.body.appendChild(icon);
    iconElements.push(icon);
  }
  
  // Setup GUI - single panel with all controls
  gui = new lil.GUI();
  gui.title("Controls");
  
  // Tab content
  gui.add(params, 'tabCount', 2, 4, 1).name('Number of Tabs').onChange(redraw);
  gui.add(params, 'tab1Title').name('Tab 1 Title').onChange(redraw);
  gui.add(params, 'tab2Title').name('Tab 2 Title').onChange(redraw);
  gui.add(params, 'tab3Title').name('Tab 3 Title').onChange(redraw);
  gui.add(params, 'tab4Title').name('Tab 4 Title').onChange(redraw);
  
  // Add a spacer
  const spacer1 = document.createElement('div');
  spacer1.style.height = '10px';
  gui.domElement.appendChild(spacer1);
  
  // Screen size
  gui.add(params, 'screenSize', 320, 1200, 1).name('Screen Size (dp)').onChange(redraw);
  
  // Styling
  gui.add(params, 'cornerRadius', 0, 30, 1).name('Corner Radius').onChange(redraw);
  gui.add(params, 'fontSize', 12, 24, 1).name('Font Size').onChange(redraw);
  gui.add(params, 'textVerticalPosition', -20, 20, 1).name('Text Y Position').onChange(redraw);
  gui.add(params, 'activeTab', 0, 3, 1).name('Active Tab').onChange(redraw);
  gui.add(params, 'showIcons').name('Add Icons').onChange(redraw);
  
  // Add another spacer
  const spacer2 = document.createElement('div');
  spacer2.style.height = '10px';
  gui.domElement.appendChild(spacer2);
  
  // Colors
  gui.addColor(params, 'backgroundColor').name('Background').onChange(redraw);
  gui.addColor(params, 'tabBackgroundColor').name('Inactive Tab BG').onChange(redraw);
  gui.addColor(params, 'activeTabBackgroundColor').name('Active Tab BG').onChange(redraw);
  gui.addColor(params, 'hoverTabBackgroundColor').name('Hover Tab BG').onChange(redraw);
  gui.addColor(params, 'tabTextColor').name('Inactive Tab Text').onChange(redraw);
  gui.addColor(params, 'activeTabTextColor').name('Active Tab Text').onChange(redraw);
  
  // Export
  gui.add(params, 'export').name('Export as PNG');
  
  // Enable loop for hover effects
  loop();
  
  // Apply theme
  applyTheme(getCurrentTheme());
}

function draw() {
  // Clear canvas and set background
  background(params.backgroundColor);
  
  // Calculate tab dimensions
  const tabTitles = [
    params.tab1Title,
    params.tab2Title,
    params.tab3Title,
    params.tab4Title
  ].slice(0, params.tabCount);
  
  // Set tabs width to exactly match the screen size
  const tabsWidth = params.screenSize;
  const tabsHeight = params.fontSize * 3;
  const tabsX = width / 2 - tabsWidth / 2;
  const tabsY = height / 2 - tabsHeight / 2;
  
  // Calculate tab widths
  const tabWidth = tabsWidth / params.tabCount;
  
  // Check which tab the mouse is over
  mouseOverTab = -1;
  if (mouseY >= tabsY && mouseY <= tabsY + tabsHeight) {
    for (let i = 0; i < params.tabCount; i++) {
      const tabX = tabsX + i * tabWidth;
      if (mouseX >= tabX && mouseX <= tabX + tabWidth) {
        mouseOverTab = i;
        // Change cursor to pointer when over a tab
        cursor(HAND);
        break;
      }
    }
  }
  
  if (mouseOverTab === -1) {
    // Reset cursor when not over a tab
    cursor(AUTO);
  }
  
  // Draw tabs
  textSize(params.fontSize);
  textAlign(CENTER, CENTER);
  
  // Hide all icons first
  iconElements.forEach(icon => {
    icon.style.display = 'none';
  });
  
  for (let i = 0; i < params.tabCount; i++) {
    const tabX = tabsX + i * tabWidth;
    const isActive = i === params.activeTab;
    const isHovered = i === mouseOverTab && !isActive;
    
    // Tab background
    if (isActive) {
      fill(params.activeTabBackgroundColor);
    } else if (isHovered) {
      fill(params.hoverTabBackgroundColor);
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
    
    // If showing icons and this is the active tab
    if (params.showIcons && isActive) {
      // Calculate positions
      const iconSize = params.fontSize * 1.2;
      const spacing = params.fontSize * 0.5;
      const textW = textWidth(tabTitles[i]);
      const totalWidth = iconSize + spacing + textW;
      const startX = tabX + tabWidth / 2 - totalWidth / 2;
      
      // Position and show the icon
      const icon = iconElements[i];
      icon.style.display = 'block';
      icon.style.fontSize = `${iconSize}px`;
      icon.style.left = `${startX}px`;
      
      // Adjust icon vertical position to align with text
      // The icon needs different positioning than the text to appear aligned
      icon.style.top = `${tabsY + tabsHeight/2 - iconSize/2 + params.textVerticalPosition - 1}px`;
      icon.style.color = params.activeTabTextColor;
      
      // Draw the text with vertical position adjustment
      text(tabTitles[i], startX + iconSize + spacing + textW/2, tabsY + tabsHeight / 2 + params.textVerticalPosition);
    } else {
      // Just draw the text centered with vertical position adjustment
      text(tabTitles[i], tabX + tabWidth / 2, tabsY + tabsHeight / 2 + params.textVerticalPosition);
    }
  }
}

function mousePressed() {
  if (mouseOverTab !== -1) {
    params.activeTab = mouseOverTab;
    redraw();
  }
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
  iconElements.forEach(icon => {
    if (icon && icon.parentNode) {
      icon.parentNode.removeChild(icon);
    }
  });
  iconElements = [];
  
  // Call the original remove function
  if (typeof p5.prototype.remove === 'function') {
    p5.prototype.remove.call(this);
  }
} 