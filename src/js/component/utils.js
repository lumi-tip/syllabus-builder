import React from "react";

export const urls = {
	lesson: "https://content.breatheco.de/lesson/",
	project: "https://projects.breatheco.de/project/",
	quiz: "https://breathecode.herokuapp.com/v1/registry/asset/",
	replit: "https://breathecode.herokuapp.com/v1/registry/asset/"
};

export const getSlug = data => {
	let slug = data.slug !== undefined ? data.slug.split(".")[0] : data.info.slug;
	slug = slug.substr(slug.indexOf("]") + 1);
	return slug;
};

export const getLink = async data => {
	if (!data) throw Error("No data url");
	if (data.url) return data.url;

	let slug = getSlug(data);
	const url = typeof urls[data.type] !== "undefined" ? urls[data.type] + slug : "/undefined_url_for_" + data.type;

	return url;
};

export const serialize = data => {
	return {
		...data,

		// swap external with target if any
		target: data.target !== undefined ? data.target : data.external === true ? "blank" : "self",
		external: undefined
	};
};

export const getTitle = data => {
	let title = "";
	if (data && typeof data !== "undefined") {
		if (typeof data.title !== "undefined") title = data.title;
		else if (typeof data.info !== "undefined") title = data.info.name || data.info.title || data.info.slug;
	}
	if (title == "") {
		console.error("There is undefined title for: ", data);
		title = "Undefined title";
	}
	return title;
};

export const getStatus = data => {
	let _status = "published";
	if (data.type === "lesson" || data.type === "project") {
		_status = data.status && data.status != "undefined" ? data.status : status;
	}
	return _status;
};

export let mappers = [
	{ type: "lesson", storeName: "lessons", draggable: true },
	{ type: "replit", storeName: "replits", draggable: true },
	{ type: "quiz", storeName: "quizzes", draggable: true },
	{ type: "project", storeName: "projects", draggable: true },
	{ type: "technology", storeName: "technologies", draggable: false }
];

export function useDebounce(value, delay) {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = React.useState(value);
	React.useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(value);
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay] // Only re-call effect if value or delay changes
	);
	return debouncedValue;
}

export const getAPIErrors = payload => {
	let errors = [];

	if (payload.detail !== undefined || payload.details !== undefined) return payload.detail || payload.details;

	if (Array.isArray(payload.errors)) return payload;

	for (let field in payload) {
		errors.push(`Invalid ${field}: ${payload[field]}`);
	}
	return errors;
};
