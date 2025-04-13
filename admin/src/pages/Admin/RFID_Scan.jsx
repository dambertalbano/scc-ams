import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";
import blankImage from "../../assets/blank-image.webp";
import { AdminContext } from "../../context/AdminContext";

const RFID_Scan = () => {
    const { getUserByCode, adminSignIn, adminSignOut } = useContext(AdminContext);
    const [scannedCode, setScannedCode] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastScannedTimes, setLastScannedTimes] = useState({}); // Store last scanned time per user

    useEffect(() => {
        document.title = 'Scan';
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (scannedCode.trim() !== '') {
                    handleScan(scannedCode.trim());
                }
                // Clear the scannedCode after processing the Enter key
                setScannedCode('');
            } else {
                setScannedCode((prevCode) => prevCode + event.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [getUserByCode, scannedCode]);

    const handleScan = async (code) => {
        if (!code.trim()) {
            setError('Please scan a valid code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log(`Scanning RFID code: ${code}`);
            const response = await getUserByCode(code);
            console.log('User fetched:', response);

            if (response && response.success && response.user) {
                setUserInfo(response.user);
                console.log('User info set:', response.user);

                const user = response.user;

                // Prevent double scanning within the same minute for this user
                const now = new Date();
                if (lastScannedTimes[code] && now.getTime() - lastScannedTimes[code].getTime() < 60000) {
                    setError('Please wait at least one minute before scanning again.');
                    setLoading(false);
                    return;
                }

                // Check if sign-in and sign-out already recorded for *today*
                const today = new Date();
                const signInDate = user.signInTime ? new Date(user.signInTime) : null;
                const signOutDate = user.signOutTime ? new Date(user.signOutTime) : null;

                const sameDaySignIn = signInDate && (
                    signInDate.getFullYear() === today.getFullYear() &&
                    signInDate.getMonth() === today.getMonth() &&
                    signInDate.getDate() === today.getDate()
                );

                const sameDaySignOut = signOutDate && (
                    signOutDate.getFullYear() === today.getFullYear() &&
                    signOutDate.getMonth() === today.getMonth() &&
                    signOutDate.getDate() === today.getDate()
                );

                if (sameDaySignIn && sameDaySignOut && signOutDate > signInDate) {
                    setError('Attendance was already recorded for today.');
                    setLoading(false);
                    return;
                }

                // Determine whether to sign in or sign out
                if (!user.signInTime || (user.signOutTime && user.signOutTime > user.signInTime)) {
                    await handleSignIn(code);
                } else if (user.signInTime && (!user.signOutTime || user.signOutTime < user.signInTime)) {
                    await handleSignOut(code);
                } else {
                    setError('Invalid state. Please contact support.');
                    setLoading(false);
                    return;
                }

                // Update last scanned time for this user
                setLastScannedTimes(prevTimes => ({ ...prevTimes, [code]: now }));
            } else {
                setError('No user found with this code');
                setUserInfo(null);
            }
        } catch (err) {
            setError('An error occurred while fetching user data.');
            console.error('Error fetching user data:', err);
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const formatName = (user) => {
        if (!user) return 'No Data';
        const lastName = user.lastName || '';
        const firstName = user.firstName || '';
        const middleName = user.middleName ? `${user.middleName.charAt(0)}.` : '';
        return `${lastName}, ${firstName} ${middleName}`.trim();
    };

    const handleSignIn = async (code) => {
        try {
            await adminSignIn(code);
            // Refresh user info after sign-in
            const response = await getUserByCode(code);
            if (response && response.success && response.user) {
                setUserInfo(response.user);
            } else {
                setError('Failed to refresh user data after sign-in.');
            }
        } catch (error) {
            setError('Failed to sign in.');
            console.error(error);
        }
    };

    const handleSignOut = async (code) => {
        try {
            await adminSignOut(code);
            // Refresh user info after sign-out
            const response = await getUserByCode(code);
            if (response && response.success && response.user) {
                setUserInfo(response.user);
            } else {
                setError('Failed to refresh user data after sign-out.');
            }
        } catch (error) {
            setError('Failed to sign out.');
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }} 
            className="flex justify-center items-center min-h-screen w-full bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl w-full">
                    {!loading && (
                        <div className="flex items-center justify-center mb-4 text-customRed">
                            <FiInfo className="w-8 h-8" />
                            <h2 className="text-3xl font-bold ml-2">User Information</h2>
                        </div>
                    )}
                    {loading ? (
                        <div className="flex justify-center items-center">
                        <Loader className="w-5 h-5 text-customRed animate-spin mr-2" />
                        <span className="text-customRed">Scanning ...</span>
                    </div>
                    ) : error ? (
                        <>
                            <p className="text-red-500 text-center">{error}</p>
                            {userInfo ? (
                                userInfo.position !== 'Teacher' ? (
                                    <UserInfoDisplay userInfo={userInfo} formatName={formatName} />
                                ) : null
                            ) : (
                                <BlankUserInfo />
                            )}
                        </>
                    ) : userInfo ? (
                        userInfo.position !== 'Teacher' ? (
                            <UserInfoDisplay userInfo={userInfo} formatName={formatName} />
                        ) : null
                    ) : (
                        <BlankUserInfo />
                    )}
                </div>
        </motion.div>
    );
};

const UserInfoDisplay = ({ userInfo, formatName }) => {
    // Function to format the date and time
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'No Data';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return 'Invalid Date';
        }
    };

    return (
        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow-md text-left w-full">
            <div className="flex flex-wrap items-center gap-4">
                <img src={userInfo.image || blankImage} alt="User" className="w-28 h-28 rounded-full border" />
                <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold truncate">{formatName(userInfo)}</p>
                    <p className="text-sm text-gray-500">{userInfo.studentNumber}</p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-gray-700 break-words">
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Address:</strong> {userInfo.address}</p>
                {userInfo.position && <p><strong>Position:</strong> {userInfo.position}</p>}
                {userInfo.educationLevel && <p><strong>Education Level:</strong> {userInfo.educationLevel}</p>}
                {userInfo.gradeYearLevel && <p><strong>Grade/Year Level:</strong> {userInfo.gradeYearLevel}</p>}
                {userInfo.section && <p><strong>Section:</strong> {userInfo.section}</p>}
            </div>
            <div className="col-span-1 sm:col-span-2 flex justify-between border-t pt-2">
                <p className="text-green-500"><strong>Sign In Time:</strong> {formatDateTime(userInfo.signInTime)}</p>
                <p className="text-red-500"><strong>Sign Out Time:</strong> {formatDateTime(userInfo.signOutTime)}</p>
            </div>
        </div>
    );
};

const BlankUserInfo = () => {
    return (
        <div className="flex flex-col items-center justify-center mt-6">
            <img src={blankImage} alt="User" className="w-28 h-28 rounded-full bg-gray-200" />
            <p className="text-gray-500 mt-3 text-lg">No user scanned</p>
        </div>
    );
};

export default RFID_Scan;