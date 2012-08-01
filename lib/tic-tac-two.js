'use strict';

var ROWS = 3;
var COLS = 3;
var PLAYER_X = 1;
var PLAYER_O = 2;
var xArr = [];
var oArr = [];
var WINNING_MATCHES = [
  [11, 12, 13],
  [21, 22, 23],
  [31, 32, 33],
  [11, 22, 33],
  [13, 22, 31],
  [11, 21, 31],
  [12, 22, 32],
  [13, 23 ,33]
];

/* New board
 * Requires: email
 * Returns: a new game board
 */
exports.new = function(email, callback) {
  var newBoard = {
    email: email,
    board: {},
    xArr: [],
    oArr: [],
    has_won: false
  };

  for (var x = 1; x < ROWS + 1; x ++) {
    for (var y = 1; y < COLS + 1; y ++) {
      newBoard.board[x.toString() + y.toString()] = 0;
    }
  }

  callback(null, newBoard);
};

var isMatchingX = function(element, index, array) {
  return (xArr.indexOf(element) > -1);
}

var isMatchingO = function(element, index, array) {
  return (oArr.indexOf(element) > -1);
}

var checkHasWon = function(currBoard) {
  xArr = currBoard.xArr;
  oArr = currBoard.oArr;

  for (var i = 0; i < WINNING_MATCHES.length; i ++) {
    if (WINNING_MATCHES[i].every(isMatchingX)) {
      currBoard.has_won = 'X';
      break;
    } else if (WINNING_MATCHES[i].every(isMatchingO)) {
      currBoard.has_won = 'O';
      break;
    }
  }

  return currBoard;
};

var randomPosition = function(low_range, high_range) {
  return Math.floor(Math.random() * (high_range - low_range + 1)) + low_range;
};

var setNextMove = function(currBoard) {
  var board = currBoard.board;
  var availablePos = [];

  for (var pos in board) {
    if (board[pos] === 0) {
      availablePos.push(pos);
    }
  }

  currBoard = checkHasWon(currBoard);

  if (!currBoard.has_won) {
    // Bot O makes a move in the next available spot
    var randomPos = randomPosition(0, availablePos.length - 1);
    currBoard.board[availablePos[randomPos]] = PLAYER_O;
    currBoard.oArr.push(parseInt(availablePos[randomPos], 10));
    currBoard = checkHasWon(currBoard);
  }

  return currBoard;
};

/* Make a move on an empty slot
 * Requires: email, board, position
 * Returns: updated board
 * Notes: If a position is already taken, we ignore and return the last
 * board state. If a position is not taken, we apply the X or O and check
 * for a potential winning state. User is always X, bot is always O.
 */
exports.move = function(currBoard, position, callback) {
  if (isNaN(currBoard.board[position], 10) || currBoard.board[position] !== 0) {
    callback(null, currBoard);

  } else {
    currBoard.board[position] = PLAYER_X;
    currBoard.xArr.push(parseInt(position, 10));
    callback(null, setNextMove(currBoard));
  }
};
