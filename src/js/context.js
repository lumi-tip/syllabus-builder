import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import API from "./api.js";
import swal from "sweetalert";
import { urls, serialize } from "./component/utils";
import { ToastProvider } from "react-toast-notifications";
import { getUrlParams } from "./utils/url";
export const ContentContext = React.createContext({});

const defaultVal = (value, def) => (value === undefined ? def : value);

const newDay = (id = 0, position = 0, seed = {}) => ({
	label: "",
	"key-concepts": [],
	lessons: [],
	profiles: [], //only used for modal windows to select profile
	projects: [],
	replits: [],
	quizzes: [],
	technologies: [],
	...seed,
	id,
	position
});

API.setOptions({
	apiPath: "https://api.breatheco.de",
	apiPathV2: process.env.API_URL + "/v1"
	// apiPathV2: "https://8000-b748e395-8aa2-4f7e-bfc5-0b7234f4f182.ws-us03.gitpod.io/v1"
});

function removeNull(obj) {
	const newObj = { ...obj };
	for (const key in newObj) {
		if (newObj[key] === null || newObj[key] === undefined) {
			delete newObj[key];
		}
	}
	return newObj;
}

const mapEntity = {
	lesson: "lessons",
	project: "projects",
	profile: "profiles",
	technology: "technologies",
	translation: "translations",
	replit: "replits",
	quiz: "quizzes",
	syllabu: "syllabus",
	courseV2: "courses"
};
const reveseMap = type => {
	for (let key in mapEntity) {
		if (mapEntity[key] === type) return key;
	}
	return null;
};
const defaultSyllabusInfo = {
	label: "",
	slug: "",
	version: "",
	profile: null,
	description: "",
	academy_author: null,
	duration_in_days: 0
};
const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			days: [],
			info: defaultSyllabusInfo,
			lessons: [],
			projects: [],
			replits: [],
			quizzes: [],
			syllabus: [],
			courses: [],
			academies: [],
			technologies: [],
			translations: [],
			report: [],
			imported_days: [],
			imported_syllabus: []
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
			setSyllabusErrors: (errors) => {
				setStore({
					syllabus_errors: errors
				});
			},
			cleanSyllabusErrors: () => {
				setStore({
					syllabus_errors: []
				});
			},
			fetch: (models, filters = {}, forceUpdate = false) => {
				if (!Array.isArray(models)) models = [models];
				filters = removeNull(filters);

				return models.map(
					entity =>
						new Promise((resolve, reject) => {
							if (!forceUpdate && Array.isArray(mapEntity[entity]) && mapEntity[entity].length > 0) {
								console.error(`Can't fetch ${entity} because its already fetched`);
								resolve(false);
								return false;
							}

							const _entity = API[entity]();
							_entity
								.filter(filters)
								.then(_data => {
									let data = _data.data || _data;
									data = data.results || data;
									if (!Array.isArray(data)) data = Object.values(data);
									const newStore = {
										[mapEntity[entity]]: data
											.filter(e => {
												const keep =
													typeof e.lang === "undefined" ||
													e.lang == "us" ||
													e.lang == "en" ||
													["project", "replit", "exercise", "lesson"].includes(entity);
												//if (!keep) console.log(`entity ${entity} was filted`, e);
												return keep;
											})
											.map(e =>
												serialize({
													...e,
													type: entity
												})
											)
									};
									console.log("newStore", newStore);
									setStore(newStore);
									resolve(data);
								})
								.catch(error => console.log(`Error fetching ${entity}`) || reject(error));
						})
				);
			},
			count: (models, filters = {}, forceUpdate = false) => {
				if (!Array.isArray(models)) models = [models];

				return models.map(
					entity =>
						new Promise((resolve, reject) => {
							const _entity = API[entity]();
							_entity
								.count(filters)
								.then(total => {
									const newStore = {
										[mapEntity[entity] + "Total"]: total
									};
									setStore(newStore);
									resolve(total);
								})
								.catch(error => console.log(`Error fetching count for ${entity}`) || reject(error));
						})
				);
			},
			report: () => {
				return {
					add: (type, message, item) => {
						const store = getStore();
						setStore({
							report: store.report.concat({
								type,
								message,
								item
							})
						});
					},
					clear: () => {
						setStore({ report: [] });
					}
				};
			},
			import: data => {
				const actions = getActions();
				const { projects } = getStore();
				let content = JSON.parse(data.content);
				let json = typeof content.json === "string" ? (json = JSON.parse(content.json)) : content.json;

				let { days, weeks } = json || content;
				if (Array.isArray(weeks) && !Array.isArray(days))
					days = [].concat.apply(
						[],
						weeks.map(w => w.days)
					);
				setStore({
					imported_days: days.map((d, i) => {
						return {
							...d,
							id: i + 1,
							position: i + 1,
							technologies: d.technologies || [],
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
							//from the json it comes like an assignment, but its really a project
							projects:
								d.assignments !== undefined
									? d.assignments.map(p => {
										const project = projects.find(_pro => (p.slug !== undefined ? _pro.slug === p.slug : _pro.slug === p));
										if (project === undefined) {
											console.log("project not found", p);
											if (typeof p === "object") {
												actions.report().add("warning", `Project not found ${p.slug || p} on position ${i + 1}`, p);
												return {
													...p,
													type: "project"
												};
											} else {
												console.log("invalid project", p);
												actions.report().add("error", `Invalid project ${p} on position ${i + 1}`, p);
												return {
													type: "project",
													slug: p,
													title: "Invalid project"
												};
											}
										}

										return project;
									})
									: (d.assignments = []),
							quizzes:
								d.quizzes !== undefined
									? d.quizzes
										.filter(f => f.slug != undefined)
										.map(l => {
											l.type = "quiz";
											return l;
										})
									: (d.quizzes = [])
						};
					})
				});
			},
			upload: (data, overrideInfo = {}) => {
				//if its not a url
				const actions = getActions();
				const { projects, info } = {
					...getStore(),
					info: overrideInfo
				};

				if (typeof data.content === "string" && !data.content.startsWith("http")) {
					let content = JSON.parse(data.content);

					let { duration_in_days, status, duration_in_hours, academy_owner } = content; // get general info form the syllabus

					let json = typeof content.json === "string" ? (json = JSON.parse(content.json)) : content.json;
					actions.report().clear(); //clear noticications

					let { days, label, description, weeks } = json || content;
					if (Array.isArray(weeks) && !Array.isArray(days))
						days = [].concat.apply(
							[],
							weeks.map(w => w.days)
						);
					let _newStore = {
						days: days.map((d, i) => {
							return {
								...d,
								id: i + 1,
								position: i + 1,
								duration_in_days: d.duration_in_days || 1,
								technologies: d.technologies || [],
								lessons:
									d.lessons !== undefined
										? d.lessons.map((l, position) => {
											l.position = defaultVal(l.position, position);
											l.type = "lesson";
											return l;
										})
										: (d.lessons = []),
								replits:
									d.replits !== undefined
										? d.replits.map((l, position) => {
											l.position = defaultVal(l.position, position);
											l.type = "replit";
											return l;
										})
										: (d.replits = []),
								// from the JSON it comes like an assignment, but it's really a project
								projects:
									d.assignments !== undefined
										? d.assignments.map((a, position) => {
											const project = projects.find(_pro =>
												a.slug !== undefined ? _pro.slug === a.slug : _pro.slug === a
											);
											if (project === undefined) {
												if (typeof a === "object") {
													actions.report().add("warning", `Project not found ${a.slug || a} on position ${i + 1}`, a);
													return {
														...a,
														type: "project"
													};
												} else {
													console.log("invalid project", a);
													actions.report().add("error", `Invalid project ${a} on position ${i + 1}`, a);
													return {
														type: "project",
														slug: a,
														title: "Invalid project"
													};
												}
											} else {
												project.target = a.target;
												project.position = defaultVal(a.position, position);
												project.title = a.title;
												project.mandatory = a.mandatory;
												return project;
											}
										})
										: (d.assignments = []),
								quizzes:
									d.quizzes !== undefined
										? d.quizzes
											.filter(f => f.slug != undefined)
											.map((l, position) => {
												l.position = defaultVal(l.position, position);
												l.type = "quiz";
												return l;
											})
										: (d.quizzes = [])
							};
						})
					};
					setStore(_newStore);

					let _info = {
						slug: info.profile,
						profile: info.profile,
						academy_author: academy_owner?.id || academy_owner,
						duration_in_days: duration_in_days || 0,
						duration_in_hours: duration_in_hours || 0,
						label,
						description,
						version: content.version,
						status: content.status
					};
					actions.setInfo(_info);

					return {
						..._newStore,
						info: _info
					};
				} else
					new Promise((resolve, reject) => {
						return fetch(data)
							.then(resp => {
								if (resp.ok) {
									return resp.json();
								} else throw new Error("There was an error code " + resp.status);
							})
							.then(json => {
								let { days, label, description, weeks, academy_owner } = json;
								if (weeks)
									days = weeks
										.map(w => w.days)
										.flat()
										.filter(d => d.label !== "Weekend")
										.map((d, i) => ({
											...d,
											id: i + 1,
											position: i + 1,
											technologies: d.technologies || [],
											lessons: d.lessons
												? d.lessons.map(l => ({
													...l,
													type: "lesson"
												}))
												: [],
											replits: d.replits
												? d.replits.map(l => ({
													...l,
													type: "replit"
												}))
												: [],
											projects: d.assignments
												? d.assignments.map(a => ({
													...projects.find(p => p.slug === a),
													type: "project"
												}))
												: [],
											quizzes: d.quizzes
												? d.quizzes.map(l => ({
													...l,
													type: "quiz"
												}))
												: [],
											"key-concepts": d["key-concepts"] || []
										}));
								setStore({ days });

								actions.setInfo({
									slug: info.profile,
									profile: info.profile,
									academy_author: academy_owner?.id || academy_owner,
									duration_in_days: info.duration_in_days,
									duration_in_hours: info.duration_in_hours,
									status: info.status,
									label,
									description,
									version: info.version
								});
								resolve(json);
							})
							.catch(error => reject(error));
					});
			},
			setInfo: data => {
				const store = getStore();
				setStore({ info: { ...store.info, ...data } });
				window.location.hash = data.slug;
			},
			serialize: newVersion => {
				const store = getStore();
				let payload = {
					...store.info,
					days: store.days.map(d => ({
						...d,
						duration_in_days: d.duration_in_days || 1,
						projects: undefined,
						project:
							d.projects.length == 0
								? undefined
								: {
									title: d.projects[0].title,
									instructions: `${urls.project}${d.projects[0].slug}`
								},
						assignments: d.projects.map(p => ({
							slug: p.slug,
							title: p.title,
							target: p.target,
							position: p.position,
							url: p.url,
							mandatory: defaultVal(p.mandatory, true)
						})),
						replits: d.replits.map(e => ({
							title: e.info != undefined ? e.info.title : e.title,
							slug: e.info != undefined ? e.info.slug : e.slug,
							position: e.info != undefined ? e.info.position : e.position,
							target: e.info != undefined ? e.info.target : e.target,
							url: e.info != undefined ? e.info.url : e.url,
							mandatory: e.info != undefined ? defaultVal(e.info.mandatory, true) : defaultVal(e.mandatory, true)
						})),
						quizzes: d.quizzes.map(e => ({
							title: e.info != undefined ? e.info.name : e.title,
							target: e.info != undefined ? e.info.target : e.target,
							slug: e.info != undefined ? e.info.slug : e.slug,
							position: e.info != undefined ? e.info.position : e.position,
							url: e.info != undefined ? e.info.url : e.url,
							mandatory: e.info != undefined ? defaultVal(e.info.mandatory, true) : defaultVal(e.mandatory, true)
						})),
						lessons: d.lessons.map(e => ({
							title: e.title,
							slug: e.slug.substr(e.slug.indexOf("]") + 1), //remove status like [draft]
							target: e.info != undefined ? e.info.target : e.target,
							url: e.info != undefined ? e.info.url : e.url,
							position: e.info != undefined ? e.info.position : e.position,
							mandatory: e.info != undefined ? defaultVal(e.info.mandatory, true) : defaultVal(e.mandatory, true)
						}))
					}))
				};
				payload = { json: payload };
				if (newVersion) payload.slug = undefined;
				return payload;
			},
			download: () => {
				const actions = getActions();
				const store = getStore();
				var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(actions.serialize().json, null, "   "));
				var dlAnchorElem = document.getElementById("downloadAnchorElem");
				dlAnchorElem.setAttribute("href", dataStr);
				dlAnchorElem.setAttribute("download", store.info.slug ? store.info.slug + ".v" + store.info.version + ".json" : "syllabus.json");
				dlAnchorElem.click();
			},
			saveSyllabus: async (newVersion = false) => {
				const store = getStore();
				const actions = getActions();
				if (!newVersion && store.info.version == "null") throw Error("Please pick a syllabus version");
				else if (store.info.version === "new") newVersion = true;
				const url = newVersion
					? API.options.apiPathV2 + "/admissions/syllabus/" + store.info.profile + "/version" + "?ignore=projects"
					: API.options.apiPathV2 + "/admissions/syllabus/" + store.info.profile + "/version/" + store.info.version + "?ignore=projects";

				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const resp = await fetch(url, {
					method: newVersion ? "POST" : "PUT",
					body: JSON.stringify(actions.serialize(newVersion), null, "   "),
					headers: {
						Academy: parseInt(store.info.academy_author),
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						const data = await resp.json();
						if (typeof data === "object") {
							if (data.detail || data.details) throw Error(data.detail || data.details);
							for (let atr in data) {
								throw Error(`Field "${atr}": ${data[atr][0]}`);
							}
						} else {
							throw Error(data.toString());
						}
					} else {
						throw Error("There was an error saving the syllabus");
					}
				}
				return await resp.json();
			},
			clear: () => {
				const store = getStore();
				localStorage.removeItem("syllabus-" + store.info.slug);
				localStorage.removeItem("syllabus-");
				setStore({
					days: [],
					report: [],
					info: {
						label: "",
						slug: "",
						version: "",
						profile: null,
						description: ""
					}
				});
			},
			pieces: function () {
				const store = getStore();
				return {
					in: (piece, day) => {
						this.pieces().delete(piece);
						this.days().update(day.id, day);
					},
					out: (piece, day) => {
						this.pieces().addOrReplace(piece);
						this.days().update(day.id, day);
					},
					addOrReplace: piece => {
						setStore({
							[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(p => p.slug !== piece.slug).concat(piece)
						});
					},
					delete: piece => {
						setStore({
							[mapEntity[piece.type]]: store[mapEntity[piece.type]].filter(p => p.slug != piece.data.slug)
						});
					}
				};
			},
			// only used to update the original asset from the database
			database: function () {
				const store = getStore();
				return {
					add: async data => {
						const { includeInRegistry, custom, ..._asset } = data;
						if (includeInRegistry === undefined || !includeInRegistry) return _asset;

						try {
							const resp = await API.registry().createAsset({
								asset_type: _asset.type === "replit" ? "EXERCISE" : _asset.type.toUpperCase(),
								technologies: [],
								..._asset
							});
							setStore({
								[mapEntity[_asset.type]]: store[mapEntity[_asset.type]].concat(_asset)
							});

							data.custom = false;
							data.includeInRegistry = false;

							return true;
						} catch (error) {
							console.error(error);
							throw error;
						}
					}
				};
			},
			searchSyllabus: async function (value) {
				return API.registry().searchOnJSON(value);
			},
			replaceInSyllabus: async function (original, replace, type) {
				return API.registry().replaceOnJSON(original, {
					slug: replace,
					type,
					simulate: false
				});
			},
			test: async () => {
				const store = getStore();
				try {
					const report = await API.registry().testSyllabus({
						days: store.days
					});
					return report;
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
			getApiSyllabusVersion: async (academy, profile, version) => {
				console.log("getApiSyllabusVersion", academy, profile, version);
				const store = getStore();
				const meta = {
					academy_author: academy,
					profile,
					slug: profile
				};
				const _store = { ...store, info: { ...store.info, ...meta } };
				setStore(_store);

				// ignore version, academy or profile null
				if (
					!version ||
					version == "" ||
					version == "null" ||
					version == "new version" ||
					!academy ||
					academy == "" ||
					academy == "null" ||
					!profile ||
					profile == "" ||
					profile == "null"
				)
					return;

				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const resp = await fetch(API.options.apiPathV2 + "/admissions/syllabus/" + profile + "/version/" + version, {
					headers: {
						Academy: parseInt(academy),
						//"Cache-Control": "no-cache",
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				const data = await resp.text();
				const actions = getActions();
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						throw Error(data.detail || data.details);
					} else {
						throw Error("There was an error fetching the syllabus");
					}
				}

				return await actions.upload({ content: data }, _store.info);
			},
			getApiSyllabusVersionForNewDay: async (academy, profile, version) => {
				console.log("getApiSyllabusVersionForNewDay", academy, profile, version);
				// ignore version, academy or profile null
				if (
					!version ||
					version == "" ||
					version == "null" ||
					!academy ||
					academy == "" ||
					academy == "null" ||
					!profile ||
					profile == "" ||
					profile == "null"
				)
					return;

				const params = new URLSearchParams(window.location.search);
				const apiKey = params.get("token");
				const resp = await fetch(API.options.apiPathV2 + "/admissions/syllabus/" + profile + "/version/" + version, {
					headers: {
						Academy: parseInt(academy),
						//"Cache-Control": "no-cache",
						"Content-type": "application/json",
						Authorization: "Token " + apiKey
					}
				});
				const data = await resp.text();
				const actions = getActions();
				if (resp.status < 200 || resp.status > 299) {
					if (resp.status > 399 && resp.status < 500) {
						throw Error(data.detail || data.details);
					} else {
						throw Error("There was an error fetching the syllabus");
					}
				}
				return await actions.import({ content: data });
			},
			cleanSyllabus: async ({ academy = null, profile = null }) => {
				const store = getStore();
				setStore({
					...store,
					info: {
						...defaultSyllabusInfo,
						academy_author: academy,
						profile
					},
					syllabus: profile ? store.syllabus : null
				});
			},
			days: () => {
				const store = getStore();
				const actions = getActions();
				return {
					add: (index = null, imported = []) => {
						if (!Array.isArray(imported) || imported.length === 0) imported = [newDay()];
						setStore({
							days: (() => {
								let _days = [];
								let extra = 0;
								for (let i = 0; i < store.days.length; i++) {
									if (index !== null && index + 1 == i) {
										imported.forEach(d => {
											extra += 1;
											_days.push(newDay(extra + i, extra + i, d));
										});
									}
									_days.push({
										...store.days[i],
										id: extra + i + 1,
										position: extra + i + 1
									});
								}
								if (index === null || index + 1 === store.days.length) {
									let count = store.days.length;
									imported.forEach(d => {
										count += 1;
										_days.push(newDay(count, count, d));
									});
								}
								return _days;
							})()
						});
					},
					update: (id, day) => {
						const store = getStore();
						setStore({
							days: store.days.map(d => {
								if (d.id != id) return d;
								else return { ...d, ...day };
							})
						});
					},
					deleteLang: (langKey) => {
						const store = getStore();
						setStore({
							days: store.days.map(day => {
								const updatedLabel = { ...day.label };
								const updatedDescription = { ...day.description };

								delete updatedLabel[langKey];
								delete updatedDescription[langKey];

								return {
									...day,
									label: updatedLabel,
									description: updatedDescription
								};
							})
						});
					},
					translationFormat: (languagesArr) => {
						const store = getStore();
						setStore({
							days: store.days.map(day => {
								const labels = {};
								const descriptions = {};

								languagesArr.forEach((language, index) => {
									labels[language] = (index === 0 && (typeof day.label === "string" || !day.label[language]))
										? (typeof day.label === "string" ? day.label : day.label[language])
										: day.label[language] || "";

									descriptions[language] = (index === 0 && (typeof day.description === "string" || !day.description[language]))
										? (typeof day.description === "string" ? day.description : day.description[language])
										: day.description[language] || "";
								});

								return {
									...day,
									label: labels,
									description: descriptions
								};
							})
						});
					},
					basicFormat: () => {
						const store = getStore();

						const foundLanguageKey = "us";

						const newDays = store.days.map(day => {
							const defaultLabel = typeof day.label === "object" ? "" : day.label;
							const defaultDescription = typeof day.description === "object" ? "" : day.description;

							const newLabel = day.label[foundLanguageKey] || defaultLabel;
							const newDescription = day.description[foundLanguageKey] || defaultDescription;

							return {
								...day,
								label: newLabel,
								description: newDescription
							};
						});

						setStore({ days: newDays });
					},
					replacePiece: (piece, type) => {
						const store = getStore();
						for (let i = 0; i < store.days.length; i++) {
							const day = store.days[i];
							let _found = day[type].find(p => p.slug === piece.data.slug);
							if (_found) return true;
						}
						return false;
					},
					findPiece: (piece, type) => {
						const store = getStore();

						for (let i = 0; i < store.days.length; i++) {
							const day = store.days[i];
							let _found = day[type].find(p => p.slug === piece.data.slug);

							if (_found)
								return {
									found: true,
									day: { ...day, id: day.id }
								};
						}
						return { found: false, day: null };
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

					const {
						duration_in_days,
						status,
						slug,
						duration_in_hours,
						academy_author,
						academy_owner,
						...rest
					} = state.actions.serialize().json;
					const _aca = academy_owner || academy_author;

					localStorage.setItem(
						"syllabus-" + (store.info.slug || slug),
						JSON.stringify({
							slug,
							duration_in_days,
							status,
							duration_in_hours,
							academy_owner: _aca ? _aca.id || _aca : null,
							json: rest
						})
					);
				}
			})
		);
		useEffect(() => {
			const slug = window.location.hash.replace("#", "");
			const previousStore = localStorage.getItem("syllabus-" + slug);
			const params = getUrlParams();

			if (params.academy && params.syllabus) {
				API.setOptions({ academy: params.academy });
				state.actions.getApiSyllabusVersion(params.academy, params.syllabus, params.version || "latest").catch(e => {
					console.error(e);
					swal({
						icon: "error",
						text: `Error fetching syllabus, we could find a 'latest' version for syllabus ${params.syllabus} and academy ${params.academy}`
					});
				});
			} else if (typeof previousStore === "string" && previousStore != "") {
				const newStore = state.actions.upload({ content: previousStore });
				state.actions.setStore(newStore);
				API.setOptions({ academy: newStore.info.academy_author });
			}

			state.actions.count(["lesson", "quiz", "project", "replit", "technology", "translation"]);
			state.actions.fetch(["technology"]);
			window.store = state.store;
		}, []);
		return (
			<ContentContext.Provider value={state}>
				<ToastProvider placement="bottom-right" autoDismiss={true}>
					<Child {...props} />
				</ToastProvider>
			</ContentContext.Provider>
		);
	};
	return StoreWrapper;
}
