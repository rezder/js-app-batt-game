import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';
import * as mv from './moves.js';
import * as dMoveType from './dmovetype.js';
import {
    CardGroup,
    CardDeck,
    CLICK_None,
    CLICK_Pos,
    CLICK_Cards,
    CLICK_Troops
} from './battcardsvg.js';
import {
    Button
} from './compsvg.js'
class Dish extends Component {
    static propTypes = {
        cardixs: PropTypes.array.isRequired,
        handler: PropTypes.func, //Click handler.
        pos: PropTypes.number.isRequired, //Position
        design: PropTypes.object.isRequired,
        makedCardixs: PropTypes.array,

    }
    render() {
        let design = this.props.design;
        let sort = dCard.dishSort(this.props.cardixs);
        let tacSize = 5;
        let troopSize = 3;
        let x = design.width - (2 * design.space) - design.cardWidth - 2 *
        design.groupStroke;
        if (this.props.isReverse) {
            let tmp = sort.tacs;
            sort.tacs = sort.troops;
            sort.troops = tmp;
            tacSize = 3;
            troopSize = 5;
        }
        return (
            <g >
                <g transform={"translate("+2*design.space+",0)"}>
                    <CardGroup cardixs={sort.troops}
                               max={troopSize}
                               markedCardixs={this.props.markedCardixs}
                               isVert={true}
                               selectType={CLICK_Pos}
                               handler={this.props.handler}
                               pos={this.props.pos}
                               design={design}
                    />
                </g>
                <g transform={"translate("+x+",0)"} >
                    <CardGroup cardixs={sort.tacs}
                               max={tacSize}
                               markedCardixs={this.props.markedCardixs}
                               isVert={true}
                               selectType={CLICK_Pos}
                               handler={this.props.handler}
                               pos={this.props.pos}
                               design={design}
                    />
                </g>
            </g>
        );
    }
}
class Flag extends Component {
    static propTypes = {
        cardixs: PropTypes.array.isRequired,
        handler: PropTypes.func, //Click handler.
        pos: PropTypes.number.isRequired, //Position
        design: PropTypes.object.isRequired,
        makedCardixs: PropTypes.array,
        selectedCardix: PropTypes.number.isRequired

    }
    render() {
        let design = this.props.design;
        let sort = dCard.flagSort(this.props.cardixs);
        let troops = 4;
        let tacs = 2;
        let step = 2 * design.groupStroke + design.space + design.cardHeight +
              (troops - 1) * design.groupVStep;
        return (
            <g>
                <CardGroup cardixs={sort.troops}
                           max={troops}
                           selectedCardix={this.props.selectedCardix}
                           markedCardixs={this.props.markedCardixs}
                           isVert={true}
                           selectType={this.props.selectType}
                           handler={this.props.handler}
                           pos={this.props.pos}
                           design={design}
                />
                <g transform={"translate(0,"+step+")"}>
                    <CardGroup cardixs={sort.envs}
                               max={tacs}
                               selectedCardix={this.props.selectedCardix}
                               markedCardixs={this.props.markedCardixs}
                               isVert={true}
                               selectType={this.props.selectType}
                               handler={this.props.handler}
                               pos={this.props.pos}
                               design={design}
                    />
                </g>
            </g>
        );
    }
}

export class Player extends Component {
    static propTypes = {
        playerCards: PropTypes.object.isRequired,
        handPointer: PropTypes.object,
        flagPointer: PropTypes.object,
        handler: PropTypes.func,
        isReverse: PropTypes.bool.isRequired,
        player: PropTypes.number.isRequired,
        markedPointers: PropTypes.array,
        isMover: PropTypes.bool.isRequired,
        design: PropTypes.object.isRequired,
        noHandTacs: PropTypes.number.isRequired,
        noHandTroops: PropTypes.number.isRequired
    }
    render() {
        let cards = this.props.playerCards;
        let handPointer = this.props.handCardPointer;
        let handler = this.props.handler;
        let isReverse = this.props.isReverse;
        let player = this.props.player;
        let markedPointers = this.props.markedPointers;
        let isMover = this.props.isMover;
        let design = this.props.design;
        let noHandTacs = this.props.noHandTacs;
        let noHandTroops = this.props.noHandTroops;
        if ((noHandTroops > 0) || (noHandTacs > 0)) {
            let backs = [];
            for (let i = 0; i < noHandTroops; i++) {
                backs.push(dCard.BACKTroop);
            }
            for (let i = 0; i < noHandTacs; i++) {
                backs.push(dCard.BACKTac);
            }
            cards.Hand = backs.concat(cards.Hand);
        }

        let dishHandler = null;
        if ((handPointer) && (handPointer.ix === dCard.TCRedeploy) &&
            isMover) {
            dishHandler = handler;
        }
        let handHandler = handler;
        if (isReverse) {
            handHandler = null;
        }
        let posDish = dPos.card.Players[player].Dish;
        let handCardix = 0;
        if (handPointer) {
            handCardix = handPointer.ix;
        }
        let handx = (design.width - 8 * design.groupHStep - 2 * design.groupStroke -
                     design.cardWidth) / 2;
        let handy = design.height / 2 - 2 * design.space - 2 * design.groupStroke -
                    design.cardHeight;
        return (
            <g>
                <g transform="translate(0,60)">
                    <Dish cardixs = {cards.Dish}
                          markedCardixs={dPos.pointerToCardixs(posDish,markedPointers)}
                          handler={dishHandler}
                          pos={posDish}
                          isReverse={isReverse}
                          design={design}
                    />
                </g>
                <g transform={"translate("+handx+","+handy+")"}>
                    <CardGroup cardixs={cards.Hand}
                               max={9}
                               selectedCardix={handCardix}
                               isVert={false}
                               selectType={CLICK_Cards}
                               handler={handHandler}
                               pos={dPos.card.Players[player].Hand}
                               design={design}
                    />
                </g>
                {this.createFlags()}
            </g>
        );
    }
    createFlags() {
        let isReverse = this.props.isReverse;
        let player = this.props.player;
        let flagPointer = this.props.flagCardPointer;
        let markedPointers = this.props.markedPointers;
        let handler = this.props.handler;
        let playerCards = this.props.playerCards;
        let design = this.props.design;
        let flags = [];
        let start = 4 * design.space + 2 * design.groupStroke + design.cardWidth;
        let step = 2 * design.space + 2 * design.groupStroke + design.cardWidth;
        let anaMoves = this.anaMoves();
        for (let i = 0; i < 9; i++) {
            let flagix = i;
            if (isReverse) {
                flagix = 8 - i;
            }
            let flagPos = dPos.card.Players[player].Flags[flagix];
            let selectType = CLICK_None;
            if (anaMoves.targetPoss.includes(flagPos)) {
                selectType = anaMoves.selectType;
            }
            let selectedCardix = 0;
            if ((flagPointer) && (flagPointer.pos === flagPos)) {
                selectedCardix = flagPointer.ix;
            }
            let x = start + i * step;
            let y = design.space + design.cardWidth / 4;
            flags.push(
                <g transform = {"translate("+x+","+y+")"} key={flagPos} >
                    <Flag
                        cardixs={playerCards.Flags[flagix]}
                        pos={flagPos}
                        handler={handler}
                        selectedCardix={selectedCardix}
                        markedCardixs={dPos.pointerToCardixs(flagPos,markedPointers)}
                        selectType={selectType}
                        design={design}
                    />
                </g>
            );
        }
        return flags;
    }
    /**
     * anaMoves analyse moves to find click data.
     * @returns {
     * {[int]} targetPoss : flags position that can be clicked.
     * {int}   selectType : The click type CLICK_.
     *  }
     */
    anaMoves() {
        let handPointer = this.props.handCardPointer;
        let moves = this.props.moves;
        let flagPointer = this.props.flagCardPointer;
        let isMover = this.props.isMover;

        let handCardix = 0;
        if (handPointer) {
            handCardix = handPointer.ix;
        }
        let flagCardix = 0;
        if (flagPointer) {
            flagCardix = flagPointer.ix;
        }
        let targetPoss = [];
        let selectType = CLICK_None;

        if (handCardix > 0) {
            if (isMover) {
                if (!dCard.isGuile(handCardix)) {
                    targetPoss = mv.findPosOnFirst(moves, handCardix);
                    selectType = CLICK_Pos;
                } else if (handCardix === dCard.TCTraitor) {
                    if (flagCardix > 0) {
                        targetPoss = mv.findPosOnSecond(moves,
                                                        handCardix, flagCardix);
                        selectType = CLICK_Pos;
                    }
                } else if (handCardix === dCard.TCRedeploy) {
                    if (flagCardix > 0) {
                        targetPoss = mv.findPosOnSecond(moves,
                                                        handCardix, flagCardix);
                        selectType = CLICK_Pos;
                    } else {
                        targetPoss = mv.findOldPosOnSecond(moves,
                                                           handCardix);
                        selectType = CLICK_Cards;
                    }
                }
            }else{
                if (handCardix === dCard.TCDeserter) {
                    targetPoss = mv.findOldPosOnSecond(moves,
                                                       handCardix, flagCardix);
                    selectType = CLICK_Cards;
                } else if (handCardix === dCard.TCTraitor) {
                    if (flagCardix === 0) {
                        targetPoss = mv.findOldPosOnSecond(
                            moves, handCardix, flagCardix);
                        selectType = CLICK_Troops;
                    }
                }
            }
        }
        return {
            targetPoss: targetPoss,
            selectType: selectType
        };
    }
}
export class Deck extends Component {
    static propTypes = {
        pos: PropTypes.number.isRequired, // Game position.
        deck: PropTypes.array.isRequired, // Cards in deck
        noHidden: PropTypes.number.isRequired, //No.hidden
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        stroke: PropTypes.number.isRequired,
        handler: PropTypes.func
    }
    render() {
        let pos = this.props.pos;
        let deck = this.props.deck;
        let noHidden = this.props.noHidden;
        let handler = this.props.handler;
        let height = this.props.height;
        let width = this.props.width;
        let stroke = this.props.stroke;
        let cardix = dCard.BACKTac;
        if (pos === dPos.card.DeckTroop) {
            cardix = dCard.BACKTroop;
        }
        let noCards = deck.length - noHidden;
        return (
            <g>
                <CardDeck cardix={cardix}
                          notxt={noCards.toString()}
                          handler={handler}
                          pos={pos}
                          height={height}
                          width={width}
                          stroke={stroke}
                />
            </g>
        );
    }
}

export class Name extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired
    }

    render() {
        let textStyle = {
            fontSize: "20px",
            fontFamily: "sans-serif"
        };
        if (this.props.isMover) {
            textStyle.textDecoration = "underline";
        }
        return (
            <text style={textStyle} pointerEvents="none">
                {this.props.name}
            </text>
        );
    }
}

export class Cone extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    static propTypes = {
        ix: PropTypes.number.isRequired, //cone ix
        x: PropTypes.number.isRequired, //x coordinate
        handler: PropTypes.func,
        pos: PropTypes.number.isRequired, // Game position.
        isMoveable: PropTypes.bool.isRequired,
        size: PropTypes.number.isRequired, //diameter
        diff: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired, // Board hight
        topPlayer: PropTypes.number.isRequired, // The player on top

    }
    handleClick(e) {
        if (this.props.handler) {
            e.stopPropagation();
            let p = dPos.Pointer.Cone(this.props.pos, this.props.ix);
            this.props.handler({
                pointer: p,
                e: e
            });
        }
    }
    render() {
        let topPlayer = this.props.topPlayer
        let pos = this.props.pos;
        let isMoveable = this.props.isMoveable;
        let diameter = this.props.size;
        let diff = this.props.diff;
        let height = this.props.height;
        let strokeWidth = 8;
        let radius = (diameter - strokeWidth) / 2;
        const styleLine = {
            fill: "#ff0000",
            stroke: "#b70000",
            strokeWidth: strokeWidth
        };
        if (this.props.isMoveable) {
            styleLine.stroke = "0f0000";
            styleLine.cursor = "pointer";
        }
        let y = height / 2;
        if (pos !== dPos.cone.None) {
            if (pos === dPos.cone.Player[topPlayer]) {
                y = y - diff;
            } else {
                y = y + diff;
            }
        }
        let circle = null;
        if (isMoveable) {
            circle = (
                <circle
                    r={radius}
                    cy={y}
                    cx={this.props.x}
                    style={styleLine}
                    onClick={this.handleClick}
                />
            );
        } else {
            circle = (
                <circle
                    r={radius}
                    cy={y}
                    cx={this.props.x}
                    style={styleLine}
                />
            );
        }
        return circle;
    }
}
export class ButtonPanel extends Component {
    static propTypes = {
        handler: PropTypes.func,
        isWinner: PropTypes.bool.isRequired,
        isStopped:PropTypes.bool.isRequired,
        isGiveUp: PropTypes.bool.isRequired,
        isViewPlayer: PropTypes.bool.isRequired,
        viewPlayer: PropTypes.number.isRequired,
        moves: PropTypes.arrayOf(PropTypes.object)
    }
    render() {
        let handler = this.props.handler;
        let isWinner = this.props.isWinner;
        let isGiveUp = this.props.isGiveUp;
        let isStopped=this.props.isStopped;
        let isViewPlayer = this.props.isViewPlayer;
        let moves = this.props.moves;
        let viewPlayer = this.props.viewPlayer;

        if (!handler || isWinner||isStopped || isGiveUp || !isViewPlayer) {
            return (<g />);
        }else {
            let isClaimDis = true
            let isPassDis = true
            let isGiveUpDis = true
            let isStopDis = false
            if (moves) {
                let lastMove = moves[moves.length - 1]
                if (lastMove.Mover === viewPlayer) {
                    isGiveUpDis = false
                    if (lastMove.MoveType === dMoveType.Hand && !lastMove.Moves) {
                        isPassDis = false
                    }
                    if (lastMove.MoveType === dMoveType.Cone) {
                        isClaimDis = false
                    }
                }
            }
            let space=8
            let letterWidth=8
            let colWidth=letterWidth*6+space
            let rowHight=20+space
            return (
                <g>
                    <g transform={translate(0,0)}>
                        <Button
                            text="Claim"
                            disabled={isClaimDis}
                            width={5*letterWidth}
                            handler={handler}
                        />
                    </g>
                    <g transform={translate(colWidth,0)}>
                        <Button
                            text="Pass"
                            disabled={isPassDis}
                            width={4*letterWidth}
                            handler={handler}
                        />
                    </g>
                    <g transform={translate(0,rowHight)}>
                        <Button
                            text="GiveUp"
                            disabled={isGiveUpDis}
                            width={6*letterWidth}
                            handler={handler}
                        />
                    </g>
                    <g transform={translate(colWidth,rowHight)}>
                        <Button
                            text="Stop"
                            disabled={isStopDis}
                            width={4*letterWidth}
                            handler={handler}
                        />
                    </g>
                </g>

            );
        }
    }
}
function translate(x,y){
    return "translate("+x+","+y+")"
}
