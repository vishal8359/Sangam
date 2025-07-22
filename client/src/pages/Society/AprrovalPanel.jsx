import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ApprovalPanel = () => {
  const { axios } = useAppContext();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // requestId during approval/rejection

  const fetchPendingRequests = async () => {
    const token = localStorage.getItem("adminToken");

    if (!token || token === "undefined" || token === "null") {
      toast.error("Admin token missing. Please login again.");
      localStorage.removeItem("adminToken");
      return;
    }

    try {
      const { data } = await axios.get("/api/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingRequests(data.requests || []);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err?.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("adminToken");
      } else {
        toast.error("Failed to fetch pending users.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    const token = localStorage.getItem("adminToken");
    const endpoint =
      action === "approve"
        ? `/api/admin/approve-request/${requestId}`
        : `/api/admin/reject-request/${requestId}`;

    try {
      setActionId(requestId);
      const { data } = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message || `${action}d successfully`);
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Failed to ${action} request`
      );
    } finally {
      setActionId(null);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          Admin Approval Panel
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading pending users...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-center text-green-500">No pending users 🎉</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => {
              const user = request.user_id;
              const society = request.society_id;

              return (
                <div
                  key={request._id}
                  className="border p-4 rounded-md shadow bg-gray-50 flex justify-between flex-wrap items-start gap-4"
                >
                  <div className="flex-1 space-y-1 text-sm text-gray-700">
                    <p>
                      <strong>Name:</strong> {user?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user?.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {user?.phone_no}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {request.user_id?.address || "N/A"}
                    </p>

                    <p>
                      <strong>Society:</strong> {society?.name || "N/A"}
                    </p>
                    
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(request._id, "approve")}
                      disabled={actionId === request._id}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded disabled:opacity-50 cursor-pointer"
                    >
                      {actionId === request._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(request._id, "reject")}
                      disabled={actionId === request._id}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded disabled:opacity-50 cursor-pointer"
                    >
                      {actionId === request._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalPanel;
