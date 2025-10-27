import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import {
  FaCalendarPlus,
  FaCalendarAlt,
  FaEdit,
  FaTrashAlt,
  FaTimes,
} from "react-icons/fa";

const ExamFormModal = ({ subjects, professorId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    subject_id: "",
    date: "",
    type: "pismeni",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "subject_id" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.subject_id) {
      setError("Morate odabrati predmet.");
      return;
    }

    onSave(formData).then((result) => {
      if (!result.success) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  const availableSubjects = subjects.filter(
    (sub) => sub.professor_id === professorId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaCalendarPlus />
              Zakazivanje Ispita
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Predmet <span className="text-red-500">*</span>
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">-- Odaberite Predmet --</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {availableSubjects.length === 0 && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <span>⚠️</span>
                Niste kreirali nijedan predmet. Kreirajte ga prvo u sekciji
                'Predmeti'.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Datum Ispita <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tip Ispita <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="pismeni">📝 Pismeni</option>
              <option value="usmeni">🗣️ Usmeni</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Poništi
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <FaCalendarPlus />
              Zakaži Ispit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Glavna ExamsPage komponenta
const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { professor, getExams, getSubjects, createExam, deleteExam } =
    useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    const [examRes, subjectRes] = await Promise.all([
      getExams(),
      getSubjects(),
    ]);

    if (examRes.success) setExams(examRes.data);
    if (subjectRes.success) setSubjects(subjectRes.data);

    if (examRes.error || subjectRes.error) {
      setError(examRes.error || subjectRes.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveExam = async (examData) => {
    const result = await createExam(examData);
    if (result.success) {
      fetchData();
    }
    return result;
  };

  const professorExams = exams
    .map((exam) => {
      const subject = subjects.find((sub) => sub.id === exam.subject_id);
      return {
        ...exam,
        subject_name: subject?.name || "N/A",
        is_professor_exam: subject?.professor_id === professor?.id,
      };
    })
    .filter((exam) => exam.is_professor_exam);

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj ispit?")) {
      const result = await deleteExam(examId);
      if (result.success) {
        fetchData();
      } else {
        alert(result.error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Učitavanje ispita...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 font-semibold">Greška: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
              <FaCalendarAlt className="text-3xl sm:text-4xl" />
              Zakazani Ispiti
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-indigo-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <FaCalendarPlus />
              <span className="hidden sm:inline">Zakaži Novi Ispit</span>
              <span className="sm:hidden">Novi Ispit</span>
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 bg-indigo-50 border-b border-indigo-200">
            <h3 className="font-bold text-lg sm:text-xl text-indigo-800">
              Ispiti koje Vi vodite ({professorExams.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Predmet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Tip
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID Ispita
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professorExams.length > 0 ? (
                  professorExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-indigo-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {exam.subject_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        📅 {exam.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1.5 inline-flex items-center gap-1 text-xs font-bold rounded-full ${
                            exam.type === "pismeni"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {exam.type === "pismeni" ? "📝" : "🗣️"}
                          {exam.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        #{exam.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-semibold"
                          title="Obriši ispit"
                        >
                          <FaTrashAlt />
                          Obriši
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FaCalendarAlt className="text-4xl text-gray-400" />
                        <p className="text-gray-500 font-semibold">
                          Niste zakažali nijedan ispit.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-lg text-indigo-800 mb-1">
              Ispiti koje Vi vodite
            </h3>
            <p className="text-sm text-gray-600">
              Ukupno: {professorExams.length}
            </p>
          </div>

          {professorExams.length > 0 ? (
            professorExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-indigo-500"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {exam.subject_name}
                    </h3>
                    <span
                      className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-full whitespace-nowrap ${
                        exam.type === "pismeni"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {exam.type === "pismeni" ? "📝" : "🗣️"}
                      {exam.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Datum:</p>
                      <p className="font-semibold text-gray-900">
                        📅 {exam.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">ID Ispita:</p>
                      <p className="font-semibold text-gray-900 font-mono">
                        #{exam.id}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 font-semibold border-2 border-red-600"
                    >
                      <FaTrashAlt />
                      Obriši Ispit
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaCalendarAlt className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">
                Niste zakažali nijedan ispit.
              </p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ExamFormModal
          subjects={subjects}
          professorId={professor?.id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveExam}
        />
      )}
    </div>
  );
};

export default ExamsPage;
