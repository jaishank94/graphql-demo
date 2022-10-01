const scrapingbee = require("scrapingbee");
const { load } = require("cheerio");

const getUrlsTitle = async (urls) => {
  const links = [];

  const promises = urls.map((url) => {
    return getTitle(url).then((res) => {
      var decoder = new TextDecoder();
      var text = decoder.decode(res.data);
      const title = load(text)("title").text();

      links.push({
        url,
        title,
      });
    });
  });

  await Promise.all(promises);

  return links;
};

const getTitle = async (url) => {
  var scrapingbeeRequest = new scrapingbee.ScrapingBeeClient(
    process.env.SCRAPINGBEE_API_KEY
  );
  var res = await scrapingbeeRequest.get({
    url: url,
    params: {},
  });
  return res;
};

module.exports = { getUrlsTitle };
