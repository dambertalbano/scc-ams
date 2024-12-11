import express from 'express';
import { addAdministrator, addStudent, addTeacher, addUtility, adminDashboard, allAdministrators, allStudents, allTeachers, allUtilitys, appointmentCancel, appointmentsAdmin, deleteAdministrator, deleteStudent, deleteTeacher, deleteUtility, getStudentByCode, getUserByCode, loginAdmin, updateAdministrator, updateStudent, updateTeacher, updateUtility } from '../controllers/adminController.js'; // Import deleteTeacher
import { changeAvailablity } from '../controllers/studentController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-student", authAdmin, upload.single('image'), addStudent)
adminRouter.post("/add-administrator", authAdmin, upload.single('image'), addAdministrator)
adminRouter.post("/add-teacher", authAdmin, upload.single('image'), addTeacher)
adminRouter.post("/add-utility", authAdmin, upload.single('image'), addUtility)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-students", authAdmin, allStudents)
adminRouter.get("/all-administrators", authAdmin, allAdministrators)
adminRouter.get("/all-teachers", authAdmin, allTeachers)
adminRouter.get("/all-utilitys", authAdmin, allUtilitys)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.put("/update-administrator/:id", authAdmin, updateAdministrator)
adminRouter.put("/teachers/:id", authAdmin, updateTeacher)
adminRouter.put("/update-utility/:id", authAdmin, updateUtility)
adminRouter.get("/rfid-scan/:code", authAdmin, getStudentByCode);
adminRouter.delete("/teachers/:id", authAdmin, deleteTeacher);
adminRouter.put("/students/:id", authAdmin, updateStudent)
adminRouter.delete("/students/:id", authAdmin, deleteStudent);
adminRouter.put("/administrators/:id", authAdmin, updateAdministrator)
adminRouter.delete("/administrators/:id", authAdmin, deleteAdministrator);
adminRouter.put("/utilitys/:id", authAdmin, updateUtility)
adminRouter.delete("/utilitys/:id", authAdmin, deleteUtility);
adminRouter.get('/user/code/:code', authAdmin, getUserByCode);


export default adminRouter;
