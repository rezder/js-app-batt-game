import React, {
    Component
} from 'react';
import logo from './rezder1.svg';
import logoDown from './serverdown.png'
import './App.css';
import {
    BattGameControler
} from './gamecontroler.js'
import {
    Down
} from './down.js'
import {
    LogIn
} from './login.js'
const AS_LogIn = 0;
const AS_Down = 1;
const AS_Game = 2;

class App extends Component {
    constructor(props) {
        super(props);
        this.handlerIn = this.handlerIn.bind(this);
        this.handlerOut = this.handlerOut.bind(this);
        this.state = {
            appState: AS_LogIn
        };
    }
    handlerIn(isIn, name) {
        let newState = AS_Down
        if (isIn) {
            newState = AS_Game
        }
        this.setState({
            appState: newState,
            name: name
        });
    }
    handlerOut() {
        let newState = AS_LogIn
        this.setState({
            appState: newState
        });
    }
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    {getLogo(this.state.appState)}
                    <h1>Battleline</h1>
                </div>
                {getPage(this.state.appState,this.state.name,this.handlerIn,this.handlerOut)}
            </div>
        );
    }
}

function getLogo(appState) {
    if (appState === AS_Down) {
        return (<img src={logoDown} className="App-logo" alt="logo" />);
    } else {
        return (<img src={logo} className="App-logo" alt="logo" />);
    }
}

function getPage(appState, name, handlerIn, handlerOut) {
    let page
    switch (appState) {
        case AS_Game:
            page = <BattGameControler name={name}/>
            break;
        case AS_Down:
            page = <Down handlerOut={handlerOut}/>
            break;
        default:
            page = <LogIn handlerIn={handlerIn}/>
    }
    return page
}

export default App;
