let gui;
let params = {
  // Text field properties
  label: "Label",
  placeholder: "Input",
  value: "",
  helperText: "Supporting text",
  
  // Visibility toggles
  showLabel: true,
  showHelperText: true,
  
  // Field state
  state: "Enabled", // Enabled, Disabled, Error, Focused
  
  // Screen size
  screenSize: 412,
  
  // Styling
  cornerRadius: 100, // Default to pill shape when inactive
  targetRadius: 8, // Target radius when focused
  fontSize: 16,
  labelSize: 12,
  helperTextSize: 12,
  fieldPadding: 16,
  
  // Colors
  backgroundColor: "#F5F5F5", // Light gray background
  fieldBackgroundColor: "#FFFFFF", // White
  textColor: "#1C1B1F", // Near black
  labelColor: "#49454F", // Dark gray
  activeColor: "#1F6E43", // Dark green from image
  errorColor: "#B3261E", // Error red
  disabledColor: "#1C1B1F", // Disabled color with opacity
  helperTextColor: "#49454F", // Dark gray
  
  // Leading icon
  showLeadingIcon: true,
  leadingIcon: "search",
  
  // Trailing icon
  showTrailingIcon: true,
  trailingIcon: "close",
  
  // Export
  export: function() {
    saveCanvas('textfield-component', 'png');
  }
};

// Color palette from the image
const colorPalette = [
  "#1F6E43", // Dark green
  "#2D9D6C", // Medium green
  "#4DB38A", // Light green
  "#8FD65B", // Lime green
  "#D9E64A", // Yellow-green
  
  "#0A3B6D", // Dark blue
  "#2D6FC1", // Medium blue
  "#4A9FE6", // Light blue
  "#6BCBF5", // Sky blue
  "#A8E7F0", // Light cyan
  
  "#6B4D1E", // Brown
  "#C42E1B", // Red
  "#E84C30", // Orange-red
  "#F7954A", // Orange
  "#FFCF54"  // Yellow
];

// Material Icons for leading and trailing
const iconOptions = [
  "search", "person", "email", "phone", "lock", "visibility", 
  "visibility_off", "close", "check", "error", "warning", "info"
];

// Track mouse position and interaction state
let mouseOverField = false;
let mouseOverTrailingIcon = false;
let fieldFocused = false;
let currentRadius = 100; // Track the current animated radius
let lastFrameTime = 0; // For animation timing
let cursorVisible = true; // For cursor blinking
let cursorBlinkTime = 0; // Track time for cursor blinking

// Select a random color on load
let randomColorIndex = Math.floor(Math.random() * colorPalette.length);

// Icon elements
let leadingIconElement;
let trailingIconElement;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto, sans-serif');
  
  // Set the active color to a random color from the palette
  params.activeColor = colorPalette[randomColorIndex];
  
  // Randomly set the visibility of label and helper text on reload
  params.showLabel = Math.random() >= 0.5;
  params.showHelperText = Math.random() >= 0.5;
  
  // Create icon elements
  leadingIconElement = document.createElement('span');
  leadingIconElement.className = 'material-icons';
  leadingIconElement.textContent = params.leadingIcon;
  leadingIconElement.style.position = 'absolute';
  leadingIconElement.style.display = 'none';
  leadingIconElement.style.userSelect = 'none';
  leadingIconElement.style.pointerEvents = 'none';
  document.body.appendChild(leadingIconElement);
  
  trailingIconElement = document.createElement('span');
  trailingIconElement.className = 'material-icons';
  trailingIconElement.textContent = params.trailingIcon;
  trailingIconElement.style.position = 'absolute';
  trailingIconElement.style.display = 'none';
  trailingIconElement.style.userSelect = 'none';
  trailingIconElement.style.pointerEvents = 'none';
  document.body.appendChild(trailingIconElement);
  
  // Setup GUI - single panel with all controls
  gui = new lil.GUI();
  gui.title("Text Field Controls");
  
  // Text field content
  gui.add(params, 'label').name('Label Text').onChange(redraw);
  gui.add(params, 'showLabel').name('Show Label').onChange(redraw);
  gui.add(params, 'placeholder').name('Placeholder').onChange(redraw);
  gui.add(params, 'value').name('Input Value').onChange(redraw);
  gui.add(params, 'helperText').name('Helper Text').onChange(redraw);
  gui.add(params, 'showHelperText').name('Show Helper Text').onChange(redraw);
  
  // Field state
  gui.add(params, 'state', ['Enabled', 'Focused', 'Error', 'Disabled']).name('Field State').onChange(function() {
    fieldFocused = params.state === 'Focused';
    redraw();
  });
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Screen size
  gui.add(params, 'screenSize', 320, 1200, 1).name('Screen Size (dp)').onChange(redraw);
  
  // Styling
  gui.add(params, 'cornerRadius', 0, 20, 1).name('Corner Radius').onChange(redraw);
  gui.add(params, 'fontSize', 12, 24, 1).name('Input Font Size').onChange(redraw);
  gui.add(params, 'labelSize', 10, 18, 1).name('Label Font Size').onChange(redraw);
  gui.add(params, 'helperTextSize', 10, 18, 1).name('Helper Text Size').onChange(redraw);
  gui.add(params, 'fieldPadding', 8, 24, 1).name('Field Padding').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Icons - now in main panel
  gui.add(params, 'showLeadingIcon').name('Show Leading Icon').onChange(redraw);
  gui.add(params, 'leadingIcon', iconOptions).name('Leading Icon').onChange(redraw);
  gui.add(params, 'showTrailingIcon').name('Show Trailing Icon').onChange(redraw);
  gui.add(params, 'trailingIcon', iconOptions).name('Trailing Icon').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Colors - now in main panel
  gui.addColor(params, 'backgroundColor').name('Background').onChange(redraw);
  gui.addColor(params, 'fieldBackgroundColor').name('Field Background').onChange(redraw);
  gui.addColor(params, 'textColor').name('Text Color').onChange(redraw);
  gui.addColor(params, 'labelColor').name('Label Color').onChange(redraw);
  gui.addColor(params, 'activeColor').name('Active Color').onChange(redraw);
  gui.addColor(params, 'errorColor').name('Error Color').onChange(redraw);
  gui.addColor(params, 'disabledColor').name('Disabled Color').onChange(redraw);
  gui.addColor(params, 'helperTextColor').name('Helper Text').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Export
  gui.add(params, 'export').name('Export as PNG');
  
  // Enable loop for hover effects
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

function draw() {
  const currentTime = millis();
  const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
  lastFrameTime = currentTime;
  
  // Blink cursor every 530ms (standard cursor blink rate)
  if (fieldFocused && currentTime - cursorBlinkTime > 530) {
    cursorVisible = !cursorVisible;
    cursorBlinkTime = currentTime;
  }
  
  // Animate corner radius
  if (fieldFocused || params.state === 'Focused') {
    // Animate towards target radius
    currentRadius = lerp(currentRadius, params.targetRadius, 0.1);
  } else {
    // Animate back to pill shape
    currentRadius = lerp(currentRadius, params.cornerRadius, 0.1);
  }
  
  // Clear canvas and set background
  background(params.backgroundColor);
  
  // Calculate text field dimensions
  const fieldWidth = params.screenSize;
  const fieldHeight = params.fontSize * 3.5;
  const fieldX = width / 2 - fieldWidth / 2;
  const fieldY = height / 2 - fieldHeight / 2;
  
  // Check if mouse is over the field
  mouseOverField = mouseX >= fieldX && mouseX <= fieldX + fieldWidth &&
                   mouseY >= fieldY && mouseY <= fieldY + fieldHeight;
  
  // Check if mouse is over the trailing icon
  const trailingIconX = fieldX + fieldWidth - params.fieldPadding - 12; // Center of icon
  const trailingIconY = fieldY + fieldHeight / 2;
  const iconRadius = 12; // Half of 24dp
  mouseOverTrailingIcon = params.showTrailingIcon && 
                          dist(mouseX, mouseY, trailingIconX, trailingIconY) < iconRadius;
  
  // Update cursor
  cursor(mouseOverTrailingIcon ? HAND : (mouseOverField ? TEXT : AUTO));
  
  // Determine colors based on state
  let activeLabelColor;
  
  switch(params.state) {
    case 'Focused':
      activeLabelColor = params.activeColor;
      break;
    case 'Error':
      activeLabelColor = params.errorColor;
      break;
    case 'Disabled':
      activeLabelColor = color(params.disabledColor);
      activeLabelColor.setAlpha(60);
      break;
    default: // Enabled
      activeLabelColor = params.labelColor;
  }
  
  // Draw text field background
  fill(params.state === 'Disabled' ? color(params.fieldBackgroundColor).levels.concat(38) : params.fieldBackgroundColor);
  noStroke();
  rect(fieldX, fieldY, fieldWidth, fieldHeight, currentRadius);
  
  // Calculate text positions with padding
  const textX = fieldX + params.fieldPadding + (params.showLeadingIcon ? 30 : 0); // 24dp icon + 6dp spacing
  
  // Adjust text Y position - center it when no label is shown
  const textY = params.showLabel ? 
    fieldY + fieldHeight / 2 + params.fontSize / 4 : 
    fieldY + fieldHeight / 2;
    
  const labelX = textX;
  // Position label much closer to the input text
  const labelY = fieldY + params.fieldPadding / 6 + params.labelSize; // Bring label closer to input
  const helperTextX = fieldX + params.fieldPadding;
  const helperTextY = fieldY + fieldHeight + params.fieldPadding;
  
  // Draw label if enabled
  if (params.showLabel) {
    noStroke();
    fill(fieldFocused || params.value ? activeLabelColor : params.labelColor);
    textSize(params.labelSize);
    textAlign(LEFT, CENTER);
    text(params.label, labelX, labelY);
  }
  
  // Draw input text or placeholder
  textSize(params.fontSize);
  textAlign(LEFT, CENTER);
  if (params.value) {
    fill(params.state === 'Disabled' ? color(params.textColor).levels.concat(38) : params.textColor);
    text(params.value, textX, textY);
    
    // Draw blinking cursor after text if field is focused
    if (fieldFocused && cursorVisible) {
      const valueWidth = textWidth(params.value);
      stroke(params.activeColor);
      strokeWeight(2);
      // Adjust cursor height - increased by 25%
      const cursorHeight = params.fontSize * 1.0; // Changed from 0.8 to 1.0 (25% increase)
      line(textX + valueWidth + 2, textY - cursorHeight/2, textX + valueWidth + 2, textY + cursorHeight/2);
      noStroke();
    }
  } else {
    if (fieldFocused) {
      // Show blinking cursor at start position when empty
      if (cursorVisible) {
        stroke(params.activeColor);
        strokeWeight(2);
        // Adjust cursor height - increased by 25%
        const cursorHeight = params.fontSize * 1.0; // Changed from 0.8 to 1.0 (25% increase)
        line(textX, textY - cursorHeight/2, textX, textY + cursorHeight/2);
        noStroke();
      }
    } else {
      // Show placeholder when not focused and empty
      fill(color(params.labelColor).levels.concat(128)); // Semi-transparent
      text(params.placeholder, textX, textY);
    }
  }
  
  // Draw helper text if enabled
  if (params.showHelperText) {
    textSize(params.helperTextSize);
    fill(params.state === 'Error' ? params.errorColor : params.helperTextColor);
    text(params.helperText, helperTextX, helperTextY);
  }
  
  // Position and show icons if needed
  if (params.showLeadingIcon) {
    const leadingIconX = fieldX + params.fieldPadding;
    const leadingIconY = fieldY + fieldHeight / 2 - 12; // Center 24dp icon
    
    leadingIconElement.style.display = 'block';
    leadingIconElement.textContent = params.leadingIcon;
    leadingIconElement.style.fontSize = '24px'; // Fixed 24dp size
    leadingIconElement.style.left = `${leadingIconX}px`;
    leadingIconElement.style.top = `${leadingIconY}px`;
    
    if (params.state === 'Disabled') {
      leadingIconElement.style.opacity = '0.38';
    } else {
      leadingIconElement.style.opacity = '1';
    }
    
    leadingIconElement.style.color = params.labelColor;
  } else {
    leadingIconElement.style.display = 'none';
  }
  
  if (params.showTrailingIcon) {
    const trailingIconX = fieldX + fieldWidth - params.fieldPadding - 24; // Position 24dp icon
    const trailingIconY = fieldY + fieldHeight / 2 - 12; // Center 24dp icon
    
    trailingIconElement.style.display = 'block';
    trailingIconElement.textContent = params.trailingIcon;
    trailingIconElement.style.fontSize = '24px'; // Fixed 24dp size
    trailingIconElement.style.left = `${trailingIconX}px`;
    trailingIconElement.style.top = `${trailingIconY}px`;
    
    if (params.state === 'Disabled') {
      trailingIconElement.style.opacity = '0.38';
    } else {
      trailingIconElement.style.opacity = '1';
    }
    
    trailingIconElement.style.color = mouseOverTrailingIcon ? params.activeColor : params.labelColor;
  } else {
    trailingIconElement.style.display = 'none';
  }
}

function mousePressed() {
  if (mouseOverTrailingIcon && params.state !== 'Disabled') {
    // Clear the field value when clicking the trailing icon (if it's a close icon)
    if (params.trailingIcon === 'close') {
      params.value = '';
      redraw();
    }
  } else if (mouseOverField && params.state !== 'Disabled') {
    // Focus the field and clear the value
    params.state = 'Focused';
    fieldFocused = true;
    params.value = ''; // Clear the input text
    // Reset cursor blinking
    cursorVisible = true;
    cursorBlinkTime = millis();
    // Start animation by setting lastFrameTime
    lastFrameTime = millis();
    // No need to call redraw() as we're using loop()
  } else if (fieldFocused) {
    // Unfocus when clicking outside
    if (params.state === 'Focused') {
      params.state = 'Enabled';
      fieldFocused = false;
      // Start animation by setting lastFrameTime
      lastFrameTime = millis();
      // No need to call redraw() as we're using loop()
    }
  }
}

function keyTyped() {
  // Only allow typing when the field is focused
  if (fieldFocused && params.state !== 'Disabled') {
    // Handle backspace (special case)
    if (keyCode === BACKSPACE) {
      params.value = params.value.slice(0, -1);
      redraw();
      return false;
    }
    
    // Add the typed character to the field value
    params.value += key;
    redraw();
    return false; // Prevent default behavior
  }
  return true;
}

function keyPressed() {
  // Handle backspace
  if (keyCode === BACKSPACE && fieldFocused && params.state !== 'Disabled') {
    if (params.value.length > 0) {
      params.value = params.value.slice(0, -1);
      redraw();
    }
    return false; // Prevent default behavior
  }
  return true;
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
  if (leadingIconElement && leadingIconElement.parentNode) {
    leadingIconElement.parentNode.removeChild(leadingIconElement);
  }
  if (trailingIconElement && trailingIconElement.parentNode) {
    trailingIconElement.parentNode.removeChild(trailingIconElement);
  }
  
  // Call the original remove function
  if (typeof p5.prototype.remove === 'function') {
    p5.prototype.remove.call(this);
  }
} 