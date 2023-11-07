const http = require("http");
require("dotenv").config();

const app = require("./app");
const { loadPlanetsData } = require("./models/planets.model");
const { connectMongo } = require("./services/mongo");
const { loadLaunchData } = require("./models/launches.model");

const PORT = process.env.PORT || 4242;

const server = http.createServer(app);

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const startServer = async () => {
  await connectMongo();
  await loadPlanetsData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
  });
};

startServer();
