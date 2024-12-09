import { useContext, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const RFID_Scan = () => {
    const { getStudentByCode } = useContext(AdminContext);
    const [code, setCode] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [error, setError] = useState('');

    const handleScan = async () => {
        if (!code) {
            setError('Please scan a valid code');
            return;
        }
    
        console.log("Scanning code:", code);  // Log the code to check its value
        const student = await getStudentByCode(code);
        if (student) {
            setStudentInfo(student);
            setError('');
        } else {
            setStudentInfo(null);
            setError('Student not found');
        }
    };
    
    

    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-4">RFID Student Information</h2>
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
                {studentInfo ? (
                    <div className="p-4 border rounded shadow">
                        <p><strong>Name:</strong> {studentInfo.name}</p>
                        <p><strong>Email:</strong> {studentInfo.email}</p>
                        <p><strong>Number:</strong> {studentInfo.number}</p>
                        <p><strong>Level:</strong> {studentInfo.level}</p>
                        <p><strong>Address:</strong> {studentInfo.address.line1}, {studentInfo.address.line2}</p>
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <p className="text-gray-500">Scan an RFID to view student information.</p>
                )}
            </div>
        </div>
    );
};

export default RFID_Scan;
