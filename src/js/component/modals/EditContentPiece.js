import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getLink, useDebounce } from "../utils";
import API from "../../api";
import swal from "sweetalert";
import { MultiSelect } from "react-multi-select-component";

const EditContentPiece = ({ defaultValue, onSave, onCancel, technologies, translations }) => {
	const [data, _setData] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [formStatus, setFormStatus] = useState({
		status: "ok",
		messages: []
	});
	const [slugValid, setSlugValid] = useState(null);
	const [linkStatus, setLinkStatus] = useState({
		status: "bg-light",
		message: "Testing URL...",
		value: null
	});
	const debouncedSlug = useDebounce(data ? data.slug : "", 500);

	useEffect(() => {
		if (defaultValue.custom !== true && defaultValue.mandatory === undefined) defaultValue.mandatory = true;
		if (typeof defaultValue == "object") _setData(defaultValue.info || defaultValue);
	}, [defaultValue]);

	useEffect(() => {
		if (data && !data.custom) {
			getLink(data)
				.then(url =>
					url && url != ""
						? setLinkStatus({
								value: url,
								status: null,
								message: null
						  })
						: setLinkStatus({
								status: "alert-danger",
								message: "URL not found"
						  })
				)
				.catch(error =>
					setLinkStatus({
						status: "alert-danger",
						message: "Error fetching piece url: " + error.message
					})
				);
		}

		if (data && data.custom) setEditMode(true);
	}, [data]);

	// Effect for API call
	useEffect(
		() => {
			if (debouncedSlug)
				validateSlug(debouncedSlug)
					.then(valid => setSlugValid(valid))
					.catch(error => setSlugValid(false));
		},
		[debouncedSlug] // Only call effect if debounced search term changes
	);

	const validate = e => {
		e.preventDefault();
		setFormStatus({ status: "loading", messages: [] });

		let errors = [];
		if (data.custom) {
			if (!data.url || data.url == "") errors.push("Manually added content must have URL property set");
			if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(data.slug))
				errors.push("The slug is a unique identifier that has only letters, numbers and hyphens");
			if (data.target != "blank") errors.push("Custom content must always open on a new window");
			if (!Array.isArray(data.technologies) || data.technologies.length === 0) errors.push("Select at least 1 technology");
			if (!Array.isArray(data.translations) || data.translations.length === 0) errors.push("Select at least 1 translation");
		}

		if (errors.length > 0) setFormStatus({ status: "error", messages: errors });
		else {
			onSave(data)
				.then(() => {
					setData({ ...data, custom: false });
				})
				.catch(errors =>
					setFormStatus({
						status: "error",
						messages: Array.isArray(errors) ? errors : [errors.message || errors.msg]
					})
				);
		}
	};

	const setData = params => {
		setFormStatus({ status: "ok", messages: [] });
		_setData(params);
	};

	const validateSlug = async _slug => {
		if (!_slug || _slug == "" || !/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(data.slug)) {
			setFormStatus({
				status: "error",
				messages: ["Invalid content slug"]
			});
			return false;
		}

		try {
			const asset = await API.registry().getAsset(_slug);
			if (data.custom) {
				setFormStatus({
					status: "error",
					messages: [`Slug is already taken by ${asset.asset_type.toLowerCase()}: ${asset.title}`]
				});
				return false;
			}
			return true;
		} catch (error) {
			if (!data.custom) {
				setFormStatus({
					status: "error",
					messages: [`Asset found on registry`]
				});
				return false;
			}

			return true;
		}
	};

	const propagate = e => {
		if (!data.custom && !editMode) {
			e.preventDefault();
			e.stopPropagation();
		}
	};

	if (!data) return "Loading...";

	return (
		<div
			className="modal show d-block edit-piece"
			onDrag={propagate}
			onClick={propagate}
			tabIndex="-1"
			role="dialog"
			onMouseDown={propagate}
			style={{ background: "rgba(0,0,0,0.5)" }}>
			<div className="modal-dialog" role="document">
				<form className="modal-content">
					<div className="modal-header p-2">
						<h3 className="w-100 text-center text-capitalize">{data.custom ? `Add Custom ${data.type}` : "Content Details"}</h3>
					</div>
					<div className="modal-body">
						<div className="form-group">
							<input
								type="text"
								onClick={e => {
									setEditMode(true);
									e.target.focus();
								}}
								onBlur={() => setEditMode(false)}
								required={true}
								className="form-control"
								placeholder="Write a title"
								value={data.title}
								onChange={e => setData({ ...data, title: e.target.value })}
							/>
							<small className="form-text text-muted">{"Students will see this title"}</small>
						</div>
						<div className="form-group">
							<div className="input-group mb-3">
								<input
									type="text"
									required={true}
									readOnly={data.custom !== true}
									className="form-control border-right-0"
									placeholder="Write a unique slug identifier"
									value={data.slug}
									onChange={e =>
										data.custom &&
										setData({
											...data,
											slug: e.target.value
										})
									}
								/>
								<div className="input-group-append">
									<span className="input-group-text bg-white" id="basic-addon2">
										{slugValid === null ? (
											<i className={"fas fa-sync spin"}></i>
										) : slugValid ? (
											<i className={`fas fa-smile-beam text-success`}></i>
										) : (
											<i className={`far fa-frown text-danger`}></i>
										)}
									</span>
								</div>
							</div>
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
									onChange={e =>
										setData({
											...data,
											url: e.target.value
										})
									}
								/>
							) : (
								<a href={linkStatus.value || "#"} className="form-control text-primary" target="_blank" rel="noopener noreferrer">
									Test URL in new window <i className="fas fa-external-link-square-alt p-1 text-secondary" />
								</a>
							)}
						</div>
						{data.custom && (
							<>
								<div className="form-group">
									<MultiSelect
										hasSelectAll={false}
										options={translations.map(t => ({
											label: t.title,
											value: t.slug
										}))}
										value={data.translations.map(t => ({
											label: t,
											value: t
										}))}
										placeholder="Language translations"
										onChange={translations =>
											setData({
												...data,
												translations: translations.map(t => t.value)
											})
										}
										labelledBy="Select available languages"
									/>
								</div>
								<div className="form-group">
									<MultiSelect
										hasSelectAll={false}
										options={technologies.map(t => ({
											label: t.title,
											value: t.slug
										}))}
										value={data.technologies.map(t => ({
											label: t,
											value: t
										}))}
										placeholder="Technologies"
										onChange={technologies =>
											setData({
												...data,
												technologies: technologies.map(t => t.value)
											})
										}
										labelledBy="Select available technologies"
									/>
								</div>
								<div className="form-group">
									<div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											checked={data.includeInRegistry === "true"}
											onChange={e =>
												setData({
													...data,
													includeInRegistry: data.includeInRegistry === "true" ? "false" : "true"
												})
											}
										/>
										<label className="form-check-label">Add to registry for future re-usage</label>
									</div>
								</div>
							</>
						)}
						<div className="form-group">
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									checked={data.target === "blank"}
									onChange={e =>
										setData({
											...data,
											target: data.target === "blank" ? "self" : "blank"
										})
									}
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
									onChange={e =>
										setData({
											...data,
											mandatory: data.mandatory !== true
										})
									}
								/>
								<label className="form-check-label">Mandatory: must be completed before graduation</label>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						{formStatus.status === "ok" ? (
							<button onClick={validate} className="btn btn-primary text-capitalize">
								Save {data.type}
							</button>
						) : formStatus.status === "loading" ? (
							<button className="btn btn-primary">
								<i className={"fas fa-sync spin"}></i> Loading ...
							</button>
						) : formStatus.status === "error" ? (
							<ul className="list-groupalert alert-danger w-100 p-1">
								{formStatus.messages.map((m, i) => (
									<li className="small p-1" key={i}>
										{m}
									</li>
								))}
							</ul>
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
	technologies: PropTypes.array,
	translations: PropTypes.array,
	onSave: PropTypes.func.required,
	onCancel: PropTypes.func
};
EditContentPiece.defaultProps = {
	defaultValue: {},
	technologies: [],
	translations: [],
	title: null
};
export default EditContentPiece;
