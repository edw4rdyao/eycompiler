import React from 'react'

export default function DisplayBox(props) {

  return (
    <div className="s-card">
      <div className="s-head">
        {props.header}
      </div>
      <div className="s-display-box">
        {
          props.type === 'interCode' ?
            props.displayData.map((d, i) => {
              return (<div key={i}>{`${d.op} ${d.arg1} ${d.arg2} ${d.res}`}</div>)
            }) :
            props.displayData.map((d, i) => {
              return (<div key={i}>{`${d}`}</div>)
            })
        }
      </div>
      <div>
        {props.type === 'interCode' ? (
          <button className="s-button s-blue s-fr" onClick={props.handleContinue}>Continue</button>) : null}
        <button className="s-button s-fr" >Download</button>
        <div className="s-description">{props.description}</div>
      </div>
      <div className="s-clear"></div>
    </div>
  )
}
