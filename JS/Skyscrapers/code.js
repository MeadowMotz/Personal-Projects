var numberArray = [];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function generateShape() {
  const size = parseInt(document.getElementById("shape").value);
  if (isNaN(size) || size <= 0) return;
  numberArray = [];

  const table = document.getElementById("table");
  table.innerHTML = "";
  table.style.display = "table";

  const cells = [];

  // Create grid
  for (let i = 0; i < size; i++) {
    const row = table.insertRow();
    cells[i] = [];
    for (let j = 0; j < size; j++) {
      const cell = row.insertCell();
      cell.contentEditable = "true";
      cells[i][j] = cell;
    }
  }

  // Start filling with backtracking
  const success = await fill(cells, size, 0, 0);
  if (!success) alert("Failed to generate a valid grid");

  label(table, size);
  // After filling, remove numbers from cells but keep in the array
  setTimeout(() => hideNumbers(cells, numberArray), 500);
  
  document.getElementById("puzzleSubmit").style.display = "block";
  document.getElementById("help").style.display = "block";
}

function label(table, size) {
  // Convert flat numberArray to 2D for easier processing
  const grid = secret();

  // Insert top label row
  const topRow = table.insertRow(0);
  topRow.insertCell().classList.add("borderless"); // top-left corner
  for (let col = 0; col < size+1; col++) {
      const colArray = grid.map(row => row[col]);
      const cell = topRow.insertCell();
      cell.classList.add("borderless");
      if (col!==size) cell.textContent = countVisible(colArray);
  }

  // Append bottom label row
  const bottomRow = table.insertRow();
  bottomRow.insertCell().classList.add("borderless"); // bottom-left corner
  for (let col = 0; col < size+1; col++) {
      const colArray = grid.map(row => row[col]).reverse();
      const cell = bottomRow.insertCell();
      cell.classList.add("borderless");
      if (col!==size) cell.textContent = countVisible(colArray);
  }

  // Add left/right labels to each row
  for (let row = 0; row < size; row++) {
      const realRow = table.rows[row + 1]; // shift by +1 due to top labels
      const left = realRow.insertCell(0);
      left.classList.add("borderless");
      left.textContent = countVisible(grid[row]);

      const right = realRow.insertCell();
      right.classList.add("borderless");
      right.textContent = countVisible([...grid[row]].reverse());
  }
}

function secret() {
    const size = Math.sqrt(numberArray.length);
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid[i] = numberArray.slice(i * size, (i + 1) * size);
    }
    return grid;
}

async function fill(cells, size, row, col) {
  if (row === size) return true; // done

  const nextRow = col === size - 1 ? row + 1 : row;
  const nextCol = col === size - 1 ? 0 : col + 1;

  const nums = shuffle([...Array(size)].map((_, i) => i + 1));

  for (const num of nums) {
    if (isSafe(to2d(cells), row, col, num)) {
      cells[row][col].textContent = num;
      numberArray[row * size + col] = num; // Save number in array
      await delay(100);

      const success = await fill(cells, size, nextRow, nextCol);
      if (success) return true;

      // Backtrack
      cells[row][col].textContent = "";
      numberArray[row * size + col] = null; // Remove from array
      await delay(100);
    }
  }

  return false; // backtrack
}

function to2d(cells) {
  const arr = zeros(cells.length);
  for (let i=0; i<cells.length; i++) {
    for (let j=0; j<cells[0].length; j++) {
      arr[i][j] = parseInt(cells[i][j].textContent) || null;
    }
  }
  return arr;
}

function isSafe(cells, row, col, num) {
  for (let i = 0; i < cells.length; i++) {
    if (i!=col && cells[row][i] === num) return false;
    if (i!=row && cells[i][col] === num) return false;
  }
  return true;
}

// Remove numbers from table cells after generation
function hideNumbers(cells, numberArray) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[i].length; j++) {
      cells[i][j].textContent = ""; // Clear the cell text
    }
  }
  // The numbers are still in the numberArray
  console.log("Secret number array:", numberArray); // Log or use the numbers as needed
}

function validate() {
    const size = parseInt(document.getElementById("shape").value);
    const cells = getCells(size);
    const userInput = [];

    // Collect user input from table cells
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells.length; j++) {
        const input = parseInt(cells[i][j].textContent);
        console.log(input);
        if (isNaN(input)) {
        alert("Please fill all cells with numbers.");
        return;
        }
        userInput.push(input);
      }
    }

    // Compare user input with the secret number array
    const feedback = compareArrays(userInput, numberArray, size);
    alert(feedback);
}

function compareArrays(userInput, secretArray, size) {
    let correct = 0;
    let incorrect = 0;

    // Compare user input with the secret number array
    for (let i = 0; i < userInput.length; i++) {
        if (userInput[i] === secretArray[i]) {
        correct++;
        } else {
        incorrect++;
        }
    }

    // Provide feedback based on the comparison
    if (correct == size*size) return `You completed the puzzle!`;
    else return `${correct} numbers are correct, ${incorrect} numbers are incorrect.`;
}

async function solveSkyscraper() {
  function toNum(arr) {
      return arr.map(cell => parseInt(cell.textContent) || 0);
  }

  const size = parseInt(document.getElementById("shape").value);
  if (isNaN(size) || size <= 0) return;
  const table = document.getElementById("table");

  // get labels as int arrays
  const top = toNum(getRow(table, 0));
  const left = toNum(getCol(table, 0));

  const success = await backtrack(getCells(size), zeros(size), size, 0, 0, top, left);
  console.log(success ? "Puzzle solved!" : "No solution found.");
  console.log("Secret: ", numberArray);
}

function getCells(size) {
  const table = document.getElementById("table");
  const cells = [];
  for (let i = 0; i < size; i++) {
    cells[i] = [];
    for (let j = 0; j < size; j++) {
      // +1 to skip the left/top label borders
      cells[i][j] = table.rows[i + 1].cells[j + 1];
    }
  }
  return cells;
}

function getCol(table, colIndex) {
    const columnCells = [];
    for (let row of table.rows) {
        const cell = row.cells[colIndex];
        if (cell) columnCells.push(cell);
    }
    columnCells.shift(); // remove header
    columnCells.pop();   // remove footer
    return columnCells;
}

function getRow(table, rowIndex) {
    const rowCells = Array.from(table.rows[rowIndex].cells);
    rowCells.shift(); // remove left border
    rowCells.pop();   // remove right border
    return rowCells;
}

function countVisible(line) {
  let count = 0, max = 0; 
  for (let val of line) {
    if (val > max) {
      count++;
      max = val;
    }
  }
  return count;
}

function zeros(i) {
  const mask = [];
  var temp;
  for (let j=0; j<i; j++) {
    temp = [];
    for (let k=0; k<i; k++) {
      temp.push(null);
    }
    mask.push(temp);
  }
  return mask;
}

function isFull(line) {
  var result = true;
  for (let num of line) {
    result = result && !isNaN(num);
  }
  return result;
}

async function backtrack(cells, grid, size, row, col, top, left) {
  function check(row, col) {
    // Check row and column uniqueness
    if (!isSafe(grid, row, col, grid[row][col])) return false;

    // Check partial column visibility (top clue)
    const colValues = grid.map(r => r[col]).filter(n => n !== null);
    if (colValues.length === size) {
      const clue = top[col];
      if (countVisible(colValues) !== clue) return false;
    } else {
      if (countVisible(colValues) > top[col]) return false; // partial invalid
    }

    // Check partial row visibility (left clue)
    const rowValues = grid[row].filter(n => n !== null);
    if (rowValues.length === size) {
      const clue = left[row];
      if (countVisible(rowValues) !== clue) return false;
    } else {
      if (countVisible(rowValues) > left[row]) return false; // partial invalid
    }

    return true;
  }

  if (row === size) return true;

  const nextRow = col === size - 1 ? row + 1 : row;
  const nextCol = col === size - 1 ? 0 : col + 1;

  const nums = shuffle([...Array(size)].map((_, i) => i + 1));

  for (const num of nums) {
    grid[row][col] = num;
    cells[row][col].textContent = num.toString();

    if (check(row, col)) {
      const success = await backtrack(cells, grid, size, nextRow, nextCol, top, left);
      if (success) return true;
    }

    // Backtrack
    grid[row][col] = null;
    cells[row][col].textContent = "";
  }

  return false;
}
