# SAP Developer Challenge - Snake & Ladder with SAP CAP Status Transition Flows

Welcome to the July 2026 SAP Developer Challenge! This is a 4-week hands-on series where we will build a multiplayer Snake & Ladder game as a fully functional SAP CAP service, powered by CAP Status Flows (`@flow.status`).

## The Scenario

We will be building the backend engine for an online Snake & Ladder game. Each player's position on the board is a state — and every move, snake bite, and ladder climb is a status transition modelled using CAP's `@flow.status` annotations.

By the end of July, the project will feature:
* A running CAP Node.js service with CDS entities and status-flow bound actions.
* A multiplayer game engine with turn management, dice rolls, snake/ladder triggers, and CAP events.
* A SAP Fiori UI displaying the live board (participants just plug in their service URL).
* Integration with the CAP MCP server to let an AI assistant drive moves via natural language.

## Why CAP Status Flows?

CAP's `@flow.status` feature provides out-of-the-box capabilities:
* **Pre-validation**: A `@from: [#Playing]` annotation rejects any action called in the wrong state (HTTP 409), no custom code needed.
* **Automatic state transitions**: `@TO: #Finished` updates the entity after your action returns.
* **History tracking**: `@TO: $flow.previous` restores the previous state (perfect for a snake bite that temporarily blocks a player).
* **Fiori integration**: Buttons in the UI are automatically enabled/disabled based on the current status.

Snake & Ladder maps directly onto this model: a player's turn is a state machine, and every square is a potential transition trigger.

## Challenge Format

Each week a blog post is published on SAP Community with the task, hints, and code guidance. 

| Week | Dates | Title | Core Topic |
| :--- | :--- | :--- | :--- |
| 1 | 6–12 Jul | Model the Board | CDS entities, status enum, `@flow.status` |
| 2 | 13–19 Jul | Roll & Move | Bound actions, `@from` / `@to` transitions |
| 3 | 20–26 Jul | Multiplayer & Events | Turn management, CAP events, snake/ladder logic |
| 4 | 27–31 Jul | UI & CAP MCP | Board UI, MCP server |

## Prerequisites
* Node.js 20+
* `@sap/cds-dk` installed globally: `npm install -g @sap/cds-dk`
* VS Code with the SAP CDS Language Support extension
* Basic familiarity with CAP (entities, services, `cds watch`)

*Note: No prior knowledge of CAP status flows is required — Week 1 introduces everything from scratch.*

## The Board

The game uses a classic 10×10 board (squares 1–100). Key squares include:

### Ladders (climb up)
| Bottom | Top | Effect |
| :--- | :--- | :--- |
| 2 | 38 | Big early boost |
| 8 | 31 | Good start |
| 15 | 26 | Small step up |
| 21 | 42 | Mid-board jump |
| 28 | 84 | The long ladder — almost wins it |
| 36 | 44 | Short gain |
| 51 | 67 | Solid advance |
| 71 | 91 | Late-game boost |
| 78 | 98 | So close to victory |

### Single-Headed Snakes (slide back)
| Head | Tail | Severity |
| :--- | :--- | :--- |
| 99 | 7 | Devastating — one square from the finish |
| 76 | 20 | Major setback |
| 43 | 18 | Mid-game punisher |

### Double-Headed Snakes (two biting ends, one shared tail)
These special snakes have two heads on different squares that share a single tail. Landing on either head square sends you to the same tail square.

| Head 1 | Head 2 | Shared Tail |
| :--- | :--- | :--- |
| 89 | 72 | 50 |
| 54 | 63 | 34 |
| 40 | 47 | 3 |

*The double-headed snake maps to CAP's `@from: [#Head1, #Head2]` — the same transition triggered by multiple entry states.*

## Reusable Board UI
A ready-made HTML/JS board will be provided later in the challenge. Participants plug in their CAP service URL and see the live board — no frontend coding required for the challenge.

## Resources
* CAP Status Transition Flows Documentation
* CAP Node.js Documentation
* Initial Setup
