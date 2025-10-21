import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [passwordOrIndex, setPasswordOrIndex] = useState("");
  const [role, setRole] = useState("professor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { professorLogin, studentLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;

    try {
      if (role === "professor") {
        result = await professorLogin(username, passwordOrIndex);
      } else {
        result = await studentLogin(username, passwordOrIndex);
      }

      if (result.success) {
        navigate(role === "professor" ? "/dashboard" : "/student/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Neočekivana greška pri prijavljivanju");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isProfessor = role === "professor";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Prijava na Sistem
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isProfessor ? "Pristup za profesore" : "Pristup za studente"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Odabir Uloge */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Prijavljujem se kao:
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setError("");
                setPasswordOrIndex("");
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="professor">🧑‍🏫 Profesor</option>
              <option value="student">🎓 Student</option>
            </select>
          </div>

          <div className="space-y-4">
            {/* Korisničko Ime */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Korisničko ime
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Unesite korisničko ime"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Lozinka / Indeks */}
            <div>
              <label
                htmlFor="secret"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {isProfessor ? "Lozinka" : "Broj Indeksa"}
              </label>
              <input
                id="secret"
                name="secret"
                type={isProfessor ? "password" : "text"}
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={
                  isProfessor ? "Unesite lozinku" : "Unesite broj indeksa"
                }
                value={passwordOrIndex}
                onChange={(e) => setPasswordOrIndex(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Prijavljivanje...
                </>
              ) : (
                "Prijavi se"
              )}
            </button>
          </div>

          {isProfessor && (
            <div className="text-center text-sm">
              Nemaš nalog?{" "}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Registruj se
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
