import React from 'react'

export default function Description() {

  const symbols = ['<id>', '<int>', '+', '-', '*', '/', '=', '==', '>', '<', '>=', '<=',
    'return', 'while', 'if else', 'int', 'void'];

  const grammarRules = [
    '@declear: a|b|c|... 所有的终结符声明',
    'A->B|C|...: 产生式形式，A可推导B或C或更多',
    'S: 拓展文法非终结符，文法规则至少应含有该项'
  ]

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
          The grammar rules are below:
        </p>
        <p>
          {grammarRules.map(r=>{
            return (
              <div className="d-section">{r}</div>
            )
          })}
        </p>
      </div>
    </div>
  )
}
