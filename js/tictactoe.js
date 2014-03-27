'use strict';

var Square = function() {
  this.value = '';
  this.setValue = function(val) {
    this.value = val;
  };
};

var Game = function($board) {
  var self = this;
  this.players = ['&times;', '&#9675;'];
  this.$board = $board;
  this.winningCombinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  var mm = new MiniMax(this.players[0], this.players[1]);

  this.setElement = function(index, symbol) {
    this.$board.find('[data-index='+index+']').html(symbol);
  };

  //setPosition updates the clicked square with the appropriate symbol and changes turns.
  this.setPosition = function(i) {
    this.board[i] = this.players[+this.firstPlayer];
    this.setElement(i, this.board[i]);
    this.firstPlayer = !this.firstPlayer;
    this.directions('It is now: ' + this.players[+this.firstPlayer] + '\'s turn');

  };

  // directions is a method to set the directions box below.
  this.directions = function(str, klass) {
    var $directions = this.$board.find('.directions');
    $directions.html(str).removeClass('error success').addClass(klass);
  };

  // setWinner removes the click handlers for the square and updates the description with the winner's symbol.
  this.setWinner = function(winner) {
    this.$board.find('.cell a').unbind('click');
    this.$board.find('.cell a').click(function(evt) { evt.preventDefault(); });
    this.directions('The winner is: ' + this.players[winner], 'success');
    this.toggleReset();
  };

  // testSquares tests all the possible combinations of square to see if the player who just played has won.
  // **Note** we only check the current player because they are the only one who can win in the current round.
  this.testSquares = function(player, current_board) {
    var self = this;
    return this.winningCombinations.filter(function(numbers) { return numbers.filter(function(x) {return current_board[x] === player; }).length === 3;}).length >= 1;
  };
  // isGameOver test to see if there are still spots left on the board.
  this.isGameOver = function(current_board) {
    return current_board.filter(function(x) { return x === undefined; } ).length === 0;
  };

  this.computerTurn = function() {
    var square = mm.getNextMove(this);
    this.setPosition(square);
    this.testWin();
  };

  // testWin tests to see if there is a winner as well as if the game is over
  this.testWin = function() {
    //test to see if there is a winner.
    if (this.testSquares(this.players[+!this.firstPlayer], this.board)){
      this.setWinner(+!this.firstPlayer);
      return true;
    }
    // if there is no winner, are there spaces left to play?
    if (this.isGameOver(this.board)) {
      this.directions('The Game ended in a tie');
      this.toggleReset();
      return true;
    }
    // game's not over!
    return false;
  }

  //toggleReset shows or hides the reset button if available.
  this.toggleReset = function() {
    this.$board.find('.reset').toggle();
  };

  this.$reset = this.$board.find('.reset');
  //make sure we only call this handler once.
  this.$reset.click(function(evt) {
    evt.preventDefault();
    self.start();
  });

  //start is the beginning of the game. This (re)initializes all the game variables.
  this.start = function() {

    //create the board as a 9 element array of undefined.
    this.board = Array.apply(null, {length: 9});
    this.firstPlayer = false;
    this.$board.find('.cell a').html('&nbsp;');

    // we always start off with the first players symbol.
    this.directions('It is now: ' + this.players[+this.firstPlayer] + '\'s turn');
    this.$reset.hide();
    this.$board.find('.cell a').each(function(i, x) {
      $(x).click(function(evt) {
        evt.preventDefault();
        if (self.board[i] !== undefined) {
          return;
        }
        self.setPosition(i);
        if (!self.testWin()) {
          self.computerTurn();
        }
      });
    });
  };
};


//this is an implementation of the Minimax algorithm for finding the best solution for playing a move.
var MiniMax = function(player, computer) {
  //set up self so we can use it inside callbacks.
  var self = this;
  this.player = player;
  this.computer = computer;

  // getNextMove returns the best statistical move for the computer to make.
  this.getNextMove = function(game) {
    var current_board = game.board
    self.game = game;

    //always go for the center
    if (current_board[4] === undefined) { return 4; }

    var available_slots = current_board.reduce(function(a,b,i) { if (b === undefined) a.push(i); return a }, []);
    var winning_score_array = available_slots.map(function(x) {
      var temp = current_board.slice(0);
      temp[x] = computer;
      return getScoreArray(temp, player, computer, 1);
    });
    //look for any available losses within the next move.
    var losing_score_array = available_slots.map(function(x) {

      var temp = current_board.slice(0);
      temp[x] = player;
      return self.game.testSquares(player, temp);
    });

    //look for any available wins within the next move.
    var immediate_win_array = available_slots.map(function(x) {
      var temp = current_board.slice(0);
      temp[x] = computer;
      return self.game.testSquares(computer, temp);
    });

    //see if we were able to find any immediate wins or losses.
    var immediate_loss = losing_score_array.indexOf(true);
    var immediate_win = immediate_win_array.indexOf(true);

    var max_index = 0;
    var max_value = -Infinity;

    winning_score_array.forEach(function(x, i) {
      if (x > max_value) {
        max_value = x;
        max_index = i;
      }
    });

    var ret_score = immediate_win >= 0 ? available_slots[immediate_win] : (immediate_loss >= 0 ? available_slots[immediate_loss] : available_slots[max_index]);
    return ret_score;
  };

  var penalty = 10.0;

  var getScoreArray = function(board, active, secondary, depth) {
    //see if the player that just played wins
    if (self.game.testSquares(secondary, board)){
      return secondary === self.player ? -penalty * depth : penalty / depth;
    } else if (self.game.isGameOver(board)) {
      return 0;
    }
    var available_slots = board.reduce(function(a,b,i) { if (b === undefined) a.push(i); return a }, []);


    return available_slots.reduce(function(a, slot) {
      var temp_board = board.slice(0);
      temp_board[slot] = active;
      return getScoreArray(temp_board, secondary, active, depth + 1)
    });

  };
};

//start the game with the board.
var game = new Game($('#board'));
game.start();
