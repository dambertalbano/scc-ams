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

    useEffect(() => {
        if (aToken) {
            getAllStudents();
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
        updateStudent(currentStudent);
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
        try {
            await deleteStudent(studentId);
            getAllStudents();
        } catch (error) {
            console.error("Failed to delete student:", error.message);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: value !== undefined ? value : !prevFilters[filterName],
        }));
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
    const currentStudents = filteredStudents.slice(offset, offset + studentsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const formatName = (student) => {
        return `${student.firstName} ${student.middleName ? student.middleName.charAt(0) + '.' : ''} ${student.lastName}`;
    };

    return (
        <div className="flex flex-col w-full p-6 mt-16 bg-white shadow-md rounded-2xl font-sans">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg pl-10 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search Student by name or email"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <Search className="absolute top-3 left-3 text-gray-400" size={20} />
                </div>
                <div className="relative">
                    <button
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-200"
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    >
                        Filters
                    </button>
                    {isFilterDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.withEmail}
                                    onChange={() => handleFilterChange('withEmail')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                With Email
                            </label>
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.noEmail}
                                    onChange={() => handleFilterChange('noEmail')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                No Email
                            </label>
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.withContact}
                                    onChange={() => handleFilterChange('withContact')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                With Contact
                            </label>
                            <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={filters.noContact}
                                    onChange={() => handleFilterChange('noContact')}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                No Contact
                            </label>
                            <select
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full border-b"
                                value={filters.educationLevel}
                                onChange={(e) => handleFilterChange('educationLevel', e.target.value)}
                            >
                                <option value="">Education Level</option>
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="College">College</option>
                            </select>
                            <select
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full border-b"
                                value={filters.gradeYearLevel}
                                onChange={(e) => handleFilterChange('gradeYearLevel', e.target.value)}
                            >
                                <option value="">Grade/Year Level</option>
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
                                <option value="Grade 11">Grade 11</option>
                                <option value="Grade 12">Grade 12</option>
                                <option value="1st Year College">1st Year College</option>
                                <option value="2nd Year College">2nd Year College</option>
                                <option value="3rd Year College">3rd Year College</option>
                                <option value="4th Year College">4th Year College</option>
                            </select>
                            <select
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                value={filters.section}
                                onChange={(e) => handleFilterChange('section', e.target.value)}
                            >
                                <option value="">Section</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left">
                            <th className="p-4 font-semibold">Image</th>
                            <th className="p-4 font-semibold">Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Contact #</th>
                            <th className="p-4 font-semibold">Education Level</th>
                            <th className="p-4 font-semibold">Grade/Year Level</th>
                            <th className="p-4 font-semibold">Section</th>
                            <th className="p-4 font-semibold">Address</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStudents.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 text-left">
                                <td className="p-4">
                                    <img className="w-12 h-12 object-cover rounded-full" src={item?.image ?? '/default-image.png'} alt="Student" />
                                </td>
                                <td className="p-4">{formatName(item)}</td>
                                <td className="p-4">{item?.email ?? 'No Email'}</td>
                                <td className="p-4">{item?.number ?? 'No Number'}</td>
                                <td className="p-4">{item?.educationLevel ?? 'No Education Level'}</td>
                                <td className="p-4">{item?.gradeYearLevel ?? 'No Grade/Year Level'}</td>
                                <td className="p-4">{item?.section ?? 'No Section'}</td>
                                <td className="p-4">{item?.address ?? 'No Address'}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <div className="relative group">
                                        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={() => handleEditClick(item)}>
                                            <Pencil size={18} />
                                        </button>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                            Edit
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={() => handleDelete(item._id)}>
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                            Delete
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ReactPaginate
                previousLabel={'< Prev'}
                nextLabel={'Next >'}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={'flex justify-center mt-6 space-x-3'}
                previousLinkClassName={'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-200'}
                nextLinkClassName={'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-200'}
                disabledClassName={'opacity-50 cursor-not-allowed'}
                activeClassName={'bg-gray-500 text-white px-4 py-2 rounded-lg'}
            />

            {isEditing && currentStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h2 className="text-2xl font-semibold mb-4">Edit Student</h2>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="firstName"
                                value={currentStudent.firstName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="middleName"
                                value={currentStudent.middleName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="lastName"
                                value={currentStudent.lastName || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="email"
                                value={currentStudent.email || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Number</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="number"
                                value={currentStudent.number || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Education Level</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="educationLevel"
                                value={currentStudent.educationLevel || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Grade/Year Level</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="gradeYearLevel"
                                value={currentStudent.gradeYearLevel || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Section</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="section"
                                value={currentStudent.section || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="address"
                                value={currentStudent.address || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2" onClick={() => setIsEditing(false)}>
                                Cancel
                            </button>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentsList;