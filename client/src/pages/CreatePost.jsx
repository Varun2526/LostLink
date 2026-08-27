import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { getErrorMessage } from "../api/axios.js";

const CreatePost = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "lost",
    title: "",
    category: "",
    description: "",
    location: "",
    date: "",
    imageUrl: "",
    verificationQuestion: "",
    verificationAnswer: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/posts", form);

      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the post"));
    }

    setLoading(false);
  };

  const inputClass =
    "mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Post an item</h1>
      <p className="text-sm text-slate-500 mt-1">
        Report something you lost, or something you found on campus
      </p>

      {error && (
        <p className="mt-4 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="text-sm font-medium text-slate-700">
            What are you posting?
          </label>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "lost" })}
              className={
                form.type === "lost"
                  ? "flex-1 py-2.5 rounded-lg border-2 border-rose-500 bg-rose-50 text-rose-700 text-sm font-medium"
                  : "flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm"
              }
            >
              I lost something
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, type: "found" })}
              className={
                form.type === "found"
                  ? "flex-1 py-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-50 text-emerald-700 text-sm font-medium"
                  : "flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm"
              }
            >
              I found something
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Black leather wallet"
            className={inputClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="documents, electronics..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            placeholder="Central Library"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="Where exactly, what it looks like, any details"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Image URL <span className="text-slate-400">(optional)</span>
          </label>
          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {form.type === "found" && (
          <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Ownership verification
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Ask something only the real owner would know. Your answer stays
                private, nobody browsing can see it.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Question</label>
              <input
                name="verificationQuestion"
                value={form.verificationQuestion}
                onChange={handleChange}
                required
                placeholder="What color was the ID card inside?"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Answer (private)
              </label>
              <input
                name="verificationAnswer"
                value={form.verificationAnswer}
                onChange={handleChange}
                required
                placeholder="Blue"
                className={inputClass}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post item"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
