import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import {
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

// Opcije za grade i status (prema Vašem FastAPI Enum-u)
const gradeOptions = ["/", 5, 6, 7, 8, 9, 10];
const statusOptions = {
  prijavljen: {
    label: "Prijavljen",
    icon: FaExclamationTriangle,
    color: "text-yellow-600",
  },
  polozio: { label: "Položio", icon: FaCheckCircle, color: "text-green-600" },
  pao: { label: "Pao", icon: FaTimesCircle, color: "text-red-600" },
};

const ExamRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    getExamRegistrations,
    getExams,
    getStudents,
    getSubjects,
    updateExamRegistration,
  } = useContext(AuthContext);

  // 1. Učitavanje svih podataka
  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, examRes, studentRes, subjectRes] = await Promise.all([
        getExamRegistrations(),
        getExams(),
        getStudents(),
        getSubjects(),
      ]);

      if (regRes.success) setRegistrations(regRes.data);
      if (examRes.success) setExams(examRes.data);
      if (studentRes.success) setStudents(studentRes.data);
      if (subjectRes.success) setSubjects(subjectRes.data);
    } catch (err) {
      console.error("Greška pri učitavanju podataka:", err);
      setError("Greška pri učitavanju podataka.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  console.log(registrations, "registracije");
  // 2. Mapiranje podataka za tabelu
  const mappedRegistrations = registrations
    .filter(
      (reg) => !selectedExamId || reg.exam_id === parseInt(selectedExamId)
    )
    .map((reg) => {
      const student = students.find((s) => s.id === reg.student_id);
      const exam = exams.find((e) => e.id === reg.exam_id);

      // POPRAVLJENO: Osiguravanje da je subject_id integer
      // Koristimo Number() umesto parseInt() za sigurnu konverziju, mada obe rade
      const subject = subjects.find((s) => s.id === Number(exam?.subject_id));

      return {
        ...reg,
        student_name: student?.name || "Nepoznat Student",
        student_index: student?.index_number || "N/A",
        // Koristimo subject_name za exam_info
        exam_info: `${subject?.name || "Nepoznat Predmet"} - ${
          exam?.date || "N/A"
        }`,
        subject_name: subject?.name || "Nepoznat Predmet",
      };
    });
  console.log(registrations, "registracije");
  // 3. RUKOVANJE AŽURIRANJEM OCENE/STATUSA
  const handleUpdate = async (regId, field, value) => {
    const updateData = { [field]: value };

    // Specijalan slučaj: ako je ocena 5, status mora biti 'pao'
    if (field === "grade" && parseInt(value) === 5) {
      updateData.status = "pao";
    }
    // Specijalan slučaj: ako je ocena > 5, status mora biti 'polozio'
    else if (field === "grade" && parseInt(value) > 5) {
      updateData.status = "polozio";
    }

    const result = await updateExamRegistration(regId, updateData);

    if (result.success) {
      // Ažuriraj lokalni state
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, ...updateData } : r))
      );
    } else {
      // ZABRANJENI ALERT ZAMENJEN CONSOLE.ERROR
      console.error(`Greška pri ažuriranju: ${result.error}`);
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">Učitavanje prijava i ispita...</div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-600">Greška: {error}</div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center">
        <FaGraduationCap className="mr-3 text-indigo-600" /> Unos Ocena i Status
        Ispita
      </h2>
      <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-md">
        <label className="font-semibold text-gray-700">
          Filtriraj po Ispitu:
        </label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">-- Svi Ispiti --</option>
          {exams.map((exam) => {
            // POPRAVLJENO: Osiguravanje da je subject_id integer
            const subject = subjects.find(
              (el) => el.id == Number(exam.subject_id)
            );
            return (
              <option key={exam.id} value={exam.id}>
                {subject?.name || "Nepoznat Predmet"} - {exam.date} ({exam.type}
                )
              </option>
            );
          })}
        </select>
      </div>

      {/* Tabela Prijava */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Index
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ispit / Predmet
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Br. Prijava
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ocena
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mappedRegistrations.length > 0 ? (
              mappedRegistrations.map((reg) => {
                const status =
                  statusOptions[reg.status] || statusOptions.prijavljen;
                return (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reg.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reg.student_index}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                      {reg.exam_info}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-indigo-600">
                      {reg.num_of_applications}
                    </td>

                    {/* Unos Ocene */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <select
                        value={reg.grade}
                        onChange={(e) =>
                          handleUpdate(reg.id, "grade", e.target.value)
                        }
                        className={`p-1 border rounded-md font-bold ${
                          reg.grade > 5
                            ? "text-green-600 border-green-300"
                            : "text-red-600 border-red-300"
                        }`}
                      >
                        {gradeOptions.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold leading-4 ${status.color} bg-opacity-10 bg-current`}
                      >
                        <status.icon className="mr-1.5 h-3 w-3" />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Nema prijava za odabrani ispit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamRegistrationsPage;
