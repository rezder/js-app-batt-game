import React, {
    Component
} from 'react';

import PropTypes from 'prop-types';
// eslint-disable-next-line
const LGS_None = 0
const LGS_OK = 1
const LGS_Down = 2
const LGS_InValid = 3
const LGS_Disable = 4
const LGS_Exist = 5
const LGS_Err = 6
export class LogIn extends Component {
    constructor(props) {
        super(props);
        this.handlerPw = this.handlerPw.bind(this);
        this.handlerLogIn = this.handlerLogIn.bind(this);
        this.handlerNew = this.handlerNew.bind(this);
        this.handlerName = this.handlerName.bind(this);
        this.state = {
            isValidName: false,
            isValidPw: false,
            pw: "",
            name: "",
            info: "",
        };
    }
    static propTypes={
        handlerIn:PropTypes.func.isRequired
    }
    handlerLogIn() {
        let http = new XMLHttpRequest();
        let url = "post/login";
        let params = "txtUserName=" + this.state.name + "&pwdPassword=" + this.state.pw;
        http.open("POST", url, true)
        http.setRequestHeader("Content-type",
                              "application/x-www-form-urlencoded");
        let login = this
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                let logInStatus = JSON.parse(http.responseText)
                                      .LogInStatus;
                console.log(["Login login status: ", logInStatus])
                let info = ""
                switch (logInStatus) {
                    case LGS_OK:
                        login.props.handlerIn(true,login.state.name);
                        break;
                    case LGS_Down:
                        login.props.handlerIn(false)
                        break;
                    case LGS_Disable:
                        info =
                            "You can't login as you have been disabled."
                            login.setState({
                                info: info
                            })
                        break;
                    case LGS_InValid:
                        info =
                            "Password and name combination does not exist."
                            login.setState({
                                pw: "",
                                info: info
                            })
                        break;
                    case LGS_Exist:
                        info = "Your are already loged in."
                        login.setState({
                            info: info
                        })
                        break;
                    case LGS_Err:
                        info = "Try again there was a unkown error."
                        login.setState({
                            info: info
                        })
                        break;
                    default:
                        console.log(["This was unexpected status: ",logInStatus])
                }
            }else if (http.readyState === 4 && http.status !== 200){
                login.props.handlerIn(false)
            }
        }
        http.send(params);
        console.log(["LogIn url: ", url, "Params: ", params])
    }
    handlerNew() {
        let http = new XMLHttpRequest();
        let url = "post/client";
        let params = "txtUserName=" + this.state.name + "&pwdPassword=" + this.state.pw;
        http.open("POST", url, true)
        http.setRequestHeader("Content-type",
                              "application/x-www-form-urlencoded");
        let login = this
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                let logInStatus = JSON.parse(http.responseText)
                                      .LogInStatus;
                console.log(["Login login status: ", logInStatus])
                let info = ""
                switch (logInStatus) {
                    case LGS_OK:
                        login.props.handlerIn(true,login.state.name)
                        break;
                    case LGS_Down:
                        login.props.handlerIn(false)
                        break;
                    case LGS_InValid:
                        console.log("Something is wrong with validation, it should not be possible to provide invalid password or name.")
                        break;
                    case LGS_Exist:
                        info = "The name allready exist."
                        login.setState({
                            info: info
                        })
                        break;
                    case LGS_Err:
                        info = "Try again there was a unkown error."
                        login.setState({
                            info: info
                        })
                        break;
                    default:
                        console.log(["This was unexpected status: ",logInStatus])
                }
            }
        }
        http.send(params);
        console.log(["LogIn url: ", url, "Params: ", params])
    }
    handlerPw(e) {
        let isValid = false
        if (e.target.value.length > 7) {
            isValid = true
        }

        this.setState({
            isValidPw: isValid,
            pw: e.target.value
        })

    }
    handlerName(e) {
        let isValid = false
        if (e.target.value.length > 3 && e.target.value.length < 21) {
            isValid = true
        }

        this.setState({
            isValidName: isValid,
            name: e.target.value
        })

    }
    render() {
        let pwClass = "valid-text"
        if (!this.state.isValidPw) {
            pwClass = "invalid-text"
        }
        let nameClass = "valid-text"
        if (!this.state.isValidName) {
            nameClass = "invalid-text"
        }
        return (
            <div className="login">
                <h2>Login</h2>
                <table>
                    <tbody>
                        <tr>
                            <td ><label  htmlFor="Uname">User Name</label></td>
                            <td><input autoFocus
                                       required
                                       id="Uname"
                                       name="txtUserName"
                                       type="text"
                                       onInput={this.handlerName}
                                       className={nameClass}
                                       value={this.state.name}
                                /></td>
                        </tr>
                        <tr>
                            <td style={{textAlign:"left"}}><label  htmlFor="Pwd">Password</label></td>
                            <td><input  required
                                        id="Pwd"
                                        name="pwdPassword"
                                        type="password"
                                        onInput={this.handlerPw}
                                        className={pwClass}
                                        value={this.state.pw}
                                /></td>
                        </tr>
                    </tbody>
                </table>
                <p id="login-buttons">
                    <button type="button"
                            id ="login-login-button"
                            onClick={this.handlerLogIn}
                            disabled={!(this.state.isValidName&&this.state.isValidPw)}>
                        Login
                    </button>
                    <button type="button"
                            id="login-new-button"
                            onClick={this.handlerNew}
                            disabled={!(this.state.isValidName&&this.state.isValidPw)}>
                        New
                    </button>
                </p>
                <p>
                    {this.state.info}
                </p>
            </div>
        );
    }
}
