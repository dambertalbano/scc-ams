import { AlertTriangle, Archive, ArrowLeft, Inbox, RefreshCw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const FeedbackDetailPage = () => {
  const { feedbackId } = useParams(); // Get feedbackId from URL
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    // IMPORTANT: Replace with your actual token retrieval logic
    const token = localStorage.getItem('adminToken');
    if (!token) console.error("Admin token not found.");
    return token;
  };

  const fetchFeedbackDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
        setError("Authentication token not found.");
        setLoading(false);
        return;
    }

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to fetch feedback details: ${response.status}`);
      }
      const data = await response.json();
      setFeedback(data);

      // If feedback status is 'new', mark it as 'viewed'
      if (data && data.status === 'new') {
        await fetch(`/api/admin/feedback/${feedbackId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'viewed' }),
        });
        // Optionally update local state immediately if needed, though a re-fetch or page refresh would also show it
        setFeedback(prev => prev ? {...prev, status: 'viewed', viewedAt: new Date().toISOString()} : null);
      }

    } catch (err) {
      console.error("Error fetching feedback detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [feedbackId]);

  useEffect(() => {
    if (feedbackId) {
      fetchFeedbackDetail();
    }
  }, [feedbackId, fetchFeedbackDetail]);

  const handleChangeStatus = async (newStatus) => {
    if (!feedback) return;
    const token = getAuthToken();
    if (!token) {
        alert("Authentication error.");
        return;
    }
    try {
      const response = await fetch(`/api/admin/feedback/${feedback._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const updatedFeedbackData = await response.json();
        setFeedback(updatedFeedbackData.feedbackItem);
        alert(`Feedback status updated to ${newStatus}.`);
      } else {
        const errData = await response.json();
        alert(`Failed to update status: ${errData.message}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert('An error occurred while updating status.');
    }
  };

  const handleDeleteFeedback = async () => {
    if (!feedback) return;
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      const token = getAuthToken();
      if (!token) {
          alert("Authentication error.");
          return;
      }
      try {
        const response = await fetch(`/api/admin/feedback/${feedback._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          alert('Feedback deleted successfully.');
          navigate('/admin/feedback'); // Navigate back to the list
        } else {
          const errData = await response.json();
          alert(`Failed to delete feedback: ${errData.message}`);
        }
      } catch (err) {
        console.error("Error deleting feedback:", err);
        alert('An error occurred while deleting feedback.');
      }
    }
  };


  const getStatusBadge = (status) => {
    // (Same as in AdminFeedbackPage, or move to a shared utility)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RefreshCw size={32} className="animate-spin text-blue-600" />
        <p className="ml-3 text-gray-700">Loading feedback details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Feedback</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link
          to="/admin/feedback"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Feedback List
        </Link>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-yellow-700 mb-2">Feedback Not Found</h2>
        <p className="text-gray-600 mb-4">The requested feedback item could not be found.</p>
        <Link
          to="/admin/feedback"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft size={18} className="mr-2" /> Back to Feedback List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
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
              onClick={() => handleChangeStatus('archived')}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Archive size={16} className="mr-2" /> Archive
            </button>
          ) : (
            <button
              onClick={() => handleChangeStatus('new')} // Or 'viewed'
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Inbox size={16} className="mr-2" /> Unarchive (Mark as New)
            </button>
          )}
          <button
            onClick={handleDeleteFeedback}
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