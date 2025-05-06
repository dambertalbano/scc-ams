import axios from 'axios';
import { AlertTriangle, Edit3, PlusCircle, Save, Trash2, XCircle } from 'lucide-react'; // Added AlertTriangle for error
import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext'; // Adjust path if needed

const Schedules = () => {
    const { backendUrl, aToken } = useContext(AdminContext);

    const [schedules, setSchedules] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [error, setError] = useState('');

    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState(null);

    const initialFormData = {
        subjectId: '',
        teacherId: '',
        section: '',
        gradeYearLevel: '',
        educationLevel: 'Secondary',
        dayOfWeek: 'Monday',
        startTime: '08:00',
        endTime: '09:00',
        semester: '1st Sem'
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchSchedules = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${backendUrl}/api/admin/schedules`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (response.data.success) {
                setSchedules(response.data.schedules);
            } else {
                setError(response.data.message || 'Failed to fetch schedules');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while fetching schedules.');
            console.error("Fetch Schedules Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubjectsForDropdown = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/admin/subjects`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (response.data.success) {
                setSubjects(response.data.subjects);
            }
        } catch (err) {
            console.error("Fetch Subjects for Dropdown Error:", err);
        }
    };

    const fetchTeachersForDropdown = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/admin/all-teachers`, { // Ensure this endpoint is correct
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (response.data.success) {
                setTeachers(response.data.teachers);
            }
        } catch (err) {
            console.error("Fetch Teachers for Dropdown Error:", err);
        }
    };

    useEffect(() => {
        if (aToken && backendUrl) {
            fetchSchedules();
            fetchSubjectsForDropdown();
            fetchTeachersForDropdown();
        }
    }, [aToken, backendUrl]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetFormDataAndState = () => {
        setFormData(initialFormData);
        setIsAdding(false);
        setIsEditing(false);
        setCurrentSchedule(null);
        setError('');
    };

    const handleAddClick = () => {
        resetFormDataAndState();
        setIsAdding(true);
    };

    const handleEditClick = (schedule) => {
        setIsEditing(true);
        setIsAdding(false);
        setCurrentSchedule(schedule);
        setFormData({
            subjectId: schedule.subjectId?._id || schedule.subjectId,
            teacherId: schedule.teacherId?._id || schedule.teacherId,
            section: schedule.section,
            gradeYearLevel: schedule.gradeYearLevel,
            educationLevel: schedule.educationLevel,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            semester: schedule.semester,
        });
    };

    const handleCancel = () => {
        resetFormDataAndState();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormLoading(true);
        setError('');

        if (formData.startTime >= formData.endTime) {
            setError("End time must be after start time.");
            setIsFormLoading(false);
            return;
        }

        try {
            let response;
            if (isEditing && currentSchedule) {
                response = await axios.put(`${backendUrl}/api/admin/schedules/${currentSchedule._id}`, formData, {
                    headers: { Authorization: `Bearer ${aToken}` }
                });
            } else {
                response = await axios.post(`${backendUrl}/api/admin/schedules`, formData, {
                    headers: { Authorization: `Bearer ${aToken}` }
                });
            }

            if (response.data.success) {
                fetchSchedules();
                handleCancel();
            } else {
                setError(response.data.message || 'Operation failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
            console.error("Submit Schedule Error:", err);
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            setIsLoading(true);
            setError('');
            try {
                const response = await axios.delete(`${backendUrl}/api/admin/schedules/${scheduleId}`, {
                    headers: { Authorization: `Bearer ${aToken}` }
                });
                if (response.data.success) {
                    fetchSchedules();
                } else {
                    setError(response.data.message || 'Failed to delete schedule');
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'An error occurred while deleting schedule.');
                console.error("Delete Schedule Error:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (!aToken) return <p className="text-center text-red-500 mt-10">Please log in to manage schedules.</p>;

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const educationLevels = ["Primary", "Secondary"];
    const semesters = ["1st Sem", "2nd Sem"];

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Manage Schedules</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold"><AlertTriangle className="inline-block mr-2" size={20} />Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="mb-6">
                <button
                    onClick={handleAddClick}
                    disabled={isAdding || isEditing}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusCircle size={20} className="mr-2" /> Add New Schedule
                </button>
            </div>

            {(isAdding || isEditing) && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                    <h3 className="text-xl font-medium mb-6 text-gray-700">{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                                <select id="subjectId" name="subjectId" value={formData.subjectId} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select Subject</option>
                                    {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">Teacher:</label>
                                <select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Select Teacher</option>
                                    {teachers.map(teach => <option key={teach._id} value={teach._id}>{teach.firstName} {teach.lastName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">Section:</label>
                                <input type="text" id="section" name="section" value={formData.section} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="gradeYearLevel" className="block text-sm font-medium text-gray-700 mb-1">Grade/Year Level:</label>
                                <input type="text" id="gradeYearLevel" name="gradeYearLevel" value={formData.gradeYearLevel} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-1">Education Level:</label>
                                <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    {educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">Day of Week:</label>
                                <select id="dayOfWeek" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time (HH:MM):</label>
                                <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time (HH:MM):</label>
                                <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} required
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester:</label>
                            <select id="semester" name="semester" value={formData.semester} onChange={handleInputChange} required
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-2">
                            <button type="button" onClick={handleCancel} disabled={isFormLoading}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm flex items-center">
                                <XCircle size={18} className="mr-2" /> Cancel
                            </button>
                            <button type="submit" disabled={isFormLoading}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save size={18} className="mr-2" />
                                {isFormLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Schedule')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading && !schedules.length && <p className="text-center text-gray-500 py-5">Loading schedules...</p>}
            {!isLoading && !schedules.length && !isAdding && !isEditing && (
                <p className="text-center text-gray-500 py-5">No schedules found. Add one to get started!</p>
            )}

            {schedules.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Year</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map(sch => (
                                <tr key={sch._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {sch.subjectId?.name || 'N/A'} <span className="text-xs text-gray-500">({sch.subjectId?.code || 'N/A'})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {sch.teacherId?.firstName || 'N/A'} {sch.teacherId?.lastName || ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.gradeYearLevel} ({sch.educationLevel})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.dayOfWeek}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.startTime} - {sch.endTime}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sch.semester}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEditClick(sch)}
                                            disabled={isAdding || isEditing}
                                            className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                                            title="Edit"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sch._id)}
                                            disabled={isLoading || isAdding || isEditing}
                                            className="text-red-600 hover:text-red-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Schedules;