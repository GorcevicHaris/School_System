import { useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import ExamPage from "../pages/ExamsPage";
const Dashboard = () => {
  const { professor } = useContext(AuthContext);
  console.log("API URL:", process.env.REACT_APP_API_URL);
  if (!professor) return <div>Učitavanje...</div>;

  return (
    <div className="space-y-8">
      <ExamPage />
      <h1 className="text-3xl font-extrabold text-gray-900">
        Dobrodošli, Prof. {professor.name}! 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Kartica 1: Predmet */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-500">Vaš Predmet</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {professor.subject}
          </p>
        </div>

        {/* Kartica 2: Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Korisničko ime</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {professor.username}
          </p>
        </div>

        {/* Kartica 3: Info */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Email Adresa</p>
          <p className="text-xl font-bold text-gray-900 mt-1 truncate">
            {professor.email}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Brzi Linkovi</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="/students"
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-150"
          >
            Upravljaj Studentima
          </a>
          <a
            href="/exams"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-150"
          >
            Kreiraj/Pregledaj Ispite
          </a>
          <a
            href="/registrations"
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-150"
          >
            Ažuriraj Ocene
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
