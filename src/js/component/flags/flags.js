import React from "react";
import PropTypes from "prop-types";
import US_FLAG from "./us.png";
import ES_FLAG from "./es.png";

const langs = {
	us: US_FLAG,
	es: ES_FLAG
};

const Flag = ({ lang, style }) => {
	if (langs[lang] === undefined) <i className="fa-solid fa-clipboard-question"></i>;
	return <img style={{ maxHeight: "20px", ...style }} src={langs[lang]} />;
};

Flag.propTypes = {
	lang: PropTypes.string,
	style: PropTypes.object
};

export default Flag;
