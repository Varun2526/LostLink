import { useEffect, useState } from "react";

import api, { getErrorMessage } from "../api/axios.js";
import PostCard from "../components/PostCard.jsx";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    setError("");

    try {
      // if nothing is filtered we just show the whole feed
      if (!q && !category && !type) {
        const res = await api.get("/posts");

        setPosts(res.data.posts);
      } else {
        const params = {};

        if (q) params.q = q;
        if (category) params.category = category;
        if (type) params.type = type;

        const res = await api.get("/posts/search", { params });

        setPosts(res.data.posts);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not load posts"));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPosts();
  };

  const clearFilters = () => {
    setQ("");
    setCategory("");
    setType("");
  };

  const tabClass = (value) => {
    return type === value
      ? "px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white"
      : "px-4 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-slate-300";
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse items</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lost and found reports from your campus
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <button onClick={() => setType("")} className={tabClass("")}>
          All
        </button>
        <button onClick={() => setType("lost")} className={tabClass("lost")}>
          Lost
        </button>
        <button onClick={() => setType("found")} className={tabClass("found")}>
          Found
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className="mt-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or description"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="sm:w-44 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-5 py-2 rounded-lg hover:bg-slate-800"
        >
          Search
        </button>

        {(q || category || type) && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-slate-800 px-2"
          >
            Clear
          </button>
        )}
      </form>

      {error && (
        <p className="mt-6 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500 mt-8">Loading...</p>
      ) : posts.length === 0 ? (
        <div className="mt-8 bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-slate-600">No items found.</p>
          <p className="text-sm text-slate-400 mt-1">
            Try a different search, or post an item yourself.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
