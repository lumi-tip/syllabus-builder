import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getLink } from "../utils";

const EditContentPiece = ({ defaultValue, onSave, onCancel }) => {
	const [data, _setData] = useState(null);
	const [formStatus, setFormStatus] = useState({ status: "ok", messages: [] });
	const [linkStatus, setLinkStatus] = useState({ status: "bg-light", message: "Testing URL...", value: null });

	useEffect(() => {
		if (defaultValue.custom !== true && defaultValue.mandatory === undefined) defaultValue.mandatory = true;
		if (typeof defaultValue == "object") _setData(defaultValue.info || defaultValue);
	}, [defaultValue]);

	useEffect(() => {
		if (data && !data.custom) {
			getLink(data)
				.then(url =>
					url && url != ""
						? setLinkStatus({ value: url, status: null, message: null })
						: setLinkStatus({ status: "alert-danger", message: "URL not found" })
				)
				.catch(error => setLinkStatus({ status: "alert-danger", message: "Error fetching piece url: " + error.message }));
		}
	}, [data]);

	const validate = e => {
		e.preventDefault();
		setFormStatus({ status: "loading", messages: [] });

		let errors = [];
		if (data.custom) {
			if (!data.url || data.url == "") errors.push("Manually added content must have URL property set");
			if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(data.slug))
				errors.push("The slug is a unique identifier that has only letters, numbers and hyphens");
			if (data.target != "blank") errors.push("Custom content must always open on a new window");
		}

		if (errors.length > 0) setFormStatus({ status: "error", messages: errors });
		else if (onSave) onSave(data);
	};

	const setData = params => {
		setFormStatus({ status: "ok", messages: [] });
		_setData(params);
	};

	if (!data) return "Loading...";

	return (
		<div
			className="modal show d-block edit-piece"
			onDrag={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onClick={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			tabIndex="-1"
			role="dialog"
			onMouseDown={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			style={{ background: "rgba(0,0,0,0.5)" }}>
			<div className="modal-dialog" role="document">
				<form className="modal-content" onSubmit={validate}>
					<div className="modal-header p-2">
						<h3 className="w-100 text-center">{data.custom ? "Add Custom Content" : "Content Details"}</h3>
					</div>
					<div className="modal-body">
						<div className="form-group">
							<input
								type="text"
								required={true}
								className="form-control"
								placeholder="Write a title"
								value={data.title}
								onChange={e => setData({ ...data, title: e.target.value })}
							/>
							<small className="form-text text-muted">{"Students will see this title"}</small>
						</div>
						<div className="form-group">
							<input
								type="text"
								required={true}
								readOnly={data.custom !== true}
								className="form-control"
								placeholder="Write a unique slug identifier"
								value={data.slug}
								onChange={e => data.custom && setData({ ...data, slug: e.target.value })}
							/>
							<small className="form-text text-muted">
								{"Custom slugs are only accepted for custom lessons, replits and projects"}
							</small>
						</div>
						<div className="form-group" style={{ position: "relative" }}>
							{!linkStatus.message && (
								<div
									className={`alert ${linkStatus.status} w-100`}
									style={{
										borderBottomLeftRadius: "0px",
										borderBottomRightRadius: "0px",
										position: "absolute",
										top: "-23px",
										fontSize: "10px"
									}}>
									{linkStatus.message}
								</div>
							)}
							{data.custom ? (
								<input
									type="url"
									required={data.custom === true}
									className="form-control"
									placeholder="Any specific url?"
									value={data.url}
									onChange={e => setData({ ...data, url: e.target.value })}
								/>
							) : (
								<a href={linkStatus.value || "#"} className="form-control text-primary" target="_blank" rel="noopener noreferrer">
									Test URL in new window <i className="fas fa-external-link-square-alt p-1 text-secondary" />
								</a>
							)}
						</div>
						<div className="form-group">
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									checked={data.target === "blank"}
									onChange={e => setData({ ...data, target: data.target === "blank" ? "self" : "blank" })}
								/>
								<label className="form-check-label">Make it open in a new window</label>
							</div>
						</div>
						<div className="form-group">
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									checked={data.mandatory}
									onChange={e => setData({ ...data, mandatory: data.mandatory !== true })}
								/>
								<label className="form-check-label">Mandatory: must be completed before graduation</label>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						{formStatus.status === "ok" ? (
							<button className="btn btn-primary">Save Content Piece</button>
						) : formStatus.status === "loading" ? (
							<button className="btn btn-primary">
								<i className={"fas fa-sync spin"}></i> Loading ...
							</button>
						) : formStatus.status === "error" ? (
							<div className="alert alert-danger">
								{formStatus.messages.map((m, i) => (
									<li className="small" key={i}>
										{m}
									</li>
								))}
							</div>
						) : null}
						<button onClick={() => onCancel && onCancel()} type="button" className="btn btn-secondary" data-dismiss="modal">
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};
EditContentPiece.propTypes = {
	defaultValue: PropTypes.string,
	title: PropTypes.string,
	onSave: PropTypes.func.required,
	onCancel: PropTypes.func
};
EditContentPiece.defaultProps = {
	defaultValue: {},
	title: null
};
export default EditContentPiece;
