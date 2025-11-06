import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../Auth/AuthContext";

const StudentDashboard = () => {
  const { student, getStudentGrades } = useContext(AuthContext);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "passed", "failed"

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    const result = await getStudentGrades();
    console.log(result, "rezultat");
    if (result.success) {
      setGrades(result.data);
    }
    setLoading(false);
  };

  const getGradeColor = (grade) => {
    if (grade >= 9) return "bg-green-100 text-green-800 border-green-300";
    if (grade >= 7) return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300"; // ← Za ocene 5 i ispod
  };

  const getGradeEmoji = (grade) => {
    if (grade >= 9) return "🌟";
    if (grade >= 7) return "😊";
    if (grade >= 6) return "👍";
    return "❌"; // ← Za negativne ocene
  };

  const calculateAverage = () => {
    const passedGrades = grades.filter((g) => g.grade >= 6);
    if (passedGrades.length === 0) return "0.00";
    const sum = passedGrades.reduce((acc, g) => acc + g.grade, 0);
    return (sum / passedGrades.length).toFixed(2);
  };

  // Filtrirane ocene
  const filteredGrades = grades.filter((g) => {
    if (filter === "passed") return g.grade >= 6;
    if (filter === "failed") return g.grade < 6;
    return true; // "all"
  });

  const passedCount = grades.filter((g) => g.grade >= 6).length;
  const failedCount = grades.filter((g) => g.grade < 6).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Pozdravna kartica */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Dobrodošao/la, {student?.name}! 🎓
        </h1>
        <p className="text-indigo-100 text-sm sm:text-base">
          Dobro došli na studentski portal. Ovde možete pregledati ispite i
          pratiti svoje rezultate.
        </p>
      </div>

      {/* Statistika kartica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Broj Indeksa
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {student?.index_number}
              </p>
            </div>
            <div className="text-3xl ml-2">📋</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Godina Studija
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {student?.age_of_study}
              </p>
            </div>
            <div className="text-3xl ml-2">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Prosečna Ocena
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {calculateAverage()}
              </p>
            </div>
            <div className="text-3xl ml-2">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                Položeno / Palo
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                <span className="text-green-600">{passedCount}</span> /{" "}
                <span className="text-red-600">{failedCount}</span>
              </p>
            </div>
            <div className="text-3xl ml-2">✅</div>
          </div>
        </div>
      </div>

      {/* Brzi link - Rezultati */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">🏆</span>
            Rezultati
          </h2>
          href="/student/results" className="text-indigo-600
          hover:text-indigo-800 font-medium text-sm sm:text-base
          transition-colors"
          <a>Vidi sve →</a>
        </div>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          Pregledajte svoje ocene i bodove sa položenih i pao ispita.
        </p>
      </div>

      {/* Ocene iz predmeta */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📝</span>
            Moje Ocene
          </h2>

          {/* Filter dugmad */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "all"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sve ({grades.length})
            </button>
            <button
              onClick={() => setFilter("passed")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "passed"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Položeno ({passedCount})
            </button>
            <button
              onClick={() => setFilter("failed")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === "failed"
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Palo ({failedCount})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Učitavanje ocena...</p>
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-6xl mb-4">
              {filter === "all" ? "📚" : filter === "passed" ? "✅" : "❌"}
            </div>
            <p className="text-gray-500 text-lg">
              {filter === "all"
                ? "Još nemate unetih ocena."
                : filter === "passed"
                ? "Nemate položenih ispita."
                : "Nemate pao ispita."}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Ocene će se pojaviti kada profesor unese vaše rezultate.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Predmet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ispit
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ocena
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bodovi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((gradeItem, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {gradeItem.subject_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {gradeItem.exam_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${getGradeColor(
                            gradeItem.grade
                          )}`}
                        >
                          {getGradeEmoji(gradeItem.grade)} {gradeItem.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {gradeItem.points} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(gradeItem.exam_date).toLocaleDateString(
                          "sr-RS"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredGrades.map((gradeItem, index) => (
                <div
                  key={index}
                  className={`bg-gray-50 rounded-xl p-4 space-y-3 border-2 hover:shadow-lg transition-all ${
                    gradeItem.grade >= 6
                      ? "border-gray-200 hover:border-indigo-300"
                      : "border-red-200 hover:border-red-400"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {gradeItem.subject_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {gradeItem.exam_name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-lg font-bold border-2 ${getGradeColor(
                        gradeItem.grade
                      )}`}
                    >
                      {getGradeEmoji(gradeItem.grade)} {gradeItem.grade}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <div>
                      <p className="text-xs text-gray-500">Bodovi</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {gradeItem.points} / 100
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Datum</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {new Date(gradeItem.exam_date).toLocaleDateString(
                          "sr-RS"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Obaveštenja */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 sm:p-6 rounded-xl shadow">
        <div className="flex">
          <div className="flex-shrink-0 text-2xl mr-3">⚠️</div>
          <div>
            <p className="text-sm sm:text-base text-yellow-700">
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
