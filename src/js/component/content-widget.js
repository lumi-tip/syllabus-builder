import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, type, className, onRefresh, isExpanded, loading, onCollapse }) => {
	const [searchToken, setSearchToken] = useState("");
	const [tagToken, setTagToken] = useState(null);

	return (
		<div className={`content-widget ${className}`}>
			{pieces.length == 0 ? (
				<div>No {type.toLowerCase()} to show</div>
			) : (
				<div className="d-flex" style={{ overflow: "hidden" }}>
					{isExpanded ? (
						<input
							className="transparent ml-1 w-100"
							placeholder={`Search ${type}...`}
							onChange={e => setSearchToken(e.target.value)}
							value={searchToken}
						/>
					) : (
						<h3
							className="w-100"
							style={{ fontSize: "18px" }}
							onClick={() => {
								onCollapse();
							}}>
							{type + " "}
						</h3>
					)}
					{onRefresh && <i onClick={() => onRefresh()} className={"fas fa-sync fa-xs float-right " + (loading ? "loading" : "")} />}
				</div>
			)}
			{isExpanded && (
				<ul
					className="p-0 w-100"
					style={{
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
							console.log("piece: ", l);
							return <ContentPiece withWarning key={i} data={l} status={l.status} previewLink={true} />;
						})}
				</ul>
			)}
		</div>
	);
};
ContentWidget.propTypes = {
	pieces: PropTypes.array,
	type: PropTypes.string,
	onRefresh: PropTypes.func,
	onCollapse: PropTypes.func,
	className: PropTypes.string,
	loading: PropTypes.bool,
	isExpanded: PropTypes.bool
};

ContentWidget.defaultProps = {
	type: "",
	className: "",
	isExpanded: false,
	onRefresh: null,
	loading: false,
	pieces: []
};
export default ContentWidget;
