import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
const WAIT_INTERVAL = 2000;
const ENTER_KEY = 13;

const useDebounce = (value, delay) => {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(
		() => {
			const timer = setTimeout(() => setDebouncedValue(value), delay);
			return () => {
				clearTimeout(timer);
			};
		},
		[value, delay || 500]
	);
	return debouncedValue;
};

const SmartInput = ({ className, placeholder, onChange, initialValue, type, style }) => {
	const [value, setValue] = useState(initialValue);
	const debouncedValue = useDebounce(value, WAIT_INTERVAL);

	useEffect(
		() => {
			onChange(debouncedValue);
		},
		[debouncedValue]
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
					setValue(e.target.value);
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
					setValue(e.target.value);
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
