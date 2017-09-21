import React, {
    Component
} from 'react';

import PropTypes from 'prop-types';
import {
    act
} from './action.js'
import {
    TabPlayers
} from './tabplayers.js'
import {
    TabInvites
} from './tabinvites.js'
import {
    BattGame
} from './battgame.js'
import {
    BattGuide
} from './guide.js'
import * as dCard from './dcard.js';
import msgsoundfile from './audio/msg.oga'
export class BattGameControler extends Component {
    constructor(props) {
        super(props)
        this.msgSound = new Audio(msgsoundfile)
        this.cleanup = this.cleanup.bind(this);

        this.wsOnClose = this.wsOnClose.bind(this);
        this.wsOnError = this.wsOnError.bind(this);
        this.wsOnOpen = this.wsOnOpen.bind(this);
        this.wsOnMessage = this.wsOnMessage.bind(this);

        this.watchHandler = this.watchHandler.bind(this);
        this.watchStopHandler = this.watchStopHandler.bind(this);
        this.sendInviteHandler = this.sendInviteHandler.bind(this);
        this.removeInviteHandler = this.removeInviteHandler.bind(this);
        this.addMsgPlayersHandler = this.addMsgPlayersHandler.bind(this);
        this.dispMsgPlayerHandler = this.dispMsgPlayerHandler.bind(this);
        let players = [];
        let invites = [];
        let msgPlayers = [];
        let protocol = "ws";
        if (window.location.protocol === "https:") {
            protocol = "wss";
        }
        let path = protocol + "://" + window.location.host + "/in/gamews";
        let ws = new WebSocket(path);
        ws.onopen = this.wsOnOpen;
        ws.onclose = this.wsOnClose;
        ws.onmessage = this.wsOnMessage;
        ws.onerror = this.wsOnError;
        this.ws = ws;
        this.cookieName = this.props.name;
        this.stopWatchingTs = null; //Used in case we recieves a little data before stopping
        this.state = {
            ws: null,
            playerId: null,
            gameData: null,
            players: players,
            invites: invites,
            msgPlayers: msgPlayers,
            msgInfo: "Connecting...",
            msgOut: ""
        };
    }
    static propTypes = {

    }
    watchHandler(playerId, playerName) {
        let action = act.actionBuilder(act.Watch)
                        .id(playerId)
                        .build();
        this.state.ws.send(JSON.stringify(action));
        console.log(["sending watch action: ",action])
        let {
            isUpdate,
            updPlayers
        } = msgPlayersAdd(this.state.msgPlayers, playerName, playerId);
        if (isUpdate){
            this.setState({msgPlayers:updPlayers});
        }
    }
    watchStopHandler(playerId, gameTs) {
        let action = act.actionBuilder(act.WatchStop)
                        .id(playerId)
                        .build();
        this.state.ws.send(JSON.stringify(action));
        this.stopWatchingTs = {
            gameTs: gameTs,
            stopTs: Date.now()
        };
        this.setState({
            gameData: null
        });
    }

    sendInviteHandler(playerId, playerName) {
        if (this.state.ws) {
            let invite = {};
            invite.ReceiverID = playerId;
            invite.ReceiverName = playerName;
            invite.invitorID = this.state.playerId;
            invite.invitorName = this.cookieName;
            invite.IsRejected = false;
            if (!invitesContain(this.state.invites, invite)) {
                let action = act.actionBuilder(act.Invite)
                                .id(playerId)
                                .build();
                this.state.ws.send(JSON.stringify(action));
                let updInvites = invitesAdd(this.state.invites, invite);
                let state={invites: updInvites}
                let {
                    isUpdate,
                    updPlayers
                } = msgPlayersAdd(this.state.msgPlayers, playerName, playerId);
                if (isUpdate){
                    state.msgPlayers=updPlayers;
                }
                this.setState(state);

            }
        }
    }
    removeInviteHandler(invite) {
        let updInvites = invitesRemove(this.state.invites, invite)
        this.setState({
            invites: updInvites
        });
    }
    addMsgPlayersHandler(playerId, playerName) {
        let {
            isUpdate,
            updPlayers
        } = msgPlayersAdd(this.state.msgPlayers, playerName, playerId)
        if (isUpdate) {
            this.setState({
                msgPlayers: updPlayers
            })
        }
    }
    dispMsgPlayerHandler(playerId, PlayerName, msgTxt, isSend) {
        let direc = " -> ";
        if (isSend) {
            direc = " <- ";
        }
        let txt = PlayerName + direc + msgTxt + "\n"

        let state = {
            msgOut:  txt + "\n" + this.state.msgOut
        };
        let {
            isUpdate,
            updPlayers
        } = msgPlayersAdd(this.state.msgPlayers, PlayerName,
                          playerId)
        if (isUpdate) {
            state.msgPlayers = updPlayers;
        }
        this.setState(state);
        if (!isSend) {
            this.msgSound.play();
        }
    }

    wsOnOpen(e) {
        this.setState({
            ws: this.ws,
            msgInfo: "Connected to game server.\n\n" +this.state.msgInfo
        });
        let action = act.actionBuilder(act.List)
                        .build();
        let ws = this.ws
        this.wsPing = window.setInterval(() => {
            ws.send(JSON.stringify(action))
        },
                                         5 * 60000);
    }
    wsOnClose(e) {
        console.log(e.code);
        console.log(e.reason);
        console.log(e.wasClean);
        let info =
            "Connection to game server closed. You must login again. To login refresh the page."
            this.setState({
                ws: null,
                msgInfo: info + "\n\n" + this.state.msgInfo
            });
        if (this.wsPing) {
            window.clearInterval(this.wsPing);
            this.wsPing = null
        }
    }
    wsOnError(e) {
        console.log(e); //Could not finde any spec we see what it contain.
        let info =
            "Connection to game server incountered and error and will close down."
            this.setState({
                msgInfo: info + "\n\n" + this.state.msgInfo
            });
        this.msgSound.play();
    }
    wsOnMessage(e) {
        const JT_Mess = 1;
        const JT_Invite = 2;
        const JT_Playing = 3;
        const JT_Watching = 4;
        const JT_List = 5;
        const JT_CloseCon = 6;
        const JT_ClearInvites = 7;
        let json = JSON.parse(e.data);
        console.log(json);
        let state = null
        switch (json.JsonType) {
            case JT_List:
                let players = [];
                let pMap = json.Data
                this.pMap = pMap;
                let playerId = -1
                for (let k of Object.keys(pMap)) {
                    players.push(pMap[k]);
                    if (!this.state.playerId) {
                        if (pMap[k].Name === this.cookieName) {
                            playerId = pMap[k].ID
                        }
                    }
                }
                players.sort(function(a, b) {
                    return a.Name.localeCompare(b.Name);
                });
                state = {
                    players: players
                }
                if (playerId !== -1) {
                    state.playerId = playerId;
                }
                let o = msgPlayersFilter(pMap, this.state.msgPlayers)
                if (o.isUpdate) {
                    state.players = o.updPlayers
                }
                //TODO check old js removed invites do not think it is necessary
                this.setState(state);
                break;
            case JT_Mess:
                let msg = json.Data;
                if (msg.SenderID === -1) {
                    this.setState({
                        msgInfo: msg.Message + "\n\n" + this.state.msgInfo
                    });
                } else {
                    this.dispMsgPlayerHandler(msg.SenderID, msg.SenderName,
                                              msg.Message, false)
                }
                break;
            case JT_Invite:
                let invite = json.Data
                state = {
                    invites: invitesReceive(this.state.invites, invite)
                }
                if (invite.IsRejected) {
                    let txt = invite.ReceiverName +
                              " declined your invitation"
                              state.msgOut =txt + "\n" +  this.state.msgOut
                } else {
                    let {
                        isUpdate,
                        updPlayers
                    } = msgPlayersAdd(this.state.msgPlayers, invite.InvitorName,
                                      invite.InvitorID)
                    if (isUpdate) {
                        state.msgPlayers = updPlayers
                    }
                }
                this.setState(state);
                break;
            case JT_Playing:
                const {updState,playerNames}=receiveGameingData(this.pMap,json.Data,this.state.msgInfo)
                //TODO check for game done and if done update list
                this.playerNames=playerNames
                this.setState(updState);
                break;
            case JT_Watching:
                let wData = json.Data
                let isBlocked = false;
                if (this.stopWatchingTs) {
                    let now = Date.now()
                    if (this.stopWatchingTs.stopTs + 10 * 1000 > now) {
                        console.log(["time stamps ", wData.GameTs, this.stopWatchingTs
                                                                       .gameTs
                        ])
                        if (wData.GameTs === this.stopWatchingTs.gameTs) { //TODO Check time stamps
                            isBlocked = true;
                        }
                    } else {
                        this.stopWatchingTs = null;
                    }
                }
                if (!isBlocked) {
                    const {updState,playerNames}=receiveGameingData(this.pMap,wData,this.state.msgInfo)
                    //TODO check for game done and if done update list winner and last move type
                    this.playerNames=playerNames
                    this.setState(updState);
                }
                break;
            case JT_CloseCon:
                this.setState({
                    msgInfo:  json.Data.Reason+ "\n\n" + this.state.msgInfo
                });
                break;
            case JT_ClearInvites:
                let oi = invitesClear(this.state.invites)
                if (oi.isUpdate) {
                    this.setState({
                        invites: oi.updInvites
                    });
                }
                break;
            default:
                console.log(["Unknown message type :", json]);
        }
    }

    cleanup() {
        this.ws.onclose = function() {}
        this.ws.close()
        if (this.wsPing) {
            window.clearInterval(this.wsPing);
        }
    }
    componentDidMount() {
        window.addEventListener('beforeunload', this.cleanup);
    }
    componentWillUnmount() {
        this.cleanup();
        window.removeEventListener('beforeunload', this.cleanup);
    }
    render() {
        let gameData = this.state.gameData
        let playerNames = null
        let viewPos = null
        if (gameData) {
            playerNames = [];
            for (let i = 0; i < 2; i++) {
                let player = this.pMap[gameData.PlayingIDs[i].toString()]
                if (player) {
                    playerNames[i] = player.Name;
                } else {
                    playerNames[i] = ""; //TODO Save in this.playerNames when recieve gameData avoid problems with pMap change after game is stopped
                }
            }
            viewPos = gameData.ViewPos;
        }
        let className=null;
        if (!this.state.ws){
            className="disconnected";
        }
        return (
            <div className={className}>
                <h2>Game</h2>
                <div id="info-message-div">
                    <div id="info-div">
                        <h2>Info</h2>
                        <textarea id="info-text"
                                  className="text-out"
                                  rows={17}
                                  cols={80}
                                  wrap="on"
                                  readOnly={true}
                                  value={this.state.msgInfo}
                        />
                    </div>
                    <div id="message-div">
                        <h2>Message</h2>
                        <textarea
                            id="message-out-text"
                            className="text-out"
                            rows={17}
                            cols={80}
                            wrap="on"
                            readOnly={true}
                            value={this.state.msgOut}
                        />
                        <br/>
                        <MsgPlayer players={this.state.msgPlayers}
                                   ws={this.state.ws}
                                   dispMsgPlayerHandler={this.dispMsgPlayerHandler}
                        />
                    </div>
                </div>
                <BattGame gameData={gameData}
                          ws={this.state.ws}
                          names={playerNames}
                          watchStopHandler={this.watchStopHandler}
                />
                <TabInvites
                    invites={this.state.invites}
                    ws={this.state.ws}
                    removeInviteHandler={this.removeInviteHandler}
                />
                <TabPlayers
                    players={this.state.players}
                    ws={this.state.ws}
                    invites={this.state.invites}
                    msgPlayers={this.state.msgPlayers}
                    viewPos={viewPos}
                    playerId={this.state.playerId}
                    watchHandler={this.watchHandler}
                    sendInviteHandler={this.sendInviteHandler}
                    addMsgPlayersHandler= {this.addMsgPlayersHandler}
                />
                <BattGuide/>
            </div>
        );
    }
}

function getCookies(document) {
    let res = new Map();
    let cookies = document.cookie;
    if (cookies !== "") {
        let list = cookies.split("; ");
        for (let i = 0; i < list.length; i++) {
            let cookie = list[i];
            let p = cookie.indexOf("=");
            let name = cookie.substring(0, p);
            let value = cookie.substring(p + 1);
            value = decodeURIComponent(value);
            res[name] = value;
        }
    }
    return res;
}

function msgPlayersAdd(players, name, id) {
    let isUpdate = true
    for (let i = 0; i < players.length; i++) {
        if (players[0].name === name && players[0].id === id) {
            isUpdate = false;
            break
        }
    }
    let updPlayers = null;
    if (isUpdate) {
        updPlayers = players.slice();
        let p = {};
        p.name = name;
        p.id = id.toString();
        updPlayers.push(p);
    } else {
        updPlayers = players
    }

    return {
        isUpdate: isUpdate,
        updPlayers: updPlayers
    }
}

function msgPlayersFilter(playerMap, players) {
    let updPlayers = []
    let isUpd = false
    for (let i = 0; i < players.length; i++) {
        if (playerMap[players[i].id]) {
            updPlayers.push(players[i]);
        } else {
            isUpd = true;
        }
    }
    if (!isUpd) {
        updPlayers = players
    }
    return {
        isUpdate: isUpd,
        updPlayers: updPlayers
    }
}

function invitesReceive(invites, invite) {
    let updInvites = null
    if (invite.IsRejected) {
        updInvites = invitesRemove(invites, invite)
    } else {
        updInvites = invitesAdd(invites, invite)
    }
    return updInvites
}

function invitesContain(invites, invite) {
    for (let i = 0; i < invites.length; i++) {
        if (invites[i].InvitorID === invite.InvitorID && invites[i].ReceiverID ===
            invite.ReceiverID) {
            return true;
        }
    }
    return false;
}

function invitesAdd(invites, invite) {
    let updInvites = invites.slice()
    updInvites.push(invite)
    return updInvites
}

function invitesRemove(invites, invite) {
    let updInvites = []
    for (let i = 0; i < invites.length; i++) {
        if (invites[i].InvitorID !== invite.InvitorID && invites[i].ReceiverID !==
            invite.ReceiverID) {
            updInvites.push(invites[i])
        }
    }
    return updInvites
}

function invitesClear(invites) {
    let updInvites = invites
    let isUpd = false
    if (invites.length !== 0) {
        updInvites = []
        isUpd = true
    }
    return {
        isUpdate: isUpd,
        updInvites: updInvites
    }

}
class MsgPlayer extends Component {
    constructor(props) {
        super(props);
        this.sendHandler = this.sendHandler.bind(this);
        this.msgHandler = this.msgHandler.bind(this);
        this.selectHandler = this.selectHandler.bind(this);
        let playerix = -1;
        if (props.players.length > 0) {
            playerix = 0;

        }
        this.state = {
            playerix: playerix,
            msg: ""
        }
    }
    static propTypes = {
        players: PropTypes.array.isRequired,
        ws: PropTypes.object,
        dispMsgPlayerHandler: PropTypes.func.isRequired
    }
    componentWillReceiveProps(nextProps) {
        let oldPlayers = this.props.players;
        let oldPlayerix = this.state.playerix;
        let newPlayers = nextProps.players;
        let newPlayerix = -1;
        if (newPlayers.length > 0) {
            if (oldPlayerix !== -1) {
                let oldPlayer = oldPlayers[oldPlayerix];
                for (let i = 0; i < newPlayers.length; i++) {
                    let newPlayer = newPlayers[i];
                    if (newPlayer.id === oldPlayer.id) {
                        newPlayerix = i;
                        break
                    }
                }
            }
            if (newPlayerix === -1) {
                newPlayerix = 0;
            }
        }
        this.setState({
            playerix: newPlayerix
        })
    }
    selectHandler(e) {
        console.log(e.target.value)
        this.setState({
            playerix: e.target.value
        })
    }
    msgHandler(e) {
        this.setState({
            msg: e.target.value
        })
    }
    sendHandler(e) {
        let player = this.props.players[this.state.playerix]
        let msg = this.state.msg;
        let action = act.actionBuilder(act.Mess)
                        .id(parseInt(player.id, 10))
                        .mess(msg)
                        .build()
        this.props.ws.send(JSON.stringify(action));
        this.props.dispMsgPlayerHandler(player.id, player.name, msg, true)
        this.setState({
            msg: ""
        })
    }
    createOptions() {
        let players = this.props.players
        let list = []
        for (let i = 0; i < players.length; i++) {
            let player = players[i]
            let option = (
                <option value={i}
                        key={player.id}>
                    {player.name}
                </option>
            )
            list.push(option);
        }
        return list
    }
    render() {
        let disabled = true
        if (this.props.ws &&
            !isNaN(this.state.playerix) &&
            this.state.msg.length > 0) {
            disabled = false;
        }
        return (
            <div className = "player-msger">
                <textarea className="text-in"
                          rows={6}
                          cols={80}
                          wrap="on"
                          value={this.state.msg}
                          onChange={this.msgHandler}
                ></textarea>
                <br/>
                <span>
                    <select value={this.state.playerix}
                            onChange={this.selectHandler}
                    >
                        {this.createOptions()}
                    </select>
                    <button type="button"
                            disabled={disabled}
                            onClick={this.sendHandler}
                    >Send</button>
                </span>
            </div>
        );
    }
}

function failedClaimedTxt(flagEx, moverName) {
    let text = null;
    for (let flagix = 0; flagix < flagEx.length; flagix++) {
        let cardixs = flagEx[flagix];
        if (cardixs) {
            if (!text) {
                text = moverName + " fails to claim flags.";
            }
            let flagNo = flagix + 1
            text = text + "\nFlag " + flagNo + ": Example: ";
            for (let i = 0; i < cardixs.length; i++) {
                let cardix = cardixs[i];
                if (i===0){
                    text = text + " " + dCard.text(cardix);
                }else{
                    text = text + "," + dCard.text(cardix);
                }
            }
        }
    }
    return text;
}

function gamePlayerNames(pMap, playingIDs) {
   let playerNames = [];
    for (let i = 0; i < 2; i++) {
        let player = pMap[playingIDs[i].toString()]
        if (player) {
            playerNames[i] = player.Name;
        } else {
            playerNames[i] = ""; // TODO may unnecessary now
        }
    }
    return playerNames

}

function receiveGameingData(pMap, data,msgInfo) {
    let playerNames = gamePlayerNames(pMap, data.PlayingIDs)
    let updState = {
        gameData: data
    };
    if (data.FailedClaimedExs) {
        let txt = failedClaimedTxt(data.FailedClaimedExs,playerNames[data.ViewPos.LastMover])
        if (txt) {
            updState.msgInfo = txt + "\n\n"+ msgInfo
        }
    }
    return {
        updState: updState,
        playerNames:playerNames
    };
}
