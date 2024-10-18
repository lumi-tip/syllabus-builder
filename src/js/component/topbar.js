import React, { useContext, useState } from "react";
import { ContentContext } from "../context.js";
import Swal from "sweetalert2";
import { Notify } from "bc-react-notifier";
import { UploadSyllabus, SyllabusDetails } from "./modal";
import SearchSyllabus from "./modals/SearchOnSyllabus";
import NewDay from "../component/modals/NewDayModal";

export const TopBar = () => {
	const { store, actions } = useContext(ContentContext);
	const [openNoti, setOpenNoti] = useState(false);
	const [openSearchOnSyllabus, setOpenSearchOnSyllabus] = useState(false);
	const [syllabusStatus, setSyllabusStatus] = useState({
		status: "btn-dark",
		messages: []
	});
	const [openSyllabusDetails, setOpenSyllabusDetails] = useState(false);
	const notInfoEmpty = key => store.info[key] && store.info[key] !== undefined && store.info[key] != "";
	const academy = store.academies.find(a => a.id == store.info.academy_author);
	return (
		<div className="topbar text-right px-3 pt-1 pb-2 position-sticky sticky-top bg-light">
			{openSyllabusDetails && <SyllabusDetails onConfirm={confirm => setOpenSyllabusDetails(false)} />}
			{openSearchOnSyllabus && <SearchSyllabus actions={actions} onCancel={() => setOpenSearchOnSyllabus(false)} />}
			<div className="d-flex">
				<p className="m-0 p-0 text-left w-100">Academy: {academy ? academy.name : "Uknown"}</p>
				<div
					style={{ width: "100px" }}
					onClick={() => setOpenNoti(!openNoti)}
					className={`btn pointer text-right p-0 text-${store.report.length === 0 ? "primary" : "danger"}`}>
					<i className="fas fa-bell" /> <span className="badge badge-light">{store.report.length}</span>
				</div>
			</div>
			<div className="d-flex">
				<p className="mt-0 p-0 text-left w-100">
					Syllabus: {store.info.slug && store.info.slug != "" ? `${store.info.slug} v${store.info.version}` : "No syllabus selected"}
				</p>
			</div>
			{openNoti && (
				<ul className="noti-canvas">
					{store.report.length === 0 && <li>No events to report</li>}
					{store.report.map((r, i) => (
						<li key={i}>
							{r.type}: {r.message || r}
						</li>
					))}
				</ul>
			)}
			<div>
				{notInfoEmpty("profile") && notInfoEmpty("academy_author") && notInfoEmpty("slug") && notInfoEmpty("version") && (
					<>
						<button
							className={`btn ${syllabusStatus.status} btn-sm mr-2`}
							onClick={() => {
								actions
									.test()
									.then(data =>
										setSyllabusStatus({
											status: "btn-success",
											messages: []
										})
									)
									.catch(async error => {
										setSyllabusStatus({
											status: "btn-danger",
											messages: [error.detail || error.msg]
										});
										await Swal({
											title: "Errors found on syllabus",
											text: error.detail || error.msg,
											icon: "error",
											dangerMode: true
										});
									});
							}}>
							<i className="fas fa-check" /> Test
						</button>
						<button
							className="btn btn-danger btn-sm mr-2"
							onClick={async () => {
								const yes = await Swal({
									title: "Are you sure?",
									text: "Make sure to save or download first or you will loose your progress",
									icon: "warning",
									buttons: true,
									dangerMode: true
								});
								if (yes) actions.clear();
							}}>
							<i className="fas fa-ban" /> Clear
						</button>
						{!["", "new version"].includes(store.info.version) && store.info.version && (
							<button className="btn btn-primary btn-sm mr-2" onClick={() => confirmEditSillabus(store, actions)}>
								<i className="fas fa-save" /> Save
							</button>
						)}
						<button className="btn btn-primary btn-sm mr-2" onClick={() => confirmSaveSillabus(store, actions)}>
							<i className="fas fa-save" /> Save as new...
						</button>
						<button className="btn btn-dark btn-sm mr-2" onClick={() => actions.download()}>
							<i className="fas fa-file-download" /> Export
						</button>
						<button
							className="btn btn-dark btn-sm mr-2"
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
							<i className="fas fa-file-upload" /> Import
						</button>
					</>
				)}
				<button className="btn btn-dark btn-sm" onClick={() => setOpenSyllabusDetails(true)}>
					<i className="fas fa-plus" /> Load
				</button>
				<button className="btn btn-dark btn-sm" onClick={() => setOpenSearchOnSyllabus(true)}>
					<i className="fas fa-zoom" /> Search
				</button>
			</div>
		</div>
	);
};

const confirmEditSillabus = async (store, actions) => {
	if (store.info.slug !== "" && store.days.length > 0) {
		const willEdit = await Swal({
			title: "Are you sure?",
			text: "Update a PREVIOUS version " + store.info.version,
			icon: "warning",
			buttons: true,
			dangerMode: true
		});
		if (willEdit) {
			try {
				//                                      ↓ false means saving under the same version
				const data = await actions.saveSyllabus(false);
				Swal("Syllabus version " + store.info.version + " update successfully", {
					icon: "success"
				});
			} catch (error) {
				console.error("Error updating syllabus: ", error);
				Swal(error.message || error.msg || error, {
					icon: "error"
				});
			}
		} else {
			Swal("Operation canceled by user");
		}
	} else if (store.info.slug === "") {
		Swal({
			title: "Syllabus details can't be empty",
			text: "Please fill the syllabus details to save",
			icon: "error",
			button: "OK"
		});
	} else if (store.days.length === 0) {
		Swal({
			title: "Syllabus without days",
			text: "A new syllabus version can't be saved without days, please add new days to the syllabus",
			icon: "error",
			button: "OK"
		});
	}
};

const confirmSaveSillabus = async (store, actions) => {
	if (store.info.slug !== "" && store.days.length > 0) {
		const willSave = await Swal({
			title: "Are you sure?",
			text: `Creating a NEW syllabus version for ${store.info.slug} academy ${store.info.academy_author}?`,
			icon: "warning",
			buttons: true,
			dangerMode: true
		});
		if (willSave) {
			try {
				//                              ⬇ true means new version number
				const data = await actions.saveSyllabus(true);
				actions.setInfo({ version: data.version });
				Swal(`New syllabus ${data.json.slug} v${data.version} saved successfully`, {
					icon: "success"
				});
			} catch (error) {
				console.error("Error: ", error);
				Swal(error.message || error, {
					icon: "error"
				});
			}
		} else {
			Swal("Operation canceled by user");
		}
	} else if (store.info.slug === "") {
		Swal({
			title: "Syllabus details can't be empty",
			text: "Please fill the syllabus details to save",
			icon: "error",
			button: "OK"
		});
	} else if (store.days.length === 0) {
		Swal({
			title: "Syllabus without days",
			text: "A new syllabus version can't be saved without days, please add new days to the syllabus",
			icon: "error",
			button: "OK"
		});
	}
};
