const { getAllLaunches, addNewLaunch, launchExistsWithId, abortLaunchById } = require("../../models/launches.model");

const httpGetAllLaunches = (req, res) => {
  // console.log(getAllLaunches())
  return res.status(200).json(getAllLaunches());
};

const httpAddNewLaunch = (req, res) => {
  const launch = req.body;
  launch.launchDate = new Date(launch.launchDate);
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

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
      ok: false,
    });
  }

  addNewLaunch(launch);
  return res.status(201).json({ ...launch, ok: true });
};

const httpAbortLaunch = (req, res) => {
  const launchId = +req.params.id;
  // if launch doesn't exist 404
  if (!launchExistsWithId(launchId)) {
    return res.status(404).json({
      error: "Launch not found",
      ok: false,
    });
  }

  //if exist , delete and return 200
  const abortedLaunch = abortLaunchById(launchId)
  return res.status(200).json({
    ...abortedLaunch, ok:true
  });
};

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
