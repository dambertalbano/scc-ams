import axios from 'axios';
import { motion } from 'framer-motion'; // Import motion
import { AlertTriangle, Edit3, PlusCircle, Save, Search, Trash2, XCircle } from 'lucide-react'; // Import Search icon
import { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const Schedules = () => {
    const { backendUrl, aToken } = useContext(AdminContext);

    const [schedules, setSchedules] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState(''); // New state for teacher filter

    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [error, setError] = useState('');

    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState(null);

    const [expandedSubjectId, setExpandedSubjectId] = useState(null); // State for expanded subject name
    const [expandedDaysId, setExpandedDaysId] = useState(null); // New state for expanded days
    const MAX_SUBJECT_NAME_LENGTH = 20; // Maximum length for subject name
    const MAX_DAYS_DISPLAY_LENGTH = 25; // Maximum character length for days display before truncating

    const daysOfWeekOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const educationLevels = ["Primary", "Secondary"];
    const semesters = ["1st Sem", "2nd Sem"];

    const initialFormData = {
        subjectId: '',
        teacherId: '',
        section: '',
        gradeYearLevel: '',
        educationLevel: 'Secondary',
        dayOfWeek: [],
        startTime: '08:00',
        endTime: '09:00',
        semester: '1st Sem'
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        document.title = 'Manage Schedules - SCC AMS';
    }, []);

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
            const response = await axios.get(`${backendUrl}/api/admin/all-teachers`, {
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

    const handleDayOfWeekChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentDays = prev.dayOfWeek;
            if (checked) {
                return { ...prev, dayOfWeek: [...currentDays, value] };
            } else {
                return { ...prev, dayOfWeek: currentDays.filter(day => day !== value) };
            }
        });
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
            dayOfWeek: Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek : (schedule.dayOfWeek ? [schedule.dayOfWeek] : []),
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
        if (!formData.dayOfWeek || formData.dayOfWeek.length === 0) {
            setError("Please select at least one day of the week.");
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

    const handleSubjectNameClick = (scheduleId) => {
        setExpandedSubjectId(prevId => (prevId === scheduleId ? null : scheduleId));
    };

    const handleDaysDisplayClick = (scheduleId) => { // New handler for days display
        setExpandedDaysId(prevId => (prevId === scheduleId ? null : scheduleId));
    };

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.1 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    // Helper function to format time from "HH:mm" to "hh:mm AM/PM"
    const formatDisplayTime = (timeStr) => {
        if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
            return 'N/A';
        }
        const [hours, minutes] = timeStr.split(':');
        let h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);

        if (isNaN(h) || isNaN(m)) {
            return 'N/A';
        }

        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // Handle midnight (00:xx) and noon (12:xx)
        
        const formattedMinutes = m < 10 ? `0${m}` : m;
        return `${h}:${formattedMinutes} ${ampm}`;
    };

    // Filter schedules based on search query and teacher filter
    const filteredSchedules = schedules.filter(sch => {
        // Teacher Filter
        if (selectedTeacherFilter && sch.teacherId?._id !== selectedTeacherFilter && sch.teacherId !== selectedTeacherFilter) {
            return false;
        }

        const query = searchQuery.toLowerCase().trim();
        if (!query) return true; // Show all if search is empty

        const subjectName = sch.subjectId?.name?.toLowerCase() || '';
        const subjectCode = sch.subjectId?.code?.toLowerCase() || '';
        const teacherFirstName = sch.teacherId?.firstName?.toLowerCase() || '';
        const teacherLastName = sch.teacherId?.lastName?.toLowerCase() || '';
        const section = sch.section?.toLowerCase() || '';
        const gradeYearLevel = sch.gradeYearLevel?.toLowerCase() || '';
        const educationLevel = sch.educationLevel?.toLowerCase() || '';
        const days = Array.isArray(sch.dayOfWeek) ? sch.dayOfWeek.join(', ').toLowerCase() : (sch.dayOfWeek?.toLowerCase() || '');
        const startTime = sch.startTime?.toLowerCase() || '';
        const endTime = sch.endTime?.toLowerCase() || '';
        const semester = sch.semester?.toLowerCase() || '';
        
        // Also search against formatted display time
        const displayStartTime = formatDisplayTime(sch.startTime).toLowerCase();
        const displayEndTime = formatDisplayTime(sch.endTime).toLowerCase();

        return (
            subjectName.includes(query) ||
            subjectCode.includes(query) ||
            teacherFirstName.includes(query) ||
            teacherLastName.includes(query) ||
            `${teacherFirstName} ${teacherLastName}`.includes(query) ||
            section.includes(query) ||
            gradeYearLevel.includes(query) ||
            educationLevel.includes(query) ||
            days.includes(query) ||
            startTime.includes(query) || // Search raw time
            endTime.includes(query) ||   // Search raw time
            displayStartTime.includes(query) || // Search formatted time
            displayEndTime.includes(query) ||   // Search formatted time
            semester.includes(query)
        );
    });

    if (!aToken) {
        return (
            <motion.div
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 p-6"
            >
                <p className="text-center text-red-400 text-xl">Please log in to manage schedules.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
        >
            <div className="container mx-auto">
                <header className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-100">Manage Schedules</h2>
                </header>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-700 border border-red-900 text-white px-4 py-3 rounded-lg relative mb-6 shadow-lg"
                        role="alert"
                    >
                        <strong className="font-bold"><AlertTriangle className="inline-block mr-2" size={20} />Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </motion.div>
                )}

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddClick}
                        disabled={isAdding || isEditing}
                        className="bg-customRed hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg flex items-center shadow-md disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                        <PlusCircle size={20} className="mr-2" /> Add New Schedule
                    </motion.button>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto sm:max-w-xs">
                            <select
                                value={selectedTeacherFilter}
                                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700"
                            >
                                <option value="">All Teachers</option>
                                {teachers.map(teach => (
                                    <option key={teach._id} value={teach._id}>
                                        {teach.firstName} {teach.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative w-full sm:w-auto sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search schedules..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>

                {(isAdding || isEditing) && (
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8 border border-gray-200"
                    >
                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">{isEditing ? 'Edit Schedule' : 'Add New Schedule'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                                    <select id="subjectId" name="subjectId" value={formData.subjectId} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700">
                                        <option value="">Select Subject</option>
                                        {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">Teacher:</label>
                                    <select id="teacherId" name="teacherId" value={formData.teacherId} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700">
                                        <option value="">Select Teacher</option>
                                        {teachers.map(teach => <option key={teach._id} value={teach._id}>{teach.firstName} {teach.lastName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">Section:</label>
                                    <input type="text" id="section" name="section" value={formData.section} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700" />
                                </div>
                                <div>
                                    <label htmlFor="gradeYearLevel" className="block text-sm font-medium text-gray-700 mb-1">Grade/Year Level:</label>
                                    <input type="text" id="gradeYearLevel" name="gradeYearLevel" value={formData.gradeYearLevel} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-1">Education Level:</label>
                                    <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700">
                                        {educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day(s) of Week:</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                                        {daysOfWeekOptions.map(day => (
                                            <label key={day} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    name="dayOfWeek"
                                                    value={day}
                                                    checked={formData.dayOfWeek.includes(day)}
                                                    onChange={handleDayOfWeekChange}
                                                    className="focus:ring-customRed h-4 w-4 text-customRed border-gray-400 rounded"
                                                />
                                                <span>{day}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time:</label>
                                    <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700" />
                                </div>
                                <div>
                                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time:</label>
                                    <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} required
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">Semester:</label>
                                <select id="semester" name="semester" value={formData.semester} onChange={handleInputChange} required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700">
                                    {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-4">
                                <motion.button type="button" onClick={handleCancel} disabled={isFormLoading}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded-lg shadow-md flex items-center">
                                    <XCircle size={18} className="mr-2" /> Cancel
                                </motion.button>
                                <motion.button type="submit" disabled={isFormLoading}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-lg shadow-md flex items-center disabled:opacity-60 disabled:cursor-not-allowed">
                                    <Save size={18} className="mr-2" />
                                    {isFormLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Schedule')}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {isLoading && !filteredSchedules.length && (
                    <motion.p variants={cardVariants} initial="initial" animate="animate" className="text-center text-gray-300 py-10 text-lg">Loading schedules...</motion.p>
                )}
                {!isLoading && !filteredSchedules.length && !isAdding && !isEditing && (
                    <motion.div variants={cardVariants} initial="initial" animate="animate" className="text-center bg-white/10 backdrop-blur-sm p-10 rounded-xl shadow-lg">
                        <p className="text-gray-200 text-lg">
                            {searchQuery || selectedTeacherFilter ? 'No schedules found matching your criteria.' : 'No schedules found.'}
                        </p>
                        {!(searchQuery || selectedTeacherFilter) && <p className="text-gray-300">Add one to get started!</p>}
                    </motion.div>
                )}

                {filteredSchedules.length > 0 && (
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        className="overflow-x-auto bg-white rounded-xl shadow-2xl"
                    >
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade/Year</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Day(s)</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Semester</th>
                                    <th scope="col" className="sticky right-0 bg-gray-100 px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSchedules.map(sch => {
                                    const subjectName = sch.subjectId?.name || 'N/A';
                                    const subjectCode = sch.subjectId?.code || 'N/A';
                                    const isSubjectExpanded = expandedSubjectId === sch._id;
                                    const isLongSubject = subjectName.length > MAX_SUBJECT_NAME_LENGTH;

                                    let displaySubjectName = subjectName;
                                    if (isLongSubject && !isSubjectExpanded) {
                                        displaySubjectName = `${subjectName.substring(0, MAX_SUBJECT_NAME_LENGTH)}...`;
                                    }

                                    const daysString = Array.isArray(sch.dayOfWeek) ? sch.dayOfWeek.join(', ') : (sch.dayOfWeek || 'N/A');
                                    const isDaysExpanded = expandedDaysId === sch._id;
                                    const isLongDays = daysString.length > MAX_DAYS_DISPLAY_LENGTH;

                                    let displayDays = daysString;
                                    if (isLongDays && !isDaysExpanded) {
                                        displayDays = `${daysString.substring(0, MAX_DAYS_DISPLAY_LENGTH)}...`;
                                    }

                                    return (
                                        <tr key={sch._id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td
                                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 cursor-pointer"
                                                onClick={() => isLongSubject && handleSubjectNameClick(sch._id)}
                                                title={isLongSubject && !isSubjectExpanded ? "Click to see full name" : (isLongSubject && isSubjectExpanded ? "Click to shorten" : "")}
                                            >
                                                {displaySubjectName} <span className="text-xs text-gray-500">({subjectCode})</span>
                                                {isLongSubject && !isSubjectExpanded && <span className="text-blue-500 text-xs ml-1">(more)</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                {sch.teacherId?.firstName || 'N/A'} {sch.teacherId?.lastName || ''}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sch.section}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sch.gradeYearLevel} ({sch.educationLevel})</td>
                                            <td 
                                                className="px-6 py-4 text-sm text-gray-600 cursor-pointer" // Removed whitespace-nowrap to allow wrapping if needed, added cursor-pointer
                                                onClick={() => isLongDays && handleDaysDisplayClick(sch._id)}
                                                title={isLongDays && !isDaysExpanded ? "Click to see all days" : (isLongDays && isDaysExpanded ? "Click to shorten" : "")}
                                            >
                                                {displayDays}
                                                {isLongDays && !isDaysExpanded && <span className="text-blue-500 text-xs ml-1">(more)</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDisplayTime(sch.startTime)} - {formatDisplayTime(sch.endTime)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sch.semester}</td>
                                            <td className="sticky right-0 bg-white px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => handleEditClick(sch)}
                                                    disabled={isAdding || isEditing || isLoading}
                                                    className="text-customRed hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sch._id)}
                                                    disabled={isLoading || isAdding || isEditing}
                                                    className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Schedules;