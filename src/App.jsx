import './styles/main.css'

import Complier from './Complier';
import Description from './Description';

function App() {
	return (
		<div className="main" id="main">
			<Complier></Complier>
			<Description></Description>
			<div className="s-clear"></div>
		</div>
	);
}

export default App;
