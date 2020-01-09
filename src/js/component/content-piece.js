import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";

const ContentPiece = ({ title, type, data, onDelete }) => {
	const [{ isDragging }, drag] = useDrag({
		item: { type, data },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});
	return (
		<li className="content-piece" ref={drag}>
			{title}{" "}
			{onDelete && (
				<i
					onClick={() => onDelete(data)}
					className="fas fa-trash-alt"
				/>
			)}
		</li>
	);
};
ContentPiece.propTypes = {
	title: PropTypes.string,
	type: PropTypes.string,
	data: PropTypes.object,
	onDelete: PropTypes.func
};
ContentPiece.defaultProps = {
	onDelete: null
};
export default ContentPiece;
