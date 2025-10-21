import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "./Auth/AuthContext";

// Navigacija za profesore
const professorNavItems = [
  { name: "Kontrolna tabla", path: "/dashboard" },
  { name: "Studenti", path: "/students" },
  { name: "Predmeti", path: "/subjects" },
  { name: "Ispiti", path: "/exams" },
  { name: "Prijave ispita", path: "/registrations" },
];

// Navigacija za studente
const studentNavItems = [
  { name: "Prijava Ispita", path: "/student/dashboard" },
];

const Layout = ({ children }) => {
  const { professor, student, userRole, logout } = useContext(AuthContext);
  const location = useLocation();

  // Odaberi stavke menija na osnovu uloge
  const navItems =
    userRole === "professor" ? professorNavItems : studentNavItems;
  const currentUser = userRole === "professor" ? professor : student;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-indigo-700">
          {userRole === "professor" ? "🎓 Škola API" : "🎓 Student Portal"}
        </div>

        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-indigo-600 font-semibold shadow-inner"
                      : "hover:bg-indigo-700"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-indigo-700">
          <p className="text-sm font-semibold truncate">
            {currentUser?.name || "Korisnik"}
          </p>
          <p className="text-xs text-indigo-300 truncate">
            {userRole === "professor"
              ? professor?.subject || "Nepoznat predmet"
              : `Indeks: ${student?.index_number || "N/A"}`}
          </p>
          <div className="mt-2 text-xs bg-indigo-900 px-2 py-1 rounded">
            {userRole === "professor" ? "👨‍🏫 Profesor" : "🎓 Student"}
          </div>
        </div>
      </div>

      {/* Glavni Sadržaj */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Navbar za Logout */}
        <header className="flex justify-between items-center p-4 bg-white shadow-md">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find((item) => item.path === location.pathname)?.name ||
              "Panel"}
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Odjavi se
          </button>
        </header>

        {/* Kontejner za rute */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
