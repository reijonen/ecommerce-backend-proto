const logger = require("./logger");

const reqLogger = (req, res, next) => {
  logger.info("Methor: ", req.methor);
  logger.info("Path: ", req.path);
  logger.info("---");
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === "CastError" && error.kind === "ObjectId") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token",
    });
  }
  logger.error(error.message);
  next(error);
};

module.exports = {
  reqLogger,
  unknownEndpoint,
  errorHandler,
};
