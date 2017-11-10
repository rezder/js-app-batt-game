import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    Shade,
    Spinner,
    Pattern,
    MiddleLine,
} from './compsvg.js';
import {
    Cone,
    Name,
    Deck,
    Player,
    ButtonPanel
} from './battcompsvg.js';
import {
    Card
} from './battcardsvg.js'
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';
import * as mv from './moves.js';
import * as dMoveType from './dmovetype.js';
import soundFile from './audio/failclick.ogg'

export const VIEW_God = 3;
export const VIEW_Watch = 2;
export const VIEW_Player0 = 0;
export const VIEW_Player1 = 1;
export const NONE_Player = 2

export class BattSvg extends Component {
    constructor(props) {
        super(props);
        this.sound = new Audio(soundFile);
        this.clickHandler = this.clickHandler.bind(this);
        this.missHandler = this.missHandler.bind(this);
        this.buttonHandler = this.buttonHandler.bind(this);
        this.state = this.calcInitState(props);
    }
    static defaultProps = {
        cardHeight: 67,
        cardWidth: 50,
        cardStroke: 3,
        groupStroke: 2,
        space: 3,
        groupHStep: 26,
        groupVStep: 20,
    };
    static propTypes = {
        cardHeight: PropTypes.number.isRequired,
        cardWidth: PropTypes.number.isRequired,
        cardStroke: PropTypes.number.isRequired,
        groupStroke: PropTypes.number.isRequired, // the stroke for the card group frame
        space: PropTypes.number.isRequired, //minimum space between items
        groupHStep: PropTypes.number.isRequired, // Horisontal move of card in group.
        groupVStep: PropTypes.number.isRequired, // Vertival move of card in group.
        cardPos: PropTypes.array.isRequired,
        conePos: PropTypes.array.isRequired,
        lastMover: PropTypes.number.isRequired,
        lastMoveType: PropTypes.number.isRequired,
        moves: PropTypes.array,
        winner: PropTypes.number.isRequired,
        view: PropTypes.number.isRequired, // VIEV_
        isNew: PropTypes.bool.isRequired, // if false it asumes a move have caused the change to positions
        noPlayerHandTroops: PropTypes.array.isRequired,
        noPlayerHandTacs: PropTypes.array.isRequired,
        scoutReturnPlayer: PropTypes.number.isRequired,
        scoutReturnCards: PropTypes.array.isRequired,
        names: PropTypes.array.isRequired, // name of players.
        moveHandler: PropTypes.func // This function is called with a move index to make a move.
    }
    calcInitState(props) {
        let state = {};
        state.markedPointers = null;
        state.handCardPointer = null;
        state.flagCardPointer = null;
        state.scoutReturnPointer = null;
        state.conePos = props.conePos;
        let posCards = [];
        for (let i = 0; i < dPos.card.Size; i++) {
            posCards.push([]);
        }
        for (let i = 1; i < props.cardPos.length; i++) {
            posCards[props.cardPos[i]].push(i);
        }
        state.posCards = posCards;
        state.isSending = false;
        return state;
    }
    clickHandler(p) {
        console.log(p.pointer);
        console.log(pp(p.e, this.svg));
        let clickedPointer = p.pointer;
        let moves = this.props.moves;
        let state = null;
        let moveix = -1;
        if (clickedPointer.type === dPos.BPCone) {
            let clickedConeix = clickedPointer.ix
            state = clickConePointer(this.state, clickedConeix, mv.mover(
                moves));
        } else {
            let res = clickCardPointer(this.state, clickedPointer, moves)
            moveix = res.moveix;
            state = res.state;
        }
        if (!state) {
            if (moveix === -1) {
                console.log("Move was not found!!!!!")
            } else {
                this.props.moveHandler(moveix, false, false);
                let point = pp(p.e, this.svg);
                state = {
                    isSending: true,
                    xSpinner: point.x,
                    ySpinner: point.y
                };
            }
        }
        if (state) {
            this.setState(state);
        }
    }
    missHandler(e) {
        this.sound.play();
        console.log(pp(e, this.svg));
    }
    buttonHandler(text) {
        const {
            moves
        } = this.props;
        let design = this.createDesign();
        let xSpinner = (design.buttonPanelX);
        let ySpinner = (design.buttonPanelY);
        let moveix = -1
        let isGiveUp = false;
        let isStop = false;
        switch (text) {
            case "Claim":
                let conePosNew = this.state.conePos;
                let conePosOld = this.props.conePos;
                let coneixs = [];
                for (let i = 1; i < conePosNew.length; i++) {
                    if (conePosOld[i] !== conePosNew[i]) {
                        coneixs.push(i);
                    }
                }
                moveix = mv.findMoveCone(coneixs, moves);
                if (moveix === -1) {
                    console.log(
                        "Cone move does not exist that must not happen game saved"
                    )
                    isStop = true;
                }
                break;
            case "Pass":
                moveix = moves.length - 1;
                break;
            case "GiveUp":
                isGiveUp = true;
                break;
            case "Stop":
                isStop = true;
                break;
            default:
                console.log(["Button text not implemented: ", text]);
        }
        this.props.moveHandler(moveix, isGiveUp, isStop);
        this.setState({
            isSending: true,
            xSpinner: xSpinner,
            ySpinner: ySpinner
        })
    }
    /**
     *componentWillReceiveProps updates state when props change.
     * I try not to update objects but replace them when they have
     * change to improve speed, when compare for change.
     * @param {} nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.isNew !== this.props.isNew ||
            nextProps.conePos !== this.props.conePos ||
            nextProps.cardPos !== this.props.cardPos
        ) {
            let props = this.props;
            let prevState = this.state
            let upd = {};
            if (nextProps.isNew) {
                upd = this.calcInitState(nextProps);
            } else {
                upd.isSending = false;
                upd.flagCardPointer = null;
                upd.scoutReturnPointer = null;
                if (!prevState.conePos.every((v, i) => v ===
                        nextProps.conePos[i])) {
                    upd.conePos = nextProps.conePos;
                } else {
                    let cardDiffs = diffCardPos(props.cardPos,
                        nextProps.cardPos);
                    if (cardDiffs.length > 0) {
                        upd.markedPointers = [];
                        upd.posCards = [];
                        for (let cards of prevState.posCards) {
                            upd.posCards.push(cards);
                        }
                        for (let diff of cardDiffs) {
                            if ((prevState.handCardPointer) &&
                                diff.pointer.ix === prevState.handCardPointer
                                .ix) {
                                upd.handCardPointer = null;
                            }
                            upd.markedPointers.push(diff.pointer);
                            let addList = upd.posCards[diff.pointer
                                .pos];
                            upd.posCards[diff.pointer.pos] =
                                addList.concat(
                                    [diff.pointer.ix]);

                            let removeList = upd.posCards[diff.oldPos];
                            let updList = [];
                            for (let cardix of removeList) {
                                if (cardix !== diff.pointer.ix) {
                                    updList.push(cardix);
                                }
                            }
                            upd.posCards[diff.oldPos] = updList;
                        }
                    }
                }
            }
            this.setState(upd);
        }

    }
    createDesign() {
        let design = {
            space: this.props.space,
            cardHeight: this.props.cardHeight,
            cardWidth: this.props.cardWidth,
            cardStroke: this.props.cardStroke,
            groupStroke: this.props.groupStroke,
            groupVStep: this.props.groupVStep,
            groupHStep: this.props.groupHStep
        };
        let dSpace = 2 * design.space;
        let cone = design.cardWidth / 2;
        let height = 2 * (3 * design.space + 2 * dSpace + 6 *
            design.groupStroke +
            1.5 * cone +
            3 * design.cardHeight + 4 * design.groupVStep);
        let width = 12 * dSpace + 22 * design.groupStroke + 11 *
            design.cardWidth;
        design.height = height;
        design.width = width;

        let handButtonY = design.height / 2 - 2 * design.space - 2 *
            design
            .groupStroke -
            design.cardHeight;
        let buttonPanelY = handButtonY + design.height / 2
        let handButtonX = (design.width - 8 * design.groupHStep - 2 *
            design.groupStroke -
            design.cardWidth) / 2;
        let handWidth = design.cardWidth + (design.groupStroke * 2) +
            (
                8 * design.groupHStep);
        let buttonPanelX = handButtonX + handWidth + design.space *
            2
        design.buttonPanelX = buttonPanelX
        design.buttonPanelY = buttonPanelY

        return design;
    }
    render() {
        let design = this.createDesign();
        let view = this.props.view;
        let moves = this.props.moves;
        let winner = this.props.winner;
        let lastMover = this.props.lastMover;
        let lastMoveType = this.props.lastMoveType;
        let names = this.props.names;
        let noPlayerHandTroops = this.props.noPlayerHandTroops;
        let noPlayerHandTacs = this.props.noPlayerHandTacs;
        let moveHandler = this.props.moveHandler;

        let handler = null;
        let buttonHandler = null;

        if (moveHandler && (view === VIEW_Player1 || view === VIEW_Player0)) {
            handler = this.clickHandler;
            buttonHandler = this.buttonHandler
        }

        let mover = mv.mover(moves);

        let isDeckMove = false;
        let isScoutMove = false;
        let isScoutReturnMove = false;
        if ((mover === view) &&
            (handler) &&
            (moves)
        ) {
            isDeckMove = mv.isDeck(moves)
            if (!isDeckMove) {
                if ((this.state.handCardPointer) &&
                    this.state.handCardPointer.ix === dCard.TCScout
                ) {
                    let deckMovePos = mv.findOldPosOnSecond(moves,
                        dCard.TCScout)
                    if (deckMovePos.length > 0) {
                        isScoutMove = true;
                    }
                } else {
                    isScoutMove = mv.isScout23(moves);
                    isScoutReturnMove = mv.isScoutReturn(moves);
                }
            }

        }
        let deckY = design.height / 2 - (design.cardHeight / 2);
        let deckXRight = design.width - 2 * design.space - design.cardWidth;
        let nameX = 20;
        let nameY = 40;
        return (
            <svg version="1.1"
                 id="battlelineSvg"
                 viewBox={[0,0,design.width,design.height]}
                 ref={(svg) => this.svg = svg}
                 onClick={this.missHandler}
            >
                <Pattern />
                <g id ="layer1">
                    <g transform={"translate("+nameX+","+nameY+")"} >
                        {createName(topPlayer(view),moves,lastMover,names)}
                    </g>
                    <g transform={"translate("+nameX+","+(design.height - nameY)+")"} >
                        {createName(opp(topPlayer(view)),moves,lastMover,names)}
                    </g>
                    <MiddleLine height={design.height} width={design.width}/>
                    {conesCreate(this.state.conePos,
                                 mover,
                                 moves,
                                 view,
                                 handler,
                                 design)}
                    <g transform={"translate("+deckXRight+","+deckY+")"}>
                        {createDeck(this.state.posCards,
                                    dPos.card.DeckTac,
                                    this.props.noPlayerHandTacs,
                                    handler,
                                    design,
                                    isScoutMove,
                                    isDeckMove,
                                    isScoutReturnMove
                        )}
                    </g>
                    <g transform={"translate("+2*design.space+","+deckY+")"}>
                        {createDeck(this.state.posCards,
                                    dPos.card.DeckTroop,
                                    this.props.noPlayerHandTroops,
                                    handler,
                                    design,
                                    isScoutMove,
                                    isDeckMove,
                                    isScoutReturnMove
                        )}
                    </g>
                    <g transform={"matrix(-1,0,0,-1,"+design.width+","+design.height/2+")"}>
                        {createPlayer(this.state,
                                      moves,
                                      mover,
                                      view,
                                      noPlayerHandTacs,
                                      noPlayerHandTroops,
                                      true,
                                      topPlayer(view),
                                      handler,
                                      design,
                                      lastMover)}
                    </g>
                    <g transform={"translate(0,"+design.height/2+")"}>
                        {createPlayer(this.state,
                                      moves,
                                      mover,
                                      view,
                                      noPlayerHandTacs,
                                      noPlayerHandTroops,
                                      false,
                                      opp(topPlayer(view)),
                                      handler,
                                      design,
                                      lastMover
                        )}
                    </g>
                    {createButtonPanel(buttonHandler,winner,view,lastMoveType,moves,design)}
                    {createScoutReturn(this.state.scoutReturnPointer,design,handler)}
                    {createSpinner(this.state.isSending,this.state.xSpinner,this.state.ySpinner)}
                    {createShade(winner,lastMoveType,design.height,design.width)}
                </g>
            </svg>
        );
    }
}

function diffCardPos(oldCardPos, newCardPos) {
    let diffs = [];
    for (let i = 0; i < oldCardPos.length; i++) {
        if (oldCardPos[i] !== newCardPos[i]) {
            diffs.push({
                pointer: dPos.Pointer.Card(newCardPos[i], i),
                oldPos: oldCardPos[i]
            })
        }
    }
    return diffs
}
//clickCardPointer handle click on card or card postion/card group
function clickCardPointer(state, clickedPointer, moves) {
    let moveix = -1;
    let updState = null;
    let handCardPointer = state.handCardPointer
    switch (clickedPointer.pos) {
        case dPos.card.ScoutReturn:
            let resScout = clickScoutReturn(state, moves, clickedPointer)
            updState = resScout.state
            break;
        case dPos.card.Players[0].Hand:
        case dPos.card.Players[1].Hand:
            updState = clickHand(state, clickedPointer)
            break;
        case dPos.card.DeckTroop:
        case dPos.card.DeckTac:
            if (mv.isScoutReturn(moves)) {
                let res = clickScoutReturn(state, moves, clickedPointer)
                moveix = res.moveix;
                updState = res.state;
            } else {
                if ((handCardPointer) &&
                    handCardPointer.ix === dCard.TCScout) {
                    moveix = mv.findMoveOldPosOnSecond(handCardPointer.ix,
                        clickedPointer.pos, moves);
                } else {
                    moveix = mv.findMovePosOnFirst(clickedPointer.ix, dPos.card
                        .Players[mv.mover(moves)].Hand, moves);
                }
            }
            break;
        default:
            let res = clickFlagDish(state, moves, clickedPointer)
            moveix = res.moveix;
            updState = res.state;
    }
    return {
        moveix: moveix,
        state: updState
    }
}
//clickFlagDish handles click on flag dish or deck with a selected card.
function clickFlagDish(state, moves, clickedPointer) {
    let handCardix = state.handCardPointer.ix;
    let moveix = -1;
    let updState = null;
    let clickedPos = clickedPointer.pos;
    switch (handCardix) {
        case dCard.TCDeserter:
            moveix = mv.findMoveIndexOnSecond(handCardix, clickedPointer.ix, moves);
            break;
        case dCard.TCTraitor:
        case dCard.TCRedeploy:
            let flagCardPointer = state.flagCardPointer;
            if (flagCardPointer) {
                let flagCardix = flagCardPointer.ix;
                if (flagCardPointer.isEqual(clickedPointer)) {
                    updState = {
                        flagCardPointer: null
                    };
                } else {
                    moveix = mv.findMovePosOnSecond(handCardix, flagCardix,
                        clickedPos, moves)
                }
            } else {
                updState = {
                    flagCardPointer: clickedPointer
                };
            }
            break;
        default: //Card to flag
            moveix = mv.findMovePosOnFirst(handCardix, clickedPos, moves);
    }
    return {
        moveix: moveix,
        state: updState
    }
}
//clickScoutReturn handle click when move is scout return.
function clickScoutReturn(state, moves, clickedPointer) {
    let handCardPointer = state.handCardPointer
    let updState = null;
    let moveix = -1;
    let noScoutR = moves[0].Moves.length;
    let mover = mv.mover(moves)
    if (noScoutR === 1) {
        moveix = mv.findMovePosOnFirst(handCardPointer.ix, clickedPointer.pos,
            moves);
    } else {
        let scoutReturnPointer = state.scoutReturnPointer;
        if (scoutReturnPointer) {
            if (scoutReturnPointer.isEqual(clickedPointer)) {
                let posCards = state.posCards;
                let hand = posCards[dPos.card.Players[mover].Hand];
                let updHand = hand.slice();
                updHand.push(scoutReturnPointer.ix)
                posCards[dPos.card.Players[mover].Hand] = updHand;
                updState = {
                    scoutReturnPointer: null,
                    posCards: posCards
                }
            } else {
                moveix = mv.findMoveScoutReturn2Cards(
                    scoutReturnPointer.ix,
                    handCardPointer.ix, moves)
            }
        } else {
            let posCards = state.posCards;
            let hand = posCards[dPos.card.Players[mover].Hand];
            let updHand = [];
            for (let i = 0; i < hand.length; i++) {
                if (hand[i] !== handCardPointer.ix) {
                    updHand.push(hand[i]);
                }
            }
            posCards[dPos.card.Players[mover].Hand] = updHand;
            let srp = dPos.Pointer.Card(dPos.card.ScoutReturn,
                handCardPointer.ix)
            updState = {
                scoutReturnPointer: srp,
                handCardPointer: null,
                posCards: posCards
            };
        }
    }
    return {
        moveix: moveix,
        state: updState
    }
}
//clickHand handle the click on a hand.
//WARNING posCards array object not change only content.
function clickHand(state, clickedPointer) {
    let handCardPointer = state.handCardPointer
    let updState = null;
    if (!handCardPointer) {
        updState = {
            handCardPointer: clickedPointer
        };
    } else {
        if (handCardPointer.isEqual(clickedPointer)) {
            updState = {
                handCardPointer: null,
                flagCardPointer: null
            };
        } else {
            let selectedCardix = handCardPointer.ix;
            let posCards = state.posCards;
            let hand = posCards[clickedPointer.pos];
            let clickedCardix = clickedPointer.ix;
            let updHand = [];
            for (let i = 0; i < hand.length; i++) {
                if (hand[i] === selectedCardix) {} else if (hand[i] ===
                    clickedCardix) {
                    updHand.push(selectedCardix);
                    updHand.push(hand[i]);
                } else {
                    updHand.push(hand[i]);
                }
            }
            posCards[clickedPointer.pos] = updHand;
            updState = {
                posCards: posCards
            };
        }
    }
    return updState;
}
//clickConePointer handle click on cones.
function clickConePointer(state, clickedConeix, playerix) {
    let conePos = state.conePos;
    let updConePos = [conePos[0]]; //first is not used
    for (let i = 1; i < conePos.length; i++) {
        if (clickedConeix === i) {
            let pos = conePos[i];
            let newPos = dPos.cone.Player[playerix];
            if (pos === newPos) {
                newPos = dPos.cone.None;
            }
            updConePos.push(newPos);
        } else {
            updConePos.push(conePos[i])
        }
    }
    let updState = {
        conePos: updConePos
    };
    return updState
}

/**
 * pp return the click point in the view box from
 * a event.
 * @param {event} event
 * @param {svg} svg
 * @returns {point} point
 */
function pp(event, svg) {
    let point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    point = point.matrixTransform(svg.getScreenCTM()
        .inverse());
    return point;
}

function createButtonPanel(handler, winner, view, lastMoveType, moves,
    design) {
    let viewPlayer = NONE_Player
    let isViewPlayer = false
    if (view === VIEW_Player0 || view === VIEW_Player1) {
        isViewPlayer = true
        viewPlayer = view
    }
    return (
        <g transform={"translate("+design.buttonPanelX+","+design.buttonPanelY+")"}>
            <ButtonPanel
                handler={handler}
                isWinner={winner!==NONE_Player}
                isStopped={lastMoveType===dMoveType.Pause}
                isGiveUp={lastMoveType===dMoveType.GiveUp}
                isViewPlayer={isViewPlayer}
                viewPlayer={viewPlayer}
                moves={moves}
            />
        </g>
    )
}

function createDeck(
    posCards,
    pos,
    noHiddens,
    svgHandler,
    design,
    isScoutMove,
    isDeckMove,
    isScoutReturnMove) {
    let deck = posCards[pos];
    let handler = null;
    let no = deck.length - noHiddens[0] - noHiddens[1]

    if ((no > 0 && (isDeckMove || isScoutMove)) || isScoutReturnMove) {
        handler = svgHandler;
    }
    return (
        <Deck pos={pos}
              deck={deck}
              noHidden={noHiddens[0] + noHiddens[1]}
              handler={handler}
              height={design.cardHeight}
              width={design.cardWidth}
              stroke={design.cardStroke}
        />
    );
}

class PlayerCards {
    constructor() {
        this.Hand = [];
        this.Dish = [];
        this.Flags = [];
        for (let i = 0; i < 9; i++) {
            this.Flags[i] = [];
        }
    }
}

function createPlayer(state, moves, mover, view, noPlayerHandTacs,
    noPlayerHandTroops, isReverse, player, svgHandler, design, lastMover) {
    let handPointer = state.handCardPointer;
    let flagPointer = state.flagCardPointer;
    let handler = svgHandler;
    let isMover = mover === player;
    let posCards = state.posCards;

    let playerCards = new PlayerCards();
    playerCards.Hand = posCards[dPos.card.Players[player].Hand];
    playerCards.Dish = posCards[dPos.card.Players[player].Dish];
    for (let i = 0; i < dPos.card.Players[player].Flags.length; i++) {
        playerCards.Flags[i] = posCards[dPos.card.Players[player].Flags[i]];
    }

    if (isReverse && (handler)) {
        if (isMover ||
            (!state.handCardPointer) ||
            !(handPointer.ix === dCard.TCTraitor ||
                handPointer.ix === dCard.TCDeserter)) {
            handPointer = null;
            flagPointer = null;
            handler = null;
            moves = null;
        }
    }
    let markedPointers = null;
    if (state.markedPointers) {
        if (view === VIEW_Player0 || view === VIEW_Player1) {
            if (lastMover === player && isReverse) {
                markedPointers = state.markedPointers;
            }
        } else {
            markedPointers = state.markedPointers;
        }
    }
    return (
        <Player player={player}
                markedPointers={markedPointers}
                playerCards={playerCards}
                handler={handler}
                isReverse={isReverse}
                isMover={isMover}
                moves={moves}
                handCardPointer={handPointer}
                flagCardPointer={flagPointer}
                design={design}
                noHandTroops={noPlayerHandTroops[player]}
                noHandTacs={noPlayerHandTacs[player]}
        />
    );
}

function createName(player, moves, lastMover, names) {
    let mover = lastMover;
    if (moves) {
        mover = mv.mover(moves);
    }
    return (
        <Name name={names[player]}
              isMover={mover===player}
        />
    );
}

function conesCreate(conePos, mover, moves, view, svgHandler, design) {
    let size = design.cardWidth / 2;
    let diff = 3 * design.space + 4 * design.groupStroke + 2 * design.cardHeight +
        4 * design.groupVStep + size;
    let poss = conePos;
    let moveables = [false, false, false, false, false, false, false, false,
        false,
        false
    ];
    let handler = null;
    if ((svgHandler) &&
        (moves) &&
        (mover === view) &&
        (mv.isCone(moves))
    ) {
        handler = svgHandler;
        for (let moveix = 0; moveix < moves.length; moveix++) {
            let move = moves[moveix];
            if (move.Moves) {
                for (let bpix = 0; bpix < move.Moves.length; bpix++) {
                    let coneMove = move.Moves[bpix];
                    moveables[coneMove.Index] = true;
                }
            }
        }
    }
    let cones = [];
    let start = 4 * design.space + 2 * design.groupStroke + design.cardWidth +
        design.groupStroke + design.cardWidth / 2;
    let step = 2 * design.groupStroke + design.cardWidth + 2 * design.space;

    for (let i = 0; i < 9; i++) {
        let ix = i + 1;
        cones.push(
            <Cone x={step*i+start}
                  key={ix}
                  pos={poss[ix]}
                  isMoveable={moveables[ix]}
                  ix={ix}
                  handler={handler}
                  height={design.height}
                  diff={diff}
                  size={size}
                  topPlayer={topPlayer(view)}
            />
        );
    }
    return cones;
}

function createSpinner(isSending, xSpinner, ySpinner) {
    return (
        <Spinner x={xSpinner}
                 y={ySpinner}
                 on={isSending}
        />
    );
}

function createShade(winner, lastMoveType, height, width) {
    let on = winner !== NONE_Player ||
        lastMoveType === dMoveType.GiveUp ||
        lastMoveType === dMoveType.Pause ||
        lastMoveType === dMoveType.None;
    return (
        <Shade
            height={height}
            width={width}
            on={on}
        />
    );
}

function topPlayer(view) {
    if (view === VIEW_Player1) {
        return 0
    }
    return 1
}

function opp(player) {
    let opp = player + 1;
    if (opp > 1) {
        opp = 0;
    }
    return opp
}
/**
 * DefaultViewPos setup the default game view position,
 * to display something nice when no game have been
 * selected.
 * @returns {pos} The game view postion.
 */
export function DefaultViewPos() {
    let cardPos = [];
    for (let i = 0; i < 61; i++) {
        cardPos[i] = dPos.card.DeckTroop;
    }
    for (let i = 0; i < 10; i++) {
        cardPos[61 + i] = dPos.card.DeckTac;
    }
    let conePos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let lastMover = 0;
    let lastMoveType = dMoveType.None;
    let lastMoveIx = 0;
    let moves = null;
    return {
        CardPos: cardPos,
        ConePos: conePos,
        LastMover: lastMover,
        LastMoveType: lastMoveType,
        LastMoveIx: lastMoveIx,
        Moves: moves,
        Winner: NONE_Player,
        View: VIEW_God,
        NoTroops: [0, 0],
        NoTacs: [0, 0],
        PlayerReturned: NONE_Player,
        CardsReturned: [0, 0]
    };
}

function createScoutReturn(pointer, design, moveHandler) {
    if (pointer) {
        let x = 0;
        let y = design.height / 2 + design.cardHeight / 4;
        let space = design.cardWidth / 2 + 2 * design.space + design.cardStroke /
            2;
        if (dCard.isTac(pointer.ix)) {
            x = design.width - space - design.cardWidth - design.cardStroke;
        } else {
            x = space;
        }
        return (
            <g transform={"translate("+x+","+y+")"}>
                <Card cardix={pointer.ix}
                      handler={moveHandler}
                      pos={pointer.pos}
                      isSelected={false}
                      isMarked={false}
                      height={design.cardHeight}
                      width={design.cardWidth}
                      stroke={design.cardStroke}
                />
            </g>
        );
    }
    return null;
}
