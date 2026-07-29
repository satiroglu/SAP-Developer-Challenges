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
    action rollDice() returns { roll: Integer; position: Integer; event: String; };

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

    @from: [ #Blocked ]
    @to: $flow.previous
    action skipTurn();
  }

  entity BoardSquares as projection on snakeladder.BoardSquares;
}
// Domain events — emitted by handlers, consumed in Week 3
event BoardEvent {
  playerID : UUID;
  type     : String;   // 'ladder' | 'snake' | 'doubleSnake'
  ![from]  : Integer;  // 'from' is a CDS reserved word — escape with ![]
  ![to]    : Integer;
}

event GameWon {
  playerID  : UUID;
  sessionID : UUID;
}