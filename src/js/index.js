//import react into the bundle
import React, { useContext, useState } from "react";
import ReactDOM from "react-dom";
import "bootstrap";
import "jquery";
import "../styles/index.scss";
import { Day, Sidebar } from "./component";
import { ContentContext, injectContent } from "./context.js";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { Notifier } from "bc-react-notifier";
import swal from "sweetalert";
import { useEffect } from "react";
import { TopBar } from "./component/topbar";
import { ExtendedInstructions } from "./component/modal";

//include your index.scss file into the bundle

const params = new URLSearchParams(window.location.search);
const API_KEY = params.get("token");

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);
	const [sidebarWidth, setSidebarWidth] = useState("350px");
	const [editExtendedDay, setEditExtendedDay] = useState(null);
	const sortedDays = store.days.sort((a, b) => (a.position < b.position ? -1 : 1));

	useEffect(() => {
		actions.getMe();

		window.onbeforeunload = function() {
			return "Are you sure you want to exit?";
		};
	}, []);

	if (!API_KEY)
		return (
			<div>
				Click here to <a href={`https://breathecode.herokuapp.com/v1/auth/view/login?url=${window.location.href}`}>log in</a>
			</div>
		);

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
					actions.days().update(editExtendedDay.id, { ...editExtendedDay, extended_instructions });
					closeInstructions(editExtendedDay);
				}}
				onCancel={() => closeInstructions(editExtendedDay)}
			/>
		);

	return (
		<>
			<DndProvider backend={Backend}>
				<div className="d-flex">
					<Sidebar content={store} width={sidebarWidth} onRefresh={type => actions.fetch([type], true)} />
					<div className="timeline" style={{ marginLeft: sidebarWidth }}>
						<Notifier />
						<TopBar />
						<div className="hbar" />
						{sortedDays.map((d, i) => (
							<div id={"day" + d.id.toString()} key={d.id.toString() + d.position.toString()}>
								<Day
									key={d.id.toString() + d.position.toString()}
									data={d}
									onEditInstructions={() => setEditExtendedDay({ ...d, scrollY: window.scrollY })}
									onMoveUp={() => {
										const other = store.days.find(_day => _day.position === d.position - 1);
										actions.days().update(d.id, { ...d, position: d.position - 1 });
										actions.days().update(other.id, { ...other, position: other.position + 1 });
									}}
									onMoveDown={() => {
										const other = store.days.find(_day => _day.position === d.position + 1);
										actions.days().update(d.id, { ...d, position: d.position + 1 });
										actions.days().update(other.id, { ...other, position: other.position - 1 });
									}}
									onDelete={id => {
										actions.days().delete(id);
									}}
								/>
								<div className="text-center">
									<i onClick={() => actions.days().add(i + 1)} className="fas fa-plus-circle pointer text-secondary" />
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
