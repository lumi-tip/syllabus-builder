//import react into the bundle
import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../styles/index.scss";
import { Day, ContentWidget } from "./component";
import { ContentContext, injectContent } from "./context.js";
//include your index.scss file into the bundle

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);

	useEffect(() => {
		actions.fetch(["lessons", "quiz", "project"]);
	}, []);
	return (
		<div className="row no-gutters">
			<div className="left-side col-4 bg-light">
				<div className="content lessons">
					<ContentWidget type="lessons" pieces={store.lessons} />
				</div>
				<div className="content projects">
					<ContentWidget type="project" pieces={store.project} />
				</div>
			</div>
			<div className="col-8 p-3">
				<div className="text-right mb-2">
					<button className="btn btn-dark btn-sm">
						<i className="fas fa-plus" /> Add new day
					</button>
				</div>
				<Day />
			</div>
		</div>
	);
});

//render your react application
ReactDOM.render(<Main />, document.querySelector("#app"));
