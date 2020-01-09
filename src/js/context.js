import React, { useState } from "react";
import PropTypes from "prop-types";
import API from "./api.js";

export const ContentContext = React.createContext();

API.setOptions({
	assetsPath:
		"https://8080-f0d8e861-4b22-40c7-8de2-e2406c72dbc6.ws-us02.gitpod.io/apis",
	apiPath: "https://api.breatheco.de"
});

const mapEntity = {
    "lesson": "lessons",
    "project": "projects",
    "replit": "replits",
    "quiz": "quizzes"
}
export function injectContent(Child) {
	const StoreWrapper = props => {
		const [store, setStore] = useState({
			lessons: [],
			exercises: [],
			project: [],
			quizzes: []
		});
		const actions = {
			fetch: models => {
				models.forEach(
					entity =>
						new Promise((resolve, reject) => {
							//fetch('https://assets.breatheco.de/apis/lesson/all/v2')
							API[entity]()
								.all()
								.then(data => {
									setStore({ ...store, [mapEntity[entity]]: data });
									resolve(data);
								});
						})
				);
			}
		};
		return (
			<ContentContext.Provider value={{ store, actions }}>
				<Child {...props} />
			</ContentContext.Provider>
		);
	};
	return StoreWrapper;
}