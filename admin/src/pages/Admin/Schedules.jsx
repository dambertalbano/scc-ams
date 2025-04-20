import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAdminContext } from "../../context/AdminContext";

const Schedules = () => {
    const { getAllSchedules, createSchedule, updateSchedule, deleteSchedule, getAllTeachers } = useAdminContext();
    const [schedules, setSchedules] = useState([]);
    const [teachers, setTeachers] = useState([]); // Store all teacher objects
    const [formData, setFormData] = useState({
        subjectId: "",
        teacherName: "",
        section: "",
        gradeYearLevel: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        semester: "1st Sem",
    });
    const [editingSchedule, setEditingSchedule] = useState(null);

    useEffect(() => {
        const fetchSchedules = async () => {
            const data = await getAllSchedules();
            setSchedules(data);
        };

        const fetchTeachers = async () => {
            try {
                const data = await getAllTeachers(); // Fetch all teachers
                if (Array.isArray(data)) {
                    setTeachers(data); // Store teacher objects
                } else {
                    setTeachers([]); // Set an empty array if data is not an array
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
                setTeachers([]); // Set an empty array in case of an error
            }
        };

        fetchSchedules();
        fetchTeachers();
    }, [getAllSchedules, getAllTeachers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingSchedule) {
            const updatedSchedule = await updateSchedule(editingSchedule._id, formData);
            if (updatedSchedule) {
                setSchedules((prev) =>
                    prev.map((schedule) =>
                        schedule._id === updatedSchedule._id ? updatedSchedule : schedule
                    )
                );
                toast.success("Schedule updated successfully");
            }
        } else {
            const newSchedule = await createSchedule(formData);
            if (newSchedule) {
                setSchedules((prev) => [...prev, newSchedule]);
                toast.success("Schedule created successfully");
            }
        }
        setFormData({
            subjectId: "",
            teacherName: "",
            section: "",
            gradeYearLevel: "",
            dayOfWeek: "",
            startTime: "",
            endTime: "",
            semester: "1st Sem",
        });
        setEditingSchedule(null);
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            ...schedule,
            teacherName: `${schedule.teacherId?.firstName || ""} ${schedule.teacherId?.middleName || ""} ${schedule.teacherId?.lastName || ""}`.trim(),
        });
    };

    const handleDelete = async (id) => {
        const success = await deleteSchedule(id);
        if (success) {
            setSchedules((prev) => prev.filter((schedule) => schedule._id !== id));
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Schedules</h1>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Subject ID"
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        list="teacherNames" // Use a datalist for autofill
                        placeholder="Teacher Name"
                        value={formData.teacherName}
                        onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <datalist id="teacherNames">
                        {teachers.map((teacher) => (
                            <option
                                key={teacher._id}
                                value={`${teacher.firstName} ${teacher.middleName || ""} ${teacher.lastName}`.trim()}
                            />
                        ))}
                    </datalist>
                    <input
                        type="text"
                        placeholder="Section"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Grade/Year Level"
                        value={formData.gradeYearLevel}
                        onChange={(e) =>
                            setFormData({ ...formData, gradeYearLevel: e.target.value })
                        }
                        className="p-2 border rounded"
                        required
                    />
                    <select
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                        className="p-2 border rounded"
                        required
                    >
                        <option value="">Select Day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                    <input
                        type="time"
                        placeholder="Start Time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="time"
                        placeholder="End Time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <select
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="p-2 border rounded"
                        required
                    >
                        <option value="1st Sem">1st Sem</option>
                        <option value="2nd Sem">2nd Sem</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {editingSchedule ? "Update Schedule" : "Add Schedule"}
                </button>
            </form>
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-4 text-left">Subject ID</th>
                        <th className="p-4 text-left">Teacher Name</th>
                        <th className="p-4 text-left">Section</th>
                        <th className="p-4 text-left">Grade/Year Level</th>
                        <th className="p-4 text-left">Day</th>
                        <th className="p-4 text-left">Time</th>
                        <th className="p-4 text-left">Semester</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map((schedule) => (
                        <tr key={schedule._id} className="border-b">
                            <td className="p-4">{schedule.subjectId}</td>
                            <td className="p-4">
                                {`${schedule.teacherId?.firstName || ""} ${schedule.teacherId?.middleName || ""} ${schedule.teacherId?.lastName || "N/A"}`.trim()}
                            </td>
                            <td className="p-4">{schedule.section}</td>
                            <td className="p-4">{schedule.gradeYearLevel}</td>
                            <td className="p-4">{schedule.dayOfWeek}</td>
                            <td className="p-4">
                                {schedule.startTime} - {schedule.endTime}
                            </td>
                            <td className="p-4">{schedule.semester}</td>
                            <td className="p-4 flex justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(schedule)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(schedule._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Schedules;