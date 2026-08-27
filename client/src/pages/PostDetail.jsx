import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import api from "../api/axios.js";
import PostCard from "../components/PostCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const formatDate = (value) => {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimSent, setClaimSent] = useState(false);
  const [sending, setSending] = useState(false);

  const loadPost = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/posts/${id}`);

      setPost(res.data.post);

      const matchRes = await api.get(`/posts/${id}/matches`);

      setMatches(matchRes.data.matches);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load this post");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();

    setClaimError("");
    setSending(true);

    try {
      await api.post("/claims", {
        postId: id,
        answer,
        message,
      });

      setClaimSent(true);
    } catch (err) {
      setClaimError(err.response?.data?.message || "Could not send the claim");
    }

    setSending(false);
  };

  if (loading) {
    return <p className="text-slate-500">Loading...</p>;
  }

  if (error) {
    return (
      <div>
        <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
        <Link to="/" className="text-indigo-600 text-sm mt-4 inline-block">
          Back to browse
        </Link>
      </div>
    );
  }

  const isLost = post.type === "lost";
  const isOwner = post.postedBy && post.postedBy._id === user.id;
  const canClaim = post.type === "found" && !isOwner && post.status === "open";

  return (
    <div>
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
        &larr; Back to browse
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {post.category} - {post.location} - {formatDate(post.date)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={
                isLost
                  ? "text-xs font-medium px-2.5 py-1 rounded-full bg-rose-100 text-rose-700"
                  : "text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700"
              }
            >
              {isLost ? "Lost" : "Found"}
            </span>

            {post.status !== "open" && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
                {post.status}
              </span>
            )}
          </div>
        </div>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="mt-4 rounded-lg max-h-72 object-cover w-full"
          />
        )}

        <p className="text-slate-700 mt-4 whitespace-pre-line">
          {post.description}
        </p>

        {post.postedBy && (
          <p className="text-sm text-slate-400 mt-5 pt-4 border-t border-slate-100">
            Posted by {post.postedBy.name} - {post.postedBy.campus}
          </p>
        )}
      </div>

      {canClaim && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
          <h2 className="font-semibold text-slate-900">Is this yours?</h2>
          <p className="text-sm text-slate-500 mt-1">
            Answer the owner's question to prove it. Only they can see your answer.
          </p>

          {claimSent ? (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-800">
                Claim submitted
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                The person who found it will review your answer and respond.
              </p>
              <Link
                to="/my-claims"
                className="text-sm text-emerald-800 font-medium mt-2 inline-block"
              >
                Track it in My Claims
              </Link>
            </div>
          ) : (
            <form onSubmit={handleClaim} className="mt-4 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Verification question
                </p>
                <p className="text-slate-800 mt-1">{post.verificationQuestion}</p>
              </div>

              {claimError && (
                <p className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
                  {claimError}
                </p>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Your answer
                </label>
                <input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Message <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="2"
                  placeholder="Anything else that proves it is yours"
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Submit claim"}
              </button>
            </form>
          )}
        </div>
      )}

      {isOwner && post.type === "found" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
          <h2 className="font-semibold text-slate-900">You posted this</h2>
          <p className="text-sm text-slate-500 mt-1">
            Check the Requests page to review who has claimed it.
          </p>
          <Link
            to="/received-claims"
            className="text-sm text-indigo-600 font-medium mt-2 inline-block"
          >
            View claim requests
          </Link>
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-semibold text-slate-900">
          Possible matches{" "}
          <span className="text-slate-400 font-normal">({matches.length})</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {isLost
            ? "Found items that look like this one"
            : "Lost item reports that look like this one"}
        </p>

        {matches.length === 0 ? (
          <div className="mt-4 bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500">No similar posts yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {matches.map((match) => (
              <PostCard
                key={match.post._id}
                post={match.post}
                score={match.score}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
