import { Pencil, Search, Trash2 } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { AdminContext } from '../../context/AdminContext';

const TeachersList = () => {
    const { teachers, aToken, getAllTeachers, deleteTeacher, updateTeacher } = useContext(AdminContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        withEmail: false,
        noEmail: false,
        withContact: false,
        noContact: false,
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState(null);
    const teachersPerPage = 10;
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

    useEffect(() => {
        document.title = 'Teacher List';
    }, []);

    useEffect(() => {
        if (aToken) getAllTeachers();
    }, [aToken, getAllTeachers]);

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const handleFilterChange = (filterName) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: !prevFilters[filterName],
        }));
    };

    const handleEdit = (teacher) => {
        setCurrentTeacher(teacher);
        setIsEditing(true);
    };

    const handleCloseEdit = () => {
        setIsEditing(false);
        setCurrentTeacher(null);
    };

    const handleDelete = (teacherId) => {
        deleteTeacher(teacherId);
    };

    const filteredTeachers = teachers?.filter((teacher) => {
        const fullName = `${teacher?.firstName} ${teacher?.middleName} ${teacher?.lastName}`.toLowerCase();
        const email = teacher?.email?.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

        if (filters.withEmail && !teacher?.email) return false;
        if (filters.noEmail && teacher?.email) return false;
        if (filters.withContact && !teacher?.number) return false;
        if (filters.noContact && teacher?.number) return false;

        return matchesSearch;
    });

    const handleSave = async () => {
        try {
            const updates = {
                firstName: currentTeacher.firstName,
                middleName: currentTeacher.middleName,
                lastName: currentTeacher.lastName,
                email: currentTeacher.email,
                number: currentTeacher.number,
                address: currentTeacher.address,
            };

            await updateTeacher(currentTeacher._id, updates, null);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating teacher:", error);
        }
    };

    const pageCount = Math.ceil((filteredTeachers?.length || 0) / teachersPerPage);
    const offset = currentPage * teachersPerPage;
    const currentTeachers = filteredTeachers?.slice(offset, offset + teachersPerPage) || [];

    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    return (
        <div className="flex flex-col w-full p-6 mt-16 bg-white shadow-md rounded-2xl font-sans">
            <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg pl-10 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search Teacher by name or email"
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
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left">
                            <th className="p-4 font-semibold">Image</th>
                            <th className="p-4 font-semibold">First Name</th>
                            <th className="p-4 font-semibold">Middle Name</th>
                            <th className="p-4 font-semibold">Last Name</th>
                            <th className="p-4 font-semibold">Email</th>
                            <th className="p-4 font-semibold">Contact #</th>
                            <th className="p-4 font-semibold">Address</th>
                            <th className="p-4 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTeachers.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 text-left">
                                <td className="p-4">
                                    <img className="w-12 h-12 object-cover rounded-full" src={item?.image ?? '/default-image.png'} alt="Teacher" />
                                </td>
                                <td className="p-4">{item?.firstName ?? ''}</td>
                                <td className="p-4">{item?.middleName ?? ''}</td>
                                <td className="p-4">{item?.lastName ?? ''}</td>
                                <td className="p-4">{item?.email ?? 'No Email'}</td>
                                <td className="p-4">{item?.number ?? 'No Number'}</td>
                                <td className="p-4">{item?.address ?? 'No Address'}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <div className="relative group">
                                        <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" onClick={() => handleEdit(item)}>
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
                activeClassName={'bg-blue-500 text-white px-4 py-2 rounded-lg'}
            />

            {isEditing && currentTeacher && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg w-1/3">
                        <h2 className="text-2xl font-semibold mb-4">Edit Teacher</h2>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="firstName"
                                value={currentTeacher.firstName || ''}
                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, firstName: e.target.value })}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="middleName"
                                value={currentTeacher.middleName || ''}
                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, middleName: e.target.value })}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="lastName"
                                value={currentTeacher.lastName || ''}
                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, lastName: e.target.value })}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="email"
                                value={currentTeacher.email || ''}
                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, email: e.target.value })}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Number</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="number"
                                value={currentTeacher.number || ''}
                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, number: e.target.value })}
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input
                                className="border w-full p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                name="address"
                                value={currentTeacher.address || ''}
                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, address: e.target.value })}
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2" onClick={handleCloseEdit}>
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeachersList;