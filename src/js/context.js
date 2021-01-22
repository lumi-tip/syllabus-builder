import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import API from "./api.js";
import { url } from "./constants/constans";

const urls = url;

export const ContentContext = React.createContext({});

const newDay = (id, position) => ({
	id,
	position,
	label: "",
	"key-concepts": [],
	lessons: [],
	assignments: [],
	replits: [],
	quizzes: []
});

API.setOptions({
	assetsPath:
		//"https://8080-f0d8e861-4b22-40c7-8de2-e2406c72dbc6.ws-us02.gitpod.io/apis",
		"https://assets.breatheco.de/apis",
	apiPath: "https://api.breatheco.de",
	apiPathV2: "https://breathecode.herokuapp.com/v1"
});
const mapEntity = {
	lesson: "lessons",
	project: "projects",
	replit: "replits",
	quiz: "quizzes",
	profile: "profiles",
	syllabu: "syllabus",
	courseV2: "courses"
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
			quizzes: [],
			syllabus: [],
			courses: [],
			academies: []
		},

		actions: {
			setStore: _store => setStore(_store),
			getStore: () => getStore(),
			getMe: async () => {
				const data = await API.getMe();
				setStore({
					academies: data.roles.map(r => r.academy)
				});
			},
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
										if (mapEntity[entity] === "replits") {
											const replitsData = [Object.values(data)];
											const newReplitStore = {
												[mapEntity[entity]]: replitsData[0].map(e => {
													e.type = "replit";
													return e;
												})
											};
											setStore(newReplitStore);
										}
										const newStore = {
											[mapEntity[entity]]: data.filter(e => typeof e.lang === "undefined" || e.lang == "en").map(e => {
												e.type = entity;
												// e.status = entity.status || "published";
												return e;
											})
										};
										setStore(newStore);
										resolve(data);
									})
									.catch(error => reject(error));
						})
				);
			},
			upload: data => {
				//if its not a url
				const { projects, info } = getStore();
				if (typeof data.content === "string" && !data.content.startsWith("http")) {
					const content = JSON.parse(data.content);
					const pieces = data.content.split(",");
					const version = pieces.length === 3 ? pieces[1] : "";

					let { days, profile, label, description, weeks } = content.json || content;
					if (Array.isArray(weeks) && !Array.isArray(days)) days = [].concat.apply([], weeks.map(w => w.days));
					setStore({
						days: days.map((d, i) => {
							return {
								...d,
								id: i + 1,
								position: i + 1,
								lessons:
									d.lessons !== undefined
										? d.lessons.map(l => {
												l.type = "lesson";
												return l;
										  })
										: (d.lessons = []),
								replits:
									d.replits !== undefined
										? d.replits.map(l => {
												l.type = "replit";
												return l;
										  })
										: (d.replits = []),
								assignments:
									d.assignments !== undefined
										? d.assignments.map(p => {
												const project = projects.find(_pro => _pro.slug === p);
												return project;
										  })
										: (d.assignments = []),
								quizzes:
									d.quizzes !== undefined
										? d.quizzes.filter(f => f.slug != undefined).map(l => {
												l.type = "quiz";
												return l;
										  })
										: (d.quizzes = [])
							};
						}),
						info: { slug: profile, profile, label, description, version: content.version || info.version }
					});
				} else
					new Promise((resolve, reject) => {
						return fetch(data)
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
											quizzes: d.quizzes ? d.quizzes.map(l => ({ ...l, type: "quiz" })) : [],
											"key-concepts": d["key-concepts"] || []
										}));
								const pieces = data.split(",");
								const version = pieces.length === 3 ? pieces[1] : "";
								setStore({ days, info: { slug: profile, profile, label, description, version } });
								resolve(json);
							})
							.catch(error => reject(error));
					});
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
										d.assignments.length == 0
											? undefined
											: {
													title: d.assignments[0].title,
													instructions: `${urls.project}${d.assignments[0].slug}`
											  },
									assignments: d.assignments.map(p => p.slug),
									replits: d.replits.map(e => ({
										title: e.title,
										slug: e.slug
									})),
									quizzes: d.quizzes.map(e => ({
										title: e.info != undefined ? e.info.name : e.title,
										slug: e.info != undefined ? e.info.slug : e.slug
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
			saveSyllabus: async () => {
				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const store = getStore();
				const resp = await fetch(API.options.apiPathV2 + "/coursework/course/" + store.info.profile + "/syllabus", {
					method: "POST",
					body: JSON.stringify(
						{
							slug: undefined,
							json: {
								...store.info,
								days: store.days.map(d => ({
									...d,
									projects: undefined,
									project:
										d.assignments.length == 0
											? undefined
											: {
													title: d.assignments[0].title,
													instructions: `${urls.project}${d.assignments[0].slug}`
											  },
									assignments: d.assignments.map(p => p.slug),
									replits: d.replits.map(e => ({
										info: {
											title: e.title,
											slug: e.slug
										}
									})),
									quizzes: d.quizzes.map(e => ({
										info: {
											title: e.info != undefined ? e.info.name : e.title,
											slug: e.info != undefined ? e.info.slug : e.slug
										}
									})),
									lessons: d.lessons.map(e => ({
										title: e.title,
										slug: e.slug
									}))
								}))
							}
						},
						null,
						"   "
					),
					headers: {
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						const data = await resp.json();
						throw Error(data.details);
					} else {
						throw Error("There was an error saving the syllabus");
					}
				}
				return await resp.json();
			},
			clear: () => {
				const store = getStore();
				localStorage.removeItem("syllabus-" + store.info.slug, JSON.stringify(store));
				setStore({
					days: [],
					info: {
						label: "",
						slug: "",
						version: "",
						profile: null,
						description: ""
					}
				});
			},
			editSyllabus: async () => {
				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const store = getStore();
				const actions = getActions();
				const resp = await fetch(API.options.apiPathV2 + "/coursework/course/" + store.info.profile + "/syllabus/" + store.info.version, {
					method: "PUT",
					body: JSON.stringify(
						{
							slug: undefined,
							json: {
								...store.info,
								days: store.days.map(d => ({
									...d,
									projects: undefined,
									project:
										d.assignments.length == 0
											? undefined
											: {
													title: d.assignments[0].title,
													instructions: `${urls.project}${d.assignments[0].slug}`
											  },
									assignments: d.assignments.map(p => p.slug),
									replits: d.replits.map(e => ({
										title: e.title,
										slug: e.slug
									})),
									quizzes: d.quizzes.map(e => ({
										title: e.info != undefined ? e.info.name : e.title,
										slug: e.info != undefined ? e.info.slug : e.slug
									})),
									lessons: d.lessons.map(e => ({
										title: e.title,
										slug: e.slug
									}))
								}))
							}
						},
						null,
						"   "
					),
					headers: {
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						const data = await resp.json();
						throw Error(data.details);
					} else {
						throw Error("There was an error saving the syllabus");
					}
				}
				return await resp;
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
					add: piece => {
						piece.type === "quiz"
							? setStore({
									[mapEntity[piece.type]]: store[mapEntity[piece.type]]
										.filter(
											p =>
												typeof piece.info.slug !== undefined
													? p.info.slug !== piece.info.slug
													: p.info.slug !== piece.data.info.slug
										)
										.concat(piece)
							  })
							: setStore({
									[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(p => p.slug !== piece.slug).concat(piece)
							  });
					},
					delete: piece => {
						piece.type === "quiz"
							? setStore({
									[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(
										p =>
											typeof piece.data.info.slug === undefined
												? p.info.slug !== piece.slug
												: p.info.slug !== piece.data.info.slug
									)
							  })
							: setStore({
									[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(p => p.slug != piece.data.slug)
							  });
					}
				};
			},
			getApiSyllabus: async (profile, version) => {
				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const resp = await fetch(API.options.apiPathV2 + "/coursework/course/" + profile + "/syllabus/" + version, {
					headers: {
						//"Cache-Control": "no-cache",
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				const data = await resp.text();
				const actions = getActions();
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						throw Error(data.details);
					} else {
						throw Error("There was an error saving the syllabus");
					}
				}

				return await actions.upload({ content: data });
			},
			setCourseSlug: async courseSlug => {
				const store = getStore();
				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const resp = await fetch(API.options.apiPathV2 + "/coursework/course/" + courseSlug + "/syllabus", {
					headers: {
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				const data = await resp.json();
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						throw Error(data.details);
					} else {
						throw Error("There was an error saving the syllabus");
					}
				}
				setStore({ ...store, syllabus: data });
			},
			days: () => {
				const store = getStore();
				return {
					add: (index = null) =>
						setStore({
							days: (() => {
								let _days = [];
								let extra = 0;
								for (let i = 0; i < store.days.length; i++) {
									if (index && index == i) {
										_days.push(newDay(i + 1, i + 1));
										extra = 1;
									}
									_days.push({ ...store.days[i], id: extra + i + 1, position: extra + i + 1 });
								}
								if (index === null || index === store.days.length) _days.push(newDay(store.days.length + 1, store.days.length + 1));
								return _days;
							})()
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
								// .sort((a, b) => (a.position < b.position ? -1 : 1))
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

			setTimeout(() => state.actions.fetch(["lesson", "quiz", "project", "replit", "profile", "courseV2"]), 1000);
		}, []);
		return (
			<ContentContext.Provider value={state}>
				<Child {...props} />
			</ContentContext.Provider>
		);
	};
	return StoreWrapper;
}
