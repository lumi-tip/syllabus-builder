import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { Tooltip } from "react-lightweight-tooltip";
import EditContentPiece from "./modals/EditContentPiece";
import { getTitle, getStatus, getLink } from "./utils";
import swal from "sweetalert";

const ContentPiece = ({ data, onDelete, onEdit, status, previewLink, withWarning }) => {
	const [editMode, setEditMode] = useState(false);

	const [{ isDragging }, drag] = useDrag({
		item: { type: data.type, data, status },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});

	let _title = getTitle(data);
	let _status = getStatus(data);

	return (
		<li className="content-piece" ref={drag}>
			{editMode && <EditContentPiece defaultValue={data} onSave={_d => setEditMode(false) || onEdit(_d)} onCancel={() => setEditMode(false)} />}
			{_title}
			{withWarning && _status != "published" && (
				<Tooltip content={`${_status} (needs to be published)`}>
					<i className="fas fa-exclamation-circle pointer p-1 text-danger" />
				</Tooltip>
			)}
			{onEdit && <i onClick={() => setEditMode(true)} className="fas fa-pencil-alt pointer p-1" />}
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
			{previewLink && (
				<i
					onClick={() => getLink(data).then(url => window.open(url))}
					className="fas fa-external-link-square-alt pointer p-1 text-secondary"
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
	previewLink: PropTypes.bool,
	withWarning: PropTypes.bool
};
ContentPiece.defaultProps = {
	onDelete: null,
	onEdit: null,
	status: null,
	previewLink: false,
	withWarning: false
};
export default ContentPiece;
