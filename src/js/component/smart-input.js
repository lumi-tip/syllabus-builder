import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
const WAIT_INTERVAL = 2000;
const ENTER_KEY = 13;

const SmartInput = ({ className, placeholder, onChange, initialValue, type }) => {
	const [value, setValue] = useState(initialValue);
	const [timer, setTimer] = useState(null);

	const mix = {
		text: props => <input type="text" {...props} />,
		textarea: props => <textarea {...props} />
	};
	const Component = mix[type];

	useEffect(() => {
		setTimer(null);
	}, []);

	return (
		<Component
			className={className}
			placeholder={placeholder}
			onChange={e => {
				clearTimeout(timer);
				setValue(e.target.value);
				setTimer(setTimeout(() => onChange(value), WAIT_INTERVAL));
			}}
			onKeyDown={e => {
				if (e.charCode === ENTER_KEY) {
					onChange(value);
				}
			}}
		/>
	);
};
SmartInput.propTypes = {
	className: PropTypes.string,
	type: PropTypes.string,
	placeholder: PropTypes.string,
	initialValue: PropTypes.string,
	onChange: PropTypes.func
};
SmartInput.defaultProps = {
	className: "",
	type: "text",
	initialValue: "",
	placeholder: ""
};
export default SmartInput;
