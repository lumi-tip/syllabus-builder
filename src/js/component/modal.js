import React, { useState, useEffect, useContext } from "react";
import { ContentContext } from "../context.js";
import SmartInput from "./smart-input";
import Select from "react-select";
import swal from "sweetalert";
import API from "../api.js";
import MDEditor from "@uiw/react-md-editor";
import PropTypes from "prop-types";

export const UploadSyllabus = ({ onConfirm }) => {
	const [value, setValue] = useState("");
	return (
		<div className="alert alert-light">
			<input
				type="text"
				readOnly={typeof value.content != "undefined"}
				className="form-control"
				placeholder={"Type the syllabus URL here. E.g: https://domain.com/syllabus.json"}
				value={value.content || value}
				onChange={e => setValue(e.target.value)}
			/>
			<input
				type="file"
				className="form-control"
				placeholder={"Or browser for a file"}
				onChange={e => {
					const reader = new FileReader();
					const files = e.target.files;
					reader.onload = () => {
						setValue({
							name: files[0].name,
							content: reader.result
						});
					};
					reader.readAsText(files[0]);
				}}
			/>
			<button className="btn btn-success mr-2" onClick={() => value != "" && onConfirm({ value: true, url: value })}>
				Save
			</button>
			<button className="btn btn-light" onClick={() => onConfirm({ value: false, url: value })}>
				Cancel
			</button>
		</div>
	);
};
UploadSyllabus.propTypes = {
	question: PropTypes.string,
	onConfirm: PropTypes.func
};

export const SyllabusDetails = ({ onConfirm }) => {
	const { store, actions } = useContext(ContentContext);
	const [academy, setAcademy] = useState(null);

	const [profile, setProfile] = useState(store.info.profile);
	const [profileOptions, setProfileOptions] = useState([]);
	// versions
	const [version, setVersion] = useState(store.info.slug && store.info.slug != "" ? store.info.version : null);
	const [versionOptions, setVersionOptions] = useState([]);

	useEffect(() => {
		if (store.info.slug && store.info.slug != "") {
			if (store.info.version && store.info.version != "") {
				setVersion(store.info.version);
			}
			if (store.info.academy && store.info.academy != "") {
				setAcademy(store.info.academy);
			}
		}
	}, [store.info]);

	useEffect(() => {
		const academyEffects = async () => {
			actions.cleanSyllabus({ academy });

			const profiles = await API.profile().all();
			setProfileOptions(profiles);
		};
		// first reset the academy to the api
		API.setOptions({ academy });

		// profile and version must be null
		setProfile(null);
		setVersion(null);

		if (academy) academyEffects();
	}, [academy]);

	useEffect(() => {
		const profileEffects = async () => {
			actions.cleanSyllabus({ academy, profile: profile?.slug });
			let versions = await API.profile().version(profile?.slug);
			if (versions.length === 0) versions = [{ version: "new version", value: "new version" }];
			setVersionOptions(versions.sort((a, b) => (a.version > b.version ? 1 : -1)));
		};
		// profile and version must be null
		setVersion(null);

		if (profile) profileEffects();
	}, [profile]);

	useEffect(() => {
		const versionEffects = async () => {
			// actions.cleanSyllabus({ academy, profile: profile?.slug });
			if (version) actions.getApiSyllabusVersion(academy, profile?.slug, version.value || version);
		};

		if (version) versionEffects();
	}, [version]);

	return (
		<div className="modal show d-block syllabus-details" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-body p-0">
						<div className="row">
							<div className="col-12">
								<Select
									className="form-control p-0"
									label="Select version"
									onChange={a => {
										setAcademy(a.value.id);
									}}
									options={store.academies.map(v => ({
										value: v,
										label: v.name
									}))}
								/>
								{academy && (
									<Select
										className="form-control p-0 border-none"
										label="Select Profile"
										onChange={p => {
											setProfile(p.value);
										}}
										options={profileOptions
											.sort((a, b) => (a.name > b.name ? 1 : -1))
											.filter(p => p.academy_owner == academy)
											.map(p => ({
												value: p,
												label: p.name
											}))}
									/>
								)}
								{profile && (
									<Select
										className="form-control p-0"
										label="Select version"
										onChange={v => {
											setVersion(v.value);
										}}
										options={versionOptions.map(v => ({
											value: v.version,
											label: v.version
										}))}
									/>
								)}
							</div>
						</div>
					</div>
					<div className="modal-footer p-0 border-0">
						{version ? (
							<button
								className="btn btn-success"
								onClick={() => {
									onConfirm({
										profile,
										slug: profile + ".v" + version,
										version,
										academy_author: academy
									});
								}}>
								<i className="fas fa-smile"></i> Continue editing
							</button>
						) : (
							<button onClick={() => onConfirm(false)} type="button" className="btn btn-secondary" data-dismiss="modal">
								Cancel
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
SyllabusDetails.propTypes = {
	profiles: PropTypes.array,
	onConfirm: PropTypes.func
};
SyllabusDetails.defaultProps = {
	profiles: []
};

export const ExtendedInstructions = ({ onSave, onCancel, defaultValue, dayNumber }) => {
	const [value, setValue] = React.useState(defaultValue);
	const [height, setHeight] = React.useState();
	useEffect(() => {
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		setHeight(vh - 80);
	}, []);
	return (
		<div className="modal show d-block extended-instructions" tabIndex="-1" role="dialog">
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-body p-0">
						<MDEditor value={value} onChange={setValue} height={height} />
					</div>
					<div className="modal-footer">
						<button onClick={() => onSave && onSave(value)} type="button" className="btn btn-primary">
							Save Day {dayNumber} Instructions
						</button>
						<button onClick={() => onCancel && onCancel()} type="button" className="btn btn-secondary" data-dismiss="modal">
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
ExtendedInstructions.propTypes = {
	defaultValue: PropTypes.string,
	onSave: PropTypes.func.required,
	onCancel: PropTypes.func,
	dayNumber: PropTypes.number
};
ExtendedInstructions.defaultProps = {
	defaultValue: "Hello *World*!"
};
