export const getCurrentUrl = (url = window.location) => {
	const querystring = new URLSearchParams(url.search);
	querystring.delete("token");

	return window.location.origin + window.location.pathname + querystring.toString() + window.location.hash;
};

export const getUrlParams = () => {
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop)
	});

	return params;
};
