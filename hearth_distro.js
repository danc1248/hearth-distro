/**
 * for hearthstone arenas:
 *
 * Calculates the percentage of people who should expect a certain win/lose ratio
 * and the percentile you are in for that win/lose ratio
 * Assumes that people are matched against those with the same win/lose ratio
 *
 * @example just execute it and then see the outptu
 */

/**
 * Individual player in our giant tourny
 * @param Mixed optional index, if it exists, it will derive the win/lose from the index, default 0
 */
var Player = function( index ) {
  this.wins = 0;
  this.loses = 0;

  if( index ) {
    this.index = index;
    this.wins = Math.floor( index / 1000 );
    this.loses = index - 1000 * this.wins;
  } else {
    this.index = this.wins * 1000 + this.loses;
  }
}

Player.prototype.win = function() {
  this.wins++;
  this.index+=1000;
}

Player.prototype.lose = function() {
  this.loses++;
  this.index+=1;
}

/**
 * For sorting an array of player indexes from lowest to highest by wins then loses
 * @return int > 0 if index1 comes after index2
 *         int < 0 if index2 comes after index1
 * @throws exception if they are equal
 */
Player.prototype.sort = function( index1, index2 ){
  var player1 = new Player( index1 ),
      player2 = new Player( index2 ),
      wins  = player1.wins  - player2.wins,
      loses = player1.loses - player2.loses;
  if( wins  !== 0 ) return wins;
  if( loses !== 0 ) return loses;
  throw "comparing two equal buckets "+ a + " " +b;
}


/**
 * This is the organizational object for our toury
 * players are stored as elements in arrays inside the bins, each bin corresponding to a win/lose ratio determined by the index
 */
var Org = function() {
  this.bins = {};
  this.total = 0;
}

/** 
 * Save a player to the correct bin
 * @param Player
 */
Org.prototype.save = function( player ) {
  var index = player.index;
  if( this.bins[index] === undefined ) {
    this.bins[index] = [];
  }
  this.bins[index].push(player);
  this.total++;
}

/**
 * Pop a player off the bin and return it
 * @param Mixed index of the bin
 * @return Player an arbitrary player off the bin
 */
Org.prototype.get = function( index ) {
  if( this.bins[index] ) {
    this.total--;
    return this.bins[index].pop();
  }
  throw "nothing to pop "+index;
}

/**
 * Find an index that can be used to grab players for a battle
 * This contains the rules for who can battle
 * @return Mixed index or false if none could be found
 */
Org.prototype.getIndexForBattle = function() {
  var indexes = Object.keys(this.bins);
  for( var a=0; a<indexes.length; a++ ) {
    var index = indexes[a];

    var numberOfPlayers = this.bins[index].length;

    if( numberOfPlayers < 2 ) {
      continue;
    }

    var player = this.bins[index][0];

    if( player.loses === 3 ) {
      continue;
    }

    if( player.wins === 12 ) {
      continue;
    }

    return index;
  }

  // no valid index, I guess we are done?
  return false;
}

/**
 * Battle two players, one is given a win and the other a lose
 * the players or of the same bin but are otherwise arbitrary
 * @param Mixed index for battle
 */
Org.prototype.battle = function( index ) {
  if( index === false ) {
    return;
  }
  var player1 = this.get( index );
  var player2 = this.get( index );

  if( !player1 || !player2 ) {
    throw "invalid index " + index;
  }

  player1.win();
  player2.lose();

  this.save(player1);
  this.save(player2);
}

/**
 * Print out the statistical information about who is where in our bins
 * @return String
 */
Org.prototype.toString = function() {
  var indexes = Object.keys(this.bins);
  indexes.sort(Player.prototype.sort);
  var s = "";
  var percentile = 0;
  for( var a=0; a<indexes.length; a++ ) {
    var index = indexes[a];
    var numberOfPlayers = this.bins[index].length;

    if( numberOfPlayers === 0 ) {
      continue;
    }

    var player = this.bins[index][0];
    var percent = numberOfPlayers / this.total
    percentile += percent;

    s += "wins:\t"+player.wins
      +  "\tloses:\t"+player.loses
      +  "\tcount:\t"+numberOfPlayers
      +  "\tpercent:\t"+Math.round(percent * 10000) / 100
      +  "\tpercentile:\t"+Math.round(percentile * 10000) / 100
      +  "\n";
  }

  return s;
}

var org = new Org();
var totes = Math.pow(2,16);

for(var a=0; a<totes; a++ ) {
  org.save( new Player() );
}

do {
  var index = org.getIndexForBattle();
  org.battle( index );
} while( index !== false );

console.log( org.toString(totes) );

