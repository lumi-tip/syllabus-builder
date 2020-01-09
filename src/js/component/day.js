import React from "react";
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";
import ContentPiece from "./content-piece.js";

const Column = ({ heading, onDrop, pieces, type, onDelete }) => {
	const [{ isOver, canDrop }, drop] = useDrop({
		accept: type,
		drop: item => onDrop(item),
		collect: mon => ({
			isOver: !!mon.isOver(),
			canDrop: !!mon.canDrop()
		})
	});
	return (
		<div
			ref={drop}
			className="col-3"
			style={{
				background: canDrop
					? "#cce0d2"
					: isOver && !canDrop
						? "red"
						: "inherit"
			}}>
			<h4>{heading}</h4>
			<ul className="py-0 px-1">
				{pieces.length == 0 && (
					<small className="p-0">No content</small>
				)}
				{pieces.map(p => (
					<ContentPiece
						key={p.slug}
						type={p.type}
						title={p.title || p.info.name}
						onDelete={() => onDelete(p)}
					/>
				))}
			</ul>
		</div>
	);
};
Column.propTypes = {
	heading: PropTypes.string,
	type: PropTypes.string,
	pieces: PropTypes.array,
	onDrop: PropTypes.func,
	onDelete: PropTypes.func
};
Column.defaultProps = {
	pieces: [],
	type: null
};

const Day = ({
	number,
	lessons,
	replits,
	projects,
	quizzes,
	onDrop,
	onDelete
}) => {
	return (
		<div className="day bg-light">
			<h3>Day {number}</h3>
			<div className="row no-gutters">
				<Column
					heading="Lessons"
					type="lesson"
					pieces={lessons}
					onDrop={item => onDrop(item)}
					onDelete={item => onDelete(item)}
				/>
				<Column
					heading="Replits"
					type="replit"
					pieces={replits}
					onDrop={item => onDrop(item)}
					onDelete={item => onDelete(item)}
				/>
				<Column
					heading="Project"
					type="project"
					pieces={projects}
					onDrop={item => onDrop(item)}
					onDelete={item => onDelete(item)}
				/>
				<Column
					heading="Quizzes"
					type="quiz"
					pieces={quizzes}
					onDrop={item => onDrop(item)}
					onDelete={item => onDelete(item)}
				/>
			</div>
		</div>
	);
};
Day.propTypes = {
	number: PropTypes.number,
	onDrop: PropTypes.func,
	onDelete: PropTypes.func,
	lessons: PropTypes.array,
	replits: PropTypes.array,
	projects: PropTypes.array,
	quizzes: PropTypes.array
};
export default Day;
