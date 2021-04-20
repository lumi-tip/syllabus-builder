import React from "react";
import PropTypes from "prop-types";
import { ContentWidget } from "./";
import { mappers } from "./utils";

const Sidebar = ({ content, onRefresh }) => {
	const [expandedItem, setExpanded] = React.useState(null);
	return (
		<div className="left-side col-4 col-md-3 bg-light pt-0">
			{expandedItem && (
				<button className="btn btn-sm btn-dark w-100 br-0" onClick={() => setExpanded(null)}>
					Show all widgets
				</button>
			)}
			{mappers
				.filter(w => !expandedItem || w.type === expandedItem)
				.map(w => (
					<div key={w.type} className={`content ${w.storeName}`}>
						<ContentWidget
							type={w.type}
							isExpanded={expandedItem === w.type}
							onCollapse={() => setExpanded(expandedItem === w.type ? null : w.type)}
							pieces={content[w.storeName]}
							onRefresh={() => onRefresh(w.type)}
						/>
					</div>
				))}
		</div>
	);
};
Sidebar.propTypes = {
	onRefresh: PropTypes.func,
	content: PropTypes.object
};
Sidebar.defaultProps = {
	onRefresh: null,
	content: {}
};
export default Sidebar;
