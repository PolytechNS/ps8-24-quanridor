const {
  isLegal,
  canJump,
  checkWin,
  isWallLegal,
  getPossibleMovesAndWalls,
} = require("../utils/game-checkers.js");

function computeMove(gameState) {
  let pos = gameState.playerspositions[1];
  let { possibleMoves, possibleWalls } = getPossibleMovesAndWalls(gameState, 2);

  // 1/3 chance of placing a wall
  if (Math.floor(Math.random() * 3) == 0 && possibleWalls.length > 0) {
    let wallIndex = Math.floor(Math.random() * possibleWalls.length);
    return possibleWalls[wallIndex];
  } else {
    let moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
  }
}

module.exports = computeMove;
