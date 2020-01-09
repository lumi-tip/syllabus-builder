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
	lesson: "lessons",
	project: "projects",
	replit: "replits",
	quiz: "quizzes"
};
export function injectContent(Child) {
	const StoreWrapper = props => {
		const [store, setStore] = useState({
			days: [],
			lessons: [],
			exercises: [],
			project: [],
			quizzes: []
		});
		const actions = {
			fetch: models => {
				if (!Array.isArray(models)) models = [models];
				const promises = models.map(
					entity =>
						new Promise((resolve, reject) => {
							//fetch('https://assets.breatheco.de/apis/lesson/all/v2')
							API[entity]()
								.all()
								.then(data => {
									setStore({
										...store,
										[mapEntity[entity]]: data.map(e => {
											e.type = entity;
											return e;
										})
									});
									resolve(data);
								});
						})
				);
			},
			addDay: () => {
				setStore({
					...store,
					days: store.days.concat([
						{
							lessons: [],
							projects: [],
							replits: [],
							quizzes: []
						}
					])
				});
			},
			movePiece: (i, piece) => {
				setStore({
					...store,
					[mapEntity[piece.type]]: store[
						mapEntity[piece.type]
					].filter(p => p.slug != piece.slug),
					days: store.days.map((d, _i) => {
						if (_i != i) return d;
						else
							return {
								...d,
								[mapEntity[piece.type]]: d[
									mapEntity[piece.type]
								]
									.filter(p => p.slug === piece.slug)
									.concat(piece)
							};
					})
				});
			},
			moveOutPiece: (i, piece) => {
				setStore({
					...store,
					[mapEntity[piece.type]]: store[mapEntity[piece.type]]
						.filter(p => p.slug != piece.slug)
						.concat(piece),
					days: store.days.map((d, _i) => {
						if (_i != i) return d;
						else
							return {
								...d,
								[mapEntity[piece.type]]: d[
									mapEntity[piece.type]
								].filter(p => p.slug === piece.slug)
							};
					})
				});
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
