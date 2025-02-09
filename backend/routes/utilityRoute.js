import express from 'express';
import { appointmentCancel, appointmentComplete, appointmentsUtility, changeAvailablity, loginUtility, updateUtilityProfile, utilityDashboard, utilityList, utilityProfile } from '../controllers/utilityController.js';
import authUtility from '../middleware/authUtility.js';
const utilityRouter = express.Router();

utilityRouter.post("/login", loginUtility)
utilityRouter.post("/cancel-appointment", authUtility, appointmentCancel)
utilityRouter.get("/appointments", authUtility, appointmentsUtility)
utilityRouter.get("/list", utilityList)
utilityRouter.post("/change-availability", authUtility, changeAvailablity)
utilityRouter.post("/complete-appointment", authUtility, appointmentComplete)
utilityRouter.get("/dashboard", authUtility, utilityDashboard)
utilityRouter.get("/profile", authUtility, utilityProfile)
utilityRouter.post("/update-profile", authUtility, updateUtilityProfile)

export default utilityRouter;