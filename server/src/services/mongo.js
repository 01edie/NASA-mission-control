const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

console.log({ MONGO_URL });

mongoose.connection.once("open", () =>
  console.log("MongoDB connection is ready")
);
mongoose.connection.on("error", console.error);

const connectMongo = async () => {
  await mongoose.connect(MONGO_URL);
};
const disconnectMongo = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectMongo,
  disconnectMongo,
};
