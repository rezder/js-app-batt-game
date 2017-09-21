import React, {
    Component
} from 'react';
import PropTypes from 'prop-types';

export class MiddleLine extends Component {
    render() {
        const styleLine = {
            stroke: "#000000",
            strokeWidth: 2,
            strokeDasharray: [4, 4]
        };
        return (
            <path id="middelPath"
                  d={"m 0,"+this.props.height/2+" "+this.props.width+",0"}
                  style={styleLine}/>
        );
    }
}
/**
   Pattern must be placed in defs where the can be reused.
   The back of the card use the pattern and if not include card would fail.
 */
export class Pattern extends Component {
    render() {
        const blackStyle = {
            fill: "black",
            stroke: "none"
        };
        return (
            <defs>
                <pattern
                    patternUnits="userSpaceOnUse"
                    width="1"
                    height="1.73205080756"
                    patternTransform="matrix(10,0,0,10,540.14072,-27.21433)"
                    id="pattern11963-5-7">
                    <circle
                        style={blackStyle}
                        cx="0"
                        cy="0.5"
                        r="0.5"
                        id="circle11166-3-4" />
                    <circle
                        style={blackStyle}
                        cx="1"
                        cy="0.5"
                        r="0.5"
                        id="circle11168-1-9" />
                    <circle
                        style={blackStyle}
                        cx="0.5"
                        cy="1.36602540378"
                        r="0.5"
                        id="circle11170-4-8" />
                    <circle
                        style={blackStyle}
                        cx="0.5"
                        cy="-0.366025403784"
                        r="0.5"
                        id="circle11172-5-5" />
                </pattern>
            </defs>
        );
    }
}

export class Shade extends Component {
    render() {
        let on = this.props.on;
        let col = "#000000";
        let height = this.props.height;
        let width = this.props.width;
        let rectStyle = {
            strokeWidth: 0,
            fill: col,
            fillOpacity: 0.3
        };
        if (on) {
            return (
                <rect
                    height={height}
                    width={width}
                    style={rectStyle}
                />
            );
        } else {
            return (<g/>);
        }
    }
}
export class Spinner extends Component {
    render() {
        let on = this.props.on;
        let col = "#000000";
        let x = this.props.x;
        let y = this.props.y;
        let rectStyle = {
            strokeWidth: 0,
            fill: "ffff00"
        };
        let styleOuter = {
            strokeWidth: 2,
            stroke: col,
            fill: "none"
        };
        let styleInner = {
            strokeWidth: 0,
            stroke: col,
            fill: col
        };
        if (on) {
            return (
                <g transform={"translate("+x+","+y+")"}>
                    <circle
                        r={8}
                        style={styleInner}
                    />
                    <rect
                        height={5}
                        width={12}
                        x={-6}
                        y={-2}
                        style={rectStyle}
                    >
                        <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="0 0 0"
                            to="360 0 0"
                            dur="0.5s"
                            begin="0s"
                            repeatCount="indefinite"
                            fill="freeze"
                        />
                    </rect>
                    <circle
                        r={7}
                        style={styleOuter}
                    />
                    <circle
                        r={4}
                        style={styleInner}
                    />

                </g>

            );

        } else {
            return (<g/>);
        }
    }
}
export class Button extends Component {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
    }
    static defaultProps = {
        disabled: false,
        height: 20,
        fontSize: 10
    };
    static propTypes = {
        text: PropTypes.string.isRequired,
        disabled: PropTypes.bool.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        fontSize: PropTypes.number.isRequired,
        handler: PropTypes.func
    }
    clickHandler(e) {
        if (this.props.handler && !this.props.disabled) {
            e.stopPropagation();
            this.props.handler(this.props.text);
        }
    }
    render() {
        let height = this.props.height
        let width = this.props.width
        let fontSize = this.props.fontSize
        let text = this.props.text
        let disabled =this.props.disabled
        let handler= this.props.handler
        const rectStyle = {
            stroke: "none"
        }
        const rectGlowStyle = {
            stroke: "none",
            fill: "url(#radialGradientButton)"
        }
        if (handler&&!disabled){
            rectGlowStyle.cursor = "pointer";
        }
        let opacity=1
        if (disabled){
            opacity=0.5
        }
        const textStyle = {
            fontSize: fontSize + "px",
            textAnchor: "middle",
            fontWeight:"bold",
            fillOpacity:opacity
        }
        const stopStyle1 = {
            stopColor: "#000000",
            stopOpacity: "0"
        }
        const stopStyle2 = {
            stopColor: "#000000",
            stopOpacity: "0.8"
        }
        return (
            <g>
                <defs>
                    <radialGradient
                        cx="0.5"
                        cy="0.5"
                        r="2"
                        fx="0.5"
                        fy="0.25"
                        gradientTransform={"scale(1,"+height/width+")"}
                        id="radialGradientButton"
                        gradientUnits="objectBoundingBox"
                    >
                        <stop
                            id="stopButton1"
                            style={stopStyle1}
                            offset="0" />
                        <stop
                            id="stopButton2"
                            style={stopStyle2}
                            offset="1" />

                    </radialGradient>
                </defs>
                <rect
                    width={width}
                    height={height}
                    ry={height/4}
                    className="svg-button-background"
                    style={rectStyle} />
                <rect
                    width={width}
                    height={height}
                    ry={height/4}
                    style={rectGlowStyle}
                    onClick={this.clickHandler}
                />
                <text
                    x={width/2}
                    y={(height+fontSize/2)/2}
                    className="svg-button-foreground"
                    style={textStyle}
                    pointerEvents="none">
                    {text}
                </text>


            </g>
        )
    }
}
