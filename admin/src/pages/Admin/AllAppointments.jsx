import axios from 'axios';
import React, { useState } from 'react';
import { RFIDReaderInput } from 'rfid-reader-input';

const AllAppointments = () => {
    const [code, setCode] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [error, setError] = useState('');

    const handleRFIDScan = (scannedCode) => {
        setCode(scannedCode);
        fetchStudentInfo(scannedCode);
    };

    const fetchStudentInfo = async (scannedCode) => {
        try {
            const { data } = await axios.get(`/api/student/${scannedCode}`);
            if (data.success) {
                setStudentInfo(data.student);
                setError('');
            } else {
                setStudentInfo(null);
                setError('Student not found');
            }
        } catch (err) {
            setStudentInfo(null);
            setError('Error fetching student information');
        }
    };

    return (
        <div className="p-5">
            <h2 className="text-xl font-bold mb-4">RFID Student Information</h2>

            <RFIDReaderInput
                isOpen={true}
                handleCodeCardRFID={handleRFIDScan} // Pass scanned code to handler
            />

            <div className="mt-5">
                {code && <p>Scanned Code: <strong>{code}</strong></p>}

                {studentInfo ? (
                    <div className="mt-4 p-4 border rounded shadow">
                        <h3 className="text-lg font-medium">Student Details:</h3>
                        <p><strong>Name:</strong> {studentInfo.name}</p>
                        <p><strong>Email:</strong> {studentInfo.email}</p>
                        <p><strong>Number:</strong> {studentInfo.number}</p>
                        <p><strong>Level:</strong> {studentInfo.level}</p>
                        <p><strong>Address:</strong> {studentInfo.address.line1}, {studentInfo.address.line2}</p>
                    </div>
                ) : error ? (
                    <p className="mt-4 text-red-500">{error}</p>
                ) : (
                    <p className="mt-4 text-gray-500">Scan an RFID to view student information.</p>
                )}
            </div>
        </div>
    );
};

export default AllAppointments;
