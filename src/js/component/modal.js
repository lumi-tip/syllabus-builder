import React, { useState, useEffect } from "react";
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
			<button className="btn btn-success" onClick={() => value != "" && onConfirm({ value: true, url: value })}>
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

export const SyllabusDetails = ({ profiles, onConfirm }) => {
	const [label, setLabel] = useState("");
	const [profile, setProfile] = useState(null);
	const [desc, setDesc] = useState("");
	if (!profile) return "hello";
	return (
		<div>
			<div className="row">
				<div className="col">
					<input
						type="text-6"
						className="form-control"
						placeholder={"Type the syllabus URL here. E.g: https://domain.com/syllabus.json"}
						value={label}
						onChange={e => setLabel(e.target.value)}
					/>
				</div>
				<div className="col-6">
					<select className="form-control" onChange={e => setProfile(e.target.value)} value={profile}>
						<option key={0} value={null}>
							Profile
						</option>
						{profiles.map((t, i) => (
							<option key={i} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div className="col-12">
					<textarea placeholder="What is this syllabus about?" value={desc} onChange={e => setDesc(e.target.value)} />
				</div>
			</div>
			<div className="row">
				<div className="col-12">
					<button className="btn btn-success" onClick={() => onConfirm({ value: true, data: { profile, description: desc, label } })}>
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
