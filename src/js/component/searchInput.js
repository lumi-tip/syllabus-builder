import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

const SearchInput = ({ onSearch, ...rest }) => {
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query, 300);

	useEffect(() => {
		if (debouncedQuery) {
			// Perform API call or other actions
			onSearch(debouncedQuery);
		}
	}, [debouncedQuery]);

	return (
		<>
			<input {...rest} type="text" value={query} onChange={e => setQuery(e.target.value)} />
		</>
	);
};

SearchInput.propTypes = {
	onSearch: PropTypes.func
};
export default SearchInput;
