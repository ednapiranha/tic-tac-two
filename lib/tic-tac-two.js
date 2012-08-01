'use strict';

var crypto = require('crypto');
var xArr = [];
var oArr = [];
var ROWS = 3;
var COLS = 3;
var PLAYER_X = 1;
var PLAYER_O = 2;
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
exports.new = function(userId, db, callback) {
  var newBoard = {
    userId: crypto.createHash('sha1').update(userId + (new Date().getTime())).digest('hex'),
    board: {},
    hasWon: false
  };

  for (var x = 1; x < ROWS + 1; x ++) {
    for (var y = 1; y < COLS + 1; y ++) {
      newBoard.board[x.toString() + y.toString()] = 0;
    }
  }
  console.log('*** ', newBoard.board)
  db.set(newBoard.userId + ':board', JSON.stringify(newBoard.board));
  db.set(newBoard.userId + ':xArr', JSON.stringify({}));
  db.set(newBoard.userId + ':oArr', JSON.stringify({}));

  // Assume this is a fast game, so nobody is going to play this for over an hour
  db.expire(newBoard.userId + ':board', 60 * 60);
  db.expire(newBoard.userId + ':xArr', 60 * 60);
  db.expire(newBoard.userId + ':oArr', 60 * 60);

  callback(null, newBoard);
};

/* Make a move on an empty slot
 * Requires: userId, position, db connection
 * Returns: updated board data
 * Notes: If a position is already taken, we ignore and return the last
 * board state. If a position is not taken, we apply the X or O and check
 * for a potential winning state. User is always X, bot is always O.
 */
exports.move = function(userId, position, db, callback) {
  var isMatchingX = function(element, index, array) {
    console.log('*****', xArr)
    return (xArr.indexOf(element) > -1);
  };

  var isMatchingO = function(element, index, array) {
    return (oArr.indexOf(element) > -1);
  };

  var checkHasWon = function(board) {
    db.get(userId + ':xArr', function(err, xArr) {
      xArr = JSON.parse(xArr);
    });

    db.get(userId + ':oArr', function(err, oArr) {
      oArr = JSON.parse(oArr);
    });

    var hasWon = false;

    for (var i = 0; i < WINNING_MATCHES.length; i ++) {
      if (WINNING_MATCHES[i].every(isMatchingX)) {
        hasWon = 'X';
        break;

      } else if (WINNING_MATCHES[i].every(isMatchingO)) {
        hasWon = 'O';
        break;
      }
    }

    return hasWon;
  };

  var randomPosition = function(lowRange, highRange) {
    return Math.floor(Math.random() * (highRange - lowRange + 1)) + lowRange;
  };

  var setBoardPosition = function(userId, arrName, arr, pos, board, db, callback) {
    if (isNaN(board[pos], 10) || board[pos] !== 0) {
      callback(null, board);

    } else {
      if (arrName === 'oArr') {
        board[pos] = PLAYER_O;

      } else {
        board[pos] = PLAYER_X;
      }

      db.set(userId + ':' + arrName, arr);
      db.set(userId + ':board', board);

      callback(null, arr);
    }
  };

  var setNextMove = function(userId, callback) {
    var availablePos = [];

    db.get(userId + ':board', function(err, board) {
      if (err) {
        callback(err);

      } else {
        board = JSON.parse(board);

        for (var pos in board) {
          if (board[pos] === 0) {
            availablePos.push(pos);
          }
        }

        var hasWon = checkHasWon(board);

        if (!hasWon) {
          db.get(userId + ':oArr', function(err, oArr) {
            oArr = JSON.parse(oArr);

            // Bot O makes a move in the next available spot
            var randomPos = randomPosition(0, availablePos.length - 1);

            setBoardPosition(userId, 'oArr', oArr.push(parseInt(availablePos[randomPos], 10)),
              availablePos[randomPos], board, db, function(err, arr) {

              if (err) {
                callback(err);

              } else {
                //hasWon = checkHasWon(board);
                callback(null, board);
              }
            });
          });
        } else {
          callback(null, board);
        }
      }
    });
  };

  db.get(userId + ':xArr', function(err, xArr) {
    if (err) {
      callback(err);

    } else {
      xArr = JSON.parse(xArr);

      db.get(userId + ':board', function(err, board) {
        if (err) {
          callback(err);

        } else {
          board = JSON.parse(board);

          setBoardPosition(userId, 'xArr', xArr.push(parseInt(position, 10)),
            position, board, db, function(err, arr) {

            if (err) {
              callback(err);

            } else {
              setNextMove(board, function(err, board) {
                if (err) {
                  callback(err);

                } else {
                  callback(null, board);
                }
              });
            }
          });
        }
      });
    }
  });
};
