import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios.js";

const statusClass = (status) => {
  if (status === "open") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "claimed") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
};

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/posts/mine");

      setPosts(res.data.posts);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your posts");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const markResolved = async (id) => {
    setError("");

    try {
      await api.patch(`/posts/${id}`, { status: "resolved" });

      loadPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the post");
    }
  };

  const reopen = async (id) => {
    setError("");

    try {
      await api.patch(`/posts/${id}`, { status: "open" });

      loadPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the post");
    }
  };

  const removePost = async (id) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    setError("");

    try {
      await api.delete(`/posts/${id}`);

      loadPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the post");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My posts</h1>
      <p className="text-sm text-slate-500 mt-1">
        Everything you have reported, including items already handed over
      </p>

      {error && (
        <p className="mt-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500 mt-8">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="mt-6 bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-600">You have not posted anything yet.</p>
          <Link
            to="/create"
            className="text-indigo-600 text-sm font-medium mt-2 inline-block"
          >
            Post your first item
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    to={`/posts/${post._id}`}
                    className="font-semibold text-slate-900 hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">
                    {post.type === "lost" ? "Lost" : "Found"} - {post.category} -{" "}
                    {post.location}
                  </p>
                </div>

                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusClass(
                    post.status
                  )}`}
                >
                  {post.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                {post.status !== "resolved" && (
                  <button
                    onClick={() => markResolved(post._id)}
                    className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    Mark resolved
                  </button>
                )}

                {post.status === "resolved" && (
                  <button
                    onClick={() => reopen(post._id)}
                    className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50"
                  >
                    Reopen
                  </button>
                )}

                <button
                  onClick={() => removePost(post._id)}
                  className="text-sm border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
