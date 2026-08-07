import express from "express";
import { getHotelbedsConfig, saveHotelbedsConfig } from "../controllers/configController.js";

const configRouter = express.Router();

configRouter.get("/hotelbeds", getHotelbedsConfig);
configRouter.post("/hotelbeds", saveHotelbedsConfig);

export default configRouter;
