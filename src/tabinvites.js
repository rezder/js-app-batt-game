import React, {
    Component
} from 'react';

import PropTypes from 'prop-types';
import {
    Table,
    Column,
    Cell
} from 'fixed-data-table';
import 'fixed-data-table/dist/fixed-data-table.css';
import {
    act
} from './action.js'

export class TabInvites extends Component {
    static propTypes = {
        invites: PropTypes.array.isRequired,
        ws: PropTypes.object,
        removeInviteHandler: PropTypes.func.isRequired,
        playerId: PropTypes.number
    }
    render() {
        const {
            invites,
            ws,
            removeInviteHandler,
            playerId
        } = this.props;
        return (
            <div className="tab-invites">
                <h2>Invites</h2>
                <Table
                    rowHeight={30}
                    headerHeight={40}
                    rowsCount={invites.length}
                    width={2*125+225}
                    height={400}
                >
                    <Column
                        header={<Cell>From/To</Cell>}
                        cell={<FromToCell
                                  invites={invites}
                                          playerId={playerId}
                        />}
                        width={125}
                    />
                    <Column
                        header={<Cell>Player</Cell>}
                        cell={<PlayerCell
                                  invites={invites}
                                          playerId={playerId}
                        />}
                        width={125}
                    />
                    <Column
                        header={<Cell>Accept/Decline/Retract</Cell>}
                        cell={<ButtonsCell
                                  invites={invites}
                                          playerId={playerId}
                                          ws={ws}
                                          removeInviteHandler={removeInviteHandler}

                        />}
                        width={225}
                    />
                </Table>
            </div>
        )
    }
}
class FromToCell extends React.Component {
    static propTypes = {
        rowIndex: PropTypes.number, //.isRequired the header does not need it
        invites: PropTypes.array, //.isRequired,
        playerId: PropTypes.number //.isRequired
    }
    render() {
        const {
            rowIndex,
            invites,
            playerId,
            ...props
        } = this.props;
        let invite = invites[rowIndex];
        let toFrom = "From"
        if (invite.InvitorID === playerId) {
            toFrom = "To"
        }
        return (
            <Cell {...props}>
                {toFrom}
            </Cell>
        );
    }
}
class PlayerCell extends React.Component {
    static propTypes = {
        rowIndex: PropTypes.number, //.isRequired the header does not need it
        invites: PropTypes.array, //.isRequired,
        playerId: PropTypes.number //.isRequired
    }
    render() {
        const {
            rowIndex,
            invites,
            playerId,
            ...props
        } = this.props;
        let invite = invites[rowIndex];
        let playerName = invites[rowIndex].InvitorName
        if (invite.InvitorID === playerId) {
            playerName = invites[rowIndex].ReceiverName
        }
        return (
            <Cell {...props}>
                {playerName}
            </Cell>
        );
    }
}
class ButtonsCell extends React.Component {
    static propTypes = {
        rowIndex: PropTypes.number, //.isRequired the header does not need it
        invites: PropTypes.array, //.isRequired,
        playerId: PropTypes.number, //.isRequired
        ws: PropTypes.object,
        removeInviteHandler: PropTypes.func.isRequired
    }
    render() {
        const {
            rowIndex,
            invites,
            playerId,
            ws,
            removeInviteHandler,
            ...props
        } = this.props;
        let invite = invites[rowIndex];
        return (
            <Cell {...props}>
                <ButtonsPanel invite ={invite}
                              ws={ws}
                              removeInviteHandler= {removeInviteHandler}
                              playerId={playerId}
                />
            </Cell>
        );
    }
}
class ButtonsPanel extends React.Component {
    static propTypes = {
        invite: PropTypes.object.isrequired,
        playerId: PropTypes.number.isRequired,
        ws: PropTypes.number.isRequired,
        removeInviteHandler: PropTypes.func.isRequired
    }
    render() {
        const {
            invite,
            ws,
            removeInviteHandler,
            playerId
        } = this.props
        let isSend = false;
        if (invite.InvitorID === playerId) {
            isSend = true
        }
        let isAct = (ws)
        return (
            <span className="button-panel">
                <InviteButton text="A"
                              removeInviteHandler={removeInviteHandler}
                              playerId={playerId}
                              invite={invite}
                              isDisabled={!isAct||isSend}
                              ws={ws}
                />
                <InviteButton text="D"
                              removeInviteHandler={removeInviteHandler}
                              playerId={playerId}
                              invite={invite}
                              isDisabled={!isAct||isSend}
                              ws={ws}
                />
                <InviteButton text="R"
                              removeInviteHandler={removeInviteHandler}
                              playerId={playerId}
                              invite={invite}
                              isDisabled={!isAct||!isSend}
                              ws={ws}
                />
            </span>
        );
    }
}
class InviteButton extends React.Component {
    constructor(props) {
        super(props)
        this.handler = this.handler.bind(this)
    }
    static propTypes = {
        invite: PropTypes.object.isrequired,
        text: PropTypes.string.isRequired,
        ws: PropTypes.number.isRequired,
        removeInviteHandler: PropTypes.func.isRequired,
        isDisabled: PropTypes.bool.isRequired
    }
    handler(text) {
        let invite = this.props.invite;
        let action
        switch (text) {
            case "A":
                action = act.actionBuilder(act.InvAccept)
                            .id(invite.InvitorID)
                            .build()
                break;
            case "D":
                action = act.actionBuilder(act.InvDecline)
                            .id(invite.InvitorID)
                            .build()
                break;
            default:
                action = act.actionBuilder(act.InvRetract)
                            .id(invite.ReceiverID)
                            .build()
        }
        this.props.ws.send(JSON.stringify(action));
        this.props.removeInviteHandler(invite)
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
                        onClick={(event)=>this.handler(this.props.text)}
                >{this.props.text}</button>
            );
        }
    }
}
