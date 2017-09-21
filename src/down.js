import React, { Component } from 'react';

import PropTypes from 'prop-types';
export class Down extends Component {
    constructor(props){
        super(props)
        this.cleanup = this.cleanup.bind(this);
        this.checkServer=this.checkServer.bind(this);
        this.timer=null
    }
    static propTypes={
        handlerOut:PropTypes.func.isRequired
    }
    chechkServer(){
        let http = new XMLHttpRequest();
        let url = "ping";
        http.open("POST", url, true)
        http.setRequestHeader("Content-type",
                              "application/x-www-form-urlencoded");
        let login = this
        http.onreadystatechange = function() {
            if (http.readyState === 4 && http.status === 200) {
                let isUp = JSON.parse(http.responseText).IsUp;
                console.log(["IsUp: ", isUp])
                if (isUp){
                    login.props.handlerOut();
                }
            }
        }
        http.send()
        console.log(["Down url: ", url])
    }
    cleanup(){
        if (this.timer!==null){
            window.clearInterVal(this.timer)
            this.timer=null
        }
    }
    componentDidMount(){
        this.timer = window.setInterval(this.chechkServer, 5000);
        window.addEventListener('beforeunload', this.cleanup);
    }

    componentWillUnmount() {
        this.cleanup();
        window.removeEventListener('beforeunload', this.cleanup);
    }
    render(){
        return(
            <div>
                <h2>Game Server Is Down</h2>
                <p>The battleline game server is down. To get it up and running again should
                    not take long. This page will ping the server untill it is up and you can
                    login again. If you do not want the ping refresh or close the page.
                </p>
            </div>
        );
    }
}
