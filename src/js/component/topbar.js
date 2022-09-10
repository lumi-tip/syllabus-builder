import React, { useContext, useState, useEffect } from "react";
import { ContentContext } from "../context.js";
import swal from "@sweetalert/with-react";
import { Notify } from "bc-react-notifier";
import { UploadSyllabus, SyllabusDetails } from "./modal";
import Dropdown from "./dropdown";
import SearchSyllabus from "./modals/SearchOnSyllabus";
import API from "../api.js";

export const TopBar = () => {
	const { store, actions } = useContext(ContentContext);
	const [openNoti, setOpenNoti] = useState(false);
	const [openSearchOnSyllabus, setOpenSearchOnSyllabus] = useState(false);
	const [loading, setLoading] = useState(false);
	const [syllabusStatus, setSyllabusStatus] = useState({
		status: "btn-dark",
		messages: []
	});
	const [openSyllabusDetails, setOpenSyllabusDetails] = useState(false);
	const notInfoEmpty = key => store.info[key] && store.info[key] !== undefined && store.info[key] != "";
	const academy = store.academies.find(a => a.id == store.info.academy_author);
	const total_days = store.days.reduce((prev, curr) => prev + (curr.duration_in_days || 1), 0);

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
				{store.info.slug && store.info.slug != "" ? (
					<div className="mt-0 p-0 text-left w-100">
						<span>Syllabus: {store.info.slug} </span>
						<Dropdown
							label={`v${store.info.version}`}
							options={async () => {
								const versions = await API.profile().version(store.info.slug);
								return versions.map(v => ({ label: `v${v.version}`, value: v }));
							}}
							onChange={opt => actions.getApiSyllabusVersion(academy.id, store.info.slug, opt.value.version)}
						/>
						<span className={`ml-1 ${store.info.duration_in_days < total_days ? "text-danger" : ""}`}>
							takes {total_days} of {store.info.duration_in_days} planned days.
						</span>
					</div>
				) : (
					<p className="mt-0 p-0 text-left w-100">No syllabus selected</p>
				)}
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
										await swal({
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
								const yes = await swal({
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
						<div className="dropdown d-inline">
							<button
								className="btn btn-primary btn-sm mr-2 dropdown-toggle"
								type="button"
								disabled={loading}
								id="dropdownMenuButton"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false">
								{loading ? (
									"Loading..."
								) : (
									<>
										<i className="fas fa-save" /> Save
									</>
								)}
							</button>
							<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
								{!["", "new version"].includes(store.info.version) && store.info.version && (
									<a
										className="dropdown-item"
										href="#"
										onClick={e => {
											e.preventDefault();
											setLoading(true);
											confirmEditSillabus(store, actions).then(() => setLoading(false));
										}}>
										Update <strong>same version</strong>
									</a>
								)}
								<a
									className="dropdown-item"
									href="#"
									onClick={() => setLoading(true) || confirmSaveSillabus(store, actions).then(() => setLoading(false))}>
									Create new version
								</a>
							</div>
						</div>
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
				<button className="btn btn-dark btn-sm ml-2" onClick={() => setOpenSearchOnSyllabus(true)}>
					<i className="fas fa-zoom" /> Search
				</button>
			</div>
		</div>
	);
};

const waitSeconds = miliseconds =>
	new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(true);
		}, miliseconds);
	});
const confirmEditSillabus = async (store, actions) => {
	let errors = [];
	await waitSeconds(2000); //wait to seconds
	const total_days = store.days.reduce((prev, curr) => prev + (curr.duration_in_days || 1), 0);
	if (total_days > store.info.duration_in_days) {
		errors.push({
			title: `Syllabus has to many days: ${total_days}`,
			text: `The syllabus should have no more than ${store.info.duration_in_days} days, currently it has ${total_days}. You can either delete some days or update the total expected days on the admin.`
		});
	}
	if (store.info.slug === "") {
		errors.push({
			title: "Syllabus details can't be empty",
			text: "Please fill the syllabus details to save"
		});
	}
	if (store.days.length === 0) {
		errors.push({
			title: "Syllabus without days",
			text: "Syllabus can't be saved without days, please add new days to the syllabus"
		});
	}

	if (errors.length > 0) {
		await swal({ ...errors[0] });
		return false;
	} else {
		const willEdit = await swal({
			title: "Are you sure?",
			text: `Update a PREVIOUS version ${store.info.version} with ${total_days} days`,
			icon: "warning",
			buttons: true,
			dangerMode: true
		});
		if (willEdit) {
			try {
				//                                      ↓ false means saving under the same version
				const data = await actions.saveSyllabus(false);
				await swal("Syllabus version " + store.info.version + " update successfully", {
					icon: "success"
				});
			} catch (error) {
				console.error("Error updating syllabus: ", error);
				await swal(error.message || error.msg || error, {
					icon: "error"
				});
			}
			return true;
		} else {
			await swal("Operation canceled by user");
			return false;
		}
	}
};

const confirmSaveSillabus = async (store, actions) => {
	if (store.info.slug !== "" && store.days.length > 0) {
		const willSave = await swal({
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
				swal(`New syllabus ${data.json.slug} v${data.version} saved successfully`, {
					icon: "success"
				});
			} catch (error) {
				console.error("Error: ", error);
				swal(error.message || error, {
					icon: "error"
				});
			}
		} else {
			swal("Operation canceled by user");
		}
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
