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
