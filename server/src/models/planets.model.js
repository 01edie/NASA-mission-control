const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const planetModel = require("./planets.mongo");

const habitablePlanets = [];

const dataPath = path.join(__dirname, "..", "..", "data", "kepler_data.csv");
// console.log(dataPath);

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

const addPlanet = async (planet) => {
  try {
    await planetModel.updateOne(
      { keplerName: planet },
      { keplerName: planet },
      { upsert: true }
    );
  } catch (error) {
    console.error(`failed to add planet -${planet}`)
  }
};

const loadPlanetsData = () =>
  new Promise((resolve, reject) => {
    fs.createReadStream(dataPath)
      .pipe(parse({ comment: "#", columns: true }))
      .on("data", (chunk) => {
        if (isHabitable(chunk)) {
          addPlanet(chunk.kepler_name)
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        console.log("..............................................");
        console.log("scanning complete");
        console.log("..............................................");
        const totalPlanets = (await planetModel.find({})).length
        console.log(
          `${totalPlanets} potential habitable planets found!`
        );
        resolve();
      });
  });

const getAllPlanets =  () => {
  return planetModel.find({},{'_id':0,'__v':0});
};

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
