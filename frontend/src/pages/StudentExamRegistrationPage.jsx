import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Auth/AuthContext";

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
    student, // ⭐ NOVO - Potrebno nam je za proveru departmana i godine
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
          setAllRegistrations(allRegistrations); // ⭐ Čuvamo sve prijave

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
      <div className="text-center py-20 bg-red-100 rounded-xl shadow-lg m-10">
        <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-800">Pristup Odbijen</h2>
        <p className="text-red-600">
          Ova stranica je dostupna samo studentima.
        </p>
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

      // ⭐ Osvježi podatke nakon uspješne prijave
      const regRes = await getStudentRegistrations();
      if (regRes.success) {
        setAllRegistrations(regRes.data);
      }
    } else {
      // ⭐ Prikaži specifičnu grešku iz backenda
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

  // ⭐ NOVA FUNKCIJA - Dobavi informacije o predmetu
  const getSubjectInfo = (subjectId) => {
    return subjects.find((s) => s.id === Number(subjectId));
  };

  // ⭐ NOVA FUNKCIJA - Proveri da li student ispunjava uslove za prijavu
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

  // Prikaži SVE ispite, sortirane po datumu (i prošle i buduće)
  const sortedExams = availableExams.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-semibold">
            Učitavanje ispita i prijava...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg shadow-lg">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-8 w-8 text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Greška</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-2xl p-8">
        <h2 className="text-4xl font-extrabold flex items-center mb-3">
          <CalendarIcon className="mr-4 h-10 w-10" /> Prijava Ispita
        </h2>
        <p className="text-lg text-indigo-100">
          Pregledajte dostupne ispitne rokove i prijavite ispite na koje želite
          izaći
        </p>
        {/* ⭐ NOVO - Prikaz informacija o studentu */}
        {student && (
          <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-sm">
              <strong>Vaš smer:</strong>{" "}
              {student.department || "Nije definisan"} |
              <strong className="ml-3">Godina studija:</strong>{" "}
              {student.age_of_study}
            </p>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-5 rounded-xl shadow-lg flex items-center animate-fade-in ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {message.type === "success" ? (
            <CheckIcon className="mr-3 h-6 w-6 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="mr-3 h-6 w-6 flex-shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ukupno Ispita</p>
              <p className="text-3xl font-bold text-gray-900">
                {availableExams.length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-4">
              <svg
                className="w-8 h-8 text-blue-600"
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

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prijavljeno</p>
              <p className="text-3xl font-bold text-gray-900">
                {registeredExamIds.length}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-4">
              <CheckIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dostupno</p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  sortedExams.filter(
                    (exam) => !registeredExamIds.includes(exam.id)
                  ).length
                }
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-4">
              <CalendarIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Dostupni Ispiti</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedExams.length === 0 ? (
            <div className="text-center py-16">
              <CalendarIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-xl text-gray-500 font-medium">
                Trenutno nema dostupnih ispita
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Profesor još nije kreirao ispite
              </p>
            </div>
          ) : (
            sortedExams.map((exam) => {
              const isRegistered = registeredExamIds.includes(exam.id);
              const subjectName = getSubjectName(exam.subject_id);
              const subjectInfo = getSubjectInfo(exam.subject_id);
              const isPastExam = new Date(exam.date) < new Date();

              // ⭐ NOVA LOGIKA - Provera prava na prijavu
              const eligibility = checkEligibility(subjectInfo);
              const canRegister =
                eligibility.eligible && !isPastExam && !isRegistered;

              return (
                <div
                  key={exam.id}
                  className={`p-6 transition-all duration-300 ${
                    isRegistered
                      ? "bg-indigo-50"
                      : isPastExam
                      ? "bg-gray-50 opacity-60"
                      : !eligibility.eligible
                      ? "bg-yellow-50" // ⭐ NOVO - Žuta pozadina za nedostupne ispite
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-6">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap">
                        <h4 className="text-xl font-bold text-gray-900">
                          {subjectName}
                        </h4>

                        {/* ⭐ NOVO - Badge za departman */}
                        {subjectInfo?.department && (
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              !subjectInfo.department ||
                              subjectInfo.department === student?.department
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            📚 {subjectInfo.department}
                          </span>
                        )}

                        {/* ⭐ NOVO - Badge za godinu */}
                        {subjectInfo?.year && (
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
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
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            exam.type === "pismeni"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {exam.type === "pismeni" ? "📝 Pismeni" : "🎤 Usmeni"}
                        </span>

                        {isPastExam && (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-600">
                            ⏰ Prošao rok
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center font-medium">
                          <CalendarIcon className="w-4 h-4 mr-1.5" />
                          {new Date(exam.date).toLocaleDateString("sr-RS", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* ⭐ NOVO - Upozorenje ako student ne ispunjava uslove */}
                      {!eligibility.eligible &&
                        !isRegistered &&
                        !isPastExam && (
                          <div className="mt-2 flex items-start">
                            <ExclamationCircleIcon className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-orange-700 font-medium">
                              {eligibility.reason}
                            </p>
                          </div>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                      {isRegistered ? (
                        <span className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-full bg-green-500 text-white shadow-lg">
                          <CheckIcon className="mr-2 h-5 w-5" /> PRIJAVLJENO
                        </span>
                      ) : isPastExam ? (
                        <span className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-full bg-gray-300 text-gray-600 cursor-not-allowed">
                          Prošao rok
                        </span>
                      ) : !eligibility.eligible ? (
                        <span className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-full bg-orange-200 text-orange-800 cursor-not-allowed">
                          Nije dostupno
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegistration(exam.id)}
                          disabled={isRegistering}
                          className="px-6 py-3 text-white bg-indigo-600 rounded-full font-bold shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
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

      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg shadow-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-400"
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
            <p className="text-sm text-blue-700">
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
