const express = require("express");
const app = express();
const PORT = 8080;
const {buildSchema} = require("graphql");
const {createHandler} = require("graphql-http/lib/use/express");
const {ruruHTML} =  require("ruru/server");

const schema = buildSchema(`
    type Query {
        hello: String
    }
    `);

const root = {
    hello() {
        return "hello world!";
    }
};

app.all(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: root,
    })
);

app.get("/", (_req, res) => {
    res.type("html")
    res.end(ruruHTML({ endpoint: "/graphql" }))
  });


app.listen(PORT, () =>{
    console.log("Serve is running");
});