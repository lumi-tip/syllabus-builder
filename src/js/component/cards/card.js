import React from "react";
import PropTypes from "prop-types";
import { ContentContext } from "../../context";
const Card = ({ store }) => {
	console.log(store.imported_days);
	return (
		<>
			<div style={{ overflowY: "scroll", width: "100%", height: "500px" }}>
				<div className="row">
					{store &&
						store.imported_days &&
						store.imported_days.map(d => (
							<div className="col-12 mb-1" key={d.id}>
								<div className="card">
									<div className="card-header">
										<p className="p-0 mb-0">{d.label}</p>
									</div>
									<div className="card-body">
										<div className="text-justify">
											<p className="p-0 mb-0">
												<u>Description</u>
											</p>
											<p className="text-truncate p-0">{d.description}</p>
										</div>
										<div className="text-justify">
											<p className="p-0 mb-0">
												<u>Teacher Instructions</u>
											</p>
											<p className="text-truncate p-0">{d.teacher_instructions}</p>
										</div>
										<div className="accordion" id="accordionExample">
											<div className="card">
												<div className="card-header text-center" id={"headingOne" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseOne" + d.id}
															aria-expanded="true"
															aria-controls={"collapseOne" + d.id}>
															{"Key concepts"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseOne" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingOne" + d.id}
													data-parent="#accordionExample">
													{d["key-concepts"] &&
														d["key-concepts"].map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k}
															</p>
														))}
												</div>
											</div>
											<div className="card">
												<div className="card-header text-center" id={"headingTwo" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseTwo" + d.id}
															aria-expanded="true"
															aria-controls={"collapseTwo" + d.id}>
															{"Lessons"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseTwo" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingTwo" + d.id}
													data-parent="#accordionExample">
													{d.lessons &&
														d.lessons.map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k.title}
															</p>
														))}
												</div>
											</div>
											<div className="card">
												<div className="card-header text-center" id={"headingThree" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseThree" + d.id}
															aria-expanded="true"
															aria-controls={"collapseThree" + d.id}>
															{"Quizzes"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseThree" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingThree" + d.id}
													data-parent="#accordionExample">
													{d.quizzes &&
														d.quizzes.map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k.title}
															</p>
														))}
												</div>
											</div>
											<div className="card">
												<div className="card-header text-center" id={"headingFour" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseFour" + d.id}
															aria-expanded="true"
															aria-controls={"collapseFour" + d.id}>
															{"Replits"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseFour" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingFour" + d.id}
													data-parent="#accordionExample">
													{d.replits &&
														d.replits.map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k.title}
															</p>
														))}
												</div>
											</div>
											<div className="card">
												<div className="card-header text-center" id={"headingFive" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseFive" + d.id}
															aria-expanded="true"
															aria-controls={"collapseFive" + d.id}>
															{"Projects"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseFive" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingFive" + d.id}
													data-parent="#accordionExample">
													{d.projects &&
														d.projects.map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k.title}
															</p>
														))}
												</div>
											</div>
											<div className="card">
												<div className="card-header text-center" id={"headingSix" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseSix" + d.id}
															aria-expanded="true"
															aria-controls={"collapseSix" + d.id}>
															{"Assignments"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseSix" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingSix" + d.id}
													data-parent="#accordionExample">
													{d.assignments &&
														d.assignments.map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k}
															</p>
														))}
												</div>
											</div>
											<div className="card">
												<div className="card-header text-center" id={"headingSeven" + d.id}>
													<h2 className="mb-0">
														<button
															className="btn btn-link"
															type="button"
															data-toggle="collapse"
															data-target={"#collapseSeven" + d.id}
															aria-expanded="true"
															aria-controls={"collapseSeven" + d.id}>
															{"Technologies"}
														</button>
													</h2>
												</div>
												<div
													id={"collapseSeven" + d.id}
													className="collapse text-justify"
													aria-labelledby={"headingSeven" + d.id}
													data-parent="#accordionExample">
													{d.technologies &&
														d.technologies.map((k, i) => (
															<p className="p-1 mb-1" key={i}>
																{k}
															</p>
														))}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
		</>
	);
};

Card.propTypes = {
	onClick: PropTypes.func,
	store: PropTypes.object
};

export default Card;
