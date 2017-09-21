import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import * as dPos from './dpos.js';
import * as dCard from './dcard.js';

export const CLICK_None = 0;
export const CLICK_Pos = 1;
export const CLICK_Cards = 2;
export const CLICK_Troops = 3;

export class CardGroup extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    static propTypes ={
        cardixs: PropTypes.array,//cards
        max: PropTypes.number.isRequired,//Max. of cards in group.
        selectedCardix: PropTypes.number,// selected card
        isVert:PropTypes.bool.isRequired,// Vertival or horisontal
        selectType: PropTypes.number.isRequired,// CLICK_
        handler: PropTypes.func, //Click handler.
        pos: PropTypes.number.isRequired,//Position
        design:PropTypes.object.isRequired//Design parameters.
    }
    handleClick(e) {
        if (this.props.handler) {
            e.stopPropagation();
            let p = dPos.Pointer.Card(this.props.pos, 0);
            this.props.handler({
                pointer: p,
                e: e
            });
        }
    }
    groupCardList() {
        let markedCardixs = this.props.markedCardixs;
        let cardixs = this.props.cardixs;
        let selectedCardix = this.props.selectedCardix;
        let selectType = this.props.selectType;
        let handler = this.props.handler;
        let pos = this.props.pos;
        let isVert = this.props.isVert;
        let d=this.props.design
        if (!markedCardixs) {
            markedCardixs = [];
        }
        let cards = [];
        if (cardixs) {
            for (var i = 0; i < cardixs.length; i++) {
                let isSelected = false;
                let isMarked = false;
                let cardix = cardixs[i];
                if (markedCardixs.includes(cardix)) {
                    isMarked = true;
                }
                if (selectedCardix === cardix) {
                    isSelected = true;
                }

                let x = d.groupStroke;
                let y = d.groupStroke;
                if (isVert) {
                    y = d.groupStroke + (d.groupVStep * i);
                } else {
                    x = x + (d.groupHStep * i);
                    if (isSelected) {
                        y = y - d.groupVStep;
                        isSelected = false;
                    }
                }
                let cardHandler = null;
                if ((selectType === CLICK_Cards) || (selectType ===
                    CLICK_Pos)) {
                    cardHandler = handler;
                } else if (selectType === CLICK_Troops) {
                    if (dCard.isTroop(cardix)) {
                        cardHandler = handler;
                    }

                }
                let key = this.props.cardixs[i];
                if (dCard.isBack(key)) {
                    key = (i + 1) * key;
                }
                cards.push(
                    (
                        <g transform={"translate("+x+","+y+")"} key={key}>
                            <Card cardix={cardixs[i]}
                                  pos={pos}
                                  handler={cardHandler}
                                  isMarked={isMarked}
                                  isSelected={isSelected}
                                  height={d.cardHeight}
                                  width={d.cardWidth}
                                  stroke={d.cardStroke}
                            />
                        </g>
                    )
                );
            }
        }
        return cards;
    }
    borderRect(height, width) {
        let st = this.stroke;
        let handler = this.props.handler;
        let selectType = this.props.selectType;

        let stColor = "#000000"; //#ffff00
        let borderStyle = {
            fill: "none",
            stroke: stColor,
            strokeWidth: st
        };
        if ((handler) && (selectType === CLICK_Pos)) {
            borderStyle.cursor = "pointer";
            borderStyle.pointerEvents="visible";//because of fill null if not sat only the frame is clickable
        }
        return (
            <rect
                height={height}
                width={width}
                style={borderStyle}
                onClick={this.handleClick}
            />
        );
    }

    render() {
        let d = this.props.design;
        let height = null;
        let width = null;
        if (this.props.isVert) {
            width = d.cardWidth + (d.groupStroke * 2);
            height = d.cardHeight + (d.groupStroke * 2) + (
                (this.props.max - 1) *d.groupVStep);
        } else {
            height = d.cardHeight + (d.groupStroke * 2);
            width = d.cardWidth + (d.groupStroke * 2) + (
                (this.props.max - 1) * d.groupHStep);
        }
        return (
            <g>
                {this.borderRect(height,width)};
                {this.groupCardList()}
            </g>
        );
    }
}

export class Card extends Component {
    static propTypes ={
        cardix: PropTypes.number.isRequired,
        handler: PropTypes.func, //Click handler.
        pos: PropTypes.number.isRequired,//Position
        isSelected: PropTypes.bool.isRequired,
        isMarked: PropTypes.bool.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        stroke:PropTypes.number.isRequired
    }

    render() {
        let c = null;
        if (dCard.isBack(this.props.cardix)) {
            c = (
                <CardDeck
                    cardix={this.props.cardix}
                    pos={this.props.pos}
                    handler={this.props.handler}
                    height={this.props.height}
                    width={this.props.width}
                    stroke={this.props.stroke}
                />
            );
        } else {
            c = (
                <CardTacTroop cardix={this.props.cardix}
                              pos={this.props.pos}
                              handler={this.props.handler}
                              isSelected={this.props.isMarked}
                              isMarked={this.props.isSelected}
                              height={this.props.height}
                              width={this.props.width}
                              stroke={this.props.stroke}
                />
            );
        }
        return c;
    }
}
export class CardDeck extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    static propTypes ={
        cardix: PropTypes.number.isRequired,
        handler: PropTypes.func, //Click handler.
        pos: PropTypes.number.isRequired,//Position
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        stroke:PropTypes.number.isRequired
    }
    handleClick(e) {
        if (this.props.handler) {
            e.stopPropagation();
            let p = dPos.Pointer.Card(this.props.pos, this.props.cardix);
            this.props.handler({
                pointer: p,
                e: e
            });
        }
    }
    render() {
        let height = this.props.height;
        let width = this.props.width;
        let handler = this.props.handler;
        let cardix = this.props.cardix;
        let notxt = this.props.notxt;
        let stroke = this.props.stroke;

        let col = "#007100";
        if (cardix === dCard.BACKTac) {
            col = "#33dd33"; //tac
        }
        const rectStyle1 = {
            fill: "#00fa00",
            stroke: "none",
            strokeWidth: stroke
        };
        const rectStyle2 = {
            fill: "url(#pattern11963-5-7)",
            stroke: col,
            strokeWidth: stroke
        };

        if (handler) {
            rectStyle2.cursor = "pointer";
        }
        const textStyle = {
            fontSize: "30px",
            fill: "#ffffff",
            textAnchor: "middle"
        };

        if (!this.props.notxt) {
            notxt = "";
        }
        return (
            <g>
                <rect
                    ry="4.5"
                    height={height}
                    width={width}
                    style={rectStyle1} />
                <rect
                    ry="4.5"
                    height={height}
                    width={width}
                    style={rectStyle2}
                    onClick={this.handleClick}
                />
                <text
                    style={textStyle}
                    x={width/2}
                    y="45.5"
                    pointerEvents="none"
                >{notxt}</text>
            </g>
        );
    }
}

class CardTacTroop extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    static propTypes ={
        cardix: PropTypes.number.isRequired,
        handler: PropTypes.func, //Click handler.
        pos: PropTypes.number.isRequired,//Position
        isSelected: PropTypes.bool.isRequired,
        isMarked: PropTypes.bool.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        stroke:PropTypes.number.isRequired
    }
    handleClick(e) {
        if (this.props.handler) {
            e.stopPropagation();
            let p = dPos.Pointer.Card(this.props.pos, this.props.cardix);
            this.props.handler({
                pointer: p,
                e: e
            });
        }
    }

    render() {
        let cardix = this.props.cardix;
        let width = this.props.width;
        let height = this.props.height;
        let stroke = this.props.stroke;
        let col = null;
        let txt = null;
        let fontSize = null;
        let txtHorizontSpace = null;
        let fontWeight = null;
        let title = null;
        if (cardix > 0 && cardix < 61) {
            col = dCard.color(cardix);
            txt = dCard.troopStrenght(cardix);
            fontSize = "15px";
            txtHorizontSpace = 15;
            fontWeight = "normal";
            title = "";
        } else {
            col = "#d3a83a";
            txt = dCard.tacName(cardix);
            fontSize = "8px";
            txtHorizontSpace = 10;
            fontWeight = "bold";
            title = dCard.tacHint(cardix);
        }
        const textStyle = {
            fontWeight: fontWeight,
            fontSize: fontSize,
            fontFamily: "sans-serif"
        };

        const rectStyle = {
            fill: col,
            stroke: "#ffffff",
            strokeWidth: stroke
        };

        if (this.props.isSelected) {
            rectStyle.stroke = "#000000";
        } else if (this.props.isMarked) {
            rectStyle.stroke = "#0000cc";
        }
        if (this.props.handler) {
            rectStyle.cursor = "pointer";
        }

        let txtVerticalSpace = 3;
        return (
            <g>
                <title>{title}</title>
                <rect
                    style={rectStyle}
                    width={width}
                    height={height}
                    x="0"
                    y="0"
                    ry="4.5"
                    onClick={this.handleClick}
                />
                <text
                    style={textStyle}
                    x={txtVerticalSpace}
                    y={txtHorizontSpace}
                    pointerEvents="none"
                >{txt}</text>
                <text
                    style={textStyle}
                    transform="scale(-1,-1)"
                    x={txtVerticalSpace - width}
                    y={txtHorizontSpace - height}
                    pointerEvents="none"
                >{txt}</text>
            </g>
        );
    }
}


