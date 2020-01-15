//import react into the bundle
import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../styles/index.scss";
import { Day, ContentWidget, UploadSyllabus, SyllabusDetails } from "./component";
import { ContentContext, injectContent } from "./context.js";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { Notifier, Notify } from "bc-react-notifier";
//include your index.scss file into the bundle

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);

	useEffect(() => {
		actions.fetch(["lesson", "quiz", "project", "replit", "profile"]);
	}, []);
	const sortedDays = store.days.sort((a, b) => (a.position < b.position ? -1 : 1));
	return (
		<DndProvider backend={Backend}>
			<div className="row no-gutters">
				<div className="left-side col-4 col-md-3 bg-light pt-0">
					<div className="content lessons">
						<ContentWidget className="w-100" type="lesson" pieces={store.lessons} />
					</div>
					<div className="content replits">
						<ContentWidget className="w-100" type="replit" pieces={store.replits} />
					</div>
					<div className="content projects">
						<ContentWidget className="w-100" type="project" pieces={store.projects} />
					</div>
					<div className="content quizzes">
						<ContentWidget className="w-100" type="quiz" pieces={store.quizzes} />
					</div>
				</div>
				<div className="right-side offset-4 offset-md-3 col-8 col-md-9 p-3 pt-0">
					<Notifier />
					{store.info.label &&
						store.info.label != "" && (
							<div>
								{store.info.label}: {store.info.slug}
							</div>
						)}
					<div className="text-right mb-2 mt-3">
						<button className="btn btn-dark btn-sm" onClick={() => actions.days().add()}>
							<i className="fas fa-plus" /> Add new day
						</button>
						<button
							className="btn btn-dark btn-sm"
							onClick={() => {
								let noti = Notify.add(
									"info",
									UploadSyllabus,
									answer => {
										if (answer.value) actions.upload(answer.url);
										noti.remove();
									},
									9999999999999
								);
							}}>
							<i className="fas fa-file-upload" /> Upload Syllabus
						</button>
						<button className="btn btn-dark btn-sm" onClick={() => actions.download()}>
							<i className="fas fa-file-download" /> Download Syllabus
						</button>
						<button
							className="btn btn-dark btn-sm"
							onClick={() => {
								let noti = Notify.add(
									"info",
									SyllabusDetails,
									answer => {
										if (answer.value) actions.setInfo(answer.data);
										noti.remove();
									},
									9999999999999
								);
							}}>
							<i className="fas fa-bars" /> Details
						</button>
					</div>
					{sortedDays.map((d, i) => (
						<Day
							key={d.id.toString() + d.position.toString()}
							data={d}
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
					))}
				</div>
			</div>
		</DndProvider>
	);
});

//render your react application
ReactDOM.render(<Main />, document.querySelector("#app"));
