import React from 'react'

export default function Description() {

  const symbols = ['<id>', '<int>', '+', '-', '*', '/', '=', '==', '>', '<', '>=', '<=',
    'return', 'while', 'if else', 'int', 'void'];

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
          {symbols.map((t, i) => {
            return (
              <span className='d-tag' key={i}>{t}</span>
            )
          })}
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
