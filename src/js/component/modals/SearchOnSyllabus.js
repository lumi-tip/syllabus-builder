import React, { useEffect, useState, useContext } from "react";
import { ContentContext } from "../../context.js";
import PropTypes from "prop-types";
import { getLink, useDebounce } from "../utils";
import Flag from "../flags/flags";
import API from "../../api";
import swal from "sweetalert";
import Select, { components, MultiValueGenericProps } from "react-select";

const SearchSyllabus = ({ onSave, onCancel, actions }) => {
	const [searchFor, setSearchFor] = useState("");
	const [replaceFor, setReplaceFor] = useState(null);
	const [error, setError] = useState(null);
	const [typeFor, setTypeFor] = useState("select");
	const [findings, setFindings] = useState(null);

	const onSearch = e => {
		e.preventDefault();
		setFindings(null);
		setReplaceFor(null);
		actions
			.searchSyllabus(searchFor)
			.then(findings => {
				setFindings(findings);
			})
			.catch(error => {
				alert("error");
			});
	};

	const onReplace = e => {
		setFindings(null);
		if (!typeFor || typeFor === "select") {
			setError("Please select a type to replace");
			return;
		}
		if (!replaceFor || replaceFor === "") {
			setError("Replace string is empty");
			return;
		}
		actions
			.replaceInSyllabus(searchFor, replaceFor, typeFor)
			.then(findings => {
				setFindings(findings);
			})
			.catch(error => {
				alert("error");
			});
	};

	return (
		<div className="modal show d-block" tabIndex="-1" role="dialog">
			<div className="modal-dialog" role="document">
				<form className="modal-content" onSubmit={e => onSearch(e)}>
					<div className="modal-header p-2">Find on syllabus</div>
					<div className="modal-body">
						<p className="text-left">Use this tool to find where a content piece is being used today, you can search by slug:</p>
						<div className="form-group mb-0">
							<div className="input-group">
								<div className="input-group-prepend">
									<span className="input-group-text btn btn-primary btn-small">Search</span>
								</div>
								<input
									type="text"
									required={true}
									className="form-control border-right-0"
									placeholder="Search for slug"
									value={searchFor}
									onChange={e => {
										const valid = /^[A-Za-z0-9]+([-A-Za-z0-9]+)*$/.test(e.target.value);
										if (valid) setSearchFor(e.target.value);
									}}
								/>
							</div>
						</div>
						{replaceFor === null ? (
							<span className="a pointer" onClick={() => setReplaceFor("")}>
								and replace
							</span>
						) : (
							<div className="form-group">
								<div className="input-group">
									<div className="input-group-prepend">
										<span className="input-group-text">replace with</span>
									</div>
									<input
										type="text"
										className="form-control border-right-0"
										placeholder="Slug and type to replace"
										value={replaceFor}
										onChange={e => {
											const valid = /^[A-Za-z0-9]+([-A-Za-z0-9]+)*$/.test(e.target.value);
											if (valid) {
												setFindings(null);
												setReplaceFor(e.target.value);
											}
										}}
									/>
									<div className="input-group-append">
										<select
											className="form-control"
											onChange={e => {
												setError(null);
												setTypeFor(e.target.value);
											}}
											value={typeFor}>
											<option value="select">Type</option>
											<option>LESSON</option>
											<option>EXERCISE</option>
											<option>PROJECT</option>
											<option>QUIZ</option>
										</select>
									</div>
								</div>
							</div>
						)}
						{findings && (
							<>
								<ul className="search-replace-results">
									{findings.length == 0 && <span>Nothing found</span>}
									{findings.map((f, i) => (
										<li key={i}>
											<span className="asset_type text-capitalize">{f.type?.toLowerCase()}</span> on module {f.module} for{" "}
											{f.syllabus} v{f.version}.
										</li>
									))}
								</ul>
								{replaceFor && findings.length > 0 && <span>{findings.length} slugs where replaced:</span>}
							</>
						)}
					</div>

					{error ? (
						<span className="alert alert-danger">{error}</span>
					) : (
						<div className="modal-footer">
							<button
								onClick={() => {
									setReplaceFor(null);
									if (onCancel) onCancel();
								}}
								type="button"
								className="btn btn-secondary btn-small"
								data-dismiss="modal">
								Close
							</button>
							<button className="btn btn-primary btn-small">Search</button>
							{replaceFor !== null && (
								<button onClick={() => onReplace()} type="button" className="btn btn-warning btn-small">
									Replace
								</button>
							)}
						</div>
					)}
				</form>
			</div>
		</div>
	);
};
SearchSyllabus.propTypes = {
	onSave: PropTypes.func.required,
	onCancel: PropTypes.func,
	actions: PropTypes.objact
};
SearchSyllabus.defaultProps = {
	onSave: null,
	onCancel: null
};
export default SearchSyllabus;
