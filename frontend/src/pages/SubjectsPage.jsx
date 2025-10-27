import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import { FaBook, FaPlus, FaTag, FaTrashAlt } from "react-icons/fa";

// Globalne konstante
const DEPARTMENTS = [
  "Računarstvo",
  "Elektrotehnika",
  "Mašinstvo",
  "Građevinarstvo",
  "Menadžment",
];

const YEARS = [1, 2, 3, 4];

// ==========================================================
// Komponenta za modal (dodavanje predmeta)
// ==========================================================

const SubjectFormModal = ({ professorId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    espb: 6,
    professor_id: professorId,
    year: 1,
    department: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Postavlja professor_id pri otvaranju, ako je potrebno
    setFormData((prev) => ({ ...prev, professor_id: professorId }));
  }, [professorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "espb" || name === "year" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.espb < 1 || formData.espb > 30) {
      setError("ESPB mora biti između 1 i 30.");
      return;
    }

    if (!formData.department) {
      setError("Morate odabrati departman.");
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
          Kreiraj Novi Predmet
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naziv Predmeta
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Npr. Algoritmi i Strukture Podataka"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Godina studija
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}. godina
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ESPB Bodovi
              </label>
              <input
                type="number"
                name="espb"
                value={formData.espb}
                onChange={handleChange}
                required
                min="1"
                max="30"
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departman / Smer
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- Odaberite Departman --</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
            💡 <strong>Napomena:</strong> Samo studenti ovog departmana i
            odgovarajuće godine će moći da prijave ovaj predmet.
          </div>

          {error && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">{error}</p>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm sm:text-base bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Poništi
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition flex items-center justify-center"
            >
              <FaPlus className="mr-1" /> Kreiraj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================================
// Glavna SubjectsPage komponenta
// ==========================================================

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pretpostavlja se da AuthContext sadrži trenutno ulogovanog profesora
  const { professor, getSubjects, createSubject, deleteSubject } =
    useContext(AuthContext);

  const fetchSubjects = async () => {
    setLoading(true);
    const result = await getSubjects();
    if (result.success) {
      setSubjects(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSaveSubject = async (subjectData) => {
    const result = await createSubject(subjectData);
    if (result.success) {
      fetchSubjects();
    }
    return result;
  };

  const handleDeleteSubject = async (subjectId) => {
    if (
      window.confirm("Da li ste sigurni da želite da izbrišete ovaj predmet?")
    ) {
      const result = await deleteSubject(subjectId);
      if (result.success) {
        fetchSubjects();
      } else {
        alert(`Greška pri brisanju: ${result.error}`);
      }
    }
  };

  // Filtriranje predmeta
  const professorSubjects = subjects.filter(
    (sub) => sub.professor_id === professor?.id
  );
  const otherSubjects = subjects.filter(
    (sub) => sub.professor_id !== professor?.id
  );

  if (loading)
    return (
      <div className="text-center py-10 text-sm sm:text-base">
        Učitavanje predmeta...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600 text-sm sm:text-base px-4">
        Greška: {error}
      </div>
    );

  return (
    // Glavni kontejner sada koristi w-full
    <div className="w-full space-y-4 sm:space-y-6  sm:p-6 lg:p-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <FaBook className="mr-2 text-indigo-600" /> Katalog Predmeta
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 text-sm sm:text-base"
        >
          <FaPlus className="mr-2" /> Dodaj Novi Predmet
        </button>
      </div>

      {/* MOJI PREDMETI SEKCIJA */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 w-full">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-base sm:text-lg text-gray-800">
            Moji Predmeti ({professorSubjects.length})
          </h3>
        </div>

        {/* Desktop tabela */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naziv
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Godina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departman
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ESPB
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {professorSubjects.length > 0 ? (
                professorSubjects.map((subject) => (
                  <tr
                    key={subject.id}
                    className="hover:bg-indigo-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 flex items-center">
                      <FaTag className="mr-2 text-indigo-400" /> {subject.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                        {subject.year}. god
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {subject.department || "Nije definisan"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center font-bold">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {subject.espb}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-red-600 hover:text-red-900 transition-colors mx-2 p-1"
                        title="Izbriši predmet"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500 italic"
                  >
                    Još niste kreirali nijedan predmet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobilni prikaz - kartice */}
        <div className="lg:hidden space-y-4 p-4">
          {professorSubjects.length > 0 ? (
            professorSubjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-white shadow-lg rounded-xl p-4 space-y-3 border border-gray-200 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-gray-900 text-base flex items-start mb-2">
                      <FaTag className="mr-2 text-indigo-400 flex-shrink-0 mt-1" />
                      <span className="break-words">{subject.name}</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-3 py-1 font-bold rounded-full bg-blue-100 text-blue-800">
                        🎓 {subject.year}. god
                      </span>
                      <span className="px-3 py-1 font-semibold rounded-full bg-purple-100 text-purple-800">
                        🏢 {subject.department || "N/A"}
                      </span>
                      <span className="px-3 py-1 font-bold rounded-full bg-gray-100 text-gray-700">
                        {subject.espb} ESPB
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-red-600 hover:text-red-900 p-2 transition flex-shrink-0"
                    title="Obriši"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 italic text-sm">
              Još niste kreirali nijedan predmet.
            </div>
          )}
        </div>
      </div>

      {/* DRUGI PREDMETI SEKCIJA */}
      {otherSubjects.length > 0 && (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 w-full mt-6">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-base sm:text-lg text-gray-800">
              Drugi predmeti u sistemu ({otherSubjects.length})
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Prikazano je {Math.min(otherSubjects.length, 5)} predmeta.
            </p>
          </div>

          {/* Desktop tabela za druge predmete */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="bg-white divide-y divide-gray-200">
                {otherSubjects.slice(0, 5).map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                      {subject.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-xs text-gray-500">
                      {subject.year}. god.
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {subject.department || "N/A"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                      {subject.espb} ESPB
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-400 text-center">
                      -
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobilni kartični prikaz za druge predmete */}
          <div className="lg:hidden divide-y divide-gray-200">
            {otherSubjects.slice(0, 3).map((subject) => (
              <div key={subject.id} className="p-4 hover:bg-gray-50 transition">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {subject.name}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="font-medium">{subject.year}. god.</span>
                  <span>•</span>
                  <span>{subject.department || "N/A"}</span>
                  <span>•</span>
                  <span className="font-bold">{subject.espb} ESPB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <SubjectFormModal
          professorId={professor?.id}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSubject}
        />
      )}
    </div>
  );
};

export default SubjectsPage;
