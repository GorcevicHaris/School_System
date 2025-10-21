import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../Auth/AuthContext";

const Register = () => {
  const [role, setRole] = useState("professor");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    // Specifična polja (za profesora/studenta):
    subject: "",
    index_number: "",
    age_of_study: 1,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { professorRegister, studentRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError(""); // Resetuj grešku pri promeni uloge
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    const dataToSend = { ...formData };

    // Čistimo objekat od nepotrebnih polja pre slanja
    if (role === "professor") {
      delete dataToSend.index_number;
      delete dataToSend.age_of_study;
      result = await professorRegister(dataToSend);
    } else {
      delete dataToSend.subject;
      result = await studentRegister(dataToSend);
    }

    // FastAPI mora biti spreman da primi ove različite objekte!

    if (result.success) {
      alert(`Registracija uspešna kao ${role}! Sada se možete prijaviti.`);
      navigate("/login");
    } else {
      setError(result.error || result.error || "Registracija nije uspela");
    }
    setLoading(false);
  };

  const isProfessor = role === "professor";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registracija Novog Korisnika 📝
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Odabir Uloge */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Registrujem se kao:
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={handleRoleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="professor">Profesor</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Osnovni Podaci za obe uloge */}
            <input
              type="text"
              name="name"
              placeholder="Ime i Prezime"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              name="username"
              placeholder="Korisničko Ime"
              value={formData.username}
              onChange={handleChange}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Adresa"
              value={formData.email}
              onChange={handleChange}
              required
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Lozinka (min 8 karaktera)"
              value={formData.password}
              onChange={handleChange}
              required
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />

            {/* Dinamička Polja */}
            {isProfessor ? (
              // Polje za Profesora
              <input
                type="text"
                name="subject"
                placeholder="Predmet koji Predajete"
                value={formData.subject}
                onChange={handleChange}
                required
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              // Polja za Studenta
              <>
                <input
                  type="text"
                  name="index_number"
                  placeholder="Broj Indeksa"
                  value={formData.index_number}
                  onChange={handleChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  name="age_of_study"
                  placeholder="Godina Studija"
                  value={formData.age_of_study}
                  onChange={handleChange}
                  required
                  min="1"
                  max="10"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Registrujem..." : `Registruj se kao ${role}`}
            </button>
          </div>
          <div className="text-center text-sm">
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
