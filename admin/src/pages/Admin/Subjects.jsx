import axios from 'axios';
import { motion } from 'framer-motion'; // Import motion
import { AlertTriangle, Edit3, PlusCircle, Save, Trash2, XCircle } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const Subjects = () => {
    const { backendUrl, aToken } = useContext(AdminContext);

    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [error, setError] = useState('');

    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSubject, setCurrentSubject] = useState(null);

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDeleteId, setSubjectToDeleteId] = useState(null);

    const initialFormData = {
        name: '',
        code: '',
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        document.title = 'Manage Subjects - SCC AMS'; // Set document title
    }, []);

    const fetchSubjects = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(`${backendUrl}/api/admin/subjects`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (response.data.success) {
                setSubjects(response.data.subjects);
            } else {
                setError(response.data.message || 'Failed to fetch subjects');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while fetching subjects.');
            console.error("Fetch Subjects Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (aToken && backendUrl) {
            fetchSubjects();
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
        setCurrentSubject(null);
        setError('');
    };

    const handleAddClick = () => {
        resetFormDataAndState();
        setIsAdding(true);
    };

    const handleEditClick = (subject) => {
        setIsEditing(true);
        setIsAdding(false);
        setCurrentSubject(subject);
        setFormData({
            name: subject.name,
            code: subject.code,
        });
    };

    const handleCancel = () => {
        resetFormDataAndState();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsFormLoading(true);
        setError('');

        const payload = { ...formData };

        try {
            let response;
            if (isEditing && currentSubject) {
                response = await axios.put(`${backendUrl}/api/admin/subjects/${currentSubject._id}`, payload, {
                    headers: { Authorization: `Bearer ${aToken}` }
                });
            } else {
                response = await axios.post(`${backendUrl}/api/admin/subjects`, payload, {
                    headers: { Authorization: `Bearer ${aToken}` }
                });
            }

            if (response.data.success) {
                fetchSubjects();
                handleCancel();
            } else {
                setError(response.data.message || 'Operation failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
            console.error("Submit Subject Error:", err);
        } finally {
            setIsFormLoading(false);
        }
    };

    const handleDelete = (subjectId) => {
        setSubjectToDeleteId(subjectId);
        setShowDeleteModal(true);
    };

    const cancelDeleteHandler = () => {
        setShowDeleteModal(false);
        setSubjectToDeleteId(null);
    };

    const confirmDeleteHandler = async () => {
        if (!subjectToDeleteId) return;

        setIsFormLoading(true);
        setError('');
        setShowDeleteModal(false);

        try {
            const response = await axios.delete(`${backendUrl}/api/admin/subjects/${subjectToDeleteId}`, {
                headers: { Authorization: `Bearer ${aToken}` }
            });
            if (response.data.success) {
                fetchSubjects();
            } else {
                setError(response.data.message || 'Failed to delete subject');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred while deleting subject.');
            console.error("Delete Subject Error:", err);
        } finally {
            setIsFormLoading(false);
            setSubjectToDeleteId(null);
        }
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

    const modalVariants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
    };

    if (!aToken) {
        return (
            <motion.div
                variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-gray-800 p-6"
            >
                <p className="text-center text-red-400 text-xl">Please log in to manage subjects.</p>
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
                    <h2 className="text-3xl font-bold text-gray-100">Manage Subjects</h2>
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

                <div className="mb-6">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddClick}
                        disabled={isAdding || isEditing || isFormLoading}
                        className="bg-customRed hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg flex items-center shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <PlusCircle size={20} className="mr-2" /> Add New Subject
                    </motion.button>
                </div>

                {(isAdding || isEditing) && (
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8 border border-gray-200"
                    >
                        <h3 className="text-2xl font-semibold mb-6 text-gray-800">{isEditing ? 'Edit Subject' : 'Add New Subject'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700" />
                            </div>
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Code:</label>
                                <input type="text" id="code" name="code" value={formData.code} onChange={handleInputChange} required
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-customRed focus:border-customRed text-gray-700" />
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
                                    {isFormLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Subject')}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md mx-auto"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete this subject? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={cancelDeleteHandler}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={confirmDeleteHandler}
                                    disabled={isFormLoading}
                                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-60"
                                >
                                    {isFormLoading ? 'Deleting...' : 'Confirm Delete'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isLoading && !subjects.length && (
                    <motion.p variants={cardVariants} initial="initial" animate="animate" className="text-center text-gray-300 py-10 text-lg">Loading subjects...</motion.p>
                )}
                {!isLoading && !subjects.length && !isAdding && !isEditing && (
                    <motion.div variants={cardVariants} initial="initial" animate="animate" className="text-center bg-white/10 backdrop-blur-sm p-10 rounded-xl shadow-lg">
                        <p className="text-gray-200 text-lg">No subjects found.</p>
                        <p className="text-gray-300">Add one to get started!</p>
                    </motion.div>
                )}

                {subjects.length > 0 && (
                    <motion.div
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        className="overflow-x-auto bg-white rounded-xl shadow-2xl"
                    >
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subjects.map(subject => (
                                    <tr key={subject._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{subject.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{subject.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                            <button
                                                onClick={() => handleEditClick(subject)}
                                                disabled={isAdding || isEditing || isLoading || isFormLoading}
                                                className="text-customRed hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject._id)}
                                                disabled={isLoading || isAdding || isEditing || isFormLoading}
                                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Subjects;