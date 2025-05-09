import { motion } from "framer-motion";
import { Loader } from "lucide-react"; // Keep only necessary icons for this page shell
import { useEffect } from "react";
// Corrected imports for default exports
import BlankUserInfo from '../../components/rfid/BlankUserInfo';
import ErrorDisplay from '../../components/rfid/ErrorDisplay';
import UserInfoDisplay from '../../components/rfid/UserInfoDisplay';
// Assuming useRfidScanLogic is a default export based on previous errors, if not, adjust.
import useRfidScanLogic from '../Admin/useRfidScanLogic'; // This path might also need checking

const RFID_Scan = () => {
    const { userInfo, error, loading, lastAction, formatName } = useRfidScanLogic();

    useEffect(() => {
        document.title = 'RFID Scanner - Admin';
    }, []);
    
    // The main RFID_Scan component becomes much simpler, primarily handling layout
    // and passing props to the shared display components.
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
            className="flex flex-col justify-center items-center min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-700 p-4 sm:p-6 md:p-10"
        >
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl text-center max-w-lg w-full transform transition-all duration-300 ease-in-out">
                {(!userInfo || loading) && !error && (
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">RFID Attendance</h1>
                        <p className="text-sm text-slate-500 mt-1">Scan RFID card to record attendance.</p>
                    </div>
                )}
                 {error && !userInfo && (
                     <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-700">RFID Attendance</h1>
                        <p className="text-sm text-slate-500 mt-1">Scan RFID card to record attendance.</p>
                    </div>
                 )}

                {/* The global keydown listener is in useRfidScanLogic, so no explicit input field needed here unless for manual override */}

                <div className={`min-h-[380px] flex flex-col justify-center items-center ${(!userInfo && !loading && !error) ? 'pt-0' : 'pt-6'}`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center text-blue-600">
                            <Loader className="w-16 h-16 animate-spin mb-4" />
                            <p className="text-xl font-semibold">Processing Scan...</p>
                            {userInfo && <p className="text-md text-slate-600 mt-1">For: {formatName(userInfo)}</p>}
                            {!userInfo && <p className="text-sm text-slate-500">Please wait a moment.</p>}
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
                <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Thesis Project. All rights reserved.</p>
            </footer>
        </motion.div>
    );
};

export default RFID_Scan;