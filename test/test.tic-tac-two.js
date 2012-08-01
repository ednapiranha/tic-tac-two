'use strict';

var express = require('express');
var app = express.createServer();
var assert = require('should');
var tic = require('../lib/tic-tac-two');
var should = require('should');

var email = 'test@test.org';

describe('game', function() {
  describe('get new board', function() {
    it('returns a new board', function(done) {
      tic.new(email, function(err, board) {
        should.exist(board);
        done();
      });
    });
  });

  describe('makes a move', function() {
    it('returns an updated board with a valid move', function(done) {
      tic.new(email, function(err, currBoard) {
        var position = '11';

        tic.move(currBoard, position, function(err, currBoard) {
          should.exist(currBoard);
          currBoard.board[position].should.equal(1);
          done();
        });
      });
    });

    it('returns an updated board with an invalid move', function(done) {
      tic.new(email, function(err, currBoard) {
        currBoard.board['11'] = 2;
        var position = '11';

        tic.move(currBoard, position, function(err, currBoard) {
          should.exist(currBoard);
          currBoard.board[position].should.equal(2);
          done();
        });
      });
    });

    it('returns an updated board with winner X', function(done) {
      tic.new(email, function(err, currBoard) {
        currBoard.board['11'] = 1;
        currBoard.board['12'] = 1;
        currBoard.xArr = [11, 12];
        var position = '13';

        tic.move(currBoard, position, function(err, currBoard) {
          should.exist(currBoard);
          currBoard.has_won.should.equal('X');
          done();
        });
      });
    });

    it('returns an updated board with winner O', function(done) {
      tic.new(email, function(err, currBoard) {
        currBoard.board['11'] = 2;
        currBoard.board['12'] = 2;
        currBoard.board['22'] = 2;
        currBoard.board['23'] = 2;
        currBoard.oArr = [11, 12,  22, 23];

        currBoard.board['13'] = 1;
        currBoard.board['21'] = 1;
        currBoard.board['31'] = 1;
        currBoard.xArr = [13, 21, 3];
        var position = '33';

        tic.move(currBoard, position, function(err, currBoard) {
          should.exist(currBoard);
          currBoard.has_won.should.equal('O');
          done();
        });
      });
    });

    it('returns an updated board with no winner', function(done) {
      tic.new(email, function(err, currBoard) {
        currBoard.board['11'] = 2;
        currBoard.board['12'] = 2;
        currBoard.board['23'] = 2;
        currBoard.board['31'] = 2;
        currBoard.oArr = [11, 12, 23, 31];

        currBoard.board['13'] = 1;
        currBoard.board['22'] = 1;
        currBoard.board['21'] = 1;
        currBoard.xArr = [13, 21, 22];
        var position = '33';

        tic.move(currBoard, position, function(err, currBoard) {
          should.exist(currBoard);
          currBoard.has_won.should.equal(false);
          done();
        });
      });
    });
  });
});