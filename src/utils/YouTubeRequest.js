const { stringify } = require(`querystring`);
const { get } = require(`https`);

class YouTubeRequest {
  constructor(apikey) {
    this.apikey = apikey;
    this.rootURL = `https://www.googleapis.com/youtube/v3/search?`;
  }
  search(query) {
    const params = stringify({
      key: this.apikey,
      part: `snippet`,
      q: query,
      type: `video`
    });
    return new Promise((res, rej) => {
      get(this.rootURL + params, response => {
        const { statusCode } = response;
        const contentType = response.headers[`content-type`];
        if (statusCode !== 200) {
          response.resume();
          rej(new Error(`Request failed. Status code: ${statusCode}`));
        } else if (!/^application\/json/.test(contentType)) {
          response.resume();
          rej(new Error(`Invalid content type. Expected application/json ` +
          `but got ${contentType}`));
        }
        let rawData = ``;
        response.on(`data`, chunk => rawData += chunk);
        response.on(`end`, () => {
          try {
            const data = JSON.parse(rawData);
            res(data);
          } catch (e) {
            rej(e);
          }
        });
      }).on(`error`, rej);
    });
  }
}

module.exports = YouTubeRequest;
