import axios from 'axios';
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
        semesterId: ''
    };
    const [formData, setFormData] = useState(initialFormData);

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
            semesterId: subject.semesterId?._id || subject.semesterId || ''
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
        if (payload.semesterId === '') {
            delete payload.semesterId;
        }

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

    // Opens the delete confirmation modal
    const handleDelete = (subjectId) => {
        setSubjectToDeleteId(subjectId);
        setShowDeleteModal(true);
    };

    // Closes the delete confirmation modal
    const cancelDeleteHandler = () => {
        setShowDeleteModal(false);
        setSubjectToDeleteId(null);
    };

    // Handles the actual deletion after confirmation
    const confirmDeleteHandler = async () => {
        if (!subjectToDeleteId) return;

        setIsLoading(true); // Use main loading for delete action
        setError('');
        setShowDeleteModal(false); // Close modal immediately

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
            setIsLoading(false);
            setSubjectToDeleteId(null); // Reset the ID
        }
    };


    if (!aToken) return <p className="text-center text-red-500 mt-10">Please log in to manage subjects.</p>;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">Manage Subjects</h2>

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
                    <PlusCircle size={20} className="mr-2" /> Add New Subject
                </button>
            </div>


            {(isAdding || isEditing) && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
                    <h3 className="text-xl font-medium mb-6 text-gray-700">{isEditing ? 'Edit Subject' : 'Add New Subject'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Code:</label>
                            <input type="text" id="code" name="code" value={formData.code} onChange={handleInputChange} required
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div className="flex items-center justify-end space-x-3 pt-2">
                            <button type="button" onClick={handleCancel} disabled={isFormLoading}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm flex items-center">
                                <XCircle size={18} className="mr-2" /> Cancel
                            </button>
                            <button type="submit" disabled={isFormLoading}
                                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save size={18} className="mr-2" />
                                {isFormLoading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Subject')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Confirm Deletion</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete this subject? This action cannot be undone.
                            </p>
                        </div>
                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                            <button
                                type="button"
                                onClick={confirmDeleteHandler}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                            >
                                Confirm Delete
                            </button>
                            <button
                                type="button"
                                onClick={cancelDeleteHandler}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && !subjects.length && <p className="text-center text-gray-500 py-5">Loading subjects...</p>}
            {!isLoading && !subjects.length && !isAdding && !isEditing && (
                <p className="text-center text-gray-500 py-5">No subjects found. Add one to get started!</p>
            )}

            {subjects.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {subjects.map(subject => (
                                <tr key={subject._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEditClick(subject)}
                                            disabled={isAdding || isEditing}
                                            className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                                            title="Edit"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject._id)} // This now opens the modal
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

export default Subjects;