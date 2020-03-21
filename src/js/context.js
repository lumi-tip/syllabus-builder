import React, { useState, useEffect } from "react";
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
			setStore: _store => setStore(_store),
			getStore: () => getStore(),
			fetch: (models, forceUpdate = false) => {
				if (!Array.isArray(models)) models = [models];
				const promises = models.map(
					entity =>
						new Promise((resolve, reject) => {
							if (forceUpdate || !Array.isArray(mapEntity[entity] || mapEntity[entity].length == 0))
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
				const { projects } = getStore();
				if (typeof data.content === "string" && !data.content.startsWith("http")) {
					const content = JSON.parse(data.content);
					const pieces = data.content.split(",");
					const version = pieces.length === 3 ? pieces[1] : "";
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
							assignments: d.assignments.map(p => {
								const project = projects.find(_pro => _pro.slug === p);
								return project;
							}),
							quizzes: d.quizzes.map(l => {
								l.type = "quizze";
								return l;
							})
						})),
						info: { slug: profile, profile, label, description, version }
					});
				} else
					fetch(data)
						.then(resp => {
							if (resp.ok) {
								return resp.json();
							} else throw new Error("There was an error code " + resp.status);
						})
						.then(json => {
							let { days, profile, label, description, weeks } = json;
							if (weeks)
								days = weeks
									.map(w => w.days)
									.flat()
									.filter(d => d.label !== "Weekend")
									.map((d, i) => ({
										...d,
										id: i + 1,
										position: i + 1,
										lessons: d.lessons ? d.lessons.map(l => ({ ...l, type: "lesson" })) : [],
										replits: d.replits ? d.replits.map(l => ({ ...l, type: "replit" })) : [],
										assignments: d.assignments
											? d.assignments.map(a => ({ ...projects.find(p => p.slug === a), type: "project" }))
											: [],
										quizzes: d.quizzes ? d.lessons.map(l => ({ ...l, type: "quiz" })) : [],
										"key-concepts": d["key-concepts"] || []
									}));
							console.log("Days", days);
							const pieces = data.split(",");
							const version = pieces.length === 3 ? pieces[1] : "";
							setStore({ days, info: { slug: profile, profile, label, description, version } });
						})
						.catch();
			},
			setInfo: data => {
				setStore({ info: { ...data } });
				window.location.hash = data.slug;
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
									assignments: d.assignments.map(p => p.slug),
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
				setStore: updatedStore => {
					const currentStore = state.actions.getStore();
					const store = Object.assign(currentStore, updatedStore);
					setState({ store, actions: { ...state.actions } });
					localStorage.setItem("syllabus-" + store.info.slug, JSON.stringify(store));
				}
			})
		);
		useEffect(() => {
			const slug = window.location.hash.replace("#", "");
			const previousStore = localStorage.getItem("syllabus-" + slug);
			if (typeof previousStore === "string" && previousStore != "") state.actions.setStore(JSON.parse(previousStore));

			setTimeout(() => state.actions.fetch(["lesson", "quiz", "project", "replit", "profile"]), 1000);
		}, []);
		return (
			<ContentContext.Provider value={state}>
				<Child {...props} />
			</ContentContext.Provider>
		);
	};
	return StoreWrapper;
}
