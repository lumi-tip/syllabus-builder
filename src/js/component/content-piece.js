import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";

const urls = {
	lesson: "https://content.breatheco.de/lesson/",
	project: "https://projects.breatheco.de/project/",
	quiz: "https://assets.breatheco.de/apps/quiz/",
	replit: ""
};
const ContentPiece = ({ data, onDelete, previewLink }) => {
	const [{ isDragging }, drag] = useDrag({
		item: { type: data.type, data },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});
	const link = data => {
		const slug = data.type === "replit" ? data.value : data.slug !== undefined ? data.slug.split(".")[0] : data.info.slug;

		const url = typeof urls[data.type] !== "undefined" ? urls[data.type] + slug : "/undefined_url_for_" + data.type;
		console.log("the url: ", url);
		return url;
	};
	let title = "";
	if (data && typeof data != "undefined") {
		if (typeof data.title != "undefined") title = data.title;
		else if (typeof data.info != "undefined") title = data.info.name;
	}
	if (title == "") title = "Undefined title";
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
