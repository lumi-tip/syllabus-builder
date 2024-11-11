import React, { useContext, useState, useEffect } from "react";
import { ContentContext } from "../context.js";
import swal from "@sweetalert/with-react";
import { Notify } from "bc-react-notifier";
import PropTypes from "prop-types";
import { UploadSyllabus, SyllabusDetails, IntegrityReport } from "./modal";
import Dropdown from "./dropdown";
import SearchSyllabus from "./modals/SearchOnSyllabus";
import API from "../api.js";

export const TopBar = ({ readOnly }) => {
	const { store, actions } = useContext(ContentContext);
	const [openNoti, setOpenNoti] = useState(false);
	const [openSearchOnSyllabus, setOpenSearchOnSyllabus] = useState(false);
	const [loading, setLoading] = useState(false);
	const [syllabusStatus, setSyllabusStatus] = useState({
		status: "btn-dark",
		messages: [],
		showReport: false
	});
	const [openSyllabusDetails, setOpenSyllabusDetails] = useState(false);
	const notInfoEmpty = key => store.info[key] && store.info[key] !== undefined && store.info[key] != "";
	const academy = store.academies.find(a => a.id == store.info.academy_author);
	const languagesArr = ["us", "es"];

	const handleBasicFormat = () => {
		swal({
			title: "Warning!",
			text: "You will switch back to the basic JSON format, which means all your progress in the translation format will be lost.",
			icon: "warning",
			buttons: {
				cancel: "Cancel",
				confirm: "Yes, continue"
			},
			dangerMode: true
		}).then((willContinue) => {
			if (willContinue) {
				actions.days().basicFormat();
				swal("Basic Format", "You have switched back to the basic format.", "success");
			}
		});
	};

	const isValidField = (field) => {
		return typeof field === "string" && field.trim() !== "";
	};

	const isValidLanguageField = (field, isLabel = false) => {
		if (typeof field === "string") {
			return isValidField(field);
		} else if (typeof field === "object" && field !== null) {
			const languagesInSyllabusArr = Object.keys(store.days[0]?.label);
			const filledCount = languagesInSyllabusArr.filter(lang => isValidField(field[lang])).length;

			if (isLabel) {
				return filledCount === languagesInSyllabusArr.length;
			}

			return filledCount === 0 || filledCount === languagesInSyllabusArr.length;
		}
		return false;
	};

	const confirmEditSyllabus = async (store, actions) => {
		let errors = [];
		await waitSeconds(2000); // wait 2 seconds

		const total_days = store.days.reduce((prev, curr) => prev + (curr.duration_in_days || 1), 0);

		// void slug validation
		if (total_days > store.info.duration_in_days) {
			errors.push({
				title: `Syllabus has too many days: ${total_days}`,
				text: `The syllabus should have no more than ${store.info.duration_in_days} days, currently it has ${total_days}. You can either delete some days or update the total expected days in the admin.`
			});
		}

		if (store.info.slug === "") {
			errors.push({
				title: "Syllabus details can't be empty",
				text: "Please fill in the syllabus details to save."
			});
		}

		if (store.days.length === 0) {
			errors.push({
				title: "Syllabus without days",
				text: "Syllabus can't be saved without days. Please add new days to the syllabus."
			});
		}

		// 'label nad description validation
		const invalidDays = store.days.filter(day => {
			const hasInvalidFields =
				!isValidLanguageField(day.label, true) ||
				!isValidLanguageField(day.description);
			return hasInvalidFields;
		});

		if (invalidDays.length > 0) {
			errors.push({
				title: "Syllabus validation error",
				text: "Please fill in all labels and descriptions for each day in the syllabus."
			});
			actions.setSyllabusErrors(invalidDays);
		}

		if (errors.length > 0) {
			await swal({ ...errors[0], icon: "error", button: "OK" });
			return false;
		} else {
			actions.cleanSyllabusErrors();

			const willEdit = await swal({
				title: "Are you sure?",
				text: `Update a PREVIOUS version ${store.info.version} with ${total_days} days`,
				icon: "warning",
				buttons: true,
				dangerMode: true
			});

			if (willEdit) {
				try {
					//                                      ↓ false means save as same version
					const data = await actions.saveSyllabus(false);
					await swal("Syllabus version " + store.info.version + " updated successfully", {
						icon: "success"
					});
					return true;
				} catch (error) {
					console.error("Error updating syllabus: ", error);
					await swal(error.message || error.msg || error, {
						icon: "error"
					});
					return false;
				}
			} else {
				await swal("Operation canceled by user");
				return false;
			}
		}
	};

	const confirmSaveSyllabus = async (store, actions) => {
		let errors = [];

		// slug and days existence validation
		if (store.info.slug === "") {
			errors.push({
				title: "Syllabus details can't be empty",
				text: "Please fill in the syllabus details to save."
			});
		}
		if (store.days.length === 0) {
			errors.push({
				title: "Syllabus without days",
				text: "A new syllabus version can't be saved without days. Please add new days to the syllabus."
			});
		}

		// label and description validation
		const invalidDays = store.days.filter(day => {
			const hasInvalidFields =
				!isValidLanguageField(day.label) ||
				!isValidLanguageField(day.description);
			return hasInvalidFields;
		});

		if (invalidDays.length > 0) {
			errors.push({
				title: "Syllabus validation error",
				text: "Please fill in all labels and descriptions for each day in the syllabus."
			});
			actions.setSyllabusErrors(invalidDays);
		}

		// show errors if needed
		if (errors.length > 0) {
			await swal({ ...errors[0], icon: "error", button: "OK" });
			return false;
		} else {
			actions.cleanSyllabusErrors();

			// Confirmation to save new syllabus
			const willSave = await swal({
				title: "Are you sure?",
				text: `Creating a NEW syllabus version for ${store.info.slug} academy ${store.info.academy_author}?`,
				icon: "warning",
				buttons: true,
				dangerMode: true
			});

			if (willSave) {
				try {
					// true meas save as new version
					const data = await actions.saveSyllabus(true);
					actions.setInfo({ version: data.version });
					await swal(`New syllabus ${data.json.slug} v${data.version} saved successfully`, {
						icon: "success"
					});
					return true;
				} catch (error) {
					console.error("Error: ", error);
					await swal(error.message || error, {
						icon: "error"
					});
					return false;
				}
			} else {
				await swal("Operation canceled by user");
				return false;
			}
		}
	};


	return (
		<div className="topbar text-right px-3 pt-1 pb-2 position-sticky sticky-top bg-light">
			{openSyllabusDetails && <SyllabusDetails onConfirm={confirm => setOpenSyllabusDetails(false)} />}
			{openSearchOnSyllabus && <SearchSyllabus readOnly={readOnly} actions={actions} onCancel={() => setOpenSearchOnSyllabus(false)} />}
			{syllabusStatus.showReport && syllabusStatus.messages && (
				<IntegrityReport messages={syllabusStatus.messages} onClose={() => setSyllabusStatus({ ...syllabusStatus, showReport: false })} />
			)}
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
						<span>Syllabus: {store.info.slug}</span>
						<Dropdown
							label={`v${store.info.version}`}
							options={async () => {
								const versions = await API.profile(store.info.slug).getAllVersions();
								return versions.map(v => ({ label: `v${v.version}`, value: v }));
							}}
							onChange={opt => actions.getApiSyllabusVersion(academy.id, store.info.slug, opt.value.version)}
						/>
						<span className={`ml-1 ${store.info.duration_in_days < total_days ? "text-danger" : ""}`}>
							takes {total_days} of {store.info.duration_in_days} planned days, status:
						</span>
						{readOnly ? (
							<span>{store.info.status}</span>
						) : (
							<Dropdown
								label={store.info.status}
								options={async () => {
									return ["DRAFT", "PUBLISHED"].filter(v => v != store.info.version).map(v => ({ label: v, value: v }));
								}}
								onChange={opt =>
									API.profile(store.info.slug)
										.updateVersion(store.info.version, { status: opt.value })
										.then(() => actions.setInfo({ status: opt.value }))
								}
							/>
						)}
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
				{!readOnly && notInfoEmpty("profile") && notInfoEmpty("academy_author") && notInfoEmpty("slug") && notInfoEmpty("version") && (
					<>
						<button className="btn btn-dark btn-sm mr-2" onClick={handleBasicFormat}>
							Basic Format
						</button>
						<button className="btn btn-dark btn-sm mr-2" onClick={() => actions.days().translationFormat(languagesArr)}>
							Translation Format
						</button>
						<button
							className={`btn ${syllabusStatus.status} btn-sm mr-2`}
							onClick={() => {
								actions
									.test()
									.then(report =>
										setSyllabusStatus({
											status: report.errors > 0 ? "btn-danger" : report.warnings > 0 ? "btn-warning" : "btn-success",
											messages: report,
											showReport: true
										})
									)
									.catch(async report => {
										let _report = report;
										const showReport = Array.isArray(_report.msg?.errors);
										setSyllabusStatus({
											showReport,
											status: "btn-danger",
											messages: showReport ? _report.msg : null
										});
										if (showReport) {
											return _report.msg;
										} else
											return await swal({
												title: "Errors found on syllabus",
												text: "Please test your syllabus before submiting and review the integrity report.",
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
											confirmEditSyllabus(store, actions).then(() => setLoading(false));
										}}>
										Update <strong>same version</strong>
									</a>
								)}
								<a
									className="dropdown-item"
									href="#"
									onClick={() => setLoading(true) || confirmSaveSyllabus(store, actions).then(() => setLoading(false))}>
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
TopBar.propTypes = {
	readOnly: PropTypes.bool
};

TopBar.defaultProps = {
	readOnly: true
};