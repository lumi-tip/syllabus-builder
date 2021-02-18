export const urls = {
	lesson: "https://content.breatheco.de/lesson/",
	project: "https://projects.breatheco.de/project/",
	quiz: "https://assets.breatheco.de/apis/quiz/",
	replit: "https://assets.breatheco.de/apis/registry/all"
};

export const getLink = data => {
	let slug = "";
	if (data.type !== "quiz") {
		slug = data.type === "replit" ? data.value : data.slug !== undefined ? data.slug.split(".")[0] : data.info.slug;
	} else {
		slug = data.info.slug;
	}

	const url = typeof urls[data.type] !== "undefined" ? urls[data.type] + slug : "/undefined_url_for_" + data.type;
	return url;
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
	{ type: "lesson", storeName: "lessons" },
	{ type: "replit", storeName: "replits" },
	{ type: "quiz", storeName: "quizzes" },
	{ type: "project", storeName: "projects" }
];
