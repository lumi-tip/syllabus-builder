import React, { useState } from "react";
import PropTypes from "prop-types";
import ContentPiece from "./content-piece.js";

const ContentWidget = ({ pieces, total, type, className, onRefresh, isExpanded, loading, onCollapse, onEdit, onSwap }) => {
	const [tagToken, setTagToken] = useState(null);

	return (
		<div className={`content-widget ${className}`}>
			<div className="d-flex" style={{ overflow: "hidden" }}>
				{!isExpanded && (
					<button className="btn btn-sm btn-dark w-100 text-left text-capitalize mb-2" onClick={() => onCollapse()}>
						{type + " "} <div className="badge badge-light bg-small float-right mt-1">{total} found</div>
					</button>
				)}
				{onRefresh && (
					<button className="btn btn-sm btn-dark" onClick={() => onRefresh()}>
						<i className={"fas fa-sync fa-xs float-right " + (loading ? "loading" : "")} />
					</button>
				)}
			</div>
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
						.map((l, i, _pieces) => {
							return (
								<ContentPiece
									withWarning
									withSwap={onSwap !== undefined}
									key={i}
									data={l}
									status={l.status}
									onEdit={data => onEdit(data)}
									onUp={() => onSwap(_pieces[i], _pieces[i - 1])}
									onDown={() => onSwap(_pieces[i], _pieces[i + 1])}
								/>
							);
						})}
				</ul>
			)}
		</div>
	);
};
ContentWidget.propTypes = {
	pieces: PropTypes.array,
	total: PropTypes.number,
	type: PropTypes.string,
	onRefresh: PropTypes.func,
	onEdit: PropTypes.func,
	onSwap: PropTypes.func,
	onCollapse: PropTypes.func,
	className: PropTypes.string,
	loading: PropTypes.bool,
	isExpanded: PropTypes.bool
};

ContentWidget.defaultProps = {
	type: "",
	total: 0,
	className: "",
	isExpanded: false,
	onRefresh: null,
	loading: false,
	pieces: []
};
export default ContentWidget;
