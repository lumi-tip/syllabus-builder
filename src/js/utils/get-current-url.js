function getCurrentUrl(url = window.location) {
	const querystring = new URLSearchParams(url.search);
	querystring.delete("token");

	return window.location.origin + window.location.pathname + querystring.toString() + window.location.hash;
}

export default getCurrentUrl;
