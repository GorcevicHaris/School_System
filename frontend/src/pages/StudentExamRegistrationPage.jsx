import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";
import { Link } from "react-router-dom";
// Inline SVG za CalendarIcon (Ikona Kalendara)
const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ExclamationCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const StudentExamRegistrationPage = () => {
  const [availableExams, setAvailableExams] = useState([]);
  const [registeredExamIds, setRegisteredExamIds] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState(null);

  const {
    getExams,
    getSubjects,
    getStudentRegistrations,
    studentCreateExamRegistration,
    userRole,
    student,
  } = useContext(AuthContext);

  useEffect(() => {
    if (userRole !== "student") {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const examRes = await getExams();
        const subjectRes = await getSubjects();
        const regRes = await getStudentRegistrations();

        if (examRes.success) setAvailableExams(examRes.data);
        if (subjectRes.success) setSubjects(subjectRes.data);

        if (regRes.success) {
          const allRegistrations = regRes.data;
          setAllRegistrations(allRegistrations);

          const activeRegistrationIds = allRegistrations
            .filter((r) => r.status === "prijavljen" || r.status === "polozio")
            .map((r) => r.exam_id);

          setRegisteredExamIds(activeRegistrationIds);
        }

        if (!examRes.success || !subjectRes.success || !regRes.success) {
          setError(
            examRes.error ||
              subjectRes.error ||
              regRes.error ||
              "Došlo je do greške prilikom učitavanja podataka."
          );
        }
      } catch (err) {
        console.error("Greška pri učitavanju podataka:", err);
        setError("Greška pri učitavanju podataka.");
      }
      setLoading(false);
    };

    fetchData();
  }, [userRole, getExams, getSubjects, getStudentRegistrations]);

  if (userRole !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center py-12 px-6 bg-red-100 rounded-xl shadow-lg max-w-md w-full">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Pristup Odbijen
          </h2>
          <p className="text-red-600">
            Ova stranica je dostupna samo studentima.
          </p>
        </div>
      </div>
    );
  }

  const handleRegistration = async (examId) => {
    setIsRegistering(true);
    setMessage(null);

    const result = await studentCreateExamRegistration(examId);

    if (result.success) {
      setMessage({ type: "success", text: "Uspešno ste prijavili ispit!" });
      setRegisteredExamIds((prevIds) => [...prevIds, examId]);

      const regRes = await getStudentRegistrations();
      if (regRes.success) {
        setAllRegistrations(regRes.data);
      }
    } else {
      setMessage({
        type: "error",
        text: result.error || "Prijava nije uspela zbog nepoznate greške.",
      });
    }
    setIsRegistering(false);
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === Number(subjectId));
    return subject?.name || "Nepoznat Predmet";
  };

  const getSubjectInfo = (subjectId) => {
    return subjects.find((s) => s.id === Number(subjectId));
  };

  const checkEligibility = (subjectInfo) => {
    if (!subjectInfo || !student) return { eligible: true, reason: "" };

    const departmentMatch =
      !subjectInfo.department || subjectInfo.department === student.department;

    const yearMatch =
      !subjectInfo.year || subjectInfo.year <= student.age_of_study;

    if (!departmentMatch && !yearMatch) {
      return {
        eligible: false,
        reason: `Ovaj predmet je za smer "${subjectInfo.department}" i ${subjectInfo.year}. godinu studija.`,
      };
    } else if (!departmentMatch) {
      return {
        eligible: false,
        reason: `Ovaj predmet je samo za smer "${subjectInfo.department}". Vi ste na smeru "${student.department}".`,
      };
    } else if (!yearMatch) {
      return {
        eligible: false,
        reason: `Ovaj predmet je za ${subjectInfo.year}. godinu studija. Vi ste na ${student.age_of_study}. godini.`,
      };
    }

    return { eligible: true, reason: "" };
  };

  const sortedExams = availableExams.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-semibold text-sm sm:text-base">
            Učitavanje ispita i prijava...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-red-800">
                  Greška
                </h3>
                <p className="text-sm sm:text-base text-red-600 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <Link
        to="/student/profile"
        className="inline-block px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
      >
        Moj profil
      </Link>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-2xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold flex flex-col sm:flex-row items-start sm:items-center mb-3 gap-3 sm:gap-0">
          <CalendarIcon className="sm:mr-4 h-8 w-8 sm:h-10 sm:w-10" />
          <span>Prijava Ispita</span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-indigo-100">
          Pregledajte dostupne ispitne rokove i prijavite ispite na koje želite
          izaći
        </p>
        {student && (
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm break-words">
              <strong>Vaš smer:</strong>{" "}
              {student.department || "Nije definisan"}
              <span className="mx-2">|</span>
              <strong>Godina studija:</strong> {student.age_of_study}
            </p>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-4 sm:p-5 rounded-xl shadow-lg flex items-start sm:items-center animate-fade-in ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {message.type === "success" ? (
            <CheckIcon className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="mr-3 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          )}
          <span className="font-medium text-sm sm:text-base flex-1">
            {message.text}
          </span>
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-gray-500 hover:text-gray-700 font-bold text-xl flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Ukupno Ispita
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {availableExams.length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3 sm:p-4">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Prijavljeno
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {registeredExamIds.length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3 sm:p-4">
              <CheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border-l-4 border-purple-500 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Dostupno
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {
                  sortedExams.filter(
                    (exam) => !registeredExamIds.includes(exam.id)
                  ).length
                }
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3 sm:p-4">
              <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            Dostupni Ispiti
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedExams.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <CalendarIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
              <p className="text-lg sm:text-xl text-gray-500 font-medium">
                Trenutno nema dostupnih ispita
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Profesor još nije kreirao ispite
              </p>
            </div>
          ) : (
            sortedExams.map((exam) => {
              const isRegistered = registeredExamIds.includes(exam.id);
              const subjectName = getSubjectName(exam.subject_id);
              const subjectInfo = getSubjectInfo(exam.subject_id);
              const isPastExam = new Date(exam.date) < new Date();

              const eligibility = checkEligibility(subjectInfo);
              const canRegister =
                eligibility.eligible && !isPastExam && !isRegistered;

              return (
                <div
                  key={exam.id}
                  className={`p-4 sm:p-6 transition-all duration-300 ${
                    isRegistered
                      ? "bg-indigo-50"
                      : isPastExam
                      ? "bg-gray-50 opacity-60"
                      : !eligibility.eligible
                      ? "bg-yellow-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                          {subjectName}
                        </h4>

                        {subjectInfo?.department && (
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                              !subjectInfo.department ||
                              subjectInfo.department === student?.department
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            📚 {subjectInfo.department}
                          </span>
                        )}

                        {subjectInfo?.year && (
                          <span
                            className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                              !subjectInfo.year ||
                              subjectInfo.year <= student?.age_of_study
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            🎓 {subjectInfo.year}. godina
                          </span>
                        )}

                        <span
                          className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                            exam.type === "pismeni"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {exam.type === "pismeni" ? "📝 Pismeni" : "🎤 Usmeni"}
                        </span>

                        {isPastExam && (
                          <span className="px-2 sm:px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-600 whitespace-nowrap">
                            ⏰ Prošao rok
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                        <span className="font-medium break-words">
                          {new Date(exam.date).toLocaleDateString("sr-RS", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {!eligibility.eligible &&
                        !isRegistered &&
                        !isPastExam && (
                          <div className="mt-2 flex items-start">
                            <ExclamationCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-orange-700 font-medium break-words">
                              {eligibility.reason}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="flex-shrink-0 w-full lg:w-auto">
                      {isRegistered ? (
                        <span className="inline-flex items-center justify-center w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-full bg-green-500 text-white shadow-lg">
                          <CheckIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />{" "}
                          PRIJAVLJENO
                        </span>
                      ) : isPastExam ? (
                        <span className="inline-flex items-center justify-center w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-full bg-gray-300 text-gray-600 cursor-not-allowed">
                          Prošao rok
                        </span>
                      ) : !eligibility.eligible ? (
                        <span className="inline-flex items-center justify-center w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-full bg-orange-200 text-orange-800 cursor-not-allowed">
                          Nije dostupno
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegistration(exam.id)}
                          disabled={isRegistering}
                          className="w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-white bg-indigo-600 rounded-full font-bold shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                        >
                          {isRegistering ? "Prijava u toku..." : "Prijavi se"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs sm:text-sm text-blue-700 break-words">
              <strong className="font-bold">Napomena:</strong> Možete prijaviti
              samo ispite koji odgovaraju vašem smeru (
              {student?.department || "nepoznat"}) i godini studija (
              {student?.age_of_study || "nepoznata"}). Nakon prijave, profesor
              će pregledati vašu prijavu i uneti rezultate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamRegistrationPage;
