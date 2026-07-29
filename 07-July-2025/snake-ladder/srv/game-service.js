// const cds = require('@sap/cds')
import cds from '@sap/cds'

// module.exports = class GameService extends cds.ApplicationService {
export default class GameService extends cds.ApplicationService {
  async init() {

    const { Players, BoardSquares } = this.entities

    // ── startTurn ─────────────────────────────────────────────────────────
    // @from: [#Waiting]  →  CAP validates status before this runs
    // @to: #Playing      →  CAP updates status after this returns
    // No business logic needed — CAP's @flow.status handles the transition.
    this.on('startTurn', 'Players', async (req) => {
      // Intentionally empty: the @from/@to annotations do all the work.
    })

    // ── rollDice ──────────────────────────────────────────────────────────
    // @from: [#Playing]  →  CAP validates status before this runs
    // @to: #Moving       →  CAP updates status after this returns
    this.on('rollDice', 'Players', async (req) => {
      const player = await SELECT.one.from(Players).where({ ID: req.params[0].ID })
      if (!player) return req.error(404, 'Player not found')

      const roll = Math.ceil(Math.random() * 6)
      let newPosition = player.position + roll

      // Can't overshoot square 100 — must land exactly
      if (newPosition > 100) {
        await UPDATE(Players).set({ lastRoll: roll }).where({ ID: player.ID })
        const needed = 100 - player.position
        return req.reject(409, `Need exactly ${needed} to finish. Rolled ${roll}. No move.`)
      }

      // Resolve snake or ladder on the new square
      const square = await SELECT.one.from(BoardSquares).where({ square: newPosition })
      let finalPosition = newPosition
      let event = null

      if (square?.ladderTo) {
        finalPosition = square.ladderTo
        event = { type: 'ladder', 'from': newPosition, 'to': finalPosition }
      } else if (square?.snakeTo) {
        finalPosition = square.snakeTo
        event = square.isDoubleHead
          ? { type: 'doubleSnake', 'from': newPosition, 'to': finalPosition }
          : { type: 'snake', 'from': newPosition, 'to': finalPosition }
      }

      // Persist position and last roll
      await UPDATE(Players)
        .set({ position: finalPosition, lastRoll: roll })
        .where({ ID: player.ID })

      // Emit domain event so subscribers (Week 3) can react
      if (event) await this.emit('BoardEvent', { playerID: player.ID, ...event })

      // Use req.reply() — not return — to pin the response value before CAP's
      // @flow.status after-handler runs. A plain `return` gets cleared by the
      // flow machinery, producing HTTP 204 instead of the expected 200 + body.
      req.reply({ roll, position: finalPosition, event: event?.type ?? 'normal' })
    })

    // ── confirmMove ───────────────────────────────────────────────────────
    // @from: [#Moving]  →  normal end of a turn, hands off to next player (Week 3)
    // @to: #Waiting     →  player waits for their next turn
    this.on('confirmMove', 'Players', async (req) => {
      // Week 3 will add turn rotation here.
      // For now: just let CAP apply @to: #Waiting
    })

    // ── blockPlayer ───────────────────────────────────────────────────────
    // @from: [#Moving]  →  called when player lands on a double-headed snake
    // @to: #Blocked     →  player skips their next turn
    this.on('blockPlayer', 'Players', async (req) => {
      // Business logic: the position was already updated in rollDice.
      // This action just transitions state — CAP handles the @to: #Blocked update.
      req.info('Player is blocked and will skip their next turn.')
    })

    // ── unblockPlayer ─────────────────────────────────────────────────────
    // @from: [#Blocked]   →  called at the start of a blocked player's next turn
    // @to: $flow.previous →  CAP restores the status to whatever it was before #Blocked
    this.on('unblockPlayer', 'Players', async (req) => {
      // CAP's $flow.previous does the work — no code needed here.
      // The player's status returns to #Waiting automatically.
    })

    // ── winGame ───────────────────────────────────────────────────────────
    // @from: [#Moving]  →  called when player.position === 100
    // @to: #Finished    →  player has won
    this.on('winGame', 'Players', async (req) => {
      const player = await SELECT.one.from(Players).where({ ID: req.params[0].ID })
      if (!player) return req.error(404, 'Player not found')

      // Mark the session as finished with this player as winner
      await UPDATE('snakeladder.GameSessions')
        .set({
          finishedAt: new Date().toISOString(),
          winner_ID: player.ID
        })
        .where({ ID: player.session_ID })

      await this.emit('GameWon', { playerID: player.ID, sessionID: player.session_ID })
    })

    this.on('skipTurn', 'Players', async (req) => {
      const player = await SELECT.one.from(Players).where({ ID: req.params[0].ID })
      await UPDATE(Players)
        .set({ turnsBlocked: (player.turnsBlocked || 0) + 1 })
        .where({ ID: player.ID })
    })


    return super.init()
  }
}