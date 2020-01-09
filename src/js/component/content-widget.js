import React, { useState } from "react";
import PropTypes from "prop-types";

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
						placeHolder={"Click to search..."}
						onChange={e => setSearchToken(e.target.value)}
						value={searchToken}
					/>
				</p>
			)}
			{pieces
				.filter(p => !searchToken || p.title.includes(searchToken))
				.map((l, i) => (
					<li key={i}>{l.title}</li>
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
