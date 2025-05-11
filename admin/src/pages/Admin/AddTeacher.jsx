import { motion } from 'framer-motion'; // Import motion
import { useContext, useEffect, useState } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Add Teacher - SCC AMS'; // Set document title
    }, []);

    const handleOpenRFID = () => {
        setOpenCardReaderWindow(true);
    };

    const handleCloseRFID = () => {
        setOpenCardReaderWindow(false);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        // Validation checks with toast.error for feedback
        if (!docImg) {
            toast.error('Please upload a profile picture.');
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

        const formData = new FormData();
        formData.append('image', docImg);
        formData.append('firstName', firstName);
        formData.append('middleName', middleName);
        formData.append('lastName', lastName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('number', number);
        formData.append('address', address);
        formData.append('code', code);

        try {
            const success = await addTeacher(formData); // Assuming addTeacher is correctly implemented in context
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
                navigate('/add-users'); // Redirect to Add Users selection page
            }
        } catch (error) {
            console.error("Error Response:", error.response);
            toast.error(error.response?.data?.message || 'Failed to add teacher. Please try again.');
            console.log(error);
        }
    };

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
        <motion.div // Main page container with Kiosk-like styling
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-800 p-4 sm:p-6 md:p-10"
        >
            <motion.form // Form container with its own animation
                variants={formVariants}
                initial="initial"
                animate="animate"
                onSubmit={onSubmitHandler}
                className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-lg shadow-xl" // Adjusted max-width and padding
            >
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center text-gray-700">Add New Teacher</h2>

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
                        <input value={code}
                        className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed"
                        type="text"
                        placeholder="RFID Serial (auto-filled)"
                        readOnly />
                        <button type="button"
                        onClick={handleOpenRFID}
                        className="bg-customRed text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                            Scan
                        </button>
                    </div>
                    <RFIDReaderInput
                        isOpen={openCardReaderWindow}
                        onRequestClose={handleCloseRFID}
                        handleCodeCardRFID={setCode}
                        textTitle='Scan Teacher RFID Card'
                        textBody=''
                    />
                </div>

                {/* Form fields in a grid layout for better spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
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
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} value={password} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="password" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input onChange={(e) => setNumber(e.target.value)} value={number} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="tel" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input onChange={(e) => setAddress(e.target.value)} value={address} className="mt-1 border border-gray-300 rounded px-3 py-2 w-full focus:ring-customRed focus:border-customRed" type="text" required />
                    </div>
                </div>

                <button type="submit" className="w-full bg-customRed px-4 py-3 mt-8 text-white rounded-md hover:bg-red-700 transition-colors font-semibold text-lg">
                    Add Teacher
                </button>
            </motion.form>
        </motion.div>
    );
};

export default AddTeacher;