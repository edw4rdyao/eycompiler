import React, { Component } from 'react'

export default class Alert extends Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div className='alert-mask'>
                <div className="alert-main">
                    <div className="alert-head">ERROR</div>
                    <div className="alert-content">{this.props.errMsg}</div>
                    <div className="alert-ok">
                        <button className="s-button s-fl" onClick={()=>this.props.handleErrClose(this.props.newProcess)}>OK</button>
                        <button className="s-button s-blue s-fr" onClick={()=>this.props.handleErrReset()}>Reset</button>
                        <div className="s-clear"></div>
                    </div>
                </div>
            </div>
        )
    }
}
