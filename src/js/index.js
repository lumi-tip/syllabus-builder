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
		actions.fetch(["lessons", "quiz", "project"]);
	}, []);
	return (
		<DndProvider backend={Backend}>
			<div className="row no-gutters">
				<div className="left-side col-4 bg-light">
					<div className="content lessons">
						<ContentWidget type="lessons" pieces={store.lessons} />
					</div>
					<div className="content projects">
						<ContentWidget type="project" pieces={store.projects} />
					</div>
				</div>
				<div className="col-8 p-3">
					<div className="text-right mb-2">
						<button className="btn btn-dark btn-sm">
							<i className="fas fa-plus" /> Add new day
						</button>
					</div>
					{store.days.map((d, i) => (
						<Day
							key={i}
							number={i}
							onDrop={piece => actions.movePiece(piece, i)}
						/>
					))}
				</div>
			</div>
		</DndProvider>
	);
});

//render your react application
ReactDOM.render(<Main />, document.querySelector("#app"));
