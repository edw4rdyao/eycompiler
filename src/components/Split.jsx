import React, { Component } from 'react'

export default class Split extends Component {
    render() {
        var splitStyle = {
            backgroundPositionX: this.props.x,
            backgroundPositionY: this.props.y
        }
        return (
            <div className="s-split" style={splitStyle}></div>
        )
    }
}
