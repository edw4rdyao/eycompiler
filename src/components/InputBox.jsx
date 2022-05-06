import React, { useState } from 'react'

export default function InputBox(props) {

	const [unable, setUnable] = useState(props.initValue === '' ? true : false);
	const [value, setValue] = useState(props.initValue);

	const handleInputChange = (e) => {
		setUnable(e.target.value === '');
		setValue(e.target.value);
	}

	const handleFileChange = (e) => {
		let r = new FileReader();
		let f = e.target;
		if (f.files.length === 0) {
			alert('No File!');
			return;
		}
		r.onload = () => {
			setValue(r.result);
			setUnable(value === '');
		}
		r.readAsText(f.files[0]);
		f.value = '';
	}

	return (
		<div className="s-card s1-input">
			<div className="s-head">
				{props.header}
			</div>
			<div className="input-box">
				<textarea className="input-box-inner" onChange={handleInputChange}
					placeholder={
						props.type === 'code' ? 'please type the source code...' :
							'please type the grammar rules...'
					}
					value={value}></textarea>
			</div>
			<div>
				<button className="s-button s-blue s-fr" disabled={unable}
					onClick={() => {
						props.handleSubmit(value);
					}}>Submit
				</button>
				<button className="s-button s-fr">
					<input type="file" className="s-upload" onChange={handleFileChange} />Upload
				</button>
				<div className="s-description">
					{props.type === 'code' ? 'Type or upload. Please input c-like file.' :
						'Type or upload. Please referance the format beside.'
					}
				</div>
			</div>
			<div className="s-clear"></div>
		</div>
	)
}
