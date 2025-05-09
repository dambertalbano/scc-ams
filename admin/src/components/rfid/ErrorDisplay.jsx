import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

 const ErrorDisplay = ({ error, userInfo, formatName, lastAction }) => {
    // Default formatName if not provided, to prevent errors if userInfo is present but formatName is missing
    const displayFormatName = formatName || ((user) => user ? `${user.lastName || ''}, ${user.firstName || ''}`.trim().replace(/^,|,$/, '') : 'N/A');

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-red-500 p-4 text-center w-full max-w-md"
        >
            <AlertTriangle className="w-16 h-16 mb-3 text-red-400" />
            <p className="text-xl font-semibold text-red-600">{error}</p>
            
            {/* Conditionally display user information if relevant to the error */}
            {userInfo && (lastAction === "Already Recorded" || lastAction === "State Error" || (error && error.toLowerCase().includes("wait at least"))) && (
                 <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium">User: {displayFormatName(userInfo)} ({userInfo.code})</p>
                    {lastAction === "Already Recorded" && <p className="italic">Status: Attendance complete for today.</p>}
                    {lastAction === "State Error" && <p className="italic">Please review this user's attendance records.</p>}
                </div>
            )}
        </motion.div>
    );
};

export default ErrorDisplay;
