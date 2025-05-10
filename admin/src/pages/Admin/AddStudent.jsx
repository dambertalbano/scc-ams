import axios from 'axios';
import { motion } from 'framer-motion';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const educationLevels = Object.keys(gradeOptions);

    useEffect(() => {
        document.title = 'Add Student - SCC AMS';
        if (educationLevels.length > 0 && !educationLevel) {
            setEducationLevel(educationLevels[0]);
        }
    }, [educationLevels, educationLevel]);

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
    }, [educationLevels]);

    const handleOpenRFID = useCallback(() => {
        setOpenCardReaderWindow(true);
    }, [setOpenCardReaderWindow]);

    const handleCloseRFID = useCallback(() => {
        setOpenCardReaderWindow(false);
    }, [setOpenCardReaderWindow]);

    const onSubmitHandler = useCallback(async (event) => {
        event.preventDefault();

        if (!docImg) {
            toast.error('Please upload a profile picture.');
            return;
        }

        if (!studentNumber) {
            toast.error('Student Number is required.');
            return;
        }

        if (!firstName) {
            toast.error('First Name is required.');
            return;
        }

        if (!lastName) {
            toast.error('Last Name is required.');
            return;
        }

        if (!email) {
            toast.error('Email is required.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (!password) {
            toast.error('Password is required.');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        if (!number) {
            toast.error('Contact Number is required.');
            return;
        }

        if (!address) {
            toast.error('Address is required.');
            return;
        }

        if (!educationLevel) {
            toast.error('Please select an Education Level.');
            return;
        }

        if (!gradeYearLevel) {
            toast.error('Please select a Grade/Year Level.');
            return;
        }

        if (!section) {
            toast.error('Please select a Section.');
            return;
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
                navigate('/admin/add-users');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to add student. Please try again.');
            console.error(error);
        }
    }, [aToken, address, backendUrl, code, docImg, educationLevel, email, firstName, gradeYearLevel, lastName, middleName, navigate, number, password, section, resetForm, studentNumber]);

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

    const pageVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.5 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    const formVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
        >
            <motion.form
                variants={formVariants}
                initial="initial"
                animate="animate"
                onSubmit={onSubmitHandler}
                className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-lg shadow-xl"
            >
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-gray-700">Add New Student</h2>

                <div className="flex flex-col items-center mb-6">
                    <label htmlFor="doc-img" className="cursor-pointer">
                        <img
                            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 object-cover border-4 border-gray-300 hover:border-customRed transition-colors"
                            src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                            alt="Profile"
                        />
                    </label>
                    <input type="file" id="doc-img" hidden onChange={(e) => setDocImg(e.target.files[0])} accept="image/*" />
                    <p className="text-sm text-gray-500 mt-2">Upload Profile Picture</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scan RFID Card</label>
                    <div className="flex items-center gap-2">
                        <input value={code} className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" placeholder="RFID Serial (auto-filled)" readOnly />
                        <button type="button" onClick={handleOpenRFID} className="bg-customRed text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                            Scan
                        </button>
                    </div>
                    <RFIDReaderInput 
                        isOpen={openCardReaderWindow} 
                        onRequestClose={handleCloseRFID} 
                        handleCodeCardRFID={setCode} 
                        textTitle='Student RFID Scanner'
                        textBody='Please tap the student RFID card on the reader.' 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student Number</label>
                        <input onChange={(e) => setStudentNumber(e.target.value)} value={studentNumber} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="password" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input onChange={(e) => setFirstName(e.target.value)} value={firstName} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                        <input onChange={(e) => setMiddleName(e.target.value)} value={middleName} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input onChange={(e) => setLastName(e.target.value)} value={lastName} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="email" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input onChange={(e) => setNumber(e.target.value)} value={number} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="tel" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input onChange={(e) => setAddress(e.target.value)} value={address} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Education Level</label>
                        <select
                            value={educationLevel}
                            onChange={(e) => {
                                setEducationLevel(e.target.value);
                                setGradeYearLevel('');
                                setSection('');
                            }}
                            className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed"
                        >
                            <option value="">Select Education Level</option>
                            {educationLevels.map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Grade/Year Level</label>
                        <select
                            value={gradeYearLevel}
                            onChange={(e) => {
                                setGradeYearLevel(e.target.value);
                                setSection('');
                            }}
                            className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed"
                            disabled={!educationLevel}
                        >
                            <option value="">Select Grade/Year Level</option>
                            {Object.keys(gradeOptions[educationLevel] || {}).map((level) => {
                                if (level.startsWith('---')) {
                                    return <option key={level} value="" disabled className="text-center font-semibold text-gray-400">--------------------</option>;
                                }
                                return <option key={level} value={level}>{level}</option>;
                            })}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Section</label>
                        <select 
                            onChange={(e) => setSection(e.target.value)} 
                            value={section} 
                            className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed"
                            disabled={!gradeYearLevel || availableSections.length === 0}
                        >
                            <option value="">Select Section</option>
                            {availableSections.map((sec, index) => (
                                <option key={index} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button type="submit" className="w-full bg-customRed px-4 py-3 mt-8 text-white rounded-md hover:bg-red-700 transition-colors font-semibold text-lg">
                    Add Student
                </button>
            </motion.form>
        </motion.div>
    );
};

export default AddStudent;