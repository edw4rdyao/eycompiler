import React, { Component } from 'react'

export default class Description extends Component {
    render() {
        return (
            <div className="d-main">
                <div className="d1">
                    <h2>Eycomplier</h2>
                    <p>
                        A online c-like Complier developed by JavaScript, including Lexical Analysis, <a
                            href="http://www.cs.ecu.edu/karl/5220/spr16/Notes/Bottom-up/lr1.html">LR(1) Analysis</a>,
                        Semantic Analysis and ASM Generation.
                    </p>
                </div>
            </div>
        )
    }
}
