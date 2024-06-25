import React, { useState } from "react";
import PropTypes from "prop-types";
import { ContentWidget } from "./";
import { mappers } from "./utils";
import SearchInput from "./searchInput";
import EditContentPiece from "./modals/EditContentPiece";
import { useToasts } from "react-toast-notifications";

const params = new URLSearchParams(window.location.search);

const Sidebar = ({ content, onCollapse, width, onSearch }) => {
	const { addToast } = useToasts();
	const [currentType, setCurrentType] = useState(null);
	const [editAsset, setEditAsset] = useState(null);
	const [searchFilters, setSearchFilters] = useState({
		keyword: "",
		academy: null
	});
	const [loading, setLoading] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const academyFromUrl = params.get("academy");
	console.log("academyFromUrl", academyFromUrl);
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
				<div>
					<div className="d-flex mb-2">
						<button
							style={{
								width: "90px"
							}}
							className="btn btn-sm btn-dark br-0 back-btn"
							onClick={() => {
								setSearchFilters({ ...searchFilters, keyword: "" });
								setCurrentType(null);
							}}>
							<i className="fas fa-angle-left"></i> Back
						</button>
						<div className="w-100">&nbsp;</div>
						<button
							className="btn btn-sm btn-dark"
							onClick={() => {
								setLoading(true);
								Promise.all(onSearch(currentType, searchFilters)).then(() => {
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
					<div className="input-group mb-3">
						<div className="input-group-prepend">
							<button className="btn btn-dark dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="false">
								{searchFilters.academy ? "Mine" : "All"}
							</button>
							<div className="dropdown-menu">
								<a
									className="dropdown-item"
									href="#"
									onClick={e => {
										e.preventDefault();
										setSearchFilters({ ...searchFilters, academy: searchFilters.academy ? null : academyFromUrl });
									}}>
									{searchFilters.academy ? `All shared ${currentType}'s` : "From my academy only"}
								</a>
							</div>
						</div>
						<SearchInput
							className="form-control"
							placeholder={`Search ${currentType}...`}
							onSearch={_keyword => {
								const _newSearch = { ...searchFilters, keyword: _keyword };
								onSearch(currentType, _newSearch);
								setSearchFilters(_newSearch);
							}}
						/>
					</div>
					You have to type to load the {currentType}s
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
							pieces={content[w.storeName]}
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
