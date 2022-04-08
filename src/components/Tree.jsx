import React, { Component } from 'react'

import drawGrammarTree from '../utils/DrawTree';

export default class Tree extends Component {
    componentDidMount(){
        if(!document.getElementById("treeSvg")){
            drawGrammarTree(this.props.grammarTreeData, "s5-viewer","treeSvg")
        }
    }

    componentDidUpdate(){
        var treeSvg = document.getElementById("treeSvg");
        if(treeSvg) treeSvg.remove();
        drawGrammarTree(this.props.grammarTreeData, "s5-viewer","treeSvg")
    }

    constructor(props){
        super(props);
    }
    render() {
        return (
            <div className="s5-viewer" id='s5-viewer'></div>
        )
    }
}
