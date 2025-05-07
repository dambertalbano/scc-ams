// ... existing imports ...
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaFilePdf, FaFilter, FaPercentage, FaUserCheck, FaUsers } from 'react-icons/fa'; // Removed FaFileExcel
import { toast } from 'react-toastify';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// import * as XLSX from 'xlsx'; // Removed XLSX import
import { useAdminContext } from '../../context/AdminContext';

// ... StatCard, UserGrowthChart, DailySignInChart components remain the same ...
const StatCard = ({ title, value, icon, unit = "" }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="text-3xl text-blue-500">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">
                {value !== null && value !== undefined ? `${value}${unit}` : 'N/A'}
            </p>
        </div>
    </div>
);

const UserGrowthChart = ({ data, title, granularity }) => { 
    console.log('[UserGrowthChart] --- RENDER START ---'); 
    console.log('[UserGrowthChart] Received props:', { data, title, granularity, dataLength: data ? data.length : 0 }); 
    
    if (!data || data.length === 0) {
        console.log('[UserGrowthChart] Data is empty or undefined. Not processing for chart.');
    }

    const formattedData = data.map((item, index) => { 
        console.log(`[UserGrowthChart] Mapping item ${index}:`, item); 
        let displayLabel = 'Unknown';
        const key = item.date; 
        console.log(`[UserGrowthChart] Item ${index} - Extracted key:`, key, 'Granularity:', granularity);

        if (key && typeof key === 'string') {
            if (key.includes('-') && key.split('-').length === 3) {
                const [year, monthNum, dayNum] = key.split('-');
                const dateObj = new Date(Date.UTC(Number(year), Number(monthNum) - 1, Number(dayNum)));
                if (!isNaN(dateObj.getTime())) {
                    displayLabel = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                } else {
                    console.warn(`[UserGrowthChart] Item ${index} - Invalid date string for daily data: ${key}`);
                    displayLabel = `Invalid (${key})`;
                }
            } else {
                console.warn(`[UserGrowthChart] Item ${index} - Unexpected key format for daily data. Key: ${key}`);
                displayLabel = `Error (${key})`;
            }
        } else if (key) {
            console.warn(`[UserGrowthChart] Item ${index} - Unexpected key type:`, key);
            displayLabel = `Error`;
        } else {
            console.warn(`[UserGrowthChart] Item ${index} - Item is missing 'date' key:`, item);
            displayLabel = 'Error (No Date)';
        }

        return {
            ...item, 
            displayLabel 
        };
    });
    console.log('[UserGrowthChart] formattedData for chart (length):', formattedData.length, formattedData); 
    console.log('[UserGrowthChart] --- RENDER END ---'); 

    return (
        <div className="p-4 border rounded-lg shadow bg-white h-96">
            <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={formattedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayLabel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newStudents" fill="#8884d8" name="New Students" />
                    <Bar dataKey="newTeachers" fill="#82ca9d" name="New Teachers" />
                    <Bar dataKey="totalNewUsers" fill="#ffc658" name="Total New Users" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const DailySignInChart = ({ data, title }) => {
    console.log('[DailySignInChart] --- RENDER START ---');
    console.log('[DailySignInChart] Received props:', { data, title, dataLength: data ? data.length : 0 });

    if (!data || data.length === 0) {
        console.log('[DailySignInChart] Data is empty or undefined. Not processing for chart.');
    }

    const formattedData = data.map((item, index) => {
        let displayLabel = 'Unknown';
        const key = item.date; 

        if (key && typeof key === 'string') {
            if (key.includes('-') && key.split('-').length === 3) { 
                const [year, monthNum, dayNum] = key.split('-');
                const dateObj = new Date(Date.UTC(Number(year), Number(monthNum) - 1, Number(dayNum)));
                if (!isNaN(dateObj.getTime())) {
                    displayLabel = dateObj.toLocaleDateString('default', { month: 'short', day: 'numeric', timeZone: 'UTC' });
                } else {
                    displayLabel = `Invalid (${key})`;
                }
            } else {
                displayLabel = `Error (${key})`;
            }
        } else if (key) {
            displayLabel = `Error (Date Key Type)`;
        } else {
            displayLabel = 'Error (No Date)';
        }

        return {
            ...item, 
            displayLabel
        };
    });
    console.log('[DailySignInChart] formattedData for chart (length):', formattedData.length, formattedData);
    console.log('[DailySignInChart] --- RENDER END ---');

    return (
        <div className="p-4 border rounded-lg shadow bg-white h-96">
            <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={formattedData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayLabel" />
                    <YAxis allowDecimals={false} /> 
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="signInCount" fill="#4A90E2" name="Daily Sign-Ins" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


const Analytics = () => {
    const {
        aToken,
        fetchAnalyticsSummary,
        fetchUserGrowthStats,
        fetchDailySignInStats, // Assuming this is now correctly implemented in AdminContext
    } = useAdminContext();

    const [analyticsData, _setAnalyticsData] = useState({
        summary: null,
        userGrowth: [],
        dailySignIns: [] 
    });

    const setAnalyticsData = (newData) => {
        console.log('[Analytics] setAnalyticsData CALLED WITH:', newData);
        _setAnalyticsData(newData);
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterPeriod, setFilterPeriod] = useState('last30days');
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    useEffect(() => {
        console.log('[Analytics] analyticsData.userGrowth changed:', analyticsData.userGrowth);
        if (analyticsData.userGrowth && analyticsData.userGrowth.length > 0) {
            console.log('[Analytics] userGrowth has data, UserGrowthChart should re-render with this data.');
        }
    }, [analyticsData.userGrowth]);
    
    useEffect(() => {
        console.log('[Analytics] analyticsData.dailySignIns changed:', analyticsData.dailySignIns);
        if (analyticsData.dailySignIns && analyticsData.dailySignIns.length > 0) {
            console.log('[Analytics] dailySignIns has data, DailySignInChart should re-render with this data.');
        }
    }, [analyticsData.dailySignIns]);


    useEffect(() => {
        const fetchAllAnalyticsData = async () => {
            console.log('[Analytics] Starting fetchAllAnalyticsData...'); 
            if (!aToken) {
                setError("User not authenticated. Cannot fetch analytics.");
                setLoading(false);
                console.log('[Analytics] No aToken, aborting fetch.'); 
                return;
            }

            setLoading(true);
            setError(null);
            
            const params = {}; 

            if (filterPeriod === 'custom' && customStartDate && customEndDate) {
                if (customStartDate > customEndDate) {
                    toast.error("Start date cannot be after end date.");
                    setLoading(false);
                    console.log('[Analytics] Invalid custom date range.'); 
                    return;
                }
                const pad = (num) => String(num).padStart(2, '0');

                const startDateYear = customStartDate.getFullYear();
                const startDateMonth = pad(customStartDate.getMonth() + 1);
                const startDateDay = pad(customStartDate.getDate());
                params.startDate = `${startDateYear}-${startDateMonth}-${startDateDay}`;

                const endDateYear = customEndDate.getFullYear();
                const endDateMonth = pad(customEndDate.getMonth() + 1);
                const endDateDay = pad(customEndDate.getDate());
                params.endDate = `${endDateYear}-${endDateMonth}-${endDateDay}`;

            } else if (filterPeriod !== 'custom') {
                params.period = filterPeriod;
            }
            
            console.log('[Analytics] API call params:', params);


            try {
                console.log('[Analytics] Attempting Promise.all...');
                const [summaryData, growthApiResponse, dailySignInResponse] = await Promise.all([
                    fetchAnalyticsSummary(params),
                    fetchUserGrowthStats(params),
                    fetchDailySignInStats(params) 
                ]);
                console.log('[Analytics] Promise.all resolved.'); 
                console.log('[Analytics] Summary Data:', summaryData);
                console.log('[Analytics] Growth API Response (raw):', growthApiResponse); 
                console.log('[Analytics] Daily Sign-In Response:', dailySignInResponse);


                setAnalyticsData({
                    summary: summaryData,
                    userGrowth: growthApiResponse.userGrowth || [], 
                    dailySignIns: dailySignInResponse.dailySignIns || [], 
                });
                console.log('[Analytics] Data set to state. User growth granularity:', growthApiResponse.granularity, 'Sign-in granularity:', dailySignInResponse.granularity); 

            } catch (err) {
                console.error("[Analytics] Error fetching one or more analytics datasets:", err); 
                setError("Failed to load some analytics data. Check console for details.");
                setAnalyticsData({ summary: null, userGrowth: [], dailySignIns: [] }); 
            } finally {
                console.log('[Analytics] Executing finally block, setting loading to false.'); 
                setLoading(false);
            }
        };

        fetchAllAnalyticsData();

    }, [aToken, filterPeriod, customStartDate, customEndDate, fetchAnalyticsSummary, fetchUserGrowthStats, fetchDailySignInStats]);

    const handleExport = useCallback((format) => { // format parameter is still here but only 'pdf' will be used
        if (!analyticsData || (!analyticsData.summary && analyticsData.userGrowth.length === 0 && analyticsData.dailySignIns.length === 0)) {
            toast.warn("No data available to export.");
            return;
        }
        
        const summary = analyticsData.summary || {};
        const userGrowth = analyticsData.userGrowth || [];
        const dailySignIns = analyticsData.dailySignIns || [];
        const timestamp = new Date().toISOString().slice(0, 10);
        const reportDate = new Date().toLocaleDateString();
        const periodString = summary.period ? `${summary.period.startDate || 'N/A'} to ${summary.period.endDate || 'N/A'}` : 'N/A';

        // Removed Excel specific helper functions: getColumnWidths, styleHeaderRow

        if (format === 'pdf') { // Only PDF export logic remains
            try {
                const doc = new jsPDF();
                let yPos = 20;

                doc.setFontSize(18);
                doc.text("Analytics Report", 105, yPos, { align: 'center' });
                yPos += 10;
                doc.setFontSize(10);
                doc.text(`Report Date: ${reportDate}`, 105, yPos, { align: 'center' });
                yPos += 10;
                doc.text(`Period: ${periodString}`, 105, yPos, { align: 'center' });
                yPos += 15; 

                // Summary Data
                doc.setFontSize(14);
                doc.text("Summary", 14, yPos);
                yPos += 8;
                doc.setFontSize(10);
                const summaryContent = [
                    `Total Users: ${summary.totalUsers ?? 'N/A'}`,
                    `Total Teachers: ${summary.activeTeachers ?? 'N/A'}`,
                    `Total Students: ${summary.activeStudents ?? 'N/A'}`,
                    `Overall Activity Rate: ${summary.overallActivityRate ?? 'N/A'}%`,
                    `Avg. Daily Attendance Rate: ${summary.averageDailyAttendanceRate ?? 'N/A'}%`,
                ];
                summaryContent.forEach(line => {
                    doc.text(line, 14, yPos);
                    yPos += 7;
                });
                yPos += 5;

                // User Growth Data
                if (userGrowth.length > 0) {
                    doc.setFontSize(14);
                    doc.text("User Growth Over Time", 14, yPos);
                    yPos += 8;
                    autoTable(doc, { 
                        startY: yPos,
                        head: [['Date', 'New Students', 'New Teachers', 'Total New Users']],
                        body: userGrowth.map(item => [item.date, item.newStudents, item.newTeachers, item.totalNewUsers]),
                        theme: 'striped',
                        headStyles: { fillColor: [22, 160, 133] },
                        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
                    });
                    yPos = doc.lastAutoTable.finalY + 10; 
                }
                
                // Daily Sign-Ins Data
                if (dailySignIns.length > 0) {
                    doc.setFontSize(14);
                    doc.text("Daily Sign-In Counts", 14, yPos);
                    yPos += 8;
                    autoTable(doc, { 
                        startY: yPos,
                        head: [['Date', 'Sign-In Count']],
                        body: dailySignIns.map(item => [item.date, item.signInCount]),
                        theme: 'grid', 
                        headStyles: { fillColor: [74, 144, 226] }, 
                        didDrawPage: (data) => { yPos = data.cursor.y + 5; }
                    });
                    // yPos = doc.lastAutoTable.finalY + 10; // Update yPos if more sections follow
                }

                doc.save(`Analytics_Report_${timestamp}.pdf`);
                toast.success("PDF report exported successfully!");
            } catch (e) {
                console.error("Error exporting to PDF:", e);
                toast.error("Failed to export PDF report.");
            }
        } else {
            // This case should ideally not be reached if the Excel button is removed
            console.warn(`Unsupported export format: ${format}`);
            toast.warn(`Unsupported export format: ${format}`);
        }
    }, [analyticsData]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading analytics...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500">Error: {error}</p></div>;
    }
    
    const currentSummary = analyticsData.summary || {}; 

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
             <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Analytics Dashboard</h1>
                {currentSummary.period && (
                    <p className="text-sm text-gray-500">
                        Displaying data for: {new Date(currentSummary.period.startDate + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC' })} - {new Date(currentSummary.period.endDate + 'T00:00:00Z').toLocaleDateString(undefined, { timeZone: 'UTC' })}
                    </p>
                )}
            </header>

            <section className="mb-6 p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                    <FaFilter className="mr-2 text-blue-500" /> Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="filterPeriod" className="block text-sm font-medium text-gray-600 mb-1">Time Period</label>
                        <select
                            id="filterPeriod"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                        >
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="thisMonth">This Month</option>
                            <option value="last6months">Last 6 Months</option>
                            <option value="last12months">Last 12 Months</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    {filterPeriod === 'custom' && (
                        <>
                            <div>
                                <label htmlFor="customStartDate" className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                <DatePicker
                                    selected={customStartDate}
                                    onChange={(date) => setCustomStartDate(date)}
                                    selectsStart
                                    startDate={customStartDate}
                                    endDate={customEndDate}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="YYYY-MM-DD"
                                    maxDate={new Date()}
                                />
                            </div>
                            <div>
                                <label htmlFor="customEndDate" className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                <DatePicker
                                    selected={customEndDate}
                                    onChange={(date) => setCustomEndDate(date)}
                                    selectsEnd
                                    startDate={customStartDate}
                                    endDate={customEndDate}
                                    minDate={customStartDate}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="YYYY-MM-DD"
                                    maxDate={new Date()}
                                />
                            </div>
                        </>
                    )}
                </div>
            </section>

            <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard title="Total Users" value={currentSummary.totalUsers} icon={<FaUsers />} />
                <StatCard title="Total Teachers" value={currentSummary.activeTeachers} icon={<FaUserCheck />} />
                <StatCard title="Total Students" value={currentSummary.activeStudents} icon={<FaUserCheck />} />
                <StatCard title="Overall Activity Rate" value={currentSummary.overallActivityRate} icon={<FaPercentage />} unit="%" />
                <StatCard title="Avg. Daily Attendance" value={currentSummary.averageDailyAttendanceRate} icon={<FaCalendarAlt />} unit="%" />
            </section>

            <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UserGrowthChart
                    data={analyticsData.userGrowth}
                    title="User Growth Over Time (New Users per Day)"
                    granularity="daily" 
                />
                <DailySignInChart 
                    data={analyticsData.dailySignIns} 
                    title="Daily User Sign-Ins" 
                />
            </section>

            <section className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Export Report</h2>
                <div className="flex space-x-4">
                    {/* Removed Excel Export Button */}
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150"
                        disabled={loading || (!analyticsData.summary && analyticsData.userGrowth.length === 0 && analyticsData.dailySignIns.length === 0)}
                    >
                        <FaFilePdf className="mr-2" /> Export to PDF
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Analytics;