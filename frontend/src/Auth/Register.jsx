import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    subject: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { professorRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await professorRegister(formData);

    if (result.success) {
      alert("Registracija uspešna! Sada se možete prijaviti.");
      navigate("/login");
    } else {
      setError(result.error || "Registracija nije uspela");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Registracija Profesora 📝
          </h2>
        </div>
        <form
          className="mt-6 sm:mt-8 space-y-4 sm:space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Ime i Prezime"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
            <input
              type="text"
              name="username"
              placeholder="Korisničko Ime"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Adresa"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
            <input
              type="password"
              name="password"
              placeholder="Lozinka (min 8 karaktera)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
            <input
              type="text"
              name="subject"
              placeholder="Predmet koji Predajete"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center font-medium px-2">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Registrujem..." : "Registruj se kao Profesor"}
            </button>
          </div>
          <div className="text-center text-xs sm:text-sm">
            Već imaš nalog?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Prijavi se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
