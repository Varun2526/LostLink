import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios.js";

const statusClass = (status) => {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
};

const MyClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/claims/my");

        setClaims(res.data.claims);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load your claims");
      }

      setLoading(false);
    };

    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My claims</h1>
      <p className="text-sm text-slate-500 mt-1">
        Items you have claimed and where each request stands
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
          <p className="text-slate-600">You have not claimed anything yet.</p>
          <Link
            to="/"
            className="text-indigo-600 text-sm font-medium mt-2 inline-block"
          >
            Browse found items
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

                  {claim.post && (
                    <p className="text-sm text-slate-500 mt-1">
                      {claim.post.category} - {claim.post.location}
                    </p>
                  )}

                  {claim.owner && (
                    <p className="text-xs text-slate-400 mt-1">
                      Found by {claim.owner.name} - {claim.owner.campus}
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

              {claim.message && (
                <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  Your note: {claim.message}
                </p>
              )}

              {claim.status === "approved" && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-3">
                  Approved. Contact the finder to collect your item.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClaims;
