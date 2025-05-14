    var numberArray = [], top = [], bottom = [], left = [], right = []; // Internal array to store the numbers and labels

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

      // After filling, remove numbers from cells but keep in the array
      setTimeout(() => hideNumbers(cells, numberArray), 500);
      
      label(table, size);

      document.getElementById("puzzleSubmit").style.display = "block";
      document.getElementById("help").style.display = "block";
    }
    
    function label(table, size) {
        function countVisibleSkyscrapers(arr) {
            let visible = 0;
            let max = 0;
            for (let num of arr) {
            if (num > max) {
                visible++;
                max = num;
            }
            }
            return visible;
        }

        // Convert flat numberArray to 2D for easier processing
        const grid = secret();

        // Insert top label row
        const topRow = table.insertRow(0);
        topRow.insertCell().classList.add("borderless"); // top-left corner
        for (let col = 0; col < size+1; col++) {
            const colArray = grid.map(row => row[col]);
            const cell = topRow.insertCell();
            cell.classList.add("borderless");
            if (col!==size) cell.textContent = countVisibleSkyscrapers(colArray);
        }

        // Append bottom label row
        const bottomRow = table.insertRow();
        bottomRow.insertCell().classList.add("borderless"); // bottom-left corner
        for (let col = 0; col < size+1; col++) {
            const colArray = grid.map(row => row[col]).reverse();
            const cell = bottomRow.insertCell();
            cell.classList.add("borderless");
            if (col!==size) cell.textContent = countVisibleSkyscrapers(colArray);
        }

        // Add left/right labels to each row
        for (let row = 0; row < size; row++) {
            const realRow = table.rows[row + 1]; // shift by +1 due to top labels
            const left = realRow.insertCell(0);
            left.classList.add("borderless");
            left.textContent = countVisibleSkyscrapers(grid[row]);

            const right = realRow.insertCell();
            right.classList.add("borderless");
            right.textContent = countVisibleSkyscrapers([...grid[row]].reverse());
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
        if (isSafe(cells, row, col, num)) {
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

    function isSafe(cells, row, col, num) {
      for (let i = 0; i < cells.length; i++) {
        if (parseInt(cells[row][i].textContent) === num) return false;
        if (parseInt(cells[i][col].textContent) === num) return false;
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
        const cells = document.getElementById("table").getElementsByTagName("td");
        const userInput = [];

        // Collect user input from table cells
        for (let i = 0; i < cells.length; i++) {
            const input = parseInt(cells[i].textContent);
            if (isNaN(input)) {
            alert("Please fill all cells with numbers.");
            return;
            }
            userInput.push(input);
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
        function isNumeric(char) {
            return !isNaN(char) && !isNaN(parseFloat(char));
        }

        function toNum(arr) {
            return arr.map(cell => parseInt(cell.textContent) || 0);
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

        const size = parseInt(document.getElementById("shape").value);
        if (isNaN(size) || size <= 0) return;
        const table = document.getElementById("table");

        // get labels as int arrays
        top = toNum(getRow(table, 0));
        bottom = toNum(getRow(table, size + 1));
        left = toNum(getCol(table, 0));
        right = toNum(getCol(table, size + 1));
        const grid = Array.from({ length: size }, () => Array(size).fill(0));

        const clues = [top, bottom, left, right];
        const success = await backtrack(grid, size, clues);
        console.log(success ? "Puzzle solved!" : "No solution found.", grid);
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

    async function backtrack(grid, size, clues) {
        // @override
        // function isSafe(row, col, num) {
        //     for (let i = 0; i < size; i++) {
        //         if (grid[row][i] === num || grid[i][col] === num) {
        //             return false;
        //         }
        //     }
        //     return true;
        // }
        // function zeros(i) {
        //     const mask = [];
        //     for (j=0; j<4; j++) {
        //         mask.push(new Array(i));
        //     }
        //     return mask;
        // }
        // const table = document.getElementById("table");
        // const cluemask = zeros(size);
        
        // for (k=1; k<5; k++) {
        //     for (i=0; i<4; i++) {
        //         for (j=0; j<size; j++) {
        //             if (cluemask[i][j]!=1 && clues[i][j]==k) {
        //                 cluemask[i][j] = 1;

        //             }
        //         }
        //     }
        // }
    }
