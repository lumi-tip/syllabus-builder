import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { url } from "../constants/constans";
import { Tooltip } from "react-lightweight-tooltip";
import EditContentPiece from "./modals/EditContentPiece";
import { getTitle, getStatus } from "./utils";

const urls = url;
const ContentPiece = ({ data, onDelete, onEdit, status, previewLink, withWarning }) => {
	const [editMode, setEditMode] = useState(false);
	let slug = "";
	const [{ isDragging }, drag] = useDrag({
		item: { type: data.type, data, status },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});
	const link = data => {
		if (data.type !== "quiz") {
			slug = data.type === "replit" ? data.value : data.slug !== undefined ? data.slug.split(".")[0] : data.info.slug;
		} else {
			slug = data.info.slug;
		}

		const url = typeof urls[data.type] !== "undefined" ? urls[data.type] + slug : "/undefined_url_for_" + data.type;
		return url;
	};

	let _title = getTitle(data);
	let _status = getStatus(data);

	return (
		<li className="content-piece" ref={drag}>
			{editMode && <EditContentPiece defaultValue={data} onSave={_d => setEditMode(false) || onEdit(_d)} onCancel={() => setEditMode(false)} />}
			{_title}
			{withWarning &&
				_status != "published" && (
					<Tooltip content={`${_status} (needs to be published)`}>
						<i className="fas fa-exclamation-circle pointer p-1 text-danger" />
					</Tooltip>
				)}
			{onDelete && <i onClick={() => onDelete(data)} className="fas fa-trash-alt pointer p-1" />}
			{onEdit && <i onClick={() => setEditMode(true)} className="fas fa-pencil-alt pointer p-1" />}
			{previewLink && <i onClick={() => window.open(link(data))} className="fas fa-external-link-square-alt pointer p-1 text-secondary" />}
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
