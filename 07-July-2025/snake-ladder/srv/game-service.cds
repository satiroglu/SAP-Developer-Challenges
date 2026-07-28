using { snakeladder } from '../db/schema';

service GameService {

  entity GameSessions as projection on snakeladder.GameSessions;

  @flow.status: TurnStatus
  entity Players as projection on snakeladder.Players actions {

    // Week 2 will implement these — declare them now so the model is complete
    @from: [ #Waiting ]
    @to: #Playing
    action startTurn();

    @from: [ #Playing ]
    @to: #Moving
    action rollDice() returns Integer;

    @from: [ #Moving ]
    @to: #Waiting                  // transitions to next player in Week 3
    action confirmMove();

    @from: [ #Moving ]
    @to: #Blocked                  // double-headed snake bite
    action blockPlayer();

    @from: [ #Blocked ]
    @to: $flow.previous            // restores pre-block status
    action unblockPlayer();

    @from: [ #Moving ]
    @to: #Finished
    action winGame();
  }

  entity BoardSquares as projection on snakeladder.BoardSquares;
}