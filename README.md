# St. Clare Online Attendance Monitoring System (AMS)

**Live Site:** [https://stclareonline-ams.live/](https://stclareonline-ams.live/)

St. Clare Online AMS is a web-based Attendance Monitoring System designed to streamline student attendance tracking and provide real-time data access for school administrators, teachers, and students.

---

## 🚀 Features

- ✅ **Student Sign-in / Sign-out** with timestamp
- 🧑‍🏫 **Admin & Teacher Dashboards** for managing students, schedules, and attendance
- 🧾 **Automated attendance logging**
- 🗓️ **Semester & schedule management**
- 🔒 Secure login and role-based access
- 📊 Real-time analytics and attendance reports
- 📨 Email validation and account security

---

## 🛠️ Built With

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT, bcrypt
- **Deployment:** Vercel (Frontend), Render / Railway / MongoDB Atlas (Backend + DB)

---

## 📁 Folder Structure (Simplified)

/client → React frontend
/server → Express backend API
/models → Mongoose schemas
/routes → API routes (auth, students, schedules, etc.)
/controllers → Business logic for handling requests


---

## 📦 Installation (for local development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/dambertalbano/scc-ams

2. Navigate to folders and install dependencies

cd server
npm install

cd ../client
npm install

3. Set up environment variables

Create .env files in both server and client folders.

MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
PORT=5000

4. Run the app

cd server
npm run dev

In another terminal:

cd client
npm start
