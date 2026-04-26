// optionsController translates HTTP requests into service calls.
const optionService = require("../services/optionService");

// Handle the request and return options to the client.
const getOptions = async (req, res, next) => {
  try {
    const data = await optionService.getOptions(req.params.type);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

// Handle creation for option and send the result back.
const createOption = async (req, res, next) => {
  try {
    const item = await optionService.createOption(req.params.type, req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// Handle updates for option and return the latest state.
const updateOption = async (req, res, next) => {
  try {
    const item = await optionService.updateOption(req.params.type, req.params.id, req.body);
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// Handle deletion for option at the HTTP layer.
const deleteOption = async (req, res, next) => {
  try {
    await optionService.deleteOption(req.params.type, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOptions,
  createOption,
  updateOption,
  deleteOption,
};
