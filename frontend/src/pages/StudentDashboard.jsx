import React, { useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";

const StudentDashboard = () => {
  const { student } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      {/* Pozdravna kartica */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Dobrodošao/la, {student?.name}! 🎓
        </h1>
        <p className="text-indigo-100">
          Dobro došli na studentski portal. Ovde možete pregledati ispite,
          prijaviti se za ispite i pratiti svoje rezultate.
        </p>
      </div>

      {/* Statistika kartica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Broj Indeksa</p>
              <p className="text-2xl font-bold text-gray-900">
                {student?.index_number}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Godina Studija
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {student?.age_of_study}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {student?.email}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Brzi linkovi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📝 Dostupni Ispiti
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Pregledajte sve dostupne ispite i prijavite se za polaganje.
          </p>
          <a
            href="/student/exams"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Pregledaj ispite →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📋 Moje Prijave
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Pratite svoje prijave i status ispita koje ste prijavili.
          </p>
          <a
            href="/student/my-registrations"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Vidi prijave →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            🏆 Rezultati
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Pregledajte svoje ocene i bodove sa položenih ispita.
          </p>
          <a
            href="/student/results"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Vidi rezultate →
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            👤 Profil
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Pregledajte i ažurirajte svoje lične informacije.
          </p>
          <a
            href="/student/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Idi na profil →
          </a>
        </div>
      </div>

      {/* Obaveštenja */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Obaveštenje:</strong> Rok za prijavu ispita je 7 dana pre
              termina ispita.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
