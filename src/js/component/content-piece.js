import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { url } from "../constants/constans";
import { Tooltip } from "react-lightweight-tooltip";

const urls = url;
const ContentPiece = ({ data, onDelete, status, previewLink, withWarning }) => {
	let slug = "";
	// data.type === "quiz" && console.log(data, "contentPieces");
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
	let title = "";
	if (data && typeof data !== "undefined") {
		if (typeof data.title !== "undefined") title = data.title;
		else if (typeof data.info !== "undefined") title = data.info.name || data.info.title || data.info.slug;
	}
	if (title == "") {
		console.error("There is undefined title for: ", data);
		title = "Undefined title";
	}

	let _status = "published";
	if (data.type === "lesson" || data.type === "project") {
		_status = data.status && data.status != "undefined" ? data.status : status;
	}
	return (
		<li className="content-piece" ref={drag}>
			{title}
			{withWarning &&
				_status != "published" && (
					<Tooltip content={`${_status} (needs to be published)`}>
						<i className="fas fa-exclamation-circle pointer p-1 text-danger" />
					</Tooltip>
				)}
			{onDelete && <i onClick={() => onDelete(data)} className="fas fa-trash-alt pointer p-1" />}
			{previewLink && <i onClick={() => window.open(link(data))} className="fas fa-external-link-square-alt pointer p-1 text-secondary" />}
		</li>
	);
};
ContentPiece.propTypes = {
	data: PropTypes.object,
	status: PropTypes.string,
	onDelete: PropTypes.func,
	previewLink: PropTypes.bool,
	withWarning: PropTypes.bool
};
ContentPiece.defaultProps = {
	onDelete: null,
	status: null,
	previewLink: false,
	withWarning: false
};
export default ContentPiece;
