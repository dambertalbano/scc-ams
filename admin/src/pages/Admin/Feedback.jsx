import { motion } from 'framer-motion'; // Import motion
import { AlertCircle, Archive, CheckCircle, ChevronLeft, ChevronRight, Eye, Inbox, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext'; // Import useAdminContext

// Define page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    x: "-10vw", // Slide in from left
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: "10vw", // Slide out to right
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

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
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="p-4 md:p-6 bg-gradient-to-br from-slate-900 to-gray-900 min-h-screen text-white" // Changed background, added default text-white
    >
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Feedback Management</h1> {/* Ensured text is white */}
        <button
          onClick={handleRefresh}
          className="mt-2 sm:mt-0 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition duration-150 border border-blue-400 hover:border-blue-300"
        >
          <RefreshCw size={18} className="mr-2" /> Refresh Data
        </button>
      </header>

      {/* Stats cards will have bg-white, so their internal text colors are fine */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Inbox size={24} className="text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Total Feedback</p>
              <p className="text-2xl font-semibold ">{contextFeedbackStats?.totalFeedback || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <AlertCircle size={24} className="text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">New Feedback</p>
              <p className="text-2xl font-semibold">{contextFeedbackStats?.newFeedbackCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Viewed Feedback</p>
              <p className="text-2xl font-semibold">{contextFeedbackStats?.viewedFeedbackCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <Archive size={24} className="text-gray-500 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Archived Feedback</p>
              <p className="text-2xl font-semibold">{contextFeedbackStats?.archivedFeedbackCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <RefreshCw size={32} className="animate-spin text-sky-300" />
          <p className="ml-2 text-gray-200">Loading feedback...</p> {/* Adjusted text color */}
        </div>
      )}

      {/* Error message styling might need adjustment if it clashes, but bg-red-100 should provide enough contrast */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && feedbackItems.length === 0 && (
        <div className="text-center py-10">
          <Inbox size={48} className="mx-auto text-gray-300 mb-4" /> {/* Adjusted icon color */}
          <p className="text-gray-300 text-lg">No feedback submissions yet.</p> {/* Adjusted text color */}
        </div>
      )}

      {/* Table has bg-white, so its internal text colors are fine */}
      {!loading && !error && feedbackItems.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto text-gray-800"> {/* Added text-gray-800 for table content */}
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

      {/* Pagination buttons are bg-white, their text color should be fine */}
      {!loading && !error && feedbackItems.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="mr-1" /> Previous
          </button>
          <span className="text-sm text-gray-200"> {/* Adjusted text color */}
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
    </motion.div>
  );
};

export default AdminFeedbackPage;
