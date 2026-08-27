import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { getErrorMessage } from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const StatCard = ({ label, value, hint, tone }) => {
  const tones = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    slate: "bg-white border-slate-200 text-slate-700",
  };

  return (
    <div className={`rounded-xl border p-5 ${tones[tone] || tones.slate}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
      {hint && <p className="text-xs opacity-70 mt-1">{hint}</p>}
    </div>
  );
};

const statusClass = (status) => {
  if (status === "open") return "bg-emerald-100 text-emerald-700";
  if (status === "claimed") return "bg-amber-100 text-amber-700";

  return "bg-slate-200 text-slate-700";
};

const Dashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/dashboard/stats");

        setStats(res.data);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load your dashboard"));
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
        {error}
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Hi {user?.name?.split(" ")[0] || "there"}
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        Here is what is happening with your items
      </p>

      {stats.claims.awaitingMyDecision > 0 && (
        <Link
          to="/received-claims"
          className="mt-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 hover:bg-amber-100"
        >
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {stats.claims.awaitingMyDecision} claim
              {stats.claims.awaitingMyDecision > 1 ? "s" : ""} waiting on you
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Someone is trying to prove an item you found is theirs
            </p>
          </div>
          <span className="text-sm font-medium text-amber-900">Review &rarr;</span>
        </Link>
      )}

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-8">
        My posts
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
        <StatCard label="Total posted" value={stats.posts.total} tone="indigo" />
        <StatCard label="Still open" value={stats.posts.open} tone="emerald" />
        <StatCard label="Claimed" value={stats.posts.claimed} tone="amber" />
        <StatCard label="Resolved" value={stats.posts.resolved} tone="slate" />
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-8">
        My claims
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
        <StatCard label="Claims made" value={stats.claims.made} tone="indigo" />
        <StatCard label="Approved" value={stats.claims.approved} tone="emerald" />
        <StatCard label="Pending" value={stats.claims.pending} tone="amber" />
        <StatCard
          label="Open on campus"
          value={stats.campus.openPosts}
          hint="items anyone can browse"
          tone="slate"
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Recent posts
        </h2>
        <Link to="/my-posts" className="text-sm text-indigo-600 font-medium">
          See all
        </Link>
      </div>

      {stats.recentPosts.length === 0 ? (
        <div className="mt-3 bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-600">You have not posted anything yet.</p>
          <Link
            to="/create"
            className="text-indigo-600 text-sm font-medium mt-2 inline-block"
          >
            Post your first item
          </Link>
        </div>
      ) : (
        <div className="mt-3 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {stats.recentPosts.map((post) => (
            <Link
              key={post._id}
              to={`/posts/${post._id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-800">{post.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {post.type === "lost" ? "Lost" : "Found"} - {post.category}
                </p>
              </div>

              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass(
                  post.status
                )}`}
              >
                {post.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
