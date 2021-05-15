import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, type, className, onRefresh, isExpanded, loading, onCollapse }) => {
	const [tagToken, setTagToken] = useState(null);

	return (
		<div className={`content-widget ${className}`}>
			{pieces.length == 0 ? (
				<div>No {type.toLowerCase()} to show</div>
			) : (
				<div className="d-flex" style={{ overflow: "hidden" }}>
					{!isExpanded && (
						<button className="btn btn-sm btn-dark w-100 text-left text-capitalize mb-2" onClick={() => onCollapse()}>
							{type + " "} <div className="badge badge-light bg-small float-right mt-1">{pieces.length} found</div>
						</button>
					)}
					{onRefresh && (
						<button className="btn btn-sm btn-dark" onClick={() => onRefresh()}>
							<i className={"fas fa-sync fa-xs float-right " + (loading ? "loading" : "")} />
						</button>
					)}
				</div>
			)}
			{isExpanded && (
				<ul
					className="p-0 w-100"
					style={{
						overflow: "auto"
					}}>
					{pieces
						.filter(p => {
							if (tagToken && tagToken !== "") {
								if (type === "lesson") return p.tags ? p.tags.includes(tagToken.toLowerCase()) : false;
								else if (type === "project") return p.technology.toLowerCase() === tagToken.toLowerCase();
								else return true;
							}
							return true;
						})
						.map((l, i) => {
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
