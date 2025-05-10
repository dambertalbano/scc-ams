import { motion } from "framer-motion";
import {
    CheckCircle,
    Fingerprint,
    GraduationCap,
    Home, // Added Home icon
    LogIn,
    LogOut,
    UserCircle2,
    UserSquare2
} from "lucide-react";
import { assets } from '../../assets/assets'; // Assuming assets.js is in src/assets/

 const UserInfoDisplay = ({ userInfo, formatName, lastAction }) => {
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return <span className="text-slate-400 italic">N/A</span>;
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) { // Check for invalid date
                return <span className="text-red-500 italic">Invalid Date</span>;
            }
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric', minute: 'numeric', hour12: true
            }) + ' - ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (error) {
            return <span className="text-red-500 italic">Invalid Date Format</span>;
        }
    };

    // Default formatName if not provided, to prevent errors
    const displayFormatName = formatName || ((user) => user ? `${user.lastName || ''}, ${user.firstName || ''}`.trim().replace(/^,|,$/, '') : 'N/A');


    const ActionIcon = lastAction === 'Signed In' ? LogIn : lastAction === 'Signed Out' ? LogOut : CheckCircle;

    // Determine effective role for conditional rendering
    const effectiveRole = userInfo?.role || (userInfo?.studentNumber ? 'Student' : (userInfo?.teacherId ? 'Teacher' : 'N/A'));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full p-2 flex flex-col items-center" // Centering content
        >
            {/* Action Message */}
            {lastAction && lastAction !== "State Error" && lastAction !== "Already Recorded" && (
                <div className={`mb-4 p-3 rounded-lg flex items-center justify-center text-lg font-semibold w-full max-w-md ${lastAction === 'Signed In' ? 'bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300'}`}>
                    <ActionIcon size={24} className="mr-2 flex-shrink-0" /> {userInfo?.firstName || 'User'} {lastAction}!
                </div>
            )}

            {/* User Image and Name */}
            <div className="flex flex-col items-center text-center mb-5">
                <img
                    src={userInfo?.image || assets.blank_image}
                    alt="User"
                    onError={(e) => { e.target.onerror = null; e.target.src = assets.blank_image; }} // Fallback for broken image links
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-slate-200 dark:border-slate-700 shadow-lg object-cover mb-3 bg-slate-100 dark:bg-slate-800"
                />
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">{displayFormatName(userInfo)}</h3>
            </div>

            {/* Grouped User Details */}
            <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-md space-y-3 mb-5">
                <div className="flex items-center">
                    <Fingerprint size={20} className="mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">ID:</span>
                    <span className="ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold">{userInfo?.code || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                    <UserSquare2 size={20} className="mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Role:</span>
                    <span className="ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold">{effectiveRole}</span>
                </div>
                {userInfo?.studentNumber && (
                    <div className="flex items-center">
                        <UserCircle2 size={20} className="mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Student Number:</span>
                        <span className="ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold">{userInfo.studentNumber}</span>
                    </div>
                )}
                {userInfo?.teacherId && (
                     <div className="flex items-center">
                        <UserCircle2 size={20} className="mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Teacher ID:</span>
                        <span className="ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold">{userInfo.teacherId}</span>
                    </div>
                )}
                {/* Conditional display for Teacher Address OR Student Details */}
                {effectiveRole === 'Teacher' && userInfo?.address && (
                    <div className="flex items-start">
                        <Home size={20} className="mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Address:</span>
                        <span className="ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold">
                            {userInfo.address}
                        </span>
                    </div>
                )}
                {effectiveRole === 'Student' && userInfo?.educationLevel && (
                    <div className="flex items-start"> {/* items-start for multi-line text */}
                        <GraduationCap size={20} className="mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Details:</span>
                        <span className="ml-2 text-sm text-slate-800 dark:text-slate-100 font-semibold">
                            {userInfo.educationLevel} - {userInfo.gradeYearLevel} - {userInfo.section}
                        </span>
                    </div>
                )}
            </div>
            
            {/* Sign In/Out Times */}
            <div className="w-full max-w-md space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg shadow-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Sign In:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">{formatDateTime(userInfo?.signInTime)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-100 dark:bg-slate-700/30 rounded-lg shadow-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Sign Out:</span>
                    <span className="text-red-600 dark:text-red-400 font-medium">{formatDateTime(userInfo?.signOutTime)}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default UserInfoDisplay;
