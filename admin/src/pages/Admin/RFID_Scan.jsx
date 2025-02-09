import { useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const RFID_Scan = () => {
    const { getUserByCode } = useContext(AdminContext);
    const [code, setCode] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleScan = async () => {
        if (!code) {
            setError('Please scan a valid code');
            return;
        }

        setLoading(true);
        setError('');
        setUserInfo(null);

        try {
            const user = await getUserByCode(code);
            if (user) {
                setUserInfo(user);
            } else {
                setError('No user found with this code');
            }
        } catch (err) {
            setError('An error occurred while fetching user data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setCode('');
        setUserInfo(null);
        setError('');
    };

    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-4">RFID User Information</h2>
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Scan RFID Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="border rounded px-3 py-2 mr-2"
                    aria-label="RFID Code"
                />
                <button
                    onClick={handleScan}
                    className="bg-blue-500 text-white rounded px-4 py-2 mr-2"
                    disabled={loading}
                    aria-busy={loading}
                >
                    {loading ? 'Scanning...' : 'Scan'}
                </button>
                <button
                    onClick={handleClear}
                    className="bg-gray-500 text-white rounded px-4 py-2"
                >
                    Clear
                </button>
            </div>
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
