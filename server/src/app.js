const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const apiV1 = require("./routes/api");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// time monitoring

app.use((req, res, next) => {
  const timeStamp = new Date().valueOf();
  next();
  const timeTaken = new Date().valueOf() - timeStamp;
  console.log(`processing time for ${req.method} ${req.url} is ${timeTaken}ms`);
});

app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", apiV1);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
