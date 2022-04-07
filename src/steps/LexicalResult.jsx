import React, { Component } from 'react'

export default class LexicalResult extends Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div className="s-card s2-lexical">
                <div className="s-head">
                    Lexical analysis result
                </div>
                <div className="s2-table-box">
                    <table className="s-table">
                        <tbody>
                            <tr>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Row</th>
                            <th>Col</th>
                            </tr>
                            {this.props.tokenStream.map((t, i)=>{
                                return (
                                    <tr key={i}>
                                        <td>{t.token}</td>
                                        <td>{t.value}</td>
                                        <td>{t.position.row}</td>
                                        <td>{t.position.col}</td>
                                    </tr>
                                    )
                            })}
                        </tbody>
                    </table>
                </div>
                <div>
                    <button className="s-button s-blue s-fr" onClick={this.props.handleContinue}>Continue</button>
                    <button className="s-button s-fr" >Download</button>
                    <div className="s-description">Type is token kind, value is token string.</div>
                </div>
                <div className="s-clear"></div>
            </div>
        )
    }
}
