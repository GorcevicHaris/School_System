import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import { FaUserPlus, FaTrashAlt, FaEdit } from "react-icons/fa";

// Komponenta za modal (dodavanje/ažuriranje)
const StudentFormModal = ({ studentToEdit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    index_number: "",
    age_of_study: 1,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name,
        username: studentToEdit.username,
        email: studentToEdit.email,
        index_number: studentToEdit.index_number,
        age_of_study: studentToEdit.age_of_study,
      });
    }
  }, [studentToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Provera da li je age_of_study broj
    if (isNaN(parseInt(formData.age_of_study))) {
      setError("Godina studija mora biti broj.");
      return;
    }

    onSave(studentToEdit ? studentToEdit.id : null, formData).then((result) => {
      if (!result.success) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-bold mb-4">
          {studentToEdit ? "Ažuriraj Studenta" : "Dodaj Novog Studenta"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Unos Polja... name, username, email, index_number, age_of_study */}

          <input
            type="text"
            name="name"
            placeholder="Ime i Prezime"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />

          <input
            type="text"
            name="username"
            placeholder="Korisničko Ime"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />

          <input
            type="text"
            name="index_number"
            placeholder="Broj Indeksa"
            value={formData.index_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />

          <input
            type="number"
            name="age_of_study"
            placeholder="Godina Studija"
            value={formData.age_of_study}
            onChange={handleChange}
            required
            min="1"
            max="10"
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Poništi
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Sačuvaj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Glavna StudentsPage komponenta
const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);

  const { getStudents, createStudent, updateStudent, deleteStudent } =
    useContext(AuthContext);

  const fetchStudents = async () => {
    setLoading(true);
    const result = await getStudents();
    if (result.success) {
      setStudents(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // RUKOVANJE MODALOM I CRUD OPERACIJAMA

  const handleOpenCreateModal = () => {
    setStudentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (id, studentData) => {
    let result;
    if (id) {
      result = await updateStudent(id, studentData);
    } else {
      result = await createStudent(studentData);
    }

    if (result.success) {
      fetchStudents(); // Osveži listu
    }
    return result;
  };

  const handleDeleteStudent = async (studentId) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovog studenta?")
    ) {
      const result = await deleteStudent(studentId);
      if (result.success) {
        fetchStudents(); // Osveži listu
      } else {
        alert(`Greška pri brisanju: ${result.error}`);
      }
    }
  };

  if (loading)
    return <div className="text-center py-10">Učitavanje studenata...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600">Greška: {error}</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Pregled Studenata</h2>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
        >
          <FaUserPlus className="mr-2" /> Dodaj Studenta
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ime
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Index
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Godina
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.index_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.age_of_study}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditModal(student)}
                      className="text-indigo-600 hover:text-indigo-900 mx-2 p-1"
                      title="Ažuriraj"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900 mx-2 p-1"
                      title="Obriši"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Nema registrovanih studenata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <StudentFormModal
          studentToEdit={studentToEdit}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStudent}
        />
      )}
    </div>
  );
};

export default StudentsPage;
