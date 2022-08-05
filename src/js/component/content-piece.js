import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { Tooltip } from "react-lightweight-tooltip";
import EditContentPiece from "./modals/EditContentPiece";
import { getTitle, getStatus, getLink } from "./utils";
import swal from "sweetalert";

const ContentPiece = ({ data, onDelete, onEdit, status, withWarning, isEditable, withMandatory, withSwap, onDown, onUp }) => {
	const [{ isDragging }, drag] = useDrag({
		item: { type: data.type || "", data, status },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});

	let _title = getTitle(data);
	let _status = getStatus(data);

	return (
		<li className="content-piece" ref={drag}>
			{withSwap && (
				<div className="position-swap">
					<i onClick={() => onUp()} className="fas fa-angle-up pointer" />
					<i onClick={() => onDown()} className="fas fa-angle-down pointer" />
				</div>
			)}
			{_title}
			{withMandatory && (data.mandatory === undefined || data.mandatory) && (
				<Tooltip content={`This project is mandatory for the students`}>
					<i className="fas fa-asterisk pointer p-1" />
				</Tooltip>
			)}
			{withWarning && _status.toLowerCase() != "ok" && (
				<Tooltip content={`${_status} (needs to be published)`}>
					<i className="fas fa-exclamation-circle pointer p-1 text-danger" />
				</Tooltip>
			)}
			{isEditable ? (
				<i onClick={() => onEdit && onEdit(data)} className="fas fa-pencil-alt pointer p-1" />
			) : (
				<i onClick={() => onEdit && onEdit(data)} className="fas fa-book pointer p-1" />
			)}
			{onDelete && (
				<i
					onClick={async () => {
						const confirm = await swal({
							title: "Are you sure?",
							text: `Do you want to remove this content from the syllabus?`,
							icon: "warning",
							buttons: true,
							dangerMode: true
						});
						if (confirm) onDelete(data);
					}}
					className="fas fa-trash-alt pointer p-1"
				/>
			)}
		</li>
	);
};
ContentPiece.propTypes = {
	data: PropTypes.object,
	status: PropTypes.string,
	onDelete: PropTypes.func,
	onEdit: PropTypes.func,
	onDown: PropTypes.func,
	onUp: PropTypes.func,
	isEditable: PropTypes.bool,
	withSwap: PropTypes.bool,
	withMandatory: PropTypes.bool,
	technologies: PropTypes.array,
	translations: PropTypes.array,
	withWarning: PropTypes.bool
};
ContentPiece.defaultProps = {
	onDelete: null,
	onEdit: null,
	status: null,
	isEditable: false,
	technologies: [],
	translations: [],
	withWarning: false,
	withMandatory: false,
	withSwap: false
};
export default ContentPiece;
