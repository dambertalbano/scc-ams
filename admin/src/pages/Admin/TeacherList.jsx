import { motion } from 'framer-motion'; // Import motion
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
    const [imageFile, setImageFile] = useState(null);
    const teachersPerPage = 10;
    const [isLoading, setIsLoading] = useState(true); // Added loading state

    useEffect(() => {
        document.title = 'Manage Teachers - SCC AMS'; // Updated document title
    }, []);

    useEffect(() => {
        if (aToken) {
            setIsLoading(true);
            getAllTeachers().finally(() => setIsLoading(false));
        }
    }, [aToken, getAllTeachers]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page on search
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: value,
        }));
        setCurrentPage(0);
    };

    const handleEdit = (teacher) => {
        setCurrentTeacher(teacher);
        setIsEditing(true);
        setImageFile(null); // Reset image file when opening edit modal
    };

    const handleCloseEdit = () => {
        setIsEditing(false);
        setCurrentTeacher(null);
        setImageFile(null);
    };

    const handleDelete = async (teacherId) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await deleteTeacher(teacherId);
            } catch (error) {
                console.error('Failed to delete teacher:', error);
            }
        }
    };

    const handleSave = async () => {
        if (!currentTeacher?._id) {
            console.error("No teacher selected for update or teacher ID is missing.");
            return;
        }
        try {
            const updates = {
                firstName: currentTeacher.firstName,
                middleName: currentTeacher.middleName,
                lastName: currentTeacher.lastName,
                email: currentTeacher.email,
                number: currentTeacher.number,
                address: currentTeacher.address,
            };

            const success = await updateTeacher(currentTeacher._id, updates, imageFile);

            if (success) {
                handleCloseEdit();
            } else {
                console.error("Update teacher failed (frontend).");
            }
        } catch (error) {
            console.error("Error updating teacher:", error);
        }
    };

    const filteredTeachers = (teachers || []).filter((teacher) => {
        const fullName = `${teacher?.firstName || ''} ${teacher?.middleName || ''} ${teacher?.lastName || ''}`.toLowerCase();
        const email = teacher?.email?.toLowerCase() || '';
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

        if (filters.withEmail && !teacher?.email) return false;
        if (filters.noEmail && teacher?.email) return false;
        if (filters.withContact && !teacher?.number) return false;
        if (filters.noContact && teacher?.number) return false;

        return matchesSearch;
    });

    const pageCount = Math.ceil(filteredTeachers.length / teachersPerPage);
    const offset = currentPage * teachersPerPage;
    const currentTeachersOnPage = filteredTeachers.slice(offset, offset + teachersPerPage);

    const handlePageClick = ({ selected }) => setCurrentPage(selected);

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const contentVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    };

    const modalVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
        >
            <header className="w-full max-w-7xl mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-100">Manage Teachers</h1>
            </header>

            <motion.div
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
                            placeholder="Search Teacher by name or email"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500 text-lg">Loading teachers...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr className="text-gray-600 text-left text-sm">
                                        <th className="p-3 font-medium">Image</th>
                                        <th className="p-3 font-medium">First Name</th>
                                        <th className="p-3 font-medium">Middle Name</th>
                                        <th className="p-3 font-medium">Last Name</th>
                                        <th className="p-3 font-medium">Email</th>
                                        <th className="p-3 font-medium">Contact #</th>
                                        <th className="p-3 font-medium">Address</th>
                                        <th className="p-3 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentTeachersOnPage.length > 0 ? currentTeachersOnPage.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 text-sm text-gray-700">
                                            <td className="p-3">
                                                <img className="w-10 h-10 object-cover rounded-full" src={item?.image ?? '/default-image.png'} alt="Teacher" />
                                            </td>
                                            <td className="p-3 whitespace-nowrap">{item?.firstName ?? ''}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.middleName ?? ''}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.lastName ?? ''}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.email ?? 'N/A'}</td>
                                            <td className="p-3 whitespace-nowrap">{item?.number ?? 'N/A'}</td>
                                            <td className="p-3 min-w-[150px]">{item?.address ?? 'N/A'}</td>
                                            <td className="p-3 flex justify-center items-center gap-2">
                                                <div className="relative group">
                                                    <button className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" onClick={() => handleEdit(item)}>
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
                                            <td colSpan="8" className="text-center py-10 text-gray-500">
                                                No teachers found matching your criteria.
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

            {isEditing && currentTeacher && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <motion.div
                        variants={modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Teacher</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="firstName"
                                    value={currentTeacher.firstName || ''}
                                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="middleName"
                                    value={currentTeacher.middleName || ''}
                                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, middleName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="lastName"
                                    value={currentTeacher.lastName || ''}
                                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, lastName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="email"
                                    value={currentTeacher.email || ''}
                                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="number"
                                    value={currentTeacher.number || ''}
                                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    className="border border-gray-300 w-full p-2.5 rounded-lg focus:ring-customRed focus:border-customRed"
                                    name="address"
                                    value={currentTeacher.address || ''}
                                    onChange={(e) => setCurrentTeacher({ ...currentTeacher, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-customRed file:text-white hover:file:bg-red-700 cursor-pointer border border-gray-300 rounded-lg p-1.5"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                                {currentTeacher.image && !imageFile && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">Current image:</p>
                                        <img src={currentTeacher.image} alt="Current teacher" className="h-16 w-16 object-cover rounded-md mt-1" />
                                    </div>
                                )}
                                {imageFile && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">New image preview:</p>
                                        <img src={URL.createObjectURL(imageFile)} alt="New preview" className="h-16 w-16 object-cover rounded-md mt-1" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors" onClick={handleCloseEdit}>
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

export default TeachersList;