import React, { useState } from "react";
import PropTypes from "prop-types";
import { ContentWidget } from "./";
import { mappers } from "./utils";
import { useToasts } from "react-toast-notifications";

const Sidebar = ({ content, onRefresh, width }) => {
	const { addToast } = useToasts();
	const [currentType, setCurrentType] = useState(null);
	const [searchToken, setSearchToken] = useState("");
	const [loading, setLoading] = useState(false);
	return (
		<div className="sidebar position-fixed" style={{ width }}>
			{currentType ? (
				<div className="d-flex mb-2">
					<button className="btn btn-sm btn-dark br-0 back-btn" onClick={() => setCurrentType(null)}>
						<i className="fas fa-angle-left"></i> Back
					</button>
					<input
						className="search w-100"
						placeholder={`Search ${currentType}...`}
						onChange={e => setSearchToken(e.target.value)}
						value={searchToken}
					/>
					<button
						className="btn btn-sm btn-dark"
						onClick={() => {
							setLoading(true);
							Promise.all(onRefresh(currentType)).then(() => {
								setLoading(false);
								addToast("Sync successfully", { appearance: "success" });
							});
						}}>
						<i className={"fas fa-sync" + (loading ? " spin" : "")}></i>
					</button>
				</div>
			) : (
				<h2>Add a new...</h2>
			)}
			{mappers
				.filter(w => !currentType || w.type === currentType)
				.map(w => (
					<div key={w.type} className={`content ${w.storeName}`}>
						<ContentWidget
							type={w.type}
							isExpanded={w.type === currentType}
							onCollapse={() => setCurrentType(w.type)}
							pieces={content[w.storeName].filter(
								p =>
									!searchToken.toLowerCase() ||
									(p.slug && p.slug.includes(searchToken)) ||
									(p.title && p.title.toLowerCase().includes(searchToken)) ||
									(p.info && p.info.name && p.info.name.toLowerCase().includes(searchToken))
							)}
						/>
					</div>
				))}
		</div>
	);
};
Sidebar.propTypes = {
	onRefresh: PropTypes.func,
	content: PropTypes.object,
	width: PropTypes.string
};
Sidebar.defaultProps = {
	onRefresh: null,
	width: "300px",
	content: {}
};
export default Sidebar;
