import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import {
  FaCalendarPlus,
  FaCalendarAlt,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

const ExamFormModal = ({ subjects, professorId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    subject_id: "",
    date: "",
    type: "pismeni", // Default na pismeni
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

  // Filtriraj predmete koje predaje trenutni profesor (opciono, ali preporučeno)
  const availableSubjects = subjects.filter(
    (sub) => sub.professor_id === professorId
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          Zakazivanje Ispita
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Predmet
            </label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Odaberite Predmet --</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} (ID: {sub.id})
                </option>
              ))}
            </select>
            {availableSubjects.length === 0 && (
              <p className="text-red-500 text-xs mt-1">
                Niste kreirali nijedan predmet. Kreirajte ga prvo u sekciji
                'Predmeti'.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Datum Ispita
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tip Ispita
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="pismeni">Pismeni</option>
              <option value="usmeni">Usmeni</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Poništi
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
              <FaCalendarPlus className="inline mr-1" /> Zakaži
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
      fetchData(); // Osveži listu
    }
    return result;
  };

  // Mapiranje ispita sa podacima o predmetu i filtriranje na ispite profesora
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

  if (loading)
    return <div className="text-center py-10">Učitavanje ispita...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600">Greška: {error}</div>
    );

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Da li ste sigurni da želite da obrišete ovaj ispit?")) {
      const result = await deleteExam(examId);
      if (result.success) {
        fetchData(); // Osveži listu ispita
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaCalendarAlt className="mr-3 text-indigo-600" /> Zakazani Ispiti
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          <FaCalendarPlus className="mr-2" /> Zakaži Novi Ispit
        </button>
      </div>

      {/* Tabela za Ispite */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-200">
          <h3 className="font-semibold text-lg text-indigo-800">
            Ispiti koje Vi vodite ({professorExams.length})
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Predmet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Ispita
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {professorExams.length > 0 ? (
              professorExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-indigo-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {exam.subject_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {exam.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        exam.type === "pismeni"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {exam.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span>{exam.id}</span>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition"
                        title="Obriši ispit"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Niste zakažali nijedan ispit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
