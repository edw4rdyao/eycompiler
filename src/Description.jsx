import React, { Component } from 'react'

export default class Description extends Component {
  render() {
    return (
      <div className="d-main">
        <div className="des d1">
          <h2>Eycomplier</h2>
          <p>
            A online c-like Complier developed by JavaScript, including Lexical Analysis, <a
              href="http://www.cs.ecu.edu/karl/5220/spr16/Notes/Bottom-up/lr1.html">LR(1) Analysis</a>,
            Semantic Analysis and ASM Generation.
          </p>
        </div>
        <div className="des d2">
          <h2>Lexical</h2>
          <p>
            The file you input should be c-like. And the symbols supported are below:
          </p>
          <p>
            <span className='d-tag'>{'[ID]'}</span>
            <span className='d-tag'>{'[INT]'}</span>
            <span className='d-tag'>{'*'}</span>
            <span className='d-tag'>{'+'}</span>
            <span className='d-tag'>{'-'}</span>
            <span className='d-tag'>{'='}</span>
            <span className='d-tag'>{'=='}</span>
            <span className='d-tag'>{'!='}</span>
            <span className='d-tag'>{'>'}</span>
            <span className='d-tag'>{'<'}</span>
            <span className='d-tag'>{'<='}</span>
            <span className='d-tag'>{'>='}</span>
            <span className='d-tag'>{'return'}</span>
            <span className='d-tag'>{'while'}</span>
            <span className='d-tag'>{'if-else'}</span>
            <span className='d-tag'>{'void'}</span>
            <span className='d-tag'>{'int'}</span>
          </p>
          <p>

          </p>
        </div>
        <div className="des d2">
          <h2>Grammar</h2>
          <p>
          </p>
        </div>
      </div>
    )
  }
}
