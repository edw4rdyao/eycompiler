import React, { Component } from 'react'

export default class TableResult extends Component {
  render() {
    if (this.props.type === 'lexicalResult') {
      return (
        <div className="s-card">
          <div className="s-head">
            {this.props.header}
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
                {this.props.tableData.map((t, i) => {
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
            <div className="s-description">{this.props.description}</div>
          </div>
          <div className="s-clear"></div>
        </div>
      )
    }
    else {
      return (
        <div className="s-card">
          <div className="s-head">
            {this.props.header}
          </div>
          <div className="s4-table-box">
            <table className="s-table s4-parsertable">
              <tbody>
                <tr>
                  <th>State</th>
                  {this.props.tableData[0].map((v, i) => {
                    return (<th key={i}>{v.s}</th>)
                  })}
                </tr>
                {this.props.tableData.map((v, i) => {
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      {v.map((vv, ii) => {
                        return (
                          // vv.lable === 'err'? <td key={ii}>{vv.lable}</td> : <td key={ii} className="s4-noterr">{vv.lable}</td>
                          vv.lable === 'err' ? <td></td> : <td key={ii} className="s4-noterr">{vv.lable}</td>
                        )
                      })}
                    </tr>
                  )
                })
                }
              </tbody>
            </table>
          </div>
          <div>
            <button className="s-button s-blue s-fr" onClick={this.props.handleContinue}>
              {this.props.type === 'lexicalResult' ? 'Continue' : 'Analysis'}
            </button>
            <button className="s-button s-fr" >Download</button>
            <div className="s-description">{this.props.description}</div>
          </div>
          <div className="s-clear"></div>
        </div>
      )
    }

  }
}
