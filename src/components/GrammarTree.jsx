import React from 'react'
import Tree from './Tree';

export default function GrammarTree(props) {
	return (
		<div className="s-card s5-grammartree" id="s5-grammartree">
			<div className="s-head">
				Grammar tree(语法树)
			</div>
			<Tree
				grammarTreeData={props.grammarTreeData}
			></Tree>
			<div className="s5-tooltips" id='tooltips'></div>
			<div>
				<button className="s-button s-blue s-fr" id="s2-continue" onClick={props.handleContinue}>Continue</button>
				<div className="s-description">Displayed by <a href="https://d3js.org.cn/">D3.js</a>. Zoomable and
					collapsible.</div>
			</div>
			<div className="s-clear"></div>
		</div>
	)
}
