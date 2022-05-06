import React from 'react'

export default function Alert(props){
  return (
    <div className='alert-mask'>
      <div className="alert-main">
        <div className="alert-head">ERROR</div>
        <div className="alert-content">{props.errMsg}</div>
        <div className="alert-ok">
          <button className="s-button s-fl" onClick={props.handleErrClose}>OK</button>
          <button className="s-button s-blue s-fr" onClick={props.handleErrReset}>Reset</button>
          <div className="s-clear"></div>
        </div>
      </div>
    </div>
  )
}
