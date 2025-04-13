import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { RFIDReaderInput } from 'rfid-reader-input';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';

const AddTeacher = () => {
    const [docImg, setDocImg] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [number, setNumber] = useState('');
    const [address, setAddress] = useState('');
    const [code, setCode] = useState('');
    const [openCardReaderWindow, setOpenCardReaderWindow] = useState(false);
    const { aToken, addTeacher } = useContext(AdminContext);

    const handleOpenRFID = () => {
        setOpenCardReaderWindow(true);
    };

    const handleCloseRFID = () => {
        setOpenCardReaderWindow(false);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!docImg) {
            return toast.error('Image Not Selected');
        }

        if (!firstName || !lastName || !email || !password || !number || !address || !code) {
            return toast.error('Missing Details');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return toast.error('Please enter a valid email');
        }

        if (password.length < 8) {
            return toast.error('Please enter a strong password');
        }

        const formData = new FormData();

        formData.append('image', docImg);
        formData.append('firstName', firstName);
        formData.append('middleName', middleName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('number', Number(number));
        formData.append('address', address);
        formData.append('code', code);

        console.log("Form Data:", Object.fromEntries(formData));

        try {
            const success = await addTeacher(formData);
            if (success) {
                setDocImg(null);
                setFirstName('');
                setMiddleName('');
                setLastName('');
                setPassword('');
                setEmail('');
                setAddress('');
                setNumber('');
                setCode('');
            }
        } catch (error) {
            console.error("Error Response:", error.response);
            toast.error(error.response?.data?.message || error.message);
            console.log(error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[90vh] w-full">
            <form onSubmit={onSubmitHandler} className="w-full max-w-5xl bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-center">Add Teacher</h2>

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
                    <label className="block text-sm font-medium">Scan RFID Card</label>
                    <div className="flex items-center gap-2">
                        <input value={code} className="border rounded px-3 py-2 w-full" type="text" readOnly />
                        <button type="button" onClick={handleOpenRFID} className="bg-customRed text-white px-3 py-2 rounded hover:bg-red-600">
                            Open Scanner
                        </button>
                    </div>
                    <RFIDReaderInput isOpen={openCardReaderWindow} onRequestClose={handleCloseRFID} handleCodeCardRFID={setCode} textTitle='RFID Identification'
                        textBody='Please bring your card closer' />
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">First Name</label>
                        <input onChange={(e) => setFirstName(e.target.value)} value={firstName} className="border rounded px-3 py-2 w-full" type="text" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Middle Name</label>
                        <input onChange={(e) => setMiddleName(e.target.value)} value={middleName} className="border rounded px-3 py-2 w-full" type="text" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Last Name</label>
                        <input onChange={(e) => setLastName(e.target.value)} value={lastName} className="border rounded px-3 py-2 w-full" type="text" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Email</label>
                        <input onChange={(e) => setEmail(e.target.value)} value={email} className="border rounded px-3 py-2 w-full" type="email" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} className="border rounded px-3 py-2 w-full" type="password" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Contact Number</label>
                        <input onChange={(e) => setNumber(e.target.value)} value={number} className="border rounded px-3 py-2 w-full" type="number" required />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-medium">Address</label>
                        <input onChange={(e) => setAddress(e.target.value)} value={address} className="border rounded px-3 py-2 w-full" type="text" required />
                    </div>
                </div>

                <button type="submit" className="w-full bg-customRed px-4 py-2 mt-4 text-white rounded hover:bg-red-600">
                    Add Teacher
                </button>
            </form>
        </div>
    );
};

export default AddTeacher;