import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";

const ContentPiece = ({ data, onDelete }) => {
	const [{ isDragging }, drag] = useDrag({
		item: { type: data.type, data },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});
	let title = "";
	if (data && typeof data != "undefined") {
		if (typeof data.title != "undefined") title = data.title;
		else if (typeof data.info != "undefined") title = data.info.name;
	}
	if (title == "") title = "Undefined title";
	return (
		<li className="content-piece" ref={drag}>
			{title} {onDelete && <i onClick={() => onDelete(data)} className="fas fa-trash-alt pointer p-1" />}
		</li>
	);
};
ContentPiece.propTypes = {
	data: PropTypes.object,
	onDelete: PropTypes.func
};
ContentPiece.defaultProps = {
	onDelete: null
};
export default ContentPiece;
