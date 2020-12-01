import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";
import { url } from "../constants/constans";

const urls = url;
const ContentPiece = ({ data, onDelete, previewLink }) => {
	let slug = "";
	// data.type === "quiz" && console.log(data, "contentPieces");
	const [{ isDragging }, drag] = useDrag({
		item: { type: data.type, data },
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
		// console.log("the url: ", url);
		return url;
	};
	// data.type == "quiz" && console.log(data);
	let title = "";
	if (data && typeof data !== "undefined") {
		if (typeof data.title !== "undefined") title = data.title;
		else if (typeof data.info !== "undefined") title = data.info.name !== undefined ? data.info.name : data.info.title;
	}
	if (title == "") title = "Undefined title";
	// console.log(title);
	return (
		<li className="content-piece" ref={drag}>
			{title}
			{onDelete && <i onClick={() => onDelete(data)} className="fas fa-trash-alt pointer p-1" />}
			{previewLink && <i onClick={() => window.open(link(data))} className="fas fa-external-link-square-alt pointer p-1 text-secondary" />}
		</li>
	);
};
ContentPiece.propTypes = {
	data: PropTypes.object,
	onDelete: PropTypes.func,
	previewLink: PropTypes.bool
};
ContentPiece.defaultProps = {
	onDelete: null,
	previewLink: false
};
export default ContentPiece;
