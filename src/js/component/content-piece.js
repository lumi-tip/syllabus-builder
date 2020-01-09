import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDrag } from "react-dnd";

const ContentPiece = ({ title, type }) => {
	const [{ isDragging }, drag] = useDrag({
		item: { type },
		collect: monitor => ({
			isDragging: !!monitor.isDragging()
		})
	});
	return <li ref={drag}>{title}</li>;
};
ContentPiece.propTypes = {
	title: PropTypes.string,
	type: PropTypes.string
};

export default ContentPiece;
