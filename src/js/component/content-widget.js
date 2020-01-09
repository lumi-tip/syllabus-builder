import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, type }) => {
	const [searchToken, setSearchToken] = useState("");
	const [tagToken, setTagToken] = useState(null);
	const [collapsed, setCollapsed] = useState(true);
	const technologies = [...new Set(pieces.map(p => p.technology))];
	const tags = [...new Set([].concat.apply([], pieces.map(p => p.tags)))];
	return (
		<div className="content-widget">
			{pieces.length == 0 ? (
				<div>No {type.toLowerCase()} to show</div>
			) : (
				<div>
					<h3 onClick={() => setCollapsed(!collapsed)}>{type + " "}</h3>
					<input
						className="transparent"
						placeholder={"Click to search..."}
						onChange={e => setSearchToken(e.target.value)}
						value={searchToken}
					/>
					{type == "project" && (
						<select onChange={e => setTagToken(e.target.value)} value={tagToken}>
							<option key={0} value={null}>
								Technology
							</option>
							{technologies.map(t => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					)}
					{type == "lesson" && (
						<select onChange={e => setTagToken(e.target.value)} value={tagToken}>
							<option key={0} value={null}>
								Tag
							</option>
							{tags.map(t => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					)}
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
					.filter(p => {
						if (tagToken) {
							if (type === "lesson") return p.tags ? p.tags.includes(tagToken) : false;
							else if (type === "project") return p.technology === tagToken;
							else return true;
						}
						return true;
					})
					.map((l, i) => (
						<ContentPiece key={i} type={type} data={l} />
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
