import React, { useState, useEffect, useContext } from "react";
import { ContentContext } from "../context.js";
import PropTypes from "prop-types";

export const UploadSyllabus = ({ onConfirm }) => {
	const [value, setValue] = useState("");
	return (
		<div className="alert alert-light">
			<input
				type="text"
				className="form-control"
				placeholder={"Type the syllabus URL here. E.g: https://domain.com/syllabus.json"}
				value={value}
				onChange={e => setValue(e.target.value)}
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
	const { store } = useContext(ContentContext);
	const [label, setLabel] = useState("");
	const [profile, setProfile] = useState(store.info.profile);
	const [desc, setDesc] = useState("");

	return (
		<div>
			<div className="row">
				<div className="col">
					<input
						type="text"
						className="form-control"
						placeholder={"Course label, e.g: FullStack 12 weeks"}
						value={label}
						onChange={e => setLabel(e.target.value)}
					/>
				</div>
				<div className="col-6">
					<select className="form-control" onChange={e => setProfile(e.target.value)} value={profile}>
						<option key={0} value={null}>
							Profile
						</option>
						{store.profiles.map((t, i) => (
							<option key={i} value={t.slug}>
								{t.name}
							</option>
						))}
					</select>
				</div>
				<div className="col-12">
					<textarea
						className="form-control"
						placeholder="What is this syllabus about?"
						value={desc}
						onChange={e => setDesc(e.target.value)}
					/>
				</div>
			</div>
			<div className="row">
				<div className="col-12 text-center">
					<button className="btn btn-success mr-2" onClick={() => onConfirm({ value: true, data: { profile, description: desc, label } })}>
						Save
					</button>
					<button className="btn btn-light" onClick={() => onConfirm(false)}>
						Cancel
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
