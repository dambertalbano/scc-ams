import express from 'express';
import { administratorDashboard, administratorList, administratorProfile, appointmentCancel, appointmentComplete, appointmentsAdministrator, changeAvailablity, loginAdministrator, updateAdministratorProfile } from '../controllers/administratorController.js';
import authAdministrator from '../middleware/authAdministrator.js';
const administratorRouter = express.Router();

administratorRouter.post("/login", loginAdministrator)
administratorRouter.post("/cancel-appointment", authAdministrator, appointmentCancel)
administratorRouter.get("/appointments", authAdministrator, appointmentsAdministrator)
administratorRouter.get("/list", administratorList)
administratorRouter.post("/change-availability", authAdministrator, changeAvailablity)
administratorRouter.post("/complete-appointment", authAdministrator, appointmentComplete)
administratorRouter.get("/dashboard", authAdministrator, administratorDashboard)
administratorRouter.get("/profile", authAdministrator, administratorProfile)
administratorRouter.post("/update-profile", authAdministrator, updateAdministratorProfile)

export default administratorRouter;