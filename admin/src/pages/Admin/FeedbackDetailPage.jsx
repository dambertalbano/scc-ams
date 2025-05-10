import { AlertTriangle, Archive, ArrowLeft, Inbox, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';

const FeedbackDetailPage = () => {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const { getFeedbackById, updateFeedbackStatus, deleteFeedbackItem, aToken } = useAdminContext();

  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedbackDetail = useCallback(async (signal) => {
    if (!aToken) {
      setError("Admin not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getFeedbackById(feedbackId, { signal });

      if (data) {
        setFeedback(data);
        if (data.status === 'new') {
          const updatedItem = await updateFeedbackStatus(feedbackId, 'viewed', { showToast: false });
          if (updatedItem) {
            setFeedback(updatedItem);
          }
        }
      } else {
        setError("Feedback not found or failed to load.");
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted for feedback detail');
      } else {
        console.error("Error fetching feedback detail:", err);
        setError(err.message || "An error occurred while fetching details.");
      }
    } finally {
      setLoading(false);
    }
  }, [feedbackId, aToken, getFeedbackById, updateFeedbackStatus]);

  useEffect(() => {
    const abortController = new AbortController();
    if (feedbackId && aToken) {
      fetchFeedbackDetail(abortController.signal);
    } else if (!aToken) {
      setError("Admin not authenticated. Please login.");
      setLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, [feedbackId, aToken, fetchFeedbackDetail]);

  const handleChangeStatusOnPage = async (newStatus) => {
    if (!feedback || !aToken) return;
    const updated = await updateFeedbackStatus(feedback._id, newStatus);
    if (updated) {
      setFeedback(updated);
    }
  };

  const handleDeleteFeedbackOnPage = async () => {
    if (!feedback || !aToken) return;
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      const success = await deleteFeedbackItem(feedback._id);
      if (success) {
        navigate('/admin/feedback');
      }
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

  // Apply new background to the full page for loading/error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-900 to-gray-900 text-white">
        <RefreshCw size={32} className="animate-spin text-slate-300" />
        <p className="ml-3 text-slate-300">Loading feedback details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-700 to-gray-800 text-white">
        <div className="bg-slate-600 p-8 rounded-lg shadow-xl">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Feedback</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <Link
            to="/admin/feedback"
            className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to Feedback List
          </Link>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-700 to-gray-800 text-white">
        <div className="bg-slate-600 p-8 rounded-lg shadow-xl">
          <AlertTriangle size={48} className="mx-auto text-yellow-400 mb-4" />
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">Feedback Not Found</h2>
          <p className="text-slate-300 mb-4">The requested feedback item could not be found.</p>
          <Link
            to="/admin/feedback"
            className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to Feedback List
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Main page container with new background
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-700 to-gray-800 min-h-screen">
      {/* Content card remains white for readability */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Feedback Details</h1>
          <Link
            to="/admin/feedback"
            className="inline-flex items-center px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to List
          </Link>
        </div>

        <div className="space-y-3 mb-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>ID:</strong> <span className="text-gray-600 break-all">{feedback._id}</span></p>
            <p><strong>Status:</strong> {getStatusBadge(feedback.status)}</p>
            <p><strong>Date Submitted:</strong> <span className="text-gray-600">{new Date(feedback.createdAt).toLocaleString()}</span></p>
            {feedback.viewedAt && (
              <p><strong>Viewed At:</strong> <span className="text-gray-600">{new Date(feedback.viewedAt).toLocaleString()}</span></p>
            )}
            <p><strong>From:</strong> <span className="text-gray-600">{feedback.name}</span></p>
            <p><strong>Email:</strong> <span className="text-gray-600">{feedback.email || 'Not provided'}</span></p>
            <p><strong>Source:</strong> <span className="text-gray-600">{feedback.source || 'N/A'}</span></p>
          </div>

          <div className="pt-3">
            <strong className="block mb-1 text-gray-800">Message:</strong>
            <div className="text-gray-700 bg-gray-50 p-4 rounded-md whitespace-pre-wrap border border-gray-200">
              {feedback.message}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          {feedback.status !== 'archived' ? (
            <button
              onClick={() => handleChangeStatusOnPage('archived')}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-slate-500 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <Archive size={16} className="mr-2" /> Archive
            </button>
          ) : (
            <button
              onClick={() => handleChangeStatusOnPage('new')}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Inbox size={16} className="mr-2" /> Unarchive (Mark as New)
            </button>
          )}
          <button
            onClick={handleDeleteFeedbackOnPage}
            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 size={16} className="mr-2" /> Delete Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailPage;