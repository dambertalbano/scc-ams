import { useCallback, useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const useRfidScanLogic = () => {
    const { getUserByCode, adminSignIn, adminSignOut, aToken } = useContext(AdminContext); // Assuming kiosk uses aToken from AdminContext
    
    const [scannedCodeState, setScannedCodeState] = useState(''); // Renamed to avoid conflict if component also has 'scannedCode'
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastScannedTimes, setLastScannedTimes] = useState({});
    const [lastAction, setLastAction] = useState('');

    // handleScan, handleSignIn, handleSignOut are almost identical to your RFID_Scan.jsx
    // Ensure they use the context functions: getUserByCode, adminSignIn, adminSignOut
    // And manage the states defined above.

    const handleSignInLogic = useCallback(async (code) => {
        try {
            await adminSignIn(code, aToken); // Pass token if your context functions require it
            const updatedUserResponse = await getUserByCode(code, aToken);
            if (updatedUserResponse && updatedUserResponse.success && updatedUserResponse.user) {
                setUserInfo(updatedUserResponse.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign in.');
            throw err;
        }
    }, [adminSignIn, getUserByCode, aToken]);

    const handleSignOutLogic = useCallback(async (code) => {
        try {
            await adminSignOut(code, aToken);
            const updatedUserResponse = await getUserByCode(code, aToken);
            if (updatedUserResponse && updatedUserResponse.success && updatedUserResponse.user) {
                setUserInfo(updatedUserResponse.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign out.');
            throw err;
        }
    }, [adminSignOut, getUserByCode, aToken]);

    const handleScanLogic = useCallback(async (code) => {
        if (!code || !code.trim()) {
            setError('Please scan or enter a valid code.');
            return;
        }
        setLoading(true);
        setError('');
        setLastAction('');
        // setUserInfo(null); // Optional: clear previous user info immediately or after fetching

        try {
            const response = await getUserByCode(code, aToken); // Pass token
            if (response && response.success && response.user) {
                const user = response.user;
                setUserInfo(user);
                const now = new Date();
                if (lastScannedTimes[code] && now.getTime() - lastScannedTimes[code].getTime() < 30000) {
                    setError('Please wait at least 30 seconds before scanning the same card again.');
                    setLoading(false);
                    return;
                }
                // ... (rest of the sign-in/sign-out decision logic from your RFID_Scan.jsx)
                // Call handleSignInLogic or handleSignOutLogic
                const today = new Date();
                const signInDate = user.signInTime ? new Date(user.signInTime) : null;
                const signOutDate = user.signOutTime ? new Date(user.signOutTime) : null;

                const isSameDay = (date1, date2) =>
                    date1 && date2 &&
                    date1.getFullYear() === date2.getFullYear() &&
                    date1.getMonth() === date2.getMonth() &&
                    date1.getDate() === date2.getDate();

                const sameDaySignIn = signInDate && isSameDay(signInDate, today);
                const sameDaySignOut = signOutDate && isSameDay(signOutDate, today);

                if (sameDaySignIn && sameDaySignOut && signOutDate >= signInDate) {
                    setError('Attendance already recorded for today (both sign-in and sign-out).');
                    setLastAction('Already Recorded');
                } else if (!sameDaySignIn || (sameDaySignIn && sameDaySignOut && signOutDate < signInDate)) {
                    await handleSignInLogic(code);
                    setLastAction('Signed In');
                } else if (sameDaySignIn && !sameDaySignOut) {
                    await handleSignOutLogic(code);
                    setLastAction('Signed Out');
                } else {
                    setError('User is in an unexpected attendance state. Please check records.');
                    setLastAction('State Error');
                }
                if (!error) { // Only update lastScannedTime if no error occurred before this point in logic
                    setLastScannedTimes(prev => ({ ...prev, [code]: now }));
                }
            } else {
                setError(response?.message || 'No user found with this code.');
                setUserInfo(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
            setUserInfo(null);
        } finally {
            setLoading(false);
        }
    }, [getUserByCode, lastScannedTimes, aToken, handleSignInLogic, handleSignOutLogic, error]); // Added error to dep array due to its usage in the logic

    // The useEffect for keydown events also goes here
    useEffect(() => {
        let buffer = "";
        let timeoutId = null;
        const processScanInput = () => {
            if (buffer.trim() !== '') {
                handleScanLogic(buffer.trim());
            }
            buffer = "";
        };
        const handleKeyDown = (event) => {
            if (timeoutId) clearTimeout(timeoutId);
            if (event.key === 'Enter') {
                if (buffer.trim() !== '') processScanInput();
                // If you have a manual input field in the UI consuming this hook:
                // else if (scannedCodeState.trim() !== '') { 
                //    handleScanLogic(scannedCodeState.trim());
                //    setScannedCodeState(''); 
                // }
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                buffer += event.key;
            }
            // else if (event.key === 'Backspace' && scannedCodeState) { // For manual input field
            //    setScannedCodeState(prev => prev.slice(0, -1));
            // }
            timeoutId = setTimeout(() => { if (buffer.trim() !== '') processScanInput(); }, 200);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [handleScanLogic]); // Removed scannedCodeState unless you add manual input handling back here

    return {
        userInfo,
        error,
        loading,
        lastAction,
        handleScan: handleScanLogic, // Expose main scan handler
        formatName: (user) => { // Keep utility functions or move them to a utils file
            if (!user) return 'N/A';
            const lastName = user.lastName || '';
            const firstName = user.firstName || '';
            const middleInitial = user.middleName ? `${user.middleName.charAt(0)}.` : '';
            return `${lastName}, ${firstName} ${middleInitial}`.trim().replace(/,\s*$/, "");
        }
    };
};

export default useRfidScanLogic;