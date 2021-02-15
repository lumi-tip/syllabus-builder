import React, { useState, useEffect, useContext } from "react";
import { ContentContext } from "../context.js";
import SmartInput from "./smart-input";
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
						setValue({ name: files[0].name, content: reader.result });
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
	const [label, setLabel] = useState(store.info.label);
	const [profile, setProfile] = useState(store.info.profile);
	const [academy, setAcademy] = useState(store.info.academy_author);
	const [desc, setDesc] = useState(store.info.description);
	const [version, setVersion] = useState(store.info.version);

	useEffect(
		() => {
			if (store.info.version && store.info.version != "") {
				setVersion(store.info.version);
			}
			if (store.info.academy && store.info.academy != "") {
				setAcademy(store.info.academy);
			}
			if (store.info.label && store.info.label != "") {
				setLabel(store.info.label);
			}
		},
		[store.info]
	);

	const shouldBeOpened = () => {
		return academy && academy != "" && (profile && profile != "");
	};

	return (
		<div className="mb-3">
			<div className="row">
				<div className="col-5">
					<input
						type="text"
						className="form-control"
						placeholder={store.info.label !== undefined ? store.info.label : "Course label, e.g: FullStack 12 weeks"}
						value={label}
						onChange={e => setLabel(e.target.value)}
					/>
				</div>
				<div className="col-7">
					<div className="input-group mb-3">
						<select
							className="form-control"
							onChange={e => {
								setAcademy(e.target.value);
								if (profile) actions.getSyllabisVersions(e.target.value, profile);
							}}
							value={academy}>
							<option key={0} value={null}>
								Select an academy
							</option>
							{store.academies.map((a, i) => {
								return (
									<option key={i} value={a.id}>
										{a.name}
									</option>
								);
							})}
						</select>
						<select
							className="form-control"
							onChange={e => {
								setProfile(e.target.value);
								if (academy) actions.getSyllabisVersions(academy, e.target.value);
							}}
							value={profile}>
							<option key={0} value={null}>
								Select profile
							</option>
							{store.profiles.map((course, i) => {
								return (
									<option key={i} value={course.slug}>
										{course.slug}
									</option>
								);
							})}
						</select>
						<select
							className={"form-control  " + (shouldBeOpened() ? "" : "d-none")}
							onChange={e => {
								if (academy) actions.getApiSyllabus(academy, profile, e.target.value);
							}}
							value={store.info.version}>
							<option key={0} value={"null"}>
								Select version
							</option>
							{store.syllabus !== null && store.syllabus.length > 0 ? (
								store.syllabus.map((syllabu, i) => {
									return (
										<option key={i} value={syllabu.version}>
											{syllabu.version}
										</option>
									);
								})
							) : (
								<option disabled>no version</option>
							)}
						</select>
					</div>
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<textarea
						className="form-control"
						placeholder={store.info.description !== undefined ? store.info.description : "What is this syllabus about?"}
						value={desc}
						onChange={e => setDesc(e.target.value)}
					/>
				</div>
			</div>
			<div className="row my-2">
				<div className="col-12 text-center">
					<button
						className="btn btn-success w-100"
						onClick={() =>
							onConfirm({
								value: true,
								data: { profile, description: desc, label, slug: profile + ".v" + version, version, academy_author: academy }
							})
						}>
						<i className="fas fa-save" /> Save and collapse
					</button>
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
