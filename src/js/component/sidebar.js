import React, { useState } from "react";
import PropTypes from "prop-types";
import { ContentWidget } from "./";
import { mappers } from "./utils";
import SearchInput from "./searchInput";
import EditContentPiece from "./modals/EditContentPiece";
import { useToasts } from "react-toast-notifications";

const Sidebar = ({ content, onCollapse, width, onSearch }) => {
	const { addToast } = useToasts();
	const [currentType, setCurrentType] = useState(null);
	const [editAsset, setEditAsset] = useState(null);
	const [searchToken, setSearchToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	if (collapsed)
		return (
			<button
				className="btn btn-sm btn-dark br-0 back-btn position-fixed sidebar-btn"
				onClick={() => setCollapsed(!collapsed) || onCollapse(!collapsed)}>
				<i className="fas fa-plus-circle"></i> Add content
			</button>
		);

	return (
		<div className="sidebar position-fixed" style={{ width }}>
			{editAsset && <EditContentPiece style={{ position: "static" }} defaultValue={editAsset} onCancel={() => setEditAsset(null)} />}
			{currentType ? (
				<div className="d-flex mb-2">
					<button
						style={{
							width: "90px"
						}}
						className="btn btn-sm btn-dark br-0 back-btn"
						onClick={() => {
							setSearchToken("");
							setCurrentType(null);
						}}>
						<i className="fas fa-angle-left"></i> Back
					</button>
					<SearchInput
						className="search w-100"
						placeholder={`Search ${currentType}...`}
						onSearch={_keyword => {
							onSearch(currentType, _keyword);
							setSearchToken(_keyword);
						}}
					/>
					<button
						className="btn btn-sm btn-dark"
						onClick={() => {
							setLoading(true);
							Promise.all(onSearch(currentType, searchToken)).then(() => {
								setLoading(false);
								addToast(`Sync ${currentType} successfully`, {
									appearance: "success"
								});
							});
						}}>
						<i className={"fas fa-sync" + (loading ? " spin" : "")}></i>
					</button>
					<button
						className="btn btn-sm btn-dark"
						onClick={() => {
							setEditAsset({
								custom: true,
								type: currentType,
								addToRegistry: true,
								target: "blank",
								translations: {},
								technologies: []
							});
						}}>
						<i className="fas fa-plus"></i>
					</button>
				</div>
			) : (
				<div className="d-flex">
					<p className="m-0 p-2 w-100">Registry</p>
					<button
						style={{
							width: "90px"
						}}
						className="btn btn-sm btn-dark btn-black br-0 back-btn m-2"
						onClick={() => setCollapsed(!collapsed) || onCollapse(!collapsed)}>
						<i className="fas fa-angle-double-left"></i>
					</button>
				</div>
			)}
			{mappers
				.filter(w => !currentType || w.type === currentType)
				.map(w => (
					<div key={w.type} className={`content ${w.storeName}`}>
						<ContentWidget
							type={w.type}
							isExpanded={w.type === currentType}
							onCollapse={() => setCurrentType(w.type)}
							total={content[w.storeName + "Total"]}
							pieces={content[w.storeName].filter(p => {
								return (
									!searchToken.toLowerCase() ||
									(p.slug && typeof p.slug === "object" ? p.slug.slug.includes(searchToken) : p.slug.includes(searchToken)) ||
									(p.title && p.title.toLowerCase().includes(searchToken)) ||
									(p.info && p.info.name && p.info.name.toLowerCase().includes(searchToken))
								);
							})}
							onEdit={_asset => {
								setEditAsset({
									..._asset,
									addToRegistry: true
								});
							}}
						/>
					</div>
				))}
		</div>
	);
};
Sidebar.propTypes = {
	onSearch: PropTypes.func,
	onCollapse: PropTypes.func,
	content: PropTypes.object,
	width: PropTypes.string
};
Sidebar.defaultProps = {
	onSearch: null,
	onCollapse: null,
	width: "300px",
	content: {}
};
export default Sidebar;
