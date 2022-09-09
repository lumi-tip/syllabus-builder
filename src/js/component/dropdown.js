import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
const Dropdown = ({ label, options, onChange }) => {
	const [loading, setLoading] = useState(false);
	const [optValues, setOptValues] = useState([]);

	useEffect(() => {
		if (Array.isArray(options)) setOptValues(options);
		else options().then(values => setOptValues(values));
	}, options);
	return (
		<div className="dropdown d-inline">
			<button
				className="btn btn-light text-secondary btn-sm p-0 dropdown-toggle"
				type="button"
				disabled={loading}
				id="dropdownMenuButton"
				data-toggle="dropdown"
				aria-haspopup="true"
				aria-expanded="false">
				{loading ? <i className="fas fa-sync spin" /> : label}
			</button>
			<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
				{optValues.length == 0 && <span>No options</span>}
				{optValues.map(o => (
					<a
						key={o.value.version}
						className="dropdown-item"
						href="#"
						onClick={e => {
							e.preventDefault();
							if (onChange) {
								setLoading(true);
								onChange(o).then(() => setLoading(false));
							}
						}}>
						{o.label}
					</a>
				))}
			</div>
		</div>
	);
};
Dropdown.propTypes = {
	onChange: PropTypes.func,
	options: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
	label: PropTypes.string
};

Dropdown.defaultProps = {
	onChange: null,
	options: [],
	label: "no label"
};

export default Dropdown;
