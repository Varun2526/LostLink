import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) => {
    return isActive
      ? "text-indigo-600 font-medium"
      : "text-slate-600 hover:text-slate-900";
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          Lost<span className="text-slate-800">Link</span>
        </Link>

        {user && (
          <div className="hidden sm:flex items-center gap-5 text-sm">
            <NavLink to="/" className={linkClass} end>
              Browse
            </NavLink>
            <NavLink to="/my-posts" className={linkClass}>
              My Posts
            </NavLink>
            <NavLink to="/my-claims" className={linkClass}>
              My Claims
            </NavLink>
            <NavLink to="/received-claims" className={linkClass}>
              Requests
            </NavLink>
          </div>
        )}

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/create"
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                + Post Item
              </Link>

              <div className="hidden sm:block text-right leading-tight">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.campus}</p>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm text-slate-600 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
