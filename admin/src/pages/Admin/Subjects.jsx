import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAdminContext } from "../../context/AdminContext";

const Subjects = () => {
    const { getAllSubjects, createSubject, updateSubject, deleteSubject } = useAdminContext();
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({ name: "", code: "" });
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            const data = await getAllSubjects();
            setSubjects(data);
        };
        fetchSubjects();
    }, [getAllSubjects]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingSubject) {
            const updatedSubject = await updateSubject(editingSubject._id, formData);
            if (updatedSubject) {
                setSubjects((prev) =>
                    prev.map((subject) =>
                        subject._id === updatedSubject._id ? updatedSubject : subject
                    )
                );
                toast.success("Subject updated successfully");
            }
        } else {
            const newSubject = await createSubject(formData);
            if (newSubject) {
                setSubjects((prev) => [...prev, newSubject]);
                toast.success("Subject created successfully");
            }
        }
        setFormData({ name: "", code: "" });
        setEditingSubject(null);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({ name: subject.name, code: subject.code });
    };

    const handleDelete = async (id) => {
        const success = await deleteSubject(id);
        if (success) {
            setSubjects((prev) => prev.filter((subject) => subject._id !== id));
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Subjects</h1>
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Subject Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Subject Code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="p-2 border rounded"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {editingSubject ? "Update Subject" : "Add Subject"}
                </button>
            </form>
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Code</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.map((subject) => (
                        <tr key={subject._id} className="border-b">
                            <td className="p-4">{subject.name}</td>
                            <td className="p-4">{subject.code}</td>
                            <td className="p-4 flex justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(subject)}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(subject._id)}
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

export default Subjects;