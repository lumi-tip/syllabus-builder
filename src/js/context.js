import React, { useState } from "react";
import PropTypes from "prop-types";
import API from "./api.js";

export const ContentContext = React.createContext({});

API.setOptions({
	assetsPath:
		//"https://8080-f0d8e861-4b22-40c7-8de2-e2406c72dbc6.ws-us02.gitpod.io/apis",
		"https://assets.breatheco.de/apis",
	apiPath: "https://api.breatheco.de"
});

const mapEntity = {
	lesson: "lessons",
	project: "projects",
	replit: "replits",
	quiz: "quizzes"
};

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			days: [],
			lessons: [],
			projects: [],
			replits: [],
			quizzes: []
		},
		actions: {
			fetch: models => {
				if (!Array.isArray(models)) models = [models];
				const promises = models.map(
					entity =>
						new Promise((resolve, reject) => {
							//fetch('https://assets.breatheco.de/apis/lesson/all/v2')
							API[entity]()
								.all()
								.then(data => {
									const newStore = {
										[mapEntity[entity]]: data.map(e => {
											e.type = entity;
											return e;
										})
									};
									setStore(newStore);
									resolve(data);
								});
						})
				);
			},
			pieces: function() {
				const store = getStore();
				return {
					in: (piece, day) => {
						this.pieces().delete(piece);
						this.days().update(day);
					},
					out: (piece, day) => {
						this.pieces().add(piece);
						this.days().update(day);
					},
					add: piece =>
						setStore({
							[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(p => p.slug != piece.slug).concat(piece)
						}),
					delete: piece =>
						setStore({
							[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(p => p.slug != piece.slug)
						})
				};
			},
			days: () => {
				const store = getStore();
				return {
					add: () =>
						setStore({
							days: store.days.concat([
								{
									number: store.days.length + 1,
									label: "",
									"key-concepts": [],
									lessons: [],
									projects: [],
									replits: [],
									quizzes: []
								}
							])
						}),
					update: day => {
						const store = getStore();
						setStore({
							days: store.days.map(d => {
								if (d.number != day.number) return d;
								else return { ...d, ...day };
							})
						});
					}
				};
			}
		}
	};
};

export function injectContent(Child) {
	const StoreWrapper = props => {
		const [state, setState] = useState(
			getState({
				getStore: () => state.store,
				getActions: () => state.actions,
				setStore: updatedStore =>
					setState({
						store: Object.assign(state.store, updatedStore),
						actions: { ...state.actions }
					})
			})
		);
		return (
			<ContentContext.Provider value={state}>
				<Child {...props} />
			</ContentContext.Provider>
		);
	};
	return StoreWrapper;
}
