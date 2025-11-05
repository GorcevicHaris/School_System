import { useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import ExamPage from "../pages/ExamsPage";

const Dashboard = () => {
  const { professor } = useContext(AuthContext);
  console.log("API URL:", process.env.REACT_APP_API_URL);

  if (!professor)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header sekcija */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2">
          Dobrodošli, Prof. {professor.name}! 👋
        </h1>
        <p className="text-indigo-100 text-sm sm:text-base">
          Upravljajte vašim predmetom i studentima na jednom mestu
        </p>
      </div>

      {/* Info kartice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Kartica 1: Predmet */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Vaš Predmet</p>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
            {professor.subject}
          </p>
        </div>

        {/* Kartica 2: Korisničko ime */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Korisničko ime</p>
            <span className="text-2xl">👤</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
            {professor.username}
          </p>
        </div>

        {/* Kartica 3: Email */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Email Adresa</p>
            <span className="text-2xl">📧</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900 break-all">
            {professor.email}
          </p>
        </div>
      </div>

      {/* Brzi Linkovi */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-2">⚡</span>
          Brzi Linkovi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/students"
            className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="mr-2 text-xl">👥</span>
            <span className="font-semibold">Upravljaj Studentima</span>
          </a>
          <a
            href="/exams"
            className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span className="mr-2 text-xl">📝</span>
            <span className="font-semibold">Kreiraj/Pregledaj Ispite</span>
          </a>
          <a
            href="/registrations"
            className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
          >
            <span className="mr-2 text-xl">✍️</span>
            <span className="font-semibold">Ažuriraj Ocene</span>
          </a>
        </div>
      </div>

      {/* ExamPage komponenta */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <ExamPage />
      </div>
    </div>
  );
};

export default Dashboard;
