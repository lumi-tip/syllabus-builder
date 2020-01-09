import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, type }) => {
	const [searchToken, setSearchToken] = useState(null);
	const [collapsed, setCollapsed] = useState(true);
	return (
		<div className="content-widget">
			{pieces.length == 0 ? (
				<div>No {type.toLowerCase()} to show</div>
			) : (
				<div>
					<h3 onClick={() => setCollapsed(!collapsed)}>
						{type + " "}
					</h3>
					<input
						placeholder={"Click to search..."}
						onChange={e => setSearchToken(e.target.value)}
						value={searchToken}
					/>
				</div>
			)}
			<ul
				className="p-0"
				style={{
					height: collapsed ? "100px" : "400px",
					overflow: "auto"
				}}>
				{pieces
					.filter(p => !searchToken || p.title.includes(searchToken))
					.map((l, i) => (
						<ContentPiece
							key={i}
							type={type}
							title={l.title}
							data={l}
						/>
					))}
			</ul>
		</div>
	);
};
ContentWidget.propTypes = {
	pieces: PropTypes.array,
	type: PropTypes.string
};

ContentWidget.defaultProps = {
	type: "",
	pieces: []
};
export default ContentWidget;
