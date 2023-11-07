const axios = require("axios");

const launchesModel = require("./launches.mongo");
const planets = require("./planets.mongo");
const STANDARD_ERRORS = require("../constants/errors");

const DEFAULT_FLIGHT_NUMBER = 100;
const SPACEX_API_URL = process.env.SPACEX_API_URL;

const launchInit = {
  // from spaceX api
  flightNumber: 100, // flight_number
  mission: "Kepler Exploration X", //name
  rocket: "Explorer IS1", // rocket.name
  launchDate: new Date("December 27, 2030"), // date_local
  target: "Kepler-452 b", // not applicable
  customers: ["ZTM", "NASA"], // payloads.customers for each
  upcoming: true, // upcoming
  success: true, // success
};

const findLaunch = (filter) => launchesModel.findOne(filter);

const saveLaunch = async (launch) => {
  await launchesModel.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
};

const populateDatabaseWithLaunches = async () => {
  console.log("Downloading launches data from spaceX API...");
  const res = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (res.status !== 200) {
    throw new Error("Problem downloading launches data from spaceX API");
  }

  const launchDocs = res.data?.docs;
  // console.log(launchDocs);
  for (launch of launchDocs) {
    const customers = launch.payloads.flatMap((payload) => payload.customers);
    const launchData = {
      flightNumber: launch.flight_number,
      mission: launch.name,
      rocket: launch.rocket.name,
      launchDate: launch.date_local,
      // target: "Kepler-452 b", // not applicable
      customers,
      upcoming: launch.upcoming,
      success: launch.success,
    };
    await saveLaunch(launchData);
  }
};

const loadLaunchData = async () => {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });

  if (firstLaunch) {
    console.log("data already loaded");
  } else {
    populateDatabaseWithLaunches();
  }
};

const getLatestLaunchNumber = async () => {
  const latestLaunch = await launchesModel.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
};

const saveInitialLaunch = () => saveLaunch(launchInit);

const getAllLaunches = ({ skip, limit }) =>
  launchesModel
    .find({}, { _id: 0, __v: 0 })
    .skip(skip)
    .limit(limit)
    .sort({ flightNumber: 1 });

const scheduleNewLaunch = async (launch) => {
  const planet = await planets.findOne({ keplerName: launch.target });
  // console.log(planet)
  if (!planet) {
    throw new Error(STANDARD_ERRORS.SCHEDULE_LAUNCH.PLANET_NOT_FOUND);
    // console.log('Target planet not found...')
  }
  const newFlightNumber = (await getLatestLaunchNumber()) + 1;
  console.log({ newFlightNumber });
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customers: ["ZTM", "NASA"],
    upcoming: true,
    success: true,
  });
  await saveLaunch(newLaunch);
};

const launchExistsWithId = (launchId) => {
  return findLaunch({ flightNumber: launchId });
};

const abortLaunchById = async (launchId) => {
  const aborted = await launchesModel.updateOne(
    { flightNumber: launchId },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
};

module.exports = {
  loadLaunchData,
  getAllLaunches,
  scheduleNewLaunch,
  launchExistsWithId,
  abortLaunchById,
  saveInitialLaunch,
};
