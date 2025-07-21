// chess.js - This file contains the logic for a Gomoku (五子棋) game,
// named 'chess.js' as per user request.
// This version is simplified to remove Firebase authentication and security redundancy,
// directly loading and saving game state to the cloud without user restrictions.

// Assume 'firebase' and 'database' (from firebase.database()) are globally available.
// Example of how they might be initialized in your global scope:
// const firebaseConfig = { /* your firebase config */ };
// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

// Game constants
const BOARD_SIZE = 15; // 15x15 board
const CELL_SIZE = 35; // Slightly reduced size of each cell in pixels for a smaller board
const STONE_RADIUS = 16; // Adjusted stone radius
const LINE_WIDTH = 1; // Width of board lines

// Game state variables
let board = [];
let movesHistory = []; // Stores {row, col, player, moveNumber} for undo/redo
let historyIndex = -1; // Current position in movesHistory
let currentPlayer = 'black'; // 'black' or 'white'
let moveNumber = 1; // Global move number for display on stones (sequential: 1, 2, 3, ...)
let gameStatus = 'playing'; // 'playing', 'black_wins', 'white_wins', 'draw'

// Canvas elements
const canvas = document.getElementById('gomokuBoard');
const ctx = canvas.getContext('2d');
const statusMessageElement = document.getElementById('statusMessage');
const undoButton = document.getElementById('undoButton');
const redoButton = document.getElementById('redoButton');
const restartButton = document.getElementById('restartButton');

// Initialize board dimensions
canvas.width = (BOARD_SIZE - 1) * CELL_SIZE + 2 * CELL_SIZE;
canvas.height = (BOARD_SIZE - 1) * CELL_SIZE + 2 * CELL_SIZE;

/**
 * Initializes the game logic and sets up the database listener.
 * This function assumes `database` (firebase.database()) is globally available.
 * It directly sets up a listener for the public game state.
 */
function initializeGameLogic() {
    try {
        // __app_id is provided by the Canvas environment for constructing database paths.
        // Using a fixed path for the public game state.
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const gameRef = database.ref(`/artifacts/${appId}/public/data/gomoku_game`);

        // Listen for changes to the game state in Firebase
        gameRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Update local game state from Firebase
                board = data.board || createEmptyBoard();
                movesHistory = data.movesHistory || [];
                historyIndex = data.historyIndex !== undefined ? data.historyIndex : -1;
                currentPlayer = data.currentPlayer || 'black';
                moveNumber = data.moveNumber || 1;
                gameStatus = data.gameStatus || 'playing';
                drawBoard(); // Redraw the board with the updated state
                updateStatusMessage(); // Update the game status message
                updateButtonStates(); // Update undo/redo button states
            } else {
                // If no data, initialize a new game and push initial state to Firebase
                initializeGame();
                updateFirebaseGameState();
            }
        }, (error) => {
            console.error("Error listening to Firebase:", error);
            statusMessageElement.textContent = `ERROR: REALTIME UPDATE FAILED`; // Simplified error message
        });

    } catch (error) {
        console.error("Error initializing game logic:", error);
        statusMessageElement.textContent = `ERROR: GAME INIT FAILED`; // Simplified error message
    }
}

/**
 * Creates an empty game board.
 * @returns {Array<Array<number>>} A 2D array representing the empty board.
 */
function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
}

/**
 * Initializes the game state to its default values.
 */
function initializeGame() {
    board = createEmptyBoard();
    movesHistory = [];
    historyIndex = -1;
    currentPlayer = 'black';
    moveNumber = 1;
    gameStatus = 'playing';
    drawBoard();
    updateStatusMessage();
    updateButtonStates();
}

/**
 * Updates the game state in Firebase Realtime Database.
 * This function assumes `database` is globally available.
 */
function updateFirebaseGameState() {
    if (!database) {
        console.warn("Firebase Realtime Database not initialized. Cannot update game state.");
        return;
    }
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const gameRef = database.ref(`/artifacts/${appId}/public/data/gomoku_game`);
    gameRef.set({
        board: board,
        movesHistory: movesHistory,
        historyIndex: historyIndex,
        currentPlayer: currentPlayer,
        moveNumber: moveNumber,
        gameStatus: gameStatus
    }).catch(error => {
        console.error("Error updating Firebase game state:", error);
        statusMessageElement.textContent = `ERROR: SAVE FAILED`; // Simplified error message
    });
}

/**
 * Draws the Gomoku board and all the stones.
 */
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#333333'; // Dark lines for light board
    ctx.lineWidth = LINE_WIDTH;
    for (let i = 0; i < BOARD_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo((i + 1) * CELL_SIZE, CELL_SIZE);
        ctx.lineTo((i + 1) * CELL_SIZE, (BOARD_SIZE) * CELL_SIZE);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE, (i + 1) * CELL_SIZE);
        ctx.lineTo((BOARD_SIZE) * CELL_SIZE, (i + 1) * CELL_SIZE);
        ctx.stroke();
    }

    // Draw star points (Hoshi) for a 15x15 board
    const starPoints = [
        [3, 3], [3, 11], [11, 3], [11, 11], // Corners
        [3, 7], [7, 3], [7, 11], [11, 7], // Middles
        [7, 7] // Center
    ];
    ctx.fillStyle = '#333333'; // Dark for star points
    starPoints.forEach(([row, col]) => {
        const x = (col + 1) * CELL_SIZE;
        const y = (row + 1) * CELL_SIZE;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw stones and move numbers
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const stone = board[r][c];
            if (stone !== 0) {
                const x = (c + 1) * CELL_SIZE;
                const y = (r + 1) * CELL_SIZE;

                // Draw stone
                ctx.beginPath();
                ctx.arc(x, y, STONE_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = stone === 1 ? 'black' : 'white'; // 1 for black, 2 for white
                ctx.fill();
                ctx.strokeStyle = '#333'; // Subtle stroke for flat look
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Draw move number
                const moveData = movesHistory.find(m => m.row === r && m.col === c);
                if (moveData) {
                    ctx.fillStyle = stone === 1 ? 'white' : 'black'; // Text color opposite to stone
                    ctx.font = `${STONE_RADIUS * 0.8}px 'Press Start 2P', monospace`; // Pixel-art like font
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // Display the pair number (e.g., 1 for 1st black/white, 2 for 2nd black/white)
                    ctx.fillText(Math.ceil(moveData.moveNumber / 2), x, y);
                }
            }
        }
    }
}

/**
 * Handles a click event on the canvas.
 * @param {MouseEvent | TouchEvent} event - The click or touch event.
 */
function handleClick(event) {
    if (gameStatus !== 'playing') {
        // Game is over, cannot make moves
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
    const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Convert pixel coordinates to board grid coordinates
    const col = Math.round((x - CELL_SIZE) / CELL_SIZE);
    const row = Math.round((y - CELL_SIZE) / CELL_SIZE);

    // Check if within board bounds and cell is empty
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === 0) {
        // Place the stone
        const playerValue = currentPlayer === 'black' ? 1 : 2; // 1 for black, 2 for white
        board[row][col] = playerValue;

        // Clear any "redo" history if a new move is made
        movesHistory = movesHistory.slice(0, historyIndex + 1);

        // Add to history with the current sequential move number
        movesHistory.push({ row, col, player: playerValue, moveNumber: moveNumber });
        historyIndex = movesHistory.length - 1;

        // Check for win
        if (checkWin(row, col, playerValue)) {
            gameStatus = currentPlayer === 'black' ? 'black_wins' : 'white_wins';
        } else if (movesHistory.length === BOARD_SIZE * BOARD_SIZE) {
            gameStatus = 'draw'; // Board is full, no winner
        } else {
            // Switch player and increment sequential move number for the *next* move
            currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
            moveNumber++;
        }

        // Update Firebase
        updateFirebaseGameState();
    }
}

/**
 * Checks if the last placed stone results in a win.
 * @param {number} r - Row of the last placed stone.
 * @param {number} c - Column of the last placed stone.
 * @param {number} player - The player who just moved (1 for black, 2 for white).
 * @returns {boolean} True if the player has won, false otherwise.
 */
function checkWin(r, c, player) {
    const directions = [
        [0, 1],  // Horizontal
        [1, 0],  // Vertical
        [1, 1],  // Diagonal \
        [1, -1]  // Diagonal /
    ];

    for (const [dr, dc] of directions) {
        let count = 1;
        // Check in one direction
        for (let i = 1; i < 5; i++) {
            const nr = r + i * dr;
            const nc = c + i * dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
                count++;
            } else {
                break;
            }
        }
        // Check in opposite direction
        for (let i = 1; i < 5; i++) {
            const nr = r - i * dr;
            const nc = c - i * dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
                count++;
            } else {
                break;
            }
        }
        if (count >= 5) {
            return true;
        }
    }
    return false;
}

/**
 * Updates the status message displayed on the screen.
 */
function updateStatusMessage() {
    switch (gameStatus) {
        case 'playing':
            statusMessageElement.textContent = `${currentPlayer === 'black' ? 'BLACK' : 'WHITE'}'S TURN`;
            break;
        case 'black_wins':
            statusMessageElement.textContent = 'BLACK WINS!';
            break;
        case 'white_wins':
            statusMessageElement.textContent = 'WHITE WINS!';
            break;
        case 'draw':
            statusMessageElement.textContent = 'DRAW!';
            break;
    }
}

/**
 * Updates the enabled/disabled state of the undo/redo buttons.
 */
function updateButtonStates() {
    undoButton.disabled = historyIndex < 0 || gameStatus !== 'playing';
    redoButton.disabled = historyIndex >= movesHistory.length - 1 || gameStatus !== 'playing';
    restartButton.disabled = false; // Always enabled
}

/**
 * Undoes the last move.
 */
function undoMove() {
    if (historyIndex >= 0 && gameStatus === 'playing') {
        // Get the last move and remove the stone from the board
        const lastMove = movesHistory[historyIndex];
        board[lastMove.row][lastMove.col] = 0;

        // Decrement history index
        historyIndex--;

        // Determine the game state for the *next* move after undoing
        const totalStonesAfterUndo = historyIndex + 1;

        if (totalStonesAfterUndo === 0) {
            // If no stones left on board, reset to initial state
            currentPlayer = 'black';
            moveNumber = 1;
        } else {
            // Determine whose turn it is next based on the number of stones remaining
            // If even number of stones remain, it's Black's turn next (e.g., after White's 1st stone is undone, Black's 1st stone remains, next is Black's 2nd stone)
            // If odd number of stones remain, it's White's turn next (e.g., after Black's 1st stone is undone, no stones remain, next is White's 1st stone)
            currentPlayer = (totalStonesAfterUndo % 2 === 0) ? 'black' : 'white';

            // The move number for the *next* stone to be placed
            // This ensures the sequential move number is correct for the next action
            moveNumber = totalStonesAfterUndo + 1;
        }
        updateFirebaseGameState();
    }
}

/**
 * Redoes the last undone move.
 */
function redoMove() {
    if (historyIndex < movesHistory.length - 1 && gameStatus === 'playing') {
        // Increment history index to get the next move to redo
        historyIndex++;
        const nextMove = movesHistory[historyIndex];
        board[nextMove.row][nextMove.col] = nextMove.player; // Place the stone

        // Determine the game state for the *next* move after redoing
        const totalStonesAfterRedo = historyIndex + 1;

        // Determine whose turn it is next based on the number of stones currently on board
        currentPlayer = (totalStonesAfterRedo % 2 === 0) ? 'black' : 'white';

        // The move number for the *next* stone to be placed
        moveNumber = totalStonesAfterRedo + 1;

        updateFirebaseGameState();
    }
}

/**
 * Restarts the game.
 * Directly restarts without a confirmation dialog as per user's request for a minimal version.
 */
function restartGame() {
    initializeGame();
    updateFirebaseGameState(); // Push the reset state to Firebase
}

// Event Listeners
canvas.addEventListener('click', handleClick);
canvas.addEventListener('touchstart', handleClick, { passive: false }); // For mobile touch
undoButton.addEventListener('click', undoMove);
redoButton.addEventListener('click', redoMove);
restartButton.addEventListener('click', restartGame);

// Initial setup on window load
window.onload = function() {
    // Directly initialize game logic which sets up the database listener
    initializeGameLogic();
    // The initial game state will be loaded from Firebase via the listener.
    // If Firebase has no data for the game path, initializeGame will be called to set up a new game.
};

// Handle window resize to redraw board
window.addEventListener('resize', drawBoard);
