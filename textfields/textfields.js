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
  cornerRadius: 100, // Default to pill shape when inactive (minimum value is now 12)
  targetRadius: 12, // Target radius when focused (minimum value is now 12)
  fontSize: 16,
  labelSize: 12,
  helperTextSize: 12,
  fieldPadding: 16,
  
  // Colors
  backgroundColor: "#F5F5F5", // Light gray background
  fieldBackgroundColor: "#FFFFFF", // White
  textColor: "#1C1B1F", // Near black
  labelColor: "#49454F", // Dark gray
  disabledColor: "#1C1B1F", // Disabled color with opacity
  
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

// Color palette - 10 colors matching the radio buttons example
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

// Material Icons for leading and trailing
const iconOptions = [
  "search", "person", "email", "phone", "lock", "visibility", 
  "visibility_off", "close", "check", "error", "warning", "info"
];

// Track mouse position and interaction state
let mouseOverField = -1;
let mouseOverTrailingIcon = -1;
let fieldFocused = -1;
let currentRadiuses = Array(10).fill(100); // Track the current animated radius for each field - start with pill shape
let lastFrameTime = 0; // For animation timing
let cursorVisible = true; // For cursor blinking
let cursorBlinkTime = 0; // Track time for cursor blinking

// Text selection variables
let selectionStart = -1; // Start position of selection in the current field
let selectionEnd = -1; // End position of selection in the current field
let isSelecting = false; // Whether user is currently dragging to select text
let selectionField = -1; // Which field has the selection

// Field values
let fieldValues = Array(10).fill("");

// Field-specific parameters
let fieldParams = [];

// Icon elements array
let leadingIconElements = [];
let trailingIconElements = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Roboto, sans-serif');
  
  // Initialize field-specific parameters with randomized values
  for (let i = 0; i < 10; i++) {
    fieldParams.push({
      showLabel: Math.random() >= 0.3,
      showHelperText: Math.random() >= 0.5,
      showLeadingIcon: Math.random() >= 0.5,
      showTrailingIcon: Math.random() >= 0.5,
      cornerRadius: Math.random() >= 0.3 ? 100 : Math.floor(Math.random() * 16) + 12, // 70% pill-shaped, 30% random radius between 12-28
      targetRadius: Math.floor(Math.random() * 16) + 12, // Random target radius between 12-28
      state: Math.random() >= 0.7 ? "Enabled" : "Error", // Only Enabled or Error states, no Disabled
      leadingIcon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
      trailingIcon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
      fontSize: Math.floor(Math.random() * 6) + 14 // Random font size between 14-20
    });
    
    // Set initial text values for some fields
    if (Math.random() >= 0.7) {
      fieldValues[i] = "Sample " + (i + 1);
    }
  }
  
  // Create icon elements for each field
  for (let i = 0; i < 10; i++) {
    let leadingIcon = document.createElement('span');
    leadingIcon.className = 'material-icons';
    leadingIcon.textContent = fieldParams[i].leadingIcon;
    leadingIcon.style.position = 'absolute';
    leadingIcon.style.display = 'none';
    leadingIcon.style.userSelect = 'none';
    leadingIcon.style.pointerEvents = 'none';
    document.body.appendChild(leadingIcon);
    leadingIconElements.push(leadingIcon);
    
    let trailingIcon = document.createElement('span');
    trailingIcon.className = 'material-icons';
    trailingIcon.textContent = fieldParams[i].trailingIcon;
    trailingIcon.style.position = 'absolute';
    trailingIcon.style.display = 'none';
    trailingIcon.style.userSelect = 'none';
    trailingIcon.style.pointerEvents = 'none';
    document.body.appendChild(trailingIcon);
    trailingIconElements.push(trailingIcon);
  }
  
  // Setup GUI - single panel with all controls
  gui = new lil.GUI();
  gui.title("Text Field Controls");
  
  // Text field content
  gui.add(params, 'label').name('Label Text').onChange(redraw);
  gui.add(params, 'showLabel').name('Show Label').onChange(redraw);
  gui.add(params, 'placeholder').name('Placeholder').onChange(redraw);
  gui.add(params, 'helperText').name('Helper Text').onChange(redraw);
  gui.add(params, 'showHelperText').name('Show Helper Text').onChange(redraw);
  
  // Field state
  gui.add(params, 'state', ['Enabled', 'Focused', 'Error', 'Disabled']).name('Field State').onChange(function() {
    fieldFocused = params.state === 'Focused' ? 0 : -1;
    redraw();
  });
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Screen size and styling
  gui.add(params, 'screenSize', 320, 412, 1).name('Field Width').onChange(redraw);
  gui.add(params, 'cornerRadius', 12, 100, 1).name('Corner Radius').onChange(redraw);
  gui.add(params, 'targetRadius', 12, 32, 1).name('Target Radius').onChange(redraw);
  gui.add(params, 'fontSize', 12, 24, 1).name('Input Font Size').onChange(redraw);
  gui.add(params, 'labelSize', 10, 18, 1).name('Label Font Size').onChange(redraw);
  gui.add(params, 'helperTextSize', 10, 18, 1).name('Helper Text Size').onChange(redraw);
  gui.add(params, 'fieldPadding', 8, 24, 1).name('Field Padding').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Icons
  gui.add(params, 'showLeadingIcon').name('Show Leading Icon').onChange(redraw);
  gui.add(params, 'leadingIcon', iconOptions).name('Leading Icon').onChange(redraw);
  gui.add(params, 'showTrailingIcon').name('Show Trailing Icon').onChange(redraw);
  gui.add(params, 'trailingIcon', iconOptions).name('Trailing Icon').onChange(redraw);
  
  // Add a spacer
  addSpacer(gui, 10);
  
  // Background color only
  gui.addColor(params, 'backgroundColor').name('Background').onChange(redraw);
  gui.addColor(params, 'fieldBackgroundColor').name('Field Background').onChange(redraw);
  
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
  if (fieldFocused >= 0 && currentTime - cursorBlinkTime > 530) {
    cursorVisible = !cursorVisible;
    cursorBlinkTime = currentTime;
  }
  
  // Animate corner radius for all fields
  for (let i = 0; i < 10; i++) {
    if (fieldFocused === i) {
      // Animate towards target radius when focused
      currentRadiuses[i] = lerp(currentRadiuses[i], fieldParams[i].targetRadius, 0.1);
    } else {
      // Animate back to default radius when not focused
      currentRadiuses[i] = lerp(currentRadiuses[i], fieldParams[i].cornerRadius, 0.1);
    }
    // Ensure radius never drops below 12 during animation
    currentRadiuses[i] = Math.max(currentRadiuses[i], 12);
  }
  
  // Clear canvas and set background
  background(params.backgroundColor);
  
  // Reset mouse over states
  mouseOverField = -1;
  mouseOverTrailingIcon = -1;
  
  // Calculate the total height needed for all text fields
  const fieldHeight = params.fontSize * 3.5;
  const totalHeight = 10 * (fieldHeight + 40); // 40px spacing between fields
  
  // Calculate starting Y position to center all fields vertically
  const startY = (height - totalHeight) / 2;
  
  // Draw all 10 text fields
  for (let i = 0; i < 10; i++) {
    const activeColor = colorPalette[i];
    const fieldY = startY + i * (fieldHeight + 40);
    
    drawTextField(i, fieldY, activeColor);
  }
  
  // Update cursor
  cursor(mouseOverTrailingIcon >= 0 ? HAND : (mouseOverField >= 0 ? TEXT : AUTO));
}

function drawTextField(index, fieldY, activeColor) {
  // Calculate text field dimensions
  const fieldWidth = params.screenSize;
  const fieldHeight = params.fontSize * 3.5;
  const fieldX = width / 2 - fieldWidth / 2;
  
  // Check if mouse is over this field
  const isMouseOver = mouseX >= fieldX && mouseX <= fieldX + fieldWidth &&
                      mouseY >= fieldY && mouseY <= fieldY + fieldHeight;
  
  if (isMouseOver) {
    mouseOverField = index;
  }
  
  // Check if mouse is over the trailing icon
  const trailingIconX = fieldX + fieldWidth - params.fieldPadding - 12; // Center of icon
  const trailingIconY = fieldY + fieldHeight / 2;
  const iconRadius = 12; // Half of 24dp
  const isMouseOverTrailing = fieldParams[index].showTrailingIcon && 
                          dist(mouseX, mouseY, trailingIconX, trailingIconY) < iconRadius;
  
  if (isMouseOverTrailing) {
    mouseOverTrailingIcon = index;
  }
  
  // Determine colors based on state
  let activeLabelColor;
  
  if (fieldFocused === index) {
    activeLabelColor = activeColor;
  } else {
    switch(fieldParams[index].state) {
      case 'Error':
        activeLabelColor = "#B3261E"; // Error red
        break;
      case 'Disabled':
        activeLabelColor = color(params.disabledColor);
        activeLabelColor.setAlpha(60);
        break;
      default: // Enabled
        activeLabelColor = params.labelColor;
    }
  }
  
  // Draw text field background
  const isDisabled = fieldParams[index].state === 'Disabled';
  fill(isDisabled ? color(params.fieldBackgroundColor).levels.concat(38) : params.fieldBackgroundColor);
  noStroke();
  rect(fieldX, fieldY, fieldWidth, fieldHeight, currentRadiuses[index]);
  
  // Add a subtle stroke with the active color when field is focused
  if (fieldFocused === index) {
    stroke(activeColor);
    strokeWeight(2);
    noFill();
    rect(fieldX, fieldY, fieldWidth, fieldHeight, currentRadiuses[index]);
    noStroke();
  }
  
  // Calculate text positions with padding
  const textX = fieldX + params.fieldPadding + (fieldParams[index].showLeadingIcon ? 30 : 0); // 24dp icon + 6dp spacing
  
  // Adjust text Y position - center it when no label is shown
  const textY = fieldParams[index].showLabel ? 
    fieldY + fieldHeight / 2 + fieldParams[index].fontSize / 4 : 
    fieldY + fieldHeight / 2;
    
  const labelX = textX;
  // Position label much closer to the input text
  const labelY = fieldY + params.fieldPadding / 6 + params.labelSize; // Bring label closer to input
  const helperTextX = fieldX + params.fieldPadding;
  const helperTextY = fieldY + fieldHeight + params.fieldPadding;
  
  // Draw label if enabled
  if (fieldParams[index].showLabel) {
    noStroke();
    fill(fieldFocused === index || fieldValues[index] ? activeLabelColor : params.labelColor);
    textSize(params.labelSize);
    textAlign(LEFT, CENTER);
    text(params.label, labelX, labelY);
  }
  
  // Draw input text or placeholder
  textSize(fieldParams[index].fontSize);
  textAlign(LEFT, CENTER);
  if (fieldValues[index]) {
    fill(isDisabled ? color("#1C1B1F").levels.concat(38) : "#1C1B1F");
    
    // Check if this field has any selected text
    if (selectionField === index && selectionStart !== selectionEnd) {
      // Get normalized selection positions
      const start = Math.min(selectionStart, selectionEnd);
      const end = Math.max(selectionStart, selectionEnd);
      
      // Draw text in three parts: before selection, selected text, after selection
      const beforeText = fieldValues[index].substring(0, start);
      const selectedText = fieldValues[index].substring(start, end);
      const afterText = fieldValues[index].substring(end);
      
      // First draw the text before selection
      if (beforeText) {
        text(beforeText, textX, textY);
      }
      
      // Calculate position for selected text
      const beforeWidth = textWidth(beforeText);
      const selectionX = textX + beforeWidth;
      
      // Draw selection background
      const selectionWidth = textWidth(selectedText);
      const selectionColor = color(activeColor);
      selectionColor.setAlpha(100); // Semi-transparent
      fill(selectionColor);
      noStroke();
      const selectionHeight = fieldParams[index].fontSize * 1.4;
      rect(selectionX, textY - selectionHeight/2, selectionWidth, selectionHeight);
      
      // Draw selected text
      fill(isDisabled ? color("#1C1B1F").levels.concat(38) : "#1C1B1F");
      text(selectedText, selectionX, textY);
      
      // Draw text after selection
      if (afterText) {
        text(afterText, selectionX + selectionWidth, textY);
      }
    } else {
      // No selection, draw text normally
      text(fieldValues[index], textX, textY);
    }
    
    // Draw blinking cursor after text if field is focused
    if (fieldFocused === index && cursorVisible && !isSelecting) {
      // If we have a selection, don't show the cursor
      if (!(selectionField === index && selectionStart !== selectionEnd)) {
        const valueWidth = textWidth(fieldValues[index]);
        stroke(activeColor);
        strokeWeight(2);
        // Adjust cursor height - increased by 25%
        const cursorHeight = fieldParams[index].fontSize * 1.0;
        line(textX + valueWidth + 2, textY - cursorHeight/2, textX + valueWidth + 2, textY + cursorHeight/2);
        noStroke();
      }
    }
  } else {
    if (fieldFocused === index) {
      // Show blinking cursor at start position when empty
      if (cursorVisible) {
        stroke(activeColor);
        strokeWeight(2);
        // Adjust cursor height - increased by 25%
        const cursorHeight = fieldParams[index].fontSize * 1.0;
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
  if (fieldParams[index].showHelperText) {
    textSize(params.helperTextSize);
    fill(fieldParams[index].state === 'Error' ? "#B3261E" : params.labelColor);
    text(params.helperText, helperTextX, helperTextY);
  }
  
  // Position and show icons if needed
  if (fieldParams[index].showLeadingIcon) {
    const leadingIconX = fieldX + params.fieldPadding;
    const leadingIconY = fieldY + fieldHeight / 2 - 12; // Center 24dp icon
    
    leadingIconElements[index].style.display = 'block';
    leadingIconElements[index].textContent = fieldParams[index].leadingIcon;
    leadingIconElements[index].style.fontSize = '24px'; // Fixed 24dp size
    leadingIconElements[index].style.left = `${leadingIconX}px`;
    leadingIconElements[index].style.top = `${leadingIconY}px`;
    
    if (isDisabled) {
      leadingIconElements[index].style.opacity = '0.38';
    } else {
      leadingIconElements[index].style.opacity = '1';
    }
    
    leadingIconElements[index].style.color = fieldFocused === index ? activeColor : params.labelColor;
  } else {
    leadingIconElements[index].style.display = 'none';
  }
  
  if (fieldParams[index].showTrailingIcon) {
    const trailingIconX = fieldX + fieldWidth - params.fieldPadding - 24; // Position 24dp icon
    const trailingIconY = fieldY + fieldHeight / 2 - 12; // Center 24dp icon
    
    trailingIconElements[index].style.display = 'block';
    trailingIconElements[index].textContent = fieldParams[index].trailingIcon;
    trailingIconElements[index].style.fontSize = '24px'; // Fixed 24dp size
    trailingIconElements[index].style.left = `${trailingIconX}px`;
    trailingIconElements[index].style.top = `${trailingIconY}px`;
    
    if (isDisabled) {
      trailingIconElements[index].style.opacity = '0.38';
    } else {
      trailingIconElements[index].style.opacity = '1';
    }
    
    trailingIconElements[index].style.color = mouseOverTrailingIcon === index ? activeColor : params.labelColor;
  } else {
    trailingIconElements[index].style.display = 'none';
  }
}

function mousePressed() {
  if (mouseOverTrailingIcon >= 0) {
    // Check if field is not disabled before handling icon click
    if (fieldParams[mouseOverTrailingIcon].state !== 'Disabled') {
      // Clear the field value when clicking the trailing icon (if it's a close icon)
      if (fieldParams[mouseOverTrailingIcon].trailingIcon === 'close') {
        fieldValues[mouseOverTrailingIcon] = '';
        // Clear any selection if we clear text
        if (selectionField === mouseOverTrailingIcon) {
          clearSelection();
        }
        redraw();
      }
    }
  } else if (mouseOverField >= 0) {
    // Only focus if the field is not disabled
    if (fieldParams[mouseOverField].state !== 'Disabled') {
      // Focus the field
      fieldFocused = mouseOverField;
      // Update the field state to visually indicate focus
      fieldParams[mouseOverField].state = "Enabled";
      // Reset cursor blinking
      cursorVisible = true;
      cursorBlinkTime = millis();
      // Start animation by setting lastFrameTime
      lastFrameTime = millis();
      
      // Handle text selection initiation
      if (fieldValues[mouseOverField].length > 0) {
        // Start selection at cursor position
        const textX = getTextX(mouseOverField);
        const cursorPos = getCursorPosFromX(mouseOverField, textX, mouseX);
        selectionStart = cursorPos;
        selectionEnd = cursorPos;
        selectionField = mouseOverField;
        isSelecting = true;
      } else {
        // No text to select
        clearSelection();
      }
    }
  } else if (fieldFocused >= 0) {
    // Unfocus when clicking outside
    fieldFocused = -1;
    // Clear any text selection
    clearSelection();
    // Start animation by setting lastFrameTime
    lastFrameTime = millis();
  }
}

function mouseDragged() {
  // Continue selection if we're in selection mode
  if (isSelecting && selectionField >= 0 && fieldValues[selectionField].length > 0) {
    const textX = getTextX(selectionField);
    selectionEnd = getCursorPosFromX(selectionField, textX, mouseX);
    redraw();
    return false; // Prevent default behavior
  }
  return true;
}

function mouseReleased() {
  // End the selection process
  isSelecting = false;
  
  // Normalize selection (make sure start is less than end)
  if (selectionField >= 0 && selectionStart > selectionEnd) {
    const temp = selectionStart;
    selectionStart = selectionEnd;
    selectionEnd = temp;
  }
  
  return false;
}

// Helper function to get cursor position from X coordinate
function getCursorPosFromX(fieldIndex, textX, mouseX) {
  const text = fieldValues[fieldIndex];
  // Handle empty text case
  if (!text) return 0;
  
  // Try to find the closest character position
  let closestPos = 0;
  let closestDist = Number.MAX_VALUE;
  
  // Check each character position
  for (let i = 0; i <= text.length; i++) {
    const subText = text.substring(0, i);
    const subWidth = textWidth(subText);
    const xPos = textX + subWidth;
    const dist = Math.abs(mouseX - xPos);
    
    if (dist < closestDist) {
      closestDist = dist;
      closestPos = i;
    }
  }
  
  return closestPos;
}

// Helper function to get the X coordinate of the text in a field
function getTextX(fieldIndex) {
  const fieldWidth = params.screenSize;
  const fieldX = width / 2 - fieldWidth / 2;
  return fieldX + params.fieldPadding + (fieldParams[fieldIndex].showLeadingIcon ? 30 : 0);
}

// Helper function to clear text selection
function clearSelection() {
  selectionStart = -1;
  selectionEnd = -1;
  selectionField = -1;
  isSelecting = false;
}

function keyTyped() {
  // Only allow typing when a field is focused
  if (fieldFocused >= 0 && fieldParams[fieldFocused].state !== 'Disabled') {
    // Handle backspace (special case)
    if (keyCode === BACKSPACE) {
      if (selectionField === fieldFocused && selectionStart !== selectionEnd) {
        // Delete selected text
        deleteSelectedText();
      } else {
        fieldValues[fieldFocused] = fieldValues[fieldFocused].slice(0, -1);
      }
      redraw();
      return false;
    }
    
    // If there's selected text, replace it with the typed character
    if (selectionField === fieldFocused && selectionStart !== selectionEnd) {
      replaceSelectedText(key);
    } else {
      // Add the typed character to the field value
      fieldValues[fieldFocused] += key;
    }
    redraw();
    return false; // Prevent default behavior
  }
  return true;
}

function keyPressed() {
  // Only handle keyboard shortcuts when a field is focused
  if (fieldFocused >= 0 && fieldParams[fieldFocused].state !== 'Disabled') {
    // Handle backspace
    if (keyCode === BACKSPACE) {
      if (selectionField === fieldFocused && selectionStart !== selectionEnd) {
        // Delete selected text
        deleteSelectedText();
      } else if (fieldValues[fieldFocused].length > 0) {
        fieldValues[fieldFocused] = fieldValues[fieldFocused].slice(0, -1);
      }
      redraw();
      return false; // Prevent default behavior
    }
    
    // Handle Ctrl+A (Select All)
    if (keyCode === 65 && keyIsDown(CONTROL)) {
      if (fieldValues[fieldFocused].length > 0) {
        selectionField = fieldFocused;
        selectionStart = 0;
        selectionEnd = fieldValues[fieldFocused].length;
        redraw();
      }
      return false;
    }
    
    // Handle Ctrl+C (Copy)
    if (keyCode === 67 && keyIsDown(CONTROL)) {
      if (selectionField === fieldFocused && selectionStart !== selectionEnd) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        const selectedText = fieldValues[fieldFocused].substring(start, end);
        
        // Use the browser's clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(selectedText).catch(err => {
            console.error('Could not copy text: ', err);
          });
        }
      }
      return false;
    }
    
    // Handle Ctrl+X (Cut)
    if (keyCode === 88 && keyIsDown(CONTROL)) {
      if (selectionField === fieldFocused && selectionStart !== selectionEnd) {
        const start = Math.min(selectionStart, selectionEnd);
        const end = Math.max(selectionStart, selectionEnd);
        const selectedText = fieldValues[fieldFocused].substring(start, end);
        
        // Use the browser's clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(selectedText).catch(err => {
            console.error('Could not copy text: ', err);
          });
        }
        
        // Delete the selected text
        deleteSelectedText();
        redraw();
      }
      return false;
    }
    
    // Handle Ctrl+V (Paste)
    if (keyCode === 86 && keyIsDown(CONTROL)) {
      // Use the browser's clipboard API if available
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.readText()
          .then(text => {
            // If there's a selection, replace it
            if (selectionField === fieldFocused && selectionStart !== selectionEnd) {
              replaceSelectedText(text);
            } else {
              // Otherwise insert at current position (end of text)
              fieldValues[fieldFocused] += text;
            }
            redraw();
          })
          .catch(err => {
            console.error('Could not paste text: ', err);
          });
      }
      return false;
    }
  }
  return true;
}

// Helper function to delete selected text
function deleteSelectedText() {
  if (selectionField >= 0 && selectionStart !== selectionEnd) {
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    
    // Remove the selected portion of the text
    fieldValues[selectionField] = 
      fieldValues[selectionField].substring(0, start) + 
      fieldValues[selectionField].substring(end);
    
    // Reset cursor position to the start of the selection
    selectionStart = start;
    selectionEnd = start;
  }
}

// Helper function to replace selected text with new text
function replaceSelectedText(newText) {
  if (selectionField >= 0 && selectionStart !== selectionEnd) {
    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);
    
    // Replace the selected portion of the text
    fieldValues[selectionField] = 
      fieldValues[selectionField].substring(0, start) + 
      newText +
      fieldValues[selectionField].substring(end);
    
    // Update cursor position to after the new text
    selectionStart = start + newText.length;
    selectionEnd = selectionStart;
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

// Clean up when the sketch is removed
function remove() {
  // Remove icon elements
  for (let i = 0; i < leadingIconElements.length; i++) {
    if (leadingIconElements[i] && leadingIconElements[i].parentNode) {
      leadingIconElements[i].parentNode.removeChild(leadingIconElements[i]);
    }
  }
  
  for (let i = 0; i < trailingIconElements.length; i++) {
    if (trailingIconElements[i] && trailingIconElements[i].parentNode) {
      trailingIconElements[i].parentNode.removeChild(trailingIconElements[i]);
    }
  }
  
  // Call the original remove function
  if (typeof p5.prototype.remove === 'function') {
    p5.prototype.remove.call(this);
  }
} 