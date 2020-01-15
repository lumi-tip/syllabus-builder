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
	quiz: "quizzes",
	profile: "profiles"
};

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			days: [],
			info: {
				label: "",
				slug: "",
				version: "",
				profile: null,
				description: ""
			},
			profiles: [],
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
								.then(_data => {
									const data = _data.data || _data;
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
			upload: data => {
				//if its not a url
				if (!data.startsWith("http")) {
					const content = JSON.parse(data);
					const { days, profile, label, description } = content;
					setStore({
						days: days.map((d, i) => ({
							...d,
							id: i + 1,
							position: i + 1,
							lessons: d.lessons.map(l => {
								l.type = "lesson";
								return l;
							}),
							replits: d.replits.map(l => {
								l.type = "replit";
								return l;
							}),
							projects: d.assignments.map(l => {
								l.type = "project";
								return l;
							}),
							quizzes: d.quizzes.map(l => {
								l.type = "quizze";
								return l;
							})
						})),
						info: { profile, label, description }
					});
				} else
					fetch(data)
						.then(resp => {
							if (resp.ok) {
								return resp.json();
							} else throw new Error("There was an error code " + resp.status);
						})
						.then(json => {
							const { days, profile, label, description } = json;
							setStore({ days, info: { profile, label, description } });
						})
						.catch();
			},
			setInfo: data => {
				setStore({ info: { ...data } });
			},
			download: () => {
				const store = getStore();
				var dataStr =
					"data:text/json;charset=utf-8," +
					encodeURIComponent(
						JSON.stringify(
							{
								...store.info,
								slug: undefined,
								days: store.days.map(d => ({
									...d,
									projects: undefined,
									project:
										d.projects.length == 0
											? undefined
											: {
													title: d.projects[0].title,
													instructions: `https://projects.breatheco.de/project/${d.projects[0].slug}`
											  },
									assignments: d.projects.map(p => p.slug),
									replits: d.replits.map(e => ({
										title: e.title,
										slug: e.slug
									})),
									quizzes: d.quizzes.map(e => ({
										title: e.title,
										slug: e.slug
									})),
									lessons: d.lessons.map(e => ({
										title: e.title,
										slug: e.slug
									}))
								}))
							},
							null,
							"   "
						)
					);
				var dlAnchorElem = document.getElementById("downloadAnchorElem");
				dlAnchorElem.setAttribute("href", dataStr);
				dlAnchorElem.setAttribute("download", store.info.slug ? store.info.slug + ".json" : "syllabus.json");
				dlAnchorElem.click();
			},
			pieces: function() {
				const store = getStore();
				return {
					in: (piece, day) => {
						this.pieces().delete(piece);
						this.days().update(day.id, day);
					},
					out: (piece, day) => {
						this.pieces().add(piece);
						this.days().update(day.id, day);
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
									id: store.days.length + 1,
									position: store.days.length + 1,
									label: "",
									"key-concepts": [],
									lessons: [],
									projects: [],
									replits: [],
									quizzes: []
								}
							])
						}),
					update: (id, day) => {
						const store = getStore();
						setStore({
							days: store.days.map(d => {
								if (d.id != id) return d;
								else return { ...d, ...day };
							})
						});
					},
					delete: id => {
						const store = getStore();
						setStore({
							days: store.days
								.filter(d => d.id != id)
								.sort((a, b) => (a.position > b.position ? -1 : 1))
								.map((d, i) => {
									return { ...d, position: i + 1 };
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
