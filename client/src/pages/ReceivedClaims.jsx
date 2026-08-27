import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { getErrorMessage } from "../api/axios.js";

const statusClass = (status) => {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
};

const ReceivedClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadClaims = async () => {
    setError("");

    try {
      const res = await api.get("/claims/received");

      setClaims(res.data.claims);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load claim requests"));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const decide = async (id, action) => {
    setBusyId(id);
    setError("");

    try {
      await api.patch(`/claims/${id}/${action}`);

      await loadClaims();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update the claim"));
    }

    setBusyId("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Claim requests</h1>
      <p className="text-sm text-slate-500 mt-1">
        People claiming the items you found. You decide who gets it.
      </p>

      {error && (
        <p className="mt-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500 mt-8">Loading...</p>
      ) : claims.length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-600">No claim requests yet.</p>
          <Link
            to="/create"
            className="text-indigo-600 text-sm font-medium mt-2 inline-block"
          >
            Post something you found
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/posts/${claim.post?._id}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {claim.post?.title || "Post removed"}
                  </Link>

                  {claim.claimant && (
                    <p className="text-sm text-slate-500 mt-1">
                      Claimed by {claim.claimant.name} - {claim.claimant.email}
                    </p>
                  )}
                </div>

                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusClass(
                    claim.status
                  )}`}
                >
                  {claim.status}
                </span>
              </div>

              <div
                className={
                  claim.answerMatched
                    ? "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4"
                    : "mt-4 rounded-lg border border-red-200 bg-red-50 p-4"
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className={
                      claim.answerMatched
                        ? "text-xs font-semibold text-emerald-800"
                        : "text-xs font-semibold text-red-800"
                    }
                  >
                    {claim.answerMatched
                      ? "Answer matches your private answer"
                      : "Answer does not match your private answer"}
                  </span>
                </div>

                <p className="text-sm text-slate-700 mt-2">
                  They answered: <span className="font-medium">{claim.answer}</span>
                </p>
              </div>

              {claim.message && (
                <p className="text-sm text-slate-600 mt-3">
                  Their note: {claim.message}
                </p>
              )}

              {claim.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => decide(claim._id, "approve")}
                    disabled={busyId === claim._id}
                    className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => decide(claim._id, "reject")}
                    disabled={busyId === claim._id}
                    className="border border-slate-300 text-slate-700 text-sm px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedClaims;
