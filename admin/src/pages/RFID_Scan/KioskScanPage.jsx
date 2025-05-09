import { motion } from "framer-motion";
import { Loader } from "lucide-react"; // Import necessary icons
// Import your display components (UserInfoDisplay, ErrorDisplay, BlankUserInfo)
// Assuming they are now in a shared location, e.g., src/components/rfid/
import { useEffect } from "react";
import BlankUserInfo from '../../components/rfid/BlankUserInfo'; // Assuming this is a default export
import ErrorDisplay from '../../components/rfid/ErrorDisplay'; // Assuming this is a default export
import UserInfoDisplay from '../../components/rfid/UserInfoDisplay'; // Assuming this is a default export
import useRfidScanLogic from '../Admin/useRfidScanLogic'; // Corrected: Import as default (no curly braces)

const KioskScanPage = () => {
    // If not using a wrapper, ensure AdminContext is provided higher up with the correct token for the kiosk
    const { userInfo, error, loading, lastAction, formatName } = useRfidScanLogic();

    useEffect(() => {
        document.title = 'Attendance Scan Station';
    }, []);

    return (
        // <KioskSpecificAdminContextWrapper> // Optional: if you need to override context for this page
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 p-4 sm:p-6 md:p-10 text-gray-300" // New page background and default text color
        >
            <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-lg w-full"> {/* New card background */}
                {(!userInfo || loading) && !error && (
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Attendance Scan</h1> {/* Card title text */}
                        <p className="text-sm text-gray-400 mt-1">Please scan your ID.</p> {/* Card subtitle text */}
                    </div>
                )}
                {error && !userInfo && (
                     <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Attendance Scan</h1> {/* Card title text */}
                        <p className="text-sm text-gray-400 mt-1">Please scan your ID.</p> {/* Card subtitle text */}
                    </div>
                )}

                {/* Hidden input for RFID scanner can be managed by the hook or added here if needed */}
                {/* <input type="text" className="opacity-0 absolute w-0 h-0" autoFocus /> */}

                <div className={`min-h-[380px] flex flex-col justify-center items-center ${(!userInfo && !loading && !error) ? 'pt-0' : 'pt-6'}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center">
                            <Loader className="w-16 h-16 animate-spin mb-4 text-red-500" /> {/* Loader accent color */}
                            <p className="text-xl font-semibold text-gray-200">Processing...</p> {/* Loading text */}
                            {userInfo && <p className="text-md text-gray-400 mt-1">For: {formatName(userInfo)}</p>} {/* Loading sub-text */}
                        </div>
                    ) : error ? (
                        <ErrorDisplay error={error} userInfo={userInfo} formatName={formatName} lastAction={lastAction} />
                    ) : userInfo ? (
                        <UserInfoDisplay userInfo={userInfo} formatName={formatName} lastAction={lastAction} />
                    ) : (
                        <BlankUserInfo />
                    )}
                </div>
            </div>
            <footer className="mt-8 text-center">
                <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} St. Clare College of Caloocan</p> {/* Footer text */}
            </footer>
        </motion.div>
        // </KioskSpecificAdminContextWrapper>
    );
};

export default KioskScanPage;