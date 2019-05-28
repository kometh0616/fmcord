const fetch = require(`node-fetch`);
const { stringify } = require(`querystring`);
const { apikey, endpoint } = require(`../../config.json`).lastFM;

module.exports = async params => {
  params.api_key = apikey;
  params.format = `json`;
  const query = stringify(params);
  const data = await fetch(endpoint + query).then(r => r.json());
  return data;
};
