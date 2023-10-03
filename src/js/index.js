//import react into the bundle
import React, { useContext, useState } from "react";
import ReactDOM from "react-dom";
import "bootstrap";
import "jquery";

import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/index.css";
import "../styles/_modals.css";
import "../styles/_sidebar.css";
import "../styles/_timeline.css";

import { Day, Sidebar } from "./component";
import { ContentContext, injectContent } from "./context.js";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { Notifier } from "bc-react-notifier";
import swal from "sweetalert";
import { useEffect } from "react";
import { TopBar } from "./component/topbar";
import { ExtendedInstructions } from "./component/modal";
import NewDay from "./component/modals/NewDayModal";
import API from "./api.js";
import { getCurrentUrl, getUrlParams } from "./utils/url";

//include your index.scss file into the bundle
const SIDEBAR_WIDTH = "300px";

const apiUrl = (process.env.API_URL || "https://breathecode.herokuapp.com").replace(/\/$/, "");

const params = new URLSearchParams(window.location.search);
const API_KEY = params.get("token");

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);

	const [collapsed, setCollapsed] = useState(true);
	const [editExtendedDay, setEditExtendedDay] = useState(null);
	const [openNewDay, setOpenNewDay] = useState(false);
	const [index, setIndex] = useState(0);
	const sortedDays = store.days.sort((a, b) => (a.position < b.position ? -1 : 1));
	const notInfoEmpty = key => store.info[key] && store.info[key] !== undefined && store.info[key] != "";

	const academyFromUrl = params.get("academy");
	const readOnly = (!academyFromUrl && typeof academyFromUrl == undefined) || store.info?.academy_author != params.get("academy");

	useEffect(() => {
		actions.getMe();
		if (process.env.ENV !== "development")
			window.onbeforeunload = function() {
				return "Are you sure you want to exit?";
			};
	}, []);

	useEffect(() => {
		if (!readOnly) setCollapsed(false);
	}, [readOnly]);

	if (!API_KEY) {
		const callbackUrl = getCurrentUrl();
		return (
			<div>
				Click here to <a href={`${apiUrl}/v1/auth/view/login?url=${callbackUrl}`}>log in</a>
			</div>
		);
	}

	const closeInstructions = editExtendedDay => {
		setTimeout(() => {
			if (editExtendedDay.scrollY) window.scrollTo(0, editExtendedDay.scrollY);
		}, 300);
		setEditExtendedDay(null);
	};
	if (editExtendedDay)
		return (
			<ExtendedInstructions
				dayNumber={editExtendedDay.position}
				defaultValue={editExtendedDay.extended_instructions}
				onSave={extended_instructions => {
					actions.days().update(editExtendedDay.id, {
						...editExtendedDay,
						extended_instructions
					});
					closeInstructions(editExtendedDay);
				}}
				onCancel={() => closeInstructions(editExtendedDay)}
			/>
		);

	return (
		<>
			<DndProvider backend={Backend}>
				<div className="d-flex">
					{!readOnly && (
						<Sidebar
							content={store}
							readOnly={readOnly}
							onRefresh={type => actions.fetch([type], true)}
							onCreateAsset={async piece => await actions.database().add(piece)}
							onCollapse={() => setCollapsed(!collapsed)}
						/>
					)}
					<div className="timeline" style={{ marginLeft: collapsed ? 0 : SIDEBAR_WIDTH }}>
						<Notifier />
						<TopBar readOnly={readOnly} />
						{readOnly ? (
							<div className="alert alert-warning m-0 rounded-0">
								{!academyFromUrl && <p className="m-0">Please specify your academy id on the URL QueryString.</p>}
								<span>You cannot update this syllabus, read only mode is active.</span>
							</div>
						) : (
							<div className="hbar" />
						)}

						{openNewDay && <NewDay onConfirm={() => setOpenNewDay(false)} store={store} actions={actions} index={index} />}
						{sortedDays.length === 0 &&
							notInfoEmpty("profile") &&
							notInfoEmpty("academy_author") &&
							notInfoEmpty("slug") &&
							notInfoEmpty("version") && (
								<div className="text-center">
									<i
										onClick={() => {
											setOpenNewDay(true);
											setIndex(null);
										}}
										className="fas fa-plus-circle pointer text-secondary"
									/>
								</div>
							)}
						{sortedDays.map((d, i) => (
							<div id={"day" + d.id.toString()} key={d.id.toString() + d.position.toString()}>
								<Day
									key={d.id.toString() + d.position.toString()}
									data={d}
									onEditInstructions={() =>
										setEditExtendedDay({
											...d,
											scrollY: window.scrollY
										})
									}
									onMoveUp={() => {
										const other = store.days.find(_day => _day.position === d.position - 1);
										actions.days().update(d.id, {
											...d,
											position: d.position - 1
										});
										actions.days().update(other.id, {
											...other,
											position: other.position + 1
										});
									}}
									onMoveDown={() => {
										const other = store.days.find(_day => _day.position === d.position + 1);
										actions.days().update(d.id, {
											...d,
											position: d.position + 1
										});
										actions.days().update(other.id, {
											...other,
											position: other.position - 1
										});
									}}
									onDelete={id => {
										actions.days().delete(id);
									}}
								/>

								<div className="text-center">
									<i
										onClick={() => {
											setOpenNewDay(true);
											setIndex(i);
										}}
										className="fas fa-plus-circle pointer text-secondary"
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</DndProvider>
		</>
	);
});

//render your react application
ReactDOM.render(<Main />, document.querySelector("#app"));
