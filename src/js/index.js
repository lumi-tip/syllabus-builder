//import react into the bundle
import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../styles/index.scss";
import { Day, ContentWidget } from "./component";
import { ContentContext, injectContent } from "./context.js";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
//include your index.scss file into the bundle

const Main = injectContent(() => {
	const { store, actions } = useContext(ContentContext);

	useEffect(() => {
		actions.fetch("lesson");
		actions.fetch("quiz");
		actions.fetch("project");
		actions.fetch("replit");
	}, []);
	return (
		<DndProvider backend={Backend}>
			<div className="row no-gutters">
				<div className="left-side col-4 col-md-3 bg-light">
					<div className="content lessons">
						<ContentWidget type="lesson" pieces={store.lessons} />
					</div>
					<div className="content replits">
						<ContentWidget type="replit" pieces={store.replits} />
					</div>
					<div className="content projects">
						<ContentWidget type="project" pieces={store.projects} />
					</div>
					<div className="content quizzes">
						<ContentWidget type="quiz" pieces={store.quizzes} />
					</div>
				</div>
				<div className="col-8 col-md-9 p-3">
					<div className="text-right mb-2">
						<button className="btn btn-dark btn-sm" onClick={() => actions.days().add()}>
							<i className="fas fa-plus" /> Add new day
						</button>
					</div>
					{store.days.sort((a, b) => (a.number < b.number ? 0 : 1)).map((d, i) => (
						<Day key={i} data={d} />
					))}
				</div>
			</div>
		</DndProvider>
	);
});

//render your react application
ReactDOM.render(<Main />, document.querySelector("#app"));
