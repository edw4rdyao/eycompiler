import React from 'react'

export default function Split(props) {
  const splitStyle = {
    backgroundPositionX: props.x,
    backgroundPositionY: props.y
  }
  return (
    <div className="s-split" style={splitStyle}></div>
  )
}
