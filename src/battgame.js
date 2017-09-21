import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';
import {
    BattSvg,
    DefaultViewPos,
    VIEW_Watch
} from './battsvg.js';
import {act} from './action.js'
export class BattGame extends Component {
    constructor(props) {
        super(props);
        this.moveHandler = this.moveHandler.bind(this);
        this.state = {
            isNew: true
        };
    }
    static propTypes={
        gameData:PropTypes.object,
        wd:PropTypes.object,
        names:PropTypes.arrayOf(PropTypes.string),
        watchingID:PropTypes.number,
        watchStopHandler:PropTypes.func.isRequired,
        gameTs:PropTypes.instanceOf(Date)

    };
    moveHandler(moveix,isGiveUp,isSave) {
        const ws=this.props.ws
        let action =null;
        if (isGiveUp){
            action=act.actionBuilder(act.Quit).build();
        }else if (isSave){
            action=act.actionBuilder(act.Save).build();
        }else{
            action=act.actionBuilder(act.Move).move(moveix).build();
        }
        console.log(["sending action:",action]);
        ws.send(JSON.stringify(action));
    }
    //componentWillReceiveProps can be called even if data not changed.
    componentWillReceiveProps(nextProps) {
        let oldGameData = this.props.gameData;
        let newGameData = nextProps.gameData;
        if (oldGameData!==newGameData){
            let isNew = true;
            if (oldGameData && newGameData) {
                if (oldGameData.GameTs === newGameData.GameTs &&
                    oldGameData.ViewPos.LastMoveIx + 1 === newGameData.ViewPos.LastMoveIx) {
                    if (isNew) {
                        isNew = false;
                    }
                }
            }
            if (isNew !== this.state.isNew) {
                this.setState({
                    isNew: isNew
                });
            }
        }
    }
    render() {
        let posView = null;
        let {gameData,names,watchStopHandler,ws}=this.props
        if (gameData) {
            posView = gameData.ViewPos;
        } else {
            posView = DefaultViewPos();
            names = ["Player 1", "Player 2"];
        }
        let moveHandler = null;
        if (ws) {
            moveHandler = this.moveHandler;
        }
        return (
            <div className="batt-game">
                <BattSvg
                    cardPos={posView.CardPos}
                    conePos={posView.ConePos}
                    lastMover={posView.LastMover}
                    lastMoveType={posView.LastMoveType}
                    moves={posView.Moves}
                    winner={posView.Winner}
                    view={posView.View}
                    noPlayerHandTroops={posView.NoTroops}
                    noPlayerHandTacs={posView.NoTacs}
                    scoutReturnPlayer={posView.PlayerReturned}
                    scoutReturnCards={posView.CardsReturned}
                    names={names}
                    isNew={this.state.isNew}
                    moveHandler={moveHandler}
                />
                <SubPanel
                    gameData={gameData}
                    names={names}
                    ws={ws}
                    watchStopHandler={watchStopHandler}
                />
            </div>
        );
    }
}
class SubPanel extends Component {
    static propTypes={
        gameData:PropTypes.object,
        names:PropTypes.array,
        ws:PropTypes.object,
        watchStopHandler:PropTypes.func
    }
    render() {
        const {
            gameData,
            names,
            ws,
            watchStopHandler
        } = this.props
        if (gameData){
            return(
                <div className="sub-panel">
                    <StopWatch viewPos={gameData.ViewPos}
                               watchingID={gameData.WatchingID}
                               gameTs={gameData.GameTs}
                               watchStopHandler={watchStopHandler}
                               ws={ws}
                    />
                    <Narator viewPos={gameData.ViewPos} names={names}/>
                </div>
            );
        }else{
            return null;
        }
    }
}
class StopWatch extends Component {
    constructor(props){
        super(props);
        this.clickHandler=this.clickHandler.bind(this);
    }
    static propTypes={
        ws:PropTypes.object.isRequired,
        viewPos:PropTypes.object.isRequired,
        watchStopHandler:PropTypes.func.isRequired,
        watchingId:PropTypes.number.isRequired,
        gameTs:PropTypes.instanceOf(Date).isRequired
    }
    clickHandler(e){
        this.props.watchStopHandler(this.props.watchingID,this.props.gameTs)
    }
    render() {
        const{viewPos,ws}=this.props
        let disabled=false;
        if (viewPos.View===VIEW_Watch){
            if (viewPos.LastMoveType===9||viewPos.Winner===0||viewPos.Winner===1||!ws){
                disabled=true;
            }
            return(
                <button
                    type="button"
                    disabled={disabled}
                    onClick={this.clickHandler}
                >Stop Watching</button>
            );
        }else{
            return null;
        }
    }
}
class Narator extends Component {
    static propTypes={
        viewPos:PropTypes.object.isRequired,
        names:PropTypes.arrayOf(PropTypes.string).isRequired,
    }
    render() {
        const {viewPos,names}=this.props;
        let txt=""
        if (viewPos.Winner===0||viewPos.Winner===1){
            if(viewPos.View===viewPos.Winner){
                txt="You win the game"
            }else{
                txt=names[viewPos.Winner]+" wins the game"
            }
            if (viewPos.LastMoveType===8){//giveup
                txt=txt+" by forfeit"
            }
        }else if (viewPos.View===VIEW_Watch){
            let moveType=""
            switch (viewPos.LastMoveType){
                case 0:
                    moveType="dealt the cards"
                    break;
                case 1:
                    moveType="claimed flags"
                    break;
                case 2:
                    moveType="drew a card"
                    break;
                case 3:
                    moveType="played card"
                    break;
                case 4:
                    moveType="played scout"
                    break;
                case 5:
                    moveType="drew 2. scout card"
                    break;
                case 6:
                    moveType="drew 3. scout card"
                    break;
                case 7:
                    moveType="returned scout cards"
                    break;
                case 9:
                    moveType="saved the game for later"
                    break;
                default:
                    moveType="";
                    console.log(["Move type is not implemented: ",viewPos.LastMoveType])
            }
            txt="Last move: "+names[viewPos.LastMover]+": "+moveType+".";
        }else{
            if (viewPos.LastMoveType===9){
                if (viewPos.LastMover===viewPos.View){
                    txt="You saved the game"
                }else{
                    txt=names[viewPos.LastMover]+ ": Saves the game."
                }
            }else{
                if (viewPos.Moves){
                    switch (viewPos.Moves[0].MoveType){
                        case 1:
                            txt="Claim flags"
                            break;
                        case 2:
                            txt="Draw card"
                            break;
                        case 5:
                            txt="Draw 2. scout card"
                            break;
                        case 6:
                            txt="Draw 3. scout card"
                            break;
                        case 7:
                            txt="Return scout cards"
                            break;
                        default:
                            txt="Play card from hand"
                    }
                }else{
                    txt="Waiting for opponent to move."
                }
            }
        }
        return(
            <textarea
                class="narator text-out"
                rows={1}
                cols={45}
                readonly={true}
                value={txt}
            ></textarea>
        );
    }
}
