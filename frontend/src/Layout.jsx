import React, { useContext, useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Odaberi stavke menija na osnovu uloge
  const navItems =
    userRole === "professor" ? professorNavItems : studentNavItems;
  const currentUser = userRole === "professor" ? professor : student;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex w-64 bg-indigo-800 text-white flex-col">
        <div className="p-4 text-xl xl:text-2xl font-bold border-b border-indigo-700">
          {userRole === "professor" ? "🎓 Škola " : "🎓 Student Portal"}
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-sm xl:text-base ${
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 text-xl font-bold border-b border-indigo-700 flex justify-between items-center">
          <span>
            {userRole === "professor" ? "🎓 Škola " : "🎓 Student Portal"}
          </span>
          <button
            onClick={closeMobileMenu}
            className="text-white hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>
        <nav className="flex-grow p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={closeMobileMenu}
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
          <div className="mt-2 text-xs bg-indigo-900 px-2 py-1 rounded inline-block">
            {userRole === "professor" ? "👨‍🏫 Profesor" : "🎓 Student"}
          </div>
        </div>
      </div>

      {/* Glavni Sadržaj */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header/Navbar za Logout */}
        <header className="flex justify-between items-center p-3 sm:p-4 bg-white shadow-md">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-gray-700 hover:text-indigo-600 focus:outline-none mr-3"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 truncate flex-1">
            {navItems.find((item) => item.path === location.pathname)?.name ||
              "Panel"}
          </h1>
          <button
            onClick={logout}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            Odjavi se
          </button>
        </header>

        {/* Kontejner za rute */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
