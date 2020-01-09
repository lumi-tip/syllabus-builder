import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, type }) => {
	const [searchToken, setSearchToken] = useState(null);
	return (
		<ul>
			{pieces.length == 0 ? (
				<p>No {type.toLowerCase()} to show</p>
			) : (
				<p>
					{type + " "}
					<input
						placeholder={"Click to search..."}
						onChange={e => setSearchToken(e.target.value)}
						value={searchToken}
					/>
				</p>
			)}
			{pieces
				.filter(p => !searchToken || p.title.includes(searchToken))
				.map((l, i) => (
					<ContentPiece key={i} type={type} title={l.title} />
				))}
		</ul>
	);
};
ContentWidget.propTypes = {
	pieces: PropTypes.array,
	type: PropTypes.string
};

ContentWidget.defaultProps = {
	type: ""
};
export default ContentWidget;
