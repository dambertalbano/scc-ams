import { useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const RFID_Scan = () => {
    const { getUserByCode } = useContext(AdminContext);  // Ensure this is the correct function
    const [code, setCode] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');

    const handleScan = async () => {
        if (!code) {
            setError('Please scan a valid code');
            return;
        }
    
        console.log("Scanning code:", code);  // Log the code to check its value
        
        try {
            // Call getUserByCode function to get the user details based on the code
            const user = await getUserByCode(code); 
            if (user) {
                setUserInfo(user);  // Set user info if found
                setError('');  // Clear any error
            } else {
                setUserInfo(null);  // Clear previous user data
                setError('No user found with this code');  // Display error if no user is found
            }
        } catch (err) {
            setUserInfo(null);
            setError('An error occurred while fetching user data.');
            console.error(err);  // Log error for debugging
        }
    };
    
    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-4">RFID User Information</h2>
            <input
                type="text"
                placeholder="Scan RFID Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}  // Update state on change
                className="border rounded px-3 py-2"
            />
            <button
                onClick={handleScan}
                className="mt-3 bg-blue-500 text-white rounded px-4 py-2"
            >
                Scan
            </button>
            <div className="mt-5">
                {userInfo ? (
                    <div className="p-4 border rounded shadow">
                        <p><strong>Name:</strong> {userInfo.name}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <p><strong>Number:</strong> {userInfo.number}</p>
                        <p><strong>Role:</strong> {userInfo.position}</p>
                        {userInfo.address && (
                            <p><strong>Address:</strong> {userInfo.address.line1}, {userInfo.address.line2}</p>
                        )}
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <p className="text-gray-500">Scan an RFID to view user information.</p>
                )}
            </div>
        </div>
    );
};

export default RFID_Scan;
