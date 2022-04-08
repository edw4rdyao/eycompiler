import React, { Component } from 'react'

export default class InputBox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			submitUnable: this.props.initValue === '' ? true : false,
			submitValue: this.props.initValue
		}
	}

	handleInputChange(e) {
		this.setState({
			submitUnable: (e.target.value === ''),
			submitValue: e.target.value
		})
	}

	handleFileChange(e) {
		var r = new FileReader();
		var f = e.target;
		if (f.files.length === 0) {
			alert('No File!');
			return;
		}
		r.onload = () => {
			this.setState({
				submitValue: r.result,
			})
			this.setState({
				submitUnable: (this.state.submitValue === '')
			})
		}
		r.readAsText(f.files[0]);
		f.value = '';
	}

	render() {
		return (
			<div className="s-card s1-input">
				<div className="s-head">
					{this.props.header}
				</div>
				<div className="input-box">
					<textarea className="input-box-inner" onChange={this.handleInputChange.bind(this)}
						placeholder={
							this.props.type === 'code' ? 'please type the source code...' :
								'please type the grammar rules...'
						}
						value={this.state.submitValue}></textarea>
				</div>
				<div>
					<button className="s-button s-blue s-fr" disabled={this.state.submitUnable}
						onClick={()=>{
							this.props.handleSubmit(this.state.submitValue);
						}}>Submit
					</button>
					<button className="s-button s-fr">
						<input type="file" className="s-upload" onChange={this.handleFileChange.bind(this)} />Upload
					</button>
					<div className="s-description">
						{this.props.type === 'code' ? 'Type or upload. Please input c-like file.' :
							'Type or upload. Please referance the format beside.'
						}
					</div>
				</div>
				<div className="s-clear"></div>
			</div>
		)
	}
}
