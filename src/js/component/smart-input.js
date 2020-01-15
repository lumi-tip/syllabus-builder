import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
const WAIT_INTERVAL = 2000;
const ENTER_KEY = 13;

const SmartInput = ({ className, placeholder, onChange, initialValue, type, style }) => {
	const [value, setValue] = useState(initialValue);
	const [timer, setTimer] = useState(null);

	useEffect(() => {
		setTimer(null);
	}, []);

	useEffect(
		() => {
			setValue(initialValue);
		},
		[initialValue]
	);

	if (type === "textarea")
		return (
			<textarea
				key="key"
				className={className}
				style={style}
				placeholder={placeholder}
				value={value}
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
	else if (type === "text")
		return (
			<input
				type="text"
				style={style}
				className={className}
				placeholder={placeholder}
				value={value}
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
	style: PropTypes.object,
	onChange: PropTypes.func
};
SmartInput.defaultProps = {
	className: "",
	style: null,
	type: "text",
	initialValue: "",
	placeholder: ""
};
export default SmartInput;
