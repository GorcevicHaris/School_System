import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import {
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaFilter,
} from "react-icons/fa";

// Opcije za grade i status (prema Vašem FastAPI Enum-u)
const statusOptions = {
  prijavljen: {
    label: "Prijavljen",
    icon: FaExclamationTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  polozio: {
    label: "Položio",
    icon: FaCheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  pao: {
    label: "Pao",
    icon: FaTimesCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

const ExamRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
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
      //znaci bukvalno vrati mi sve ispite koje nisam odabrao ili vrati mi ispit koji sam odabrao koji je jednak examid
    )
    .filter((reg) => !selectedStatus || reg.status == selectedStatus)
    .map((reg) => {
      const student = students.find((s) => s.id === reg.student_id);
      const exam = exams.find((e) => e.id === reg.exam_id);
      const subject = subjects.find((s) => s.id === Number(exam?.subject_id));

      return {
        ...reg,
        student_name: student?.name || "Nepoznat Student",
        student_index: student?.index_number || "N/A",
        exam_info: `${subject?.name || "Nepoznat Predmet"} - ${
          exam?.date || "N/A"
        }`,
        subject_name: subject?.name || "Nepoznat Predmet",
      };
    });

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
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, ...updateData } : r))
      );
    } else {
      console.error(`Greška pri ažuriranju: ${result.error}`);
    }
  };

  const calculateGrade = (points) => {
    if (points === null || points === "") return "/";
    if (points < 51) return 5;
    if (points < 61) return 6;
    if (points < 71) return 7;
    if (points < 81) return 8;
    if (points < 91) return 9;
    return 10;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Učitavanje prijava i ispita...
          </p>
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

  const handlePointChange = (reg, value) => {
    // Filtriraj sve prijave ovog studenta za ISTI PREDMET
    const currentExam = exams.find((el) => el.id == reg.exam_id);
    //znaci vrati mi sve examsove koji imaju isti kao oni koji se prijavljuju
    if (!currentExam) return false; // Ako ne nađe ispit, zaustavi se
    const studentSubjectRegistration = registrations
      .filter((r) => {
        const exam = exams.find((e) => e.id === r.exam_id);
        return (
          r.student_id === reg.student_id &&
          exam.subject_id === currentExam.subject_id
        );
      })
      .sort((a, b) => b.num_of_applications - a.num_of_applications); // Sortiraj po broju aplikacija

    const latestReg = studentSubjectRegistration[0];

    console.log(
      "Sve prijave za ovog studenta na ovom PREDMETU:",
      studentSubjectRegistration
    );

    if (reg.num_of_applications !== latestReg.num_of_applications) {
      alert(
        "Ne možete menjati prethodnu prijavu. Možete editovati samo poslednju prijavu."
      );
      return false;
    }

    const newGrade = calculateGrade(value);
    const newStatus = newGrade === 5 ? "pao" : "polozio";

    handleUpdate(reg.id, "points", value);
    handleUpdate(reg.id, "grade", newGrade);
    handleUpdate(reg.id, "status", newStatus);

    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center flex-wrap gap-3">
            <FaGraduationCap className="text-3xl sm:text-4xl" />
            <span>Unos Ocena i Status Ispita</span>
          </h2>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base">
              <FaFilter className="text-indigo-600" />
              Filtriraj po Ispitu:
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="flex-1 sm:flex-none sm:min-w-[300px] p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="">-- Svi Ispiti --</option>
              {exams.map((exam) => {
                const subject = subjects.find(
                  (el) => el.id == Number(exam.subject_id)
                );
                return (
                  <option key={exam.id} value={exam.id}>
                    {subject?.name || "Nepoznat Predmet"} - {exam.date} (
                    {exam.type})
                  </option>
                );
              })}
            </select>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm sm:text-base min-w-[180px]">
                <FaFilter className="text-indigo-600" />
                Filtriraj po Statusu:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 sm:min-w-[300px] p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="">-- Svi Statusi --</option>
                <option value="prijavljen">📝 Prijavljen</option>
                <option value="polozio">✅ Položio</option>
                <option value="pao">❌ Pao</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 font-medium">Ukupno prijava</p>
            <p className="text-3xl font-bold text-gray-900">
              {mappedRegistrations.length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 font-medium">📝 Prijavljeni</p>
            <p className="text-3xl font-bold text-yellow-600">
              {
                mappedRegistrations.filter((r) => r.status === "prijavljen")
                  .length
              }
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 font-medium">✅ Položili</p>
            <p className="text-3xl font-bold text-green-600">
              {mappedRegistrations.filter((r) => r.status === "polozio").length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600 font-medium">❌ Pali</p>
            <p className="text-3xl font-bold text-red-600">
              {mappedRegistrations.filter((r) => r.status === "pao").length}
            </p>
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Index
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Ispit / Predmet
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Br. Prijava
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Poeni
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Ocena
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                      <tr
                        key={reg.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {reg.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {reg.student_index}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {reg.exam_info}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {reg.num_of_applications}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={reg.points ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;

                              if (val === "") {
                                handleUpdate(reg.id, "points", null);
                                handleUpdate(reg.id, "grade", "/");
                                // Ažuriraj UI odmah
                                setRegistrations((prev) =>
                                  prev.map((r) =>
                                    r.id === reg.id
                                      ? { ...r, points: null, grade: "/" }
                                      : r
                                  )
                                );
                                return;
                              }

                              let value = parseInt(val);
                              if (isNaN(value)) value = 0;
                              if (value > 100) value = 100;
                              if (value < 0) value = 0;

                              handlePointChange(reg, value);
                            }}
                            ame="w-20 p-2 text-center border-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 font-semibold"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg">
                            {reg.grade === "/" ? "/" : reg.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-bold ${status.color} ${status.bg}`}
                          >
                            <status.icon className="mr-2 h-4 w-4" />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FaExclamationTriangle className="text-4xl text-gray-400" />
                        <p className="font-semibold">
                          Nema prijava za odabrani ispit.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {mappedRegistrations.length > 0 ? (
            mappedRegistrations.map((reg) => {
              const status =
                statusOptions[reg.status] || statusOptions.prijavljen;
              return (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div
                    className={`p-4 ${
                      status.bg
                    } border-l-4 ${status.color.replace("text-", "border-")}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {reg.student_name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${status.color} bg-white shadow-sm`}
                      >
                        <status.icon className="mr-1.5 h-3 w-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Index:</p>
                        <p className="font-semibold text-gray-900">
                          {reg.student_index}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">
                          Broj prijava:
                        </p>
                        <p className="font-semibold text-indigo-600">
                          {reg.num_of_applications}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-gray-500 font-medium text-sm">
                        Ispit:
                      </p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {reg.exam_info}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Poeni:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={reg.points ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;

                            if (val === "") {
                              handleUpdate(reg.id, "points", null);
                              handleUpdate(reg.id, "grade", "/");
                              // Ažuriraj UI odmah
                              setRegistrations((prev) =>
                                prev.map((r) =>
                                  r.id === reg.id
                                    ? { ...r, points: null, grade: "/" }
                                    : r
                                )
                              );
                              return;
                            }

                            let value = parseInt(val);
                            if (isNaN(value)) value = 0;
                            if (value > 100) value = 100;
                            if (value < 0) value = 0;

                            handlePointChange(reg, value);
                          }}
                          className="w-full p-2.5 text-center border-2 rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ocena:
                        </label>
                        <div className="flex items-center justify-center h-[42px] rounded-lg bg-indigo-100">
                          <span className="text-2xl font-bold text-indigo-700">
                            {reg.grade === "/" ? "/" : reg.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <FaExclamationTriangle className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-semibold">
                Nema prijava za odabrani ispit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamRegistrationsPage;
