import React from "react";
import PropTypes from "prop-types";

const Column = ({ heading }) => (
	<div className="col-4">
		<h4>{heading}</h4>
	</div>
);
Column.propTypes = {
	heading: PropTypes.string
};

const Day = () => {
	return (
		<div className="day bg-light">
			<h3>Day 1</h3>
			<div className="row no-gutters">
				<Column heading="Lessons" />
				<Column heading="Exercises" />
				<Column heading="Project" />
			</div>
		</div>
	);
};
export default Day;
