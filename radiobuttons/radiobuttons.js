let gui;
let params = {
  // Radio button properties
  radioSize: 20,
  outerRingThickness: 2.4, 
  innerCircleSize: 10,
  gridSize: 10, // 10x10 grid
  spacing: 100, // Default spacing between buttons
  
  // Screen size
  screenSize: 850,
  
  // Styling options
  animationSpeed: 0.2,
  
  // Colors
  backgroundColor: "#F5F5F5", // Light gray background
  inactiveColor: "#747775", // Color for inactive radio (changed from #49454F)
  activeColor: "#6750A4", // Default color for active radio
  hoverColor: "#F7F2FA", // Light hover color
  disabledColor: "#E0E0E0", // Disabled color
  
  // Export
  export: function() {
    saveCanvas('radio-buttons-component', 'png');
  }
};

// Complete rainbow palette with exactly 10 colors
const colorPalette = [
  "#E53935", // Red
  "#FF5722", // Deep Orange
  "#FF9800", // Orange
  "#FFC107", // Amber
  "#FFEB3B", // Yellow
  "#8BC34A", // Light Green
  "#4CAF50", // Green
  "#00ACC1", // Cyan
  "#2196F3", // Blue
  "#673AB7"  // Deep Purple
];

// Track mouse position and interaction states
let mouseOverButton = -1;
let hoveredRow = -1;
let hoveredCol = -1;
let lastFrameTime = 0;

// Grid of radio buttons states (0 = inactive, 1 = active)
let radioGrid = [];

// Animation states for each radio button
let animationStates = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto, sans-serif');
  
  // Initialize the grid with random states
  initializeGrid();
  
  // Setup GUI
  gui = new lil.GUI();
  gui.title("Radio Button Controls");
  
  // Screen size
  gui.add(params, 'screenSize', 500, 1200, 10).name('Grid Size').onChange(redraw);
  
  // Styling
  gui.add(params, 'radioSize', 16, 36, 1).name('Radio Size').onChange(redraw);
  gui.add(params, 'outerRingThickness', 1, 5, 0.5).name('Ring Thickness').onChange(redraw);
  gui.add(params, 'innerCircleSize', 6, 16, 1).name('Inner Circle Size').onChange(redraw);
  gui.add(params, 'spacing', 50, 120, 5).name('Button Spacing').onChange(redraw);
  gui.add(params, 'animationSpeed', 0.05, 0.5, 0.05).name('Animation Speed').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Background color only (removed other color controls)
  gui.addColor(params, 'backgroundColor').name('Background').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Export
  gui.add(params, 'export').name('Export as PNG');
  
  // Enable loop for animations and hover effects
  loop();
  
  // Apply theme
  applyTheme(getCurrentTheme());
}

// Helper function to add spacers between control groups
function addSpacer(gui, height) {
  const spacer = document.createElement('div');
  spacer.style.height = height + 'px';
  gui.domElement.appendChild(spacer);
}

function initializeGrid() {
  radioGrid = [];
  animationStates = [];
  
  for (let i = 0; i < params.gridSize; i++) {
    radioGrid[i] = [];
    animationStates[i] = [];
    
    // Select one random button per row
    const selectedCol = Math.floor(Math.random() * params.gridSize);
    
    for (let j = 0; j < params.gridSize; j++) {
      // Only set the randomly selected button to active in each row
      radioGrid[i][j] = (j === selectedCol) ? 1 : 0;
      
      // Initialize animation state to match the button state
      animationStates[i][j] = radioGrid[i][j];
    }
  }
}

function draw() {
  const currentTime = millis();
  const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;
  
  // Clear canvas and set background
  background(params.backgroundColor);
  
  // Calculate grid dimensions
  const gridWidth = params.gridSize * params.spacing;
  const gridHeight = params.gridSize * params.spacing;
  const startX = width / 2 - gridWidth / 2 + params.spacing / 2;
  const startY = height / 2 - gridHeight / 2 + params.spacing / 2;
  
  // Track if mouse is over any button
  let foundHoveredButton = false;
  hoveredRow = -1;
  hoveredCol = -1;
  
  // Draw the grid of radio buttons
  for (let i = 0; i < params.gridSize; i++) {
    // Use a different color for each row
    const buttonColor = colorPalette[i % colorPalette.length];
    
    for (let j = 0; j < params.gridSize; j++) {
      const x = startX + j * params.spacing;
      const y = startY + i * params.spacing;
      
      // Check if mouse is over this button
      const isHovered = dist(mouseX, mouseY, x, y) < params.radioSize;
      if (isHovered) {
        hoveredRow = i;
        hoveredCol = j;
        foundHoveredButton = true;
        cursor(HAND);
      }
      
      // Animate the inner circle
      const targetState = radioGrid[i][j];
      if (animationStates[i][j] !== targetState) {
        animationStates[i][j] = lerp(animationStates[i][j], targetState, params.animationSpeed);
        if (Math.abs(animationStates[i][j] - targetState) < 0.01) {
          animationStates[i][j] = targetState;
        }
      }
      
      // Draw the radio button
      drawRadioButton(x, y, isHovered, buttonColor, animationStates[i][j]);
    }
  }
  
  // Reset cursor if not hovering over any button
  if (!foundHoveredButton) {
    cursor(AUTO);
  }
}

function drawRadioButton(x, y, isHovered, color, animationState) {
  // Draw hover effect with semi-transparent version of the button color
  if (isHovered) {
    noStroke();
    // Convert hex color to RGB and add transparency
    const c = color;
    fill(c + "20"); // Add 20 (12.5%) opacity to the color
    // Make hover effect 40% larger than the button
    const hoverSize = params.radioSize * 1.4;
    ellipse(x, y, hoverSize * 2);
  }
  
  // Draw outer ring
  noFill();
  stroke(animationState > 0.5 ? color : params.inactiveColor);
  strokeWeight(params.outerRingThickness);
  ellipse(x, y, params.radioSize * 2);
  
  // Draw inner circle with animation
  if (animationState > 0) {
    noStroke();
    fill(color);
    const innerSize = params.innerCircleSize * animationState;
    ellipse(x, y, innerSize * 2);
  }
}

function mousePressed() {
  if (hoveredRow >= 0 && hoveredCol >= 0) {
    // If the button is already active, do nothing (can't deselect a radio button)
    if (radioGrid[hoveredRow][hoveredCol] === 1) {
      return;
    }
    
    // Deselect all buttons in this row
    for (let j = 0; j < params.gridSize; j++) {
      radioGrid[hoveredRow][j] = 0;
    }
    
    // Select the clicked button
    radioGrid[hoveredRow][hoveredCol] = 1;
    
    redraw();
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

// Listen for theme changes from other parts of the application
window.addEventListener('storage', function(e) {
  if (e.key === 'theme') {
    applyTheme(e.newValue);
  }
});

// Handle keyboard shortcuts
function keyPressed() {
  // 'R' key - randomize grid
  if (key === 'r' || key === 'R') {
    initializeGrid();
  }
} 