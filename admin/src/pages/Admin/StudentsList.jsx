import { motion } from 'framer-motion'; // Import motion
import { Pencil, Search, Trash2 } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { AdminContext } from '../../context/AdminContext';

const StudentsList = () => {
    const { students, aToken, getAllStudents, updateStudent, deleteStudent } = useContext(AdminContext);

    const [isEditing, setIsEditing] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const studentsPerPage = 10;
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filters, setFilters] = useState({
        withEmail: false,
        noEmail: false,
        withContact: false,
        noContact: false,
        educationLevel: '',
        gradeYearLevel: '',
        section: '',
    });
    const [isLoading, setIsLoading] = useState(true); // Added loading state

    useEffect(() => {
        document.title = 'Manage Students - SCC AMS'; // Set document title
    }, []);

    useEffect(() => {
        if (aToken) {
            setIsLoading(true);
            getAllStudents().finally(() => setIsLoading(false));
        }
    }, [aToken, getAllStudents]);

    const handleEditClick = (student) => {
        if (!student._id) {
            console.error("Student ID is missing for the selected student.");
            return;
        }
        setCurrentStudent(student);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentStudent._id) {
            console.error("Student ID is missing for the current student.");
            return;
        }
        await updateStudent(currentStudent); // Ensure updateStudent is awaited if it's async
        setIsEditing(false);
        setCurrentStudent(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDelete = async (studentId) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await deleteStudent(studentId);
            } catch (error) {
                console.error("Failed to delete student:", error.message);
            }
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page on search
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: value !== undefined ? value : !prevFilters[filterName],
        }));
        setCurrentPage(0); // Reset to first page on filter change
    };

    const filteredStudents = students.filter((student) => {
        const fullName = `${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName}`.toLowerCase();
        const email = student.email?.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email?.includes(searchTerm.toLowerCase()) || student.address?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filters.withEmail && !student.email) return false;
        if (filters.noEmail && student.email) return false;
        if (filters.withContact && !student.number) return false;
        if (filters.noContact && student.number) return false;
        if (filters.educationLevel && student.educationLevel !== filters.educationLevel) return false;
        if (filters.gradeYearLevel && student.gradeYearLevel !== filters.gradeYearLevel) return false;
        if (filters.section && student.section !== filters.section) return false;

        return matchesSearch;
    });

    const pageCount = Math.ceil(filteredStudents.length / studentsPerPage);
    const offset = currentPage * studentsPerPage;
    const currentStudentsOnPage = filteredStudents.slice(offset, offset + studentsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const formatName = (student) => {
        return `${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName}`;
    };

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    };

    return (
        <motion.div // Main page container
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
        >
            <header className="w-full max-w-7xl mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-100">Manage Students</h1>
            </header>

            <motion.div // Content card container
                variants={contentVariants}
                initial="initial"
                animate="animate"
                className="w-full max-w-7xl p-6 bg-white shadow-xl rounded-2xl font-sans"
            >
                <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-6">
                    <div className="relative w-full md:w-1/2">
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg pl-10 focus:ring-customRed focus:border-customRed"
                            placeholder="Search Student by name or email"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <div className="relative">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-customRed"
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        >
                            Filters
                        </button>
                        {isFilterDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                                <div className="p-2 border-b">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Education Level</label>
                                    <select
                                        className="block w-full p-2 text-sm text-gray-700 border-gray-300 rounded-md focus:ring-customRed focus:border-customRed"
                                        value={filters.educationLevel}
                                        onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
                                    >
                                        <option value="">All Levels</option>
                                        <option value="Primary">Primary</option>
                                        <option value="Secondary">Secondary</option>
                                    </select>
                                </div>
                                <div className="p-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Grade/Year Level</label>
                                    <select
                                        className="block w-full p-2 text-sm text-gray-700 border-gray-300 rounded-md focus:ring-customRed focus:border-customRed"
                                        value={filters.gradeYearLevel}
                                        onChange={(e) => handleFilterChange('gradeYearLevel', e.target.value)}
                                    >
                                        <option value="">All Grades/Years</option>
                                        <option value="Grade 1">Grade 1</option>
                                        <option value="Grade 2">Grade 2</option>
                                        <option value="Grade 3">Grade 3</option>
                                        <option value="Grade 4">Grade 4</option>
                                        <option value="Grade 5">Grade 5</option>
                                        <option value="Grade 6">Grade 6</option>
                                        <option value="Grade 7">Grade 7</option>
                                        <option value="Grade 8">Grade 8</option>
                                        <option value="Grade 9">Grade 9</option>
                                        <option value="Grade 10">Grade 10</option>
                                        <option value="Grade 11 HUMMS">Grade 11 HUMMS</option>
                                        <option value="Grade 11 A&D">Grade 11 A&D</option>
                                        <option value="Grade 11 F&B">Grade 11 F&B</option>
                                        <option value="Grade 11 B&P">Grade 11 B&P</option>
                                        <option value="Grade 11 TS">Grade 11 TS</option>
                                        <option value="Grade 11 ICT">Grade 11 ICT</option>
                                        <option value="Grade 11 ABM">Grade 11 ABM</option>
                                        <option value="Grade 12 HUMMS">Grade 12 HUMMS</option>
                                        <option value="Grade 12 A&D">Grade 12 A&D</option>
                                        <option value="Grade 12 F&B">Grade 12 F&B</option>
                                        <option value="Grade 12 B&P">Grade 12 B&P</option>
                                        <option value="Grade 12 TS">Grade 12 TS</option>
                                        <option value="Grade 12 ICT">Grade 12 ICT</option>
                                        <option value="Grade 12 ABM">Grade 12 ABM</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500 text-lg">Loading students...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr className="text-gray-600 text-left text-sm">
                                        <th className="p-3 font-medium">Image</th>
                                        <th className="p-3 font-medium">Name</th>
                                        <th className="p-3 font-medium">Email</th>
                                        <th className="p-3 font-medium">Contact #</th>
                                        <th className="p-3 font-medium">Education Level</th>
                                        <th className="p-3 font-medium">Grade/Year Level</th>
                                        <th className="p-3 font-medium">Section</th>
                                        <th className="p-3 font-medium">Address</th>
                                        <th className="p-3 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentStudentsOnPage.length > 0 ? currentStudentsOnPage.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 text-sm text-gray-700">
                                            <td className="p-3">
                                                <img className="w-10 h-10 object-cover rounded-full" src={item?.image ?? '/default-image.png'} alt="Student" />
                                            </td>
                                            <td className="p-3 whitespace-nowrap">{formatName(item)}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.email ?? 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.number ?? 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.educationLevel ?? 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.gradeYearLevel ?? 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.section ?? 'N/A'}</td>
                                            <td className="p-3 min-w-[150px]">{item?.address ?? 'N/A'}</td>
                                            <td className="p-3 flex justify-center items-center gap-2">
                                                <div className="relative group">
                                                    <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" onClick={() => handleEditClick(item)}>
                                                        <Pencil size={16} />
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                        Edit
                                                    </div>
                                                </div>
                                                <div className="relative group">
                                                    <button className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors" onClick={() => handleDelete(item._id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                                        Delete
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-10 text-gray-500">
                                                No students found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {pageCount > 1 && (
                            <ReactPaginate
                                previousLabel={'< Prev'}
                                nextLabel={'Next >'}
                                pageCount={pageCount}
                                onPageChange={handlePageClick}
                                containerClassName={'flex justify-center items-center mt-6 space-x-2 text-sm'}
                                pageLinkClassName={'px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'}
                                previousLinkClassName={'px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'}
                                nextLinkClassName={'px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100'}
                                disabledClassName={'opacity-50 cursor-not-allowed'}
                                activeLinkClassName={'bg-customRed text-white border-customRed'}
                                breakLabel={'...'}
                                breakLinkClassName={'px-3 py-2 border border-gray-300 rounded-md text-gray-700'}
                            />
                        )}
                    </>
                )}
            </motion.div>

            {isEditing && currentStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Student</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="firstName"
                                    value={currentStudent.firstName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="middleName"
                                    value={currentStudent.middleName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="lastName"
                                    value={currentStudent.lastName || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="email"
                                    value={currentStudent.email || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="number"
                                    value={currentStudent.number || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                                <select
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="educationLevel"
                                    value={currentStudent.educationLevel || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Level</option>
                                    <option value="Primary">Primary</option>
                                    <option value="Secondary">Secondary</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Year Level</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="gradeYearLevel"
                                    value={currentStudent.gradeYearLevel || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="section"
                                    value={currentStudent.section || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="address"
                                    value={currentStudent.address || ''}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <select
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="semester"
                                    value={currentStudent.semester || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Semester</option>
                                    <option value="1st Sem">1st Sem</option>
                                    <option value="2nd Sem">2nd Sem</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester Start Date</label>
                                <input
                                    type="date"
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="semesterDates.start"
                                    value={currentStudent.semesterDates?.start?.split('T')[0] || ''}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setCurrentStudent((prev) => ({
                                            ...prev,
                                            semesterDates: {
                                                ...prev.semesterDates,
                                                start: value,
                                            },
                                        }));
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester End Date</label>
                                <input
                                    type="date"
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="semesterDates.end"
                                    value={currentStudent.semesterDates?.end?.split('T')[0] || ''}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setCurrentStudent((prev) => ({
                                            ...prev,
                                            semesterDates: {
                                                ...prev.semesterDates,
                                                end: value,
                                            },
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" onClick={handleSave}>
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default StudentsList;