import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { useDrop } from "react-dnd";
import { ContentPiece, SmartInput } from "./index.js";
import { ContentContext } from "../context.js";
import ReactTags from "react-tag-autocomplete";

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
				background: canDrop ? "#cce0d2" : isOver && !canDrop ? "red" : "inherit"
			}}>
			<h4>{heading}</h4>
			<ul className="py-0 px-1">
				{pieces.length == 0 && <small className="p-0">No content</small>}
				{pieces.map(p => (
					<ContentPiece key={p.slug} type={p.type} data={p} onDelete={() => onDelete(p)} />
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

const Day = ({ number, data }) => {
	const { store, actions } = useContext(ContentContext);
	const [concept, setConcept] = useState("");
	return (
		<div className="day bg-light">
			<h3>
				Day {data.number}:{" "}
				<SmartInput
					className="transparent"
					placeholder="Write the date label..."
					onChange={val => actions.days().update({ ...data, label: val })}
					initialValue={data.label}
				/>
			</h3>
			<div className="row no-gutters">
				<div className="col-6 pl-1">
					<SmartInput
						type="textarea"
						className="transparent w-100"
						placeholder="Add a description for the students..."
						onChange={teacher_instructions => actions.days().update({ ...data, label: teacher_instructions })}
						initialValue={data.teacher_instructions || data.instructions}
					/>
				</div>
				<div className="col-6 pl-1">
					<SmartInput
						type="textarea"
						className="transparent w-100"
						placeholder="Add a description for the teacher..."
						onChange={description => actions.days().update({ ...data, description })}
						initialValue={data.description}
					/>
				</div>
				<div className="col-12 pl-1">
					<SmartInput
						type="textarea"
						className="transparent w-100"
						placeholder="Any particular homework?"
						onChange={homework => actions.days().update({ ...data, homework })}
						initialValue={data.homework}
					/>
				</div>
				<div className="col-12 pl-1">
					{data["key-concepts"].map(c => (
						<span key={c} className="badge badge-dark mx-1">
							{c}{" "}
							<i
								onClick={() => actions.days().update({ ...data, ["key-concepts"]: data["key-concepts"].filter(kc => kc != c) })}
								className="fas fa-trash-alt pointer p-1"
							/>
						</span>
					))}
					<input
						type="text"
						placeholder={"Add a Key Concept"}
						className="transparent"
						value={concept}
						onChange={e => setConcept(e.target.value)}
						onKeyPress={e => {
							if (e.charCode == 13) {
								actions.days().update({ ...data, ["key-concepts"]: data["key-concepts"].concat([concept]) });
								setConcept("");
							}
						}}
					/>
				</div>
			</div>
			<div className="row no-gutters">
				<Column
					heading="Lessons"
					type="lesson"
					pieces={data.lessons}
					onDrop={item =>
						actions.pieces().in(item, {
							number: data.number,
							lessons: data.lessons.concat([item.data])
						})
					}
					onDelete={item =>
						actions.pieces().out(item, {
							number: data.number,
							lessons: data.lessons.filter(l => l.slug != item.data.slug)
						})
					}
				/>
				<Column
					heading="Replits"
					type="replit"
					pieces={data.replits}
					onDrop={item =>
						actions.pieces().in(item, {
							number: data.number,
							replits: data.replits.concat([item.data])
						})
					}
					onDelete={item =>
						actions.pieces().out(item, {
							number: data.number,
							replits: data.replits.filter(l => l.slug != item.data.slug)
						})
					}
				/>
				<Column
					heading="Project"
					type="project"
					pieces={data.projects}
					onDrop={item =>
						actions.pieces().in(item, {
							number: data.number,
							projects: data.projects.concat([item.data])
						})
					}
					onDelete={item =>
						actions.pieces().out(item, {
							number: data.number,
							projects: data.projects.filter(l => l.slug != item.data.slug)
						})
					}
				/>
				<Column
					heading="Quizzes"
					type="quiz"
					pieces={data.quizzes}
					onDrop={item =>
						actions.pieces().in(item, {
							number: data.number,
							quizzes: data.quizzes.concat([item.data])
						})
					}
					onDelete={item =>
						actions.pieces().out(item, {
							number: data.number,
							quizzes: data.quizzes.filter(l => l.slug != item.data.slug)
						})
					}
				/>
			</div>
		</div>
	);
};
Day.propTypes = {
	number: PropTypes.number,
	onDrop: PropTypes.func,
	onUpdate: PropTypes.func,
	data: PropTypes.object
};
export default Day;
