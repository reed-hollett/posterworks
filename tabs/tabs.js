let gui;
let params = {
  // Tab titles
  tab1Title: "Overview",
  tab2Title: "Specifications",
  tab3Title: "Details",
  tab4Title: "Resources",
  
  // Tab structure
  tabCount: 2,
  activeTab: 0,
  
  // Screen size
  screenSize: 412,
  
  // Styling
  cornerRadius: 0,
  fontSize: 14,
  tabPadding: 21,
  indicatorHeight: 4,
  
  // Colors
  backgroundColor: "#E6E6FA", // Light lavender
  tabBackgroundColor: "#FFFFFF", // White
  tabTextColor: "#333333", // Dark gray
  activeTabTextColor: "#000000", // Black
  indicatorColor: "#6A5ACD", // Slate blue
  
  // Export
  export: function() {
    saveCanvas('tabs-component', 'png');
  }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto, sans-serif');
  
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
  gui.add(params, 'cornerRadius', 0, 20, 1).name('Corner Radius').onChange(redraw);
  gui.add(params, 'fontSize', 12, 24, 1).name('Font Size').onChange(redraw);
  gui.add(params, 'tabPadding', 10, 40, 1).name('Tab Padding').onChange(redraw);
  gui.add(params, 'indicatorHeight', 1, 10, 1).name('Indicator Height').onChange(redraw);
  gui.addColor(params, 'indicatorColor').name('Indicator').onChange(redraw);
  gui.add(params, 'activeTab', 0, 3, 1).name('Active Tab').onChange(redraw);
  
  // Add another spacer
  const spacer2 = document.createElement('div');
  spacer2.style.height = '10px';
  gui.domElement.appendChild(spacer2);
  
  // Colors
  gui.addColor(params, 'backgroundColor').name('Background').onChange(redraw);
  gui.addColor(params, 'tabBackgroundColor').name('Tab Background').onChange(redraw);
  gui.addColor(params, 'tabTextColor').name('Tab Text').onChange(redraw);
  gui.addColor(params, 'activeTabTextColor').name('Active Tab Text').onChange(redraw);
  
  // Export
  gui.add(params, 'export').name('Export as PNG');
  
  // Initial draw
  noLoop();
  redraw();
  
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
  
  // Draw tab container
  fill(params.tabBackgroundColor);
  noStroke();
  rect(tabsX, tabsY, tabsWidth, tabsHeight, params.cornerRadius);
  
  // Calculate tab widths
  const tabWidth = tabsWidth / params.tabCount;
  
  // Draw tabs
  textSize(params.fontSize);
  textAlign(CENTER, CENTER);
  
  for (let i = 0; i < params.tabCount; i++) {
    const tabX = tabsX + i * tabWidth;
    const isActive = i === params.activeTab;
    
    // Tab text
    fill(isActive ? params.activeTabTextColor : params.tabTextColor);
    text(tabTitles[i], tabX + tabWidth / 2, tabsY + tabsHeight / 2);
    
    // Active indicator
    if (isActive) {
      fill(params.indicatorColor);
      rect(tabX, tabsY + tabsHeight - params.indicatorHeight, tabWidth, params.indicatorHeight);
    }
  }
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