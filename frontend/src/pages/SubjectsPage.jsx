import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import { FaBook, FaPlus, FaTag, FaTrashAlt } from "react-icons/fa";

// Komponenta za modal (dodavanje predmeta)
const SubjectFormModal = ({ professorId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    espb: 6, // Default ESPB
    professor_id: professorId,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "espb" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.espb < 1 || formData.espb > 30) {
      setError("ESPB mora biti između 1 i 30.");
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          Kreiraj Novi Predmet
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Naziv Predmeta
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Npr. Algoritmi i Strukture Podataka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="text-sm text-gray-500">
            * Predmet će biti automatski povezan sa Vašim ID-jem: **
            {professorId}**
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
              <FaPlus className="inline mr-1" /> Kreiraj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Glavna SubjectsPage komponenta
const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      fetchSubjects(); // Osveži listu
    }
    return result;
  };

  const handleDeleteSubject = async (subjectId) => {
    if (
      window.confirm("Da li ste sigurni da zelite da izbrisete ovaj predmet")
    ) {
      const result = await deleteSubject(subjectId);
      if (result.success) {
        fetchSubjects();
      } else {
        alert(`Greska pri brisanju ${result.error}`);
      }
    }
  };

  const professorSubjects = subjects.filter(
    (sub) => sub.professor_id === professor?.id
  );
  const otherSubjects = subjects.filter(
    (sub) => sub.professor_id !== professor?.id
  );

  if (loading)
    return <div className="text-center py-10">Učitavanje predmeta...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600">Greška: {error}</div>
    );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaBook className="mr-3 text-indigo-600" /> Katalog Predmeta
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-150"
        >
          <FaPlus className="mr-2" /> Dodaj Novi Predmet
        </button>
      </div>

      {/* Tabela za Predmete */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-200">
          <h3 className="font-semibold text-lg text-indigo-800">
            Moji Predmeti ({professorSubjects.length})
          </h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Naziv
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ESPB
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Profesora
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {professorSubjects.length > 0 ? (
              professorSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900 flex items-center">
                    <FaTag className="mr-2 text-indigo-400" /> {subject.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">
                    {subject.espb}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {subject.professor_id} (Vi)
                  </td>
                  {/* Dugme za brisanje skroz desno */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-100"
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
                  colSpan="4"
                  className="px-6 py-4 text-center text-gray-500 italic"
                >
                  Još niste kreirali nijedan predmet.
                </td>
              </tr>
            )}

            {/* Dodatni predmeti (kao primer) */}
            {otherSubjects.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider"
                  >
                    Drugi predmeti u sistemu
                  </td>
                </tr>
                {otherSubjects.slice(0, 3).map((subject) => (
                  <tr key={subject.id} className="text-gray-400 italic">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                      {subject.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {subject.espb}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {subject.professor_id}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

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
