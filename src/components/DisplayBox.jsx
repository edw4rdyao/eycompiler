import React, { Component } from 'react'

export default class DisplayBox extends Component {
  render() {
    return (
      <div className="s-card">
        <div className="s-head">
          {this.props.header}
        </div>
          
        <div>
          <button className="s-button s-fr" >Download</button>
          <div className="s-description">{this.props.description}</div>
        </div>
        <div className="s-clear"></div>
      </div>
    )
  }
}
