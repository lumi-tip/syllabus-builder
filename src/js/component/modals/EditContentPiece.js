import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getLink } from "../utils";

const EditContentPiece = ({ defaultValue, onSave, onCancel }) => {
	const [data, setData] = useState(null);

	useEffect(() => {
		if (defaultValue.custom !== true && defaultValue.mandatory === undefined) defaultValue.mandatory = true;
		if (typeof defaultValue == "object") setData(defaultValue.info || defaultValue);
	}, [defaultValue]);

	if (!data) return "Loading...";

	return (
		<div className="modal show d-block edit-piece" tabIndex="-1" role="dialog">
			<div className="modal-dialog" role="document">
				<form
					className="modal-content"
					onSubmit={e => {
						e.preventDefault();
						if (onSave) onSave(data);
					}}>
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
						<div className="form-group">
							<input
								type="url"
								required={data.custom === true}
								className="form-control"
								placeholder="Any specific url?"
								value={data.url}
								onChange={e => setData({ ...data, url: e.target.value })}
							/>
							<small className="form-text text-muted">Only if not in the registry already</small>
						</div>
						<div className="form-group">
							<div className="form-check">
								<input
									className="form-check-input"
									type="checkbox"
									checked={data.mandatory}
									onChange={e => setData({ ...data, mandatory: data.mandatory !== true })}
								/>
								<label className="form-check-label">Mandatory material</label>
							</div>
						</div>
					</div>
					<div className="modal-footer">
						<a
							href="#"
							onClick={e => {
								e.preventDefault();
								getLink(data)
									.then(url => window.open(url))
									.catch(error => console.error("Error fetching piece url", error));
							}}
							target="_blank"
							rel="noopener noreferrer">
							Open in new window <i className="fas fa-external-link-square-alt p-1 text-secondary" />
						</a>
						<button className="btn btn-primary">Save Content Piece</button>
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
