import axios from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { RFIDReaderInput } from 'rfid-reader-input';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import gradeOptions from '../../utils/gradeOptions';

const useAddStudentForm = () => {
    const [docImg, setDocImg] = useState(null);
    const [studentNumber, setStudentNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [number, setNumber] = useState('');
    const [educationLevel, setEducationLevel] = useState('');
    const [gradeYearLevel, setGradeYearLevel] = useState('');
    const [section, setSection] = useState('');
    const [address, setAddress] = useState('');
    const [code, setCode] = useState('');
    const [openCardReaderWindow, setOpenCardReaderWindow] = useState(false);
    const [availableSections, setAvailableSections] = useState([]);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { aToken } = useContext(AdminContext);

    const educationLevels = Object.keys(gradeOptions);

    useEffect(() => {
        if (educationLevels.length > 0) {
            setEducationLevel(educationLevels[0]);
        }
    }, []);

    const resetForm = useCallback(() => {
        setDocImg(null);
        setStudentNumber('');
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setPassword('');
        setEmail('');
        setAddress('');
        setEducationLevel(educationLevels[0] || '');
        setGradeYearLevel('');
        setSection('');
        setNumber('');
        setCode('');
    }, [setDocImg, setStudentNumber, setFirstName, setMiddleName, setLastName, setEmail, setPassword, setAddress, setEducationLevel, setGradeYearLevel, setSection, number, setNumber, setCode, educationLevels]);

    const handleOpenRFID = useCallback(() => {
        setOpenCardReaderWindow(true);
    }, [setOpenCardReaderWindow]);

    const handleCloseRFID = useCallback(() => {
        setOpenCardReaderWindow(false);
    }, [setOpenCardReaderWindow]);

    const onSubmitHandler = useCallback(async (event) => {
        event.preventDefault();

        if (!docImg) {
            return toast.error('Image Not Selected');
        }

        if (!studentNumber || !firstName || !lastName || !email || !password || !number || !address || !educationLevel || !gradeYearLevel || !section) {
            return toast.error('Missing Details');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return toast.error('Please enter a valid email');
        }

        if (password.length < 8) {
            return toast.error('Please enter a strong password');
        }

        if (!educationLevel) {
            return toast.error("Please select an Education Level");
        }

        if (!gradeYearLevel) {
            return toast.error("Please select a Grade/Year Level");
        }

        if (!section) {
            return toast.error("Please select a Section");
        }

        const formData = new FormData();
        formData.append('image', docImg);
        formData.append('studentNumber', studentNumber);
        formData.append('firstName', firstName);
        formData.append('middleName', middleName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('number', parseInt(number, 10));
        formData.append('address', address);
        formData.append('code', code);
        formData.append('educationLevel', educationLevel);
        formData.append('gradeYearLevel', gradeYearLevel);
        formData.append('section', section);

        try {
            const { data } = await axios.post(backendUrl + '/api/admin/add-student', formData, {
                headers: {
                    Authorization: `Bearer ${aToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (data.success) {
                toast.success(data.message);
                resetForm();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            console.error(error);
        }
    }, [aToken, address, backendUrl, code, docImg, educationLevel, email, firstName, gradeYearLevel, lastName, middleName, number, password, section, resetForm, studentNumber]);

    useEffect(() => {
        setAvailableSections(gradeOptions[educationLevel]?.[gradeYearLevel] || []);
    }, [educationLevel, gradeYearLevel]);

    return {
        docImg, setDocImg, studentNumber, setStudentNumber, firstName, setFirstName, middleName, setMiddleName, lastName, setLastName,
        email, setEmail, password, setPassword, number, setNumber, educationLevel, setEducationLevel,
        gradeYearLevel, setGradeYearLevel, section, setSection, address, setAddress,
        code, setCode, openCardReaderWindow, setOpenCardReaderWindow, availableSections, handleOpenRFID,
        handleCloseRFID, onSubmitHandler, educationLevels
    };
};

const AddStudent = () => {
    const {
        docImg, setDocImg, studentNumber, setStudentNumber, firstName, setFirstName, middleName, setMiddleName, lastName, setLastName,
        email, setEmail, password, setPassword, number, setNumber, educationLevel, setEducationLevel,
        gradeYearLevel, setGradeYearLevel, section, setSection, address, setAddress,
        code, setCode, openCardReaderWindow, handleOpenRFID,
        handleCloseRFID, onSubmitHandler, educationLevels, availableSections
    } = useAddStudentForm();

    return (
        <div className="flex justify-center items-center min-h-[90vh] w-full">
            <form onSubmit={onSubmitHandler} className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-center">Add Student</h2>

                <div className="flex flex-col items-center mb-4">
                    <label htmlFor="doc-img" className="cursor-pointer">
                        <img
                            className="w-20 h-20 rounded-full bg-gray-200 object-cover"
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            style={{ width: '200px', height: '200px' }}
                            alt="Profile"
                        />
                    </label>
                    <input type="file" id="doc-img" hidden onChange={(e) => setDocImg(e.target.files[0])} />
                    <p className="text-sm text-gray-500">Upload Profile Picture</p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium font-bold">Scan RFID Card</label>
                    <div className="flex items-center gap-2">
                        <input value={code} className="border rounded px-3 py-2 w-full" type="text" placeholder="RFID Serial" readOnly />
                        <button type="button" onClick={handleOpenRFID} className="bg-customRed text-white px-3 py-2 rounded hover:bg-red-600">
                            Open Scanner
                        </button>
                    </div>
                    <RFIDReaderInput isOpen={openCardReaderWindow} onRequestClose={handleCloseRFID} handleCodeCardRFID={setCode} textTitle='RFID Identification'
                        textBody='Please bring your card closer' />
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-medium font-bold">Student Number</label>
                    <input onChange={(e) => setStudentNumber(e.target.value)} value={studentNumber} className="border rounded px-3 py-2 w-full" type="text" required />

                    <label className="block text-sm font-medium font-bold">First Name</label>
                    <input onChange={(e) => setFirstName(e.target.value)} value={firstName} className="border rounded px-3 py-2 w-full" type="text" required />

                    <label className="block text-sm font-medium font-bold">Middle Name</label>
                    <input onChange={(e) => setMiddleName(e.target.value)} value={middleName} className="border rounded px-3 py-2 w-full" type="text" required />

                    <label className="block text-sm font-medium font-bold">Last Name</label>
                    <input onChange={(e) => setLastName(e.target.value)} value={lastName} className="border rounded px-3 py-2 w-full" type="text" required />

                    <label className="block text-sm font-medium font-bold">Email</label>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} className="border rounded px-3 py-2 w-full" type="email" required />

                    <label className="block text-sm font-medium font-bold">Password</label>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2 w-full" type="password" required />

                    <label className="block text-sm font-medium font-bold">Contact Number</label>
                    <input onChange={(e) => setNumber(e.target.value)} value={number} className="border rounded px-3 py-2 w-full" type="text" required />

                    <label className="block text-sm font-medium font-bold">Address</label>
                    <input onChange={(e) => setAddress(e.target.value)} value={address} className="border rounded px-3 py-2 w-full" type="text" required />

                    <div>
                        <label className="block text-sm font-medium font-bold">Education Level</label>
                        <select
                            value={educationLevel}
                            onChange={(e) => {
                                setEducationLevel(e.target.value);
                                setGradeYearLevel('');
                            }}
                            className="border rounded px-3 py-2 w-full"
                        >
                            <option value="">Select Education Level</option>
                            {educationLevels.map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    {educationLevel && (
                        <div>
                            <label className="block text-sm font-medium font-bold">Grade/Year Level</label>
                            <select
                                value={gradeYearLevel}
                                onChange={(e) => setGradeYearLevel(e.target.value)}
                                className="border rounded px-3 py-2 w-full"
                            >
                                <option value="">Select Grade/Year Level</option>
                                {Object.keys(gradeOptions[educationLevel] || {}).map((level, index, array) => {
                                    if (level.startsWith('---')) {
                                        return (
                                            <option key={level} value="" disabled className="text-center border-b">
                                                --------------------------------------------------
                                            </option>
                                        );
                                    } else {
                                        return (
                                            <option key={level} value={level}>{level}</option>
                                        );
                                    }
                                })}
                            </select>
                        </div>
                    )}

                    <select onChange={(e) => setSection(e.target.value)} value={section} className="border rounded px-3 py-2 w-full">
                        <option value="">Select Section</option>
                        {availableSections.map((sec, index) => (
                            <option key={index} value={sec}>{sec}</option>
                        ))}
                    </select>

                </div>

                <button type="submit" className="w-full bg-customRed px-4 py-2 mt-4 text-white rounded hover:bg-red-600">
                    Add Student
                </button>
            </form>
        </div>
    );
};

export default AddStudent;