import { AlertCircle, Archive, CheckCircle, ChevronLeft, ChevronRight, Eye, Inbox, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext'; // Import useAdminContext

const AdminFeedbackPage = () => {
  const {
    aToken, // Use token from context to check if admin is logged in
    feedbackStats: contextFeedbackStats, // Stats from context
    getFeedbackStats,
    getAllFeedback,
    updateFeedbackStatus,
    deleteFeedbackItem,
  } = useAdminContext();

  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const loadFeedbackStats = useCallback(async () => {
    if (!aToken) return;
    await getFeedbackStats({ showToast: false }); // Call context function
  }, [aToken, getFeedbackStats]);

  const loadFeedbackItems = useCallback(async (page = 1) => {
    if (!aToken) {
      setError("Admin not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const data = await getAllFeedback(page, itemsPerPage); // Call context function
    if (data && data.feedbackItems) {
      setFeedbackItems(data.feedbackItems);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } else {
      setError("Failed to load feedback items."); // Or use error from context if set
      setFeedbackItems([]);
    }
    setLoading(false);
  }, [aToken, getAllFeedback, itemsPerPage]);

  useEffect(() => {
    if (aToken) { // Ensure token exists before fetching
      loadFeedbackStats();
      loadFeedbackItems(currentPage);
    } else {
      setError("Admin not authenticated. Please login.");
      setLoading(false);
    }
  }, [aToken, loadFeedbackItems, loadFeedbackStats, currentPage]);

  const handleRefresh = () => {
    if (aToken) {
      loadFeedbackStats();
      loadFeedbackItems(currentPage);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!aToken) {
      alert("Admin not authenticated.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      const success = await deleteFeedbackItem(feedbackId); // Call context function
      if (success) {
        loadFeedbackItems(currentPage); // Easiest way to refresh
      }
    }
  };

  const handleChangeStatus = async (feedbackId, newStatus) => {
    if (!aToken) {
      alert("Admin not authenticated.");
      return;
    }
    const updatedItem = await updateFeedbackStatus(feedbackId, newStatus); // Call context function
    if (updatedItem) {
      setFeedbackItems(prevItems =>
        prevItems.map(item =>
          item._id === feedbackId ? updatedItem : item
        )
      );
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">New</span>;
      case 'viewed':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Viewed</span>;
      case 'archived':
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-full">Archived</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Feedback Management</h1>
        <button
          onClick={handleRefresh}
          className="mt-2 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150"
        >
          <RefreshCw size={18} className="mr-2" /> Refresh Data
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Inbox size={24} className="text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Feedback</p>
              <p className="text-2xl font-semibold text-gray-800">{contextFeedbackStats.totalFeedback}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">New Feedback</p>
              <p className="text-2xl font-semibold text-gray-800">{contextFeedbackStats.newFeedbackCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Viewed Feedback</p>
              <p className="text-2xl font-semibold text-gray-800">{contextFeedbackStats.viewedFeedbackCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Archive size={24} className="text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Archived Feedback</p>
              <p className="text-2xl font-semibold text-gray-800">{contextFeedbackStats.archivedFeedbackCount}</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <RefreshCw size={32} className="animate-spin text-blue-600" />
          <p className="ml-2 text-gray-600">Loading feedback...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && feedbackItems.length === 0 && (
        <div className="text-center py-10">
          <Inbox size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No feedback submissions yet.</p>
        </div>
      )}

      {!loading && !error && feedbackItems.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message Snippet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbackItems.map((item) => (
                <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${item.status === 'new' ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}{item.email && ` (${item.email})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {item.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/admin/feedback/${item._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Link>
                    {item.status !== 'archived' && (
                      <button
                        onClick={() => handleChangeStatus(item._id, 'archived')}
                        className="text-gray-500 hover:text-gray-700 mr-3"
                        title="Archive Feedback"
                      >
                        <Archive size={18} />
                      </button>
                    )}
                    {item.status === 'archived' && (
                      <button
                        onClick={() => handleChangeStatus(item._id, 'new')}
                        className="text-yellow-500 hover:text-yellow-700 mr-3"
                        title="Unarchive Feedback (Mark as New)"
                      >
                        <Inbox size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Feedback"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && feedbackItems.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFeedbackPage;
