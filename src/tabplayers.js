import React, {
    Component
} from 'react';
import {
    act
} from './action.js'
import PropTypes from 'prop-types';
import {
    Table,
    Column,
    Cell
} from 'fixed-data-table';
import 'fixed-data-table/dist/fixed-data-table.css';

export class TabPlayers extends Component {
    constructor(props) {
        super(props);
        this.updHandler = this.updHandler.bind(this);
    }
    static propTypes = {
        players: PropTypes.array.isRequired,
        ws: PropTypes.object,
        invites: PropTypes.array.isRequired,
        msgPlayers: PropTypes.array.isRequired,
        viewPos: PropTypes.object,
        playerId: PropTypes.number,
        sendInviteHandler: PropTypes.func.isRequired,
        watchHandler: PropTypes.func.isRequired,
        addMsgPlayersHandler: PropTypes.func.isRequired,
    }
    updHandler() {
        let action = act.actionBuilder(act.List)
                        .build();
        this.props.ws.send(JSON.stringify(action));
    }
    render() {
        const {
            players,
            ws,
            invites,
            msgPlayers,
            viewPos,
            playerId,
            sendInviteHandler,
            watchHandler,
            addMsgPlayersHandler,
        } = this.props;
        let isGame = false
        if (viewPos) {
            if (viewPos.Winner !== 0 && viewPos.Winner !== 1 &&
                viewPos.LastMoveType !== 9 //TODO maybe import
            ) {
                isGame = true;
            }
        }
        let isUpdDisabled = false;
        if (!ws) {
            isUpdDisabled = true;
        }
        return (
            <div className="tab-players">
                <button type="button"
                        onClick={this.updHandler}
                        disabled={isUpdDisabled}
                        className="h2-button"
                        title="Push to update"
                >Players</button>
                <Table
                    rowHeight={30}
                    headerHeight={40}
                    rowsCount={players.length}
                    width={2*125+225}
                    height={400}
                >
                    <Column
                        header={<Cell>Player</Cell>}
                        cell={<TextCell
                                  players={players}
                                          field="Name"
                        />}
                        width={125}
                    />
                    <Column
                        header={<Cell>Playing</Cell>}
                        cell={<TextCell
                                  players={players}
                                          field="OppName"
                        />}
                        width={125}
                    />
                    <Column
                        header={<Cell>Invite/Message/Watch</Cell>}
                        cell={<ButtonsCell
                                  players={players}
                                          invites={invites}
                                          msgPlayers={msgPlayers}
                                          playerId={playerId}
                                          ws={ws}
                                          isGame={isGame}
                                          sendInviteHandler={sendInviteHandler}
                                          addMsgPlayersHandler={addMsgPlayersHandler}
                                          watchHandler={watchHandler}

                        />}
                        width={225}
                    />

                </Table>

            </div>
        )

    }

}
class ButtonsCell extends React.Component {
    render() {
        const {
            rowIndex,
            players,
            invites,
            msgPlayers,
            playerId,
            isGame,
            ws,
            sendInviteHandler,
            watchHandler,
            addMsgPlayersHandler,
            ...props
        } = this.props;
        let player = players[rowIndex];
        let isMsg = false;
        let isInvite = false;
        let isWatch = false;
        if ((ws) && player.ID !== playerId) {
            isMsg = true;
            for (let i = 0; i < msgPlayers.length; i++) {
                if (msgPlayers[i].id === player.ID.toString()) {
                    isMsg = false;
                    break;
                }
            }
            if (!isGame) {
                if (player.Opp === 0) {
                    isInvite = true
                    for (let i = 0; i < invites.length; i++) {
                        if (invites[i].InvitorID === player.ID ||
                            invites[i].ReceiverID === player.ID) {
                            isInvite = false;
                            break;
                        }
                    }
                } else {
                    isWatch = true
                }
            }
        }
        return (

            <Cell {...props}>
                <ButtonsPanel isWatch={isWatch}
                              isMsg={isMsg}
                              isInvite={isInvite}
                              watchHandler={watchHandler}
                              sendInviteHandler={sendInviteHandler}
                              addMsgPlayersHandler= {addMsgPlayersHandler}
                              playerId={player.ID}
                              playerName={player.Name}
                />
            </Cell>
        );
    }
}
class ButtonsPanel extends React.Component {
    static propTypes = {
        isWatch: PropTypes.bool.isRequired,
        watchHandler: PropTypes.func.isRequired,
        isMsg: PropTypes.bool.isRequired,
        addMsgPlayersHandler: PropTypes.func.isRequired,
        isInvite: PropTypes.bool.isRequired,
        sendInviteHandler: PropTypes.func.isRequired,
        playerId: PropTypes.number.isRequired,
        playerName: PropTypes.string.isRequired
    }
    render() {
        const {
            isWatch,
            watchHandler,
            isMsg,
            addMsgPlayersHandler,
            isInvite,
            sendInviteHandler,
            playerId,
            playerName
        } = this.props;
        return (
            <span className="button-panel">
                <PanelButton text="I"
                             handler={sendInviteHandler}
                             playerId={playerId}
                             playerName={playerName}
                             isDisabled={!isInvite}
                />
                <PanelButton text="M"
                             handler={addMsgPlayersHandler}
                             playerId={playerId}
                             playerName={playerName}
                             isDisabled={!isMsg}
                />
                <PanelButton text="W"
                             handler={watchHandler}
                             playerId={playerId}
                             playerName={playerName}
                             isDisabled={!isWatch}
                />

            </span>
        );
    }
}
class PanelButton extends React.Component {
    static propTypes = {
        isDisabled: PropTypes.bool.isRequired,
        text: PropTypes.string.isRequired,
        playerId: PropTypes.number.isRequired,
        playerName: PropTypes.string.isRequired,
        handler: PropTypes.func.isrequired
    }
    render() {
        if (this.props.isDisabled) {
            return (
                <button type="button"
                        disabled={true}
                >{this.props.text}</button>
            );
        } else {
            return (
                <button type="button"
                        onClick={(event)=>this.props.handler(this.props.playerId,this.props.playerName)}
                >{this.props.text}</button>
            );
        }

    }
}
class TextCell extends React.Component {
    render() {
        const {
            rowIndex,
            field,
            players,
            ...props
        } = this.props;
        return (
            <Cell {...props}>
                {players[rowIndex][field]}
            </Cell>
        );
    }
}
