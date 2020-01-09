import React from "react";
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";

const Column = ({ heading, onDrop }) => {
	const [{ isOver, canDrop }, drop] = useDrop({
		accept: ["lesson", "project", "replit"],
		drop: () => onDrop(),
		collect: mon => ({
			isOver: !!mon.isOver(),
			canDrop: !!mon.canDrop()
		})
	});
	return (
		<div ref={drop} className="col-4">
			<h4>{heading}</h4>
		</div>
	);
};
Column.propTypes = {
	heading: PropTypes.string,
	onDrop: PropTypes.func
};

const Day = ({ number, onDrop }) => {
	return (
		<div className="day bg-light">
			<h3>Day {number}</h3>
			<div className="row no-gutters">
				<Column heading="Lessons" />
				<Column heading="Exercises" />
				<Column heading="Project" />
			</div>
		</div>
	);
};
Day.propTypes = {
	number: PropTypes.string,
	onDrop: PropTypes.func
};
export default Day;
