const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");

const habitablePlanets = [];

const dataPath = path.join(__dirname, "..", "..", "data", "kepler_data.csv");
console.log(dataPath);

function isHabitable(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6 &&
    planet["koi_teq"] > 32 &&
    planet["koi_teq"] < 225
    // 221
  );
}

const loadPlanetsData = () =>
  new Promise((resolve, reject) => {
    fs.createReadStream(dataPath)
      .pipe(parse({ comment: "#", columns: true }))
      .on("data", (chunk) => {
        if (isHabitable(chunk)) habitablePlanets.push(chunk);
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", () => {
        console.log("..............................................");
        console.log("scanning complete");
        console.log("..............................................");
        console.log(
          `${habitablePlanets.length} potential habitable planets found!`
        );
        resolve();
      });
  });

const getAllPlanets = () => habitablePlanets;

module.exports = {
  loadPlanetsData,
  getAllPlanets
};
