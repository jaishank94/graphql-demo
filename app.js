require("dotenv").config();
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { getUrlsTitle } = require("./helper/index.js");

const app = express();

const mentionsRegex = /@([A-z]+)\b[^\w]/gi;
const emoticonsRegex = /(^|\()([A-z]+)\b\)/gi;
const linksRegex =
  /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim;

const dataSchema = buildSchema(`
      type Query {
        records(message: String!): Record
      }

      type Record {
        mentions: [String]
        emoticons: [String]
        links: [Link]
      }

      type Link {
        url: String
        title: String
      }
`);

const getRecordInfo = async (args) => {
  const message = String(args.message);

  const mentionsInfo = message.match(mentionsRegex);

  const emoticonsInfo = message.match(emoticonsRegex);

  const linkInfo = message.match(linksRegex);

  return {
    mentions:
      mentionsInfo &&
      mentionsInfo.map((val) => val.substring(1, val.length - 1)),
    emoticons:
      emoticonsInfo &&
      emoticonsInfo.map((val) => val.substring(1, val.length - 1)),
    links: linkInfo && getUrlsTitle(linkInfo),
  };
};

const root = {
  records: getRecordInfo,
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: dataSchema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port: ${process.env.PORT}`);
});
