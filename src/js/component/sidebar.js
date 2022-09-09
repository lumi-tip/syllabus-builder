import React, { useState } from "react";
import PropTypes from "prop-types";
import { ContentWidget } from "./";
import { mappers } from "./utils";
import EditContentPiece from "./modals/EditContentPiece";
import { useToasts } from "react-toast-notifications";

const Sidebar = ({ content, onRefresh, onCreateAsset, width }) => {
	const { addToast } = useToasts();
	const [currentType, setCurrentType] = useState(null);
	const [editAsset, setEditAsset] = useState(null);
	const [searchToken, setSearchToken] = useState("");
	const [loading, setLoading] = useState(false);
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
				<p className="m-0 p-2">Registry</p>
			)}
			{mappers
				.filter(w => !currentType || w.type === currentType)
				.map(w => (
					<div key={w.type} className={`content ${w.storeName}`}>
						<ContentWidget
							type={w.type}
							isExpanded={w.type === currentType}
							onCollapse={() => setCurrentType(w.type)}
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
	onRefresh: PropTypes.func,
	onCreateAsset: PropTypes.func,
	content: PropTypes.object,
	width: PropTypes.string
};
Sidebar.defaultProps = {
	onRefresh: null,
	onCreateAsset: null,
	width: "300px",
	content: {}
};
export default Sidebar;
