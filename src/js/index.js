//import react into the bundle
import React, { useContext, useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap";
import "jquery";
import "../styles/index.scss";
import { Day, Sidebar } from "./component";
import { ContentContext, injectContent } from "./context.js";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Notifier } from "bc-react-notifier";
import { useEffect } from "react";
import { TopBar } from "./component/topbar";
import { ExtendedInstructions } from "./component/modal";
import NewDay from "./component/modals/NewDayModal";
import getCurrentUrl from "./utils/get-current-url";

//include your index.scss file into the bundle

const apiUrl = (process.env.API_URL || "https://breathecode.herokuapp.com").replace(/\/$/, "");

const params = new URLSearchParams(window.location.search);
const API_KEY = params.get("token");

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);
	const [sidebarWidth, setSidebarWidth] = useState("350px");
	const [editExtendedDay, setEditExtendedDay] = useState(null);
	const [openNewDay, setOpenNewDay] = useState(false);
	const [index, setIndex] = useState(0);
	const sortedDays = store.days.sort((a, b) => (a.position < b.position ? -1 : 1));
	const notInfoEmpty = key => store.info[key] && store.info[key] !== undefined && store.info[key] != "";

	useEffect(() => {
		actions.getMe();
		if (process.env.ENV !== "development")
			window.onbeforeunload = function () {
				return "Are you sure you want to exit?";
			};
	}, []);

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
			<DndProvider backend={HTML5Backend}>
				<div className="d-flex">
					<Sidebar
						content={store}
						width={sidebarWidth}
						onRefresh={type => actions.fetch([type], true)}
						onCreateAsset={async piece => await actions.database().add(piece)}
					/>
					<div className="timeline" style={{ marginLeft: sidebarWidth }}>
						<Notifier />
						<TopBar />
						<div className="hbar" />
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
createRoot(document.querySelector("#app")).render(<Main/>);
