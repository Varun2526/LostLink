import { Link } from "react-router-dom";

const formatDate = (value) => {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const PostCard = ({ post, score }) => {
  const isLost = post.type === "lost";

  return (
    <Link
      to={`/posts/${post._id}`}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{post.title}</h3>

        <div className="shrink-0 flex items-center gap-2">
          {score !== undefined && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-600 text-white">
              {Math.round(score * 100)}% match
            </span>
          )}

          <span
            className={
              isLost
                ? "text-xs font-medium px-2 py-1 rounded-full bg-rose-100 text-rose-700"
                : "text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700"
            }
          >
            {isLost ? "Lost" : "Found"}
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
        {post.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-xs text-slate-500">
        <span className="bg-slate-100 px-2 py-1 rounded">{post.category}</span>
        <span>{post.location}</span>
        <span>{formatDate(post.date)}</span>
      </div>

      {post.postedBy && (
        <p className="text-xs text-slate-400 mt-3">
          Posted by {post.postedBy.name} - {post.postedBy.campus}
        </p>
      )}
    </Link>
  );
};

export default PostCard;
