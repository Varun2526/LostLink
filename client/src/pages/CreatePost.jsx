import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api, { getErrorMessage, getFieldErrors } from "../api/axios.js";

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear the error under a field as soon as it is edited
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  // sends the chosen file to the backend, which streams it to Cloudinary
  // and returns a url we drop straight into imageUrl
  const handleFile = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setError("");
    setUploading(true);

    try {
      const data = new FormData();

      data.append("image", file);

      const res = await api.post("/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((current) => ({ ...current, imageUrl: res.data.imageUrl }));
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload the image"));
    }

    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await api.post("/posts", form);

      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Could not create the post"));
      setFieldErrors(getFieldErrors(err));
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
            Photo <span className="text-slate-400">(optional)</span>
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="mt-1 w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-60"
          />

          {uploading && (
            <p className="text-xs text-slate-500 mt-2">Uploading...</p>
          )}

          {/* Uploading needs Cloudinary configured on the server. Pasting a
              link always works, so both options stay available. */}
          <div className="flex items-center gap-3 mt-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or paste a link</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass}
          />

          {form.imageUrl && !uploading && (
            <div className="mt-3 flex items-start gap-3">
              <img
                src={form.imageUrl}
                alt="Image preview"
                className="w-24 h-24 object-cover rounded-lg border border-slate-200"
              />

              <button
                type="button"
                onClick={() => setForm({ ...form, imageUrl: "" })}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          )}

          {fieldErrors.imageUrl && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.imageUrl}</p>
          )}
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
          disabled={loading || uploading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Posting..." : "Post item"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
