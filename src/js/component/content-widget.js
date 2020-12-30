import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, type, className, onRefresh, contentHeight }) => {
	const [searchToken, setSearchToken] = useState("");
	const [tagToken, setTagToken] = useState(null);
	const [collapsed, setCollapsed] = useState(true);
	const technologies = [...new Set(pieces.map(p => p.technology))];
	const tags = [...new Set([].concat.apply([], pieces.map(p => p.tags)))].map(t => (t ? t.toLowerCase() : ""));
	return (
		<div className={`content-widget ${className}`}>
			{pieces.length == 0 ? (
				<div>No {type.toLowerCase()} to show</div>
			) : (
				<div>
					<h3 onClick={() => setCollapsed(!collapsed)}>{type + " "}</h3>
					<input
						className="transparent ml-1"
						placeholder={"Click to search..."}
						onChange={e => setSearchToken(e.target.value)}
						value={searchToken}
					/>
					{onRefresh && <i onClick={() => onRefresh()} className="fas fa-sync fa-xs float-right" />}
					{type == "project" && (
						<select className="form-control" onChange={e => setTagToken(e.target.value)} value={tagToken}>
							<option key={0} value={""}>
								Technology
							</option>
							{technologies.map((t, i) => (
								<option key={i} value={t}>
									{t}
								</option>
							))}
						</select>
					)}
					{type == "lesson" && (
						<select className="form-control" onChange={e => setTagToken(e.target.value)} value={tagToken}>
							<option key={0} value={""}>
								Tag
							</option>
							{tags.map((t, i) => (
								<option key={i} value={t}>
									{t}
								</option>
							))}
						</select>
					)}
				</div>
			)}
			<ul
				className="p-0 w-100"
				style={{
					maxHeight: collapsed ? contentHeight : "90vh",
					overflow: "auto"
				}}>
				{pieces
					.filter(
						p =>
							!searchToken.toLowerCase() ||
							(p.slug && p.slug.includes(searchToken)) ||
							(p.title && p.title.toLowerCase().includes(searchToken)) ||
							(p.info && p.info.name && p.info.name.toLowerCase().includes(searchToken))
					)
					.filter(p => {
						if (tagToken && tagToken !== "") {
							if (type === "lesson") return p.tags ? p.tags.includes(tagToken.toLowerCase()) : false;
							else if (type === "project") return p.technology.toLowerCase() === tagToken.toLowerCase();
							else return true;
						}
						return true;
					})
					.map((l, i) => {
						return <ContentPiece key={i} data={l} previewLink={true} />;
					})}
			</ul>
		</div>
	);
};
ContentWidget.propTypes = {
	pieces: PropTypes.array,
	type: PropTypes.string,
	onRefresh: PropTypes.func,
	className: PropTypes.string,
	contentHeight: PropTypes.string
};

ContentWidget.defaultProps = {
	type: "",
	className: "",
	contentHeight: "",
	onRefresh: null,
	pieces: []
};
export default ContentWidget;
