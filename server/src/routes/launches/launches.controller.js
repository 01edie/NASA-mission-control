const {
  getAllLaunches,
  scheduleNewLaunch,
  launchExistsWithId,
  abortLaunchById,
} = require("../../models/launches.model");
const STANDARD_ERRORS = require("../../constants/errors");
const { getPagination } = require("../../services/query");

const httpGetAllLaunches = async (req, res) => {
  const pagination = getPagination(req.query);
  return res.status(200).json(await getAllLaunches(pagination));
};

const httpAddNewLaunch = async (req, res) => {
  const launch = req.body;
  // console.log('body',req.body)
  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.target ||
    !launch.rocket
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
      ok: false,
    });
  }
  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
      ok: false,
    });
  }

  try {
    await scheduleNewLaunch(launch);
    return res.status(201).json({ ...launch, ok: true });
  } catch (error) {
    let errorMessage = STANDARD_ERRORS.GENERIC.ERROR;
    let status = 500;
    if (
      Object.values(STANDARD_ERRORS.SCHEDULE_LAUNCH).includes(error.message)
    ) {
      errorMessage = error.message;
      status = 400;
    }
    console.log(error.message);
    return res.status(status).json({ error: errorMessage, ok: false });
  }
};

const httpAbortLaunch = async (req, res) => {
  const launchId = +req.params.id;
  // if launch doesn't exist 404
  const launchExists = await launchExistsWithId(launchId);

  if (!launchExists) {
    return res.status(404).json({
      error: "Launch not found",
      ok: false,
    });
  }

  //if exist , delete and return 200
  const abortedLaunch = await abortLaunchById(launchId);
  if (!abortedLaunch) {
    return res.status(200).json({
      error: "Something went wrong",
      ok: false,
    });
  }
  return res.status(200).json({
    ok: true,
  });
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
