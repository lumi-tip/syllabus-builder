import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { Tooltip } from "react-tooltip";
import EditContentPiece from "./modals/EditContentPiece";
import { getTitle, getStatus, getLink } from "./utils";
import Swal from "sweetalert2";

const ContentPiece = ({ data, onDelete, onEdit, status, withWarning, isEditable }) => {
	const [{ isDragging }, drag] = useDrag({
		type: data.type || "DEFAULT_TYPE",
		item: { data, status },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});

	let _title = getTitle(data);
	let _status = getStatus(data);

	return (
		<li className="content-piece" ref={drag}>
			{_title}
			{withWarning && _status.toLowerCase() != "published" && (
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
						const confirm = await Swal({
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
	isEditable: PropTypes.bool,
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
	withWarning: false
};
export default ContentPiece;
