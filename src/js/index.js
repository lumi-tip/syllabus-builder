//import react into the bundle
import React, { useContext, useState } from "react";
import ReactDOM from "react-dom";
import "bootstrap";
import "jquery";
import "../styles/index.scss";
import { Day, ContentWidget, UploadSyllabus, SyllabusDetails } from "./component";
import { ContentContext, injectContent } from "./context.js";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { Notifier, Notify } from "bc-react-notifier";
import swal from "sweetalert";

//include your index.scss file into the bundle

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);
	const [state, setState] = useState(false);
	const sortedDays = store.days.sort((a, b) => (a.position < b.position ? -1 : 1));
	const confirmSaveSillabus = () => {
		if (store.info.slug !== "" && store.days.length > 0) {
			swal({
				title: "Are you sure?",
				text: "Once saved, you will be creating a new syllabus version",
				icon: "warning",
				buttons: true,
				dangerMode: true
			}).then(willSave => {
				if (willSave) {
					actions.saveSyllabus();
					swal("New syllabus version saved successfully", {
						icon: "success"
					});
				} else {
					swal("Operation canceled by user");
				}
			});
		} else if (store.info.slug === "") {
			swal({
				title: "Syllabus details can't be empty",
				text: "Please fill the syllabus details to save",
				icon: "error",
				button: "OK"
			});
		} else if (store.days.length === 0) {
			swal({
				title: "Syllabus without days",
				text: "A new syllabus version can't be saved without days, please add new days to the syllabus",
				icon: "error",
				button: "OK"
			});
		}
	};
	const confirmEditSillabus = () => {
		if (store.info.slug !== "" && store.days.length > 0) {
			swal({
				title: "Are you sure?",
				text: "Once saved, you will be creating a new syllabus version",
				icon: "warning",
				buttons: true,
				dangerMode: true
			}).then(willEdit => {
				if (willEdit) {
					actions.editSyllabus();
					swal("New syllabus version was edited successfully", {
						icon: "success"
					});
				} else {
					swal("Operation canceled by user");
				}
			});
		} else if (store.info.slug === "") {
			swal({
				title: "Syllabus details can't be empty",
				text: "Please fill the syllabus details to save",
				icon: "error",
				button: "OK"
			});
		} else if (store.days.length === 0) {
			swal({
				title: "Syllabus without days",
				text: "A new syllabus version can't be saved without days, please add new days to the syllabus",
				icon: "error",
				button: "OK"
			});
		}
	};
	return (
		<>
			<DndProvider backend={Backend}>
				<div className="row no-gutters">
					<div className="left-side col-4 col-md-3 bg-light pt-0">
						<div className="content lessons">
							<ContentWidget
								type="lesson"
								contentHeight="calc(22vh - 50px)"
								pieces={store.lessons}
								onRefresh={() => actions.fetch(["lesson"], true)}
							/>
						</div>
						<div className="content replits">
							<ContentWidget
								type="replit"
								contentHeight="calc(22vh - 50px)"
								pieces={store.replits}
								onRefresh={() => actions.fetch(["replit"], true)}
							/>
						</div>
						<div className="content projects">
							<ContentWidget
								type="project"
								contentHeight="calc(22vh - 50px)"
								pieces={store.projects}
								onRefresh={() => actions.fetch(["project"], true)}
							/>
						</div>
						<div className="content quizzes">
							<ContentWidget
								type="quiz"
								contentHeight="calc(22vh - 50px)"
								pieces={store.quizzes}
								onRefresh={() => actions.fetch(["quiz"])}
							/>
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
							<button className="btn btn-primary btn-sm mr-2" onClick={() => confirmEditSillabus()}>
								<i className="fas fa-save" /> Edit Syllabus
							</button>

							<button className="btn btn-primary btn-sm mr-2" onClick={() => confirmSaveSillabus()}>
								<i className="fas fa-save" /> Save Syllabus
							</button>

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
		</>
	);
});

//render your react application
ReactDOM.render(<Main />, document.querySelector("#app"));
