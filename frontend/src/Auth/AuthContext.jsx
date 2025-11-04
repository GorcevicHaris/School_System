import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || "http://192.168.0.105:8000";
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(Cookies.get("token") || null);
  const [userId, setUserId] = useState(Cookies.get("user_id") || null);
  const [userRole, setUserRole] = useState(Cookies.get("user_role") || null);

  const [professor, setProfessor] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------
  // POMOĆNA FUNKCIJA ZA KOLAČIĆE
  // ---------------------------------
  const setAuthCookies = (resData) => {
    const { access_token, user_id, user_role } = resData;
    setToken(access_token);
    setUserId(user_id);
    setUserRole(user_role);

    Cookies.set("token", access_token, { expires: 1 });
    Cookies.set("user_id", user_id, { expires: 1 });
    Cookies.set("user_role", user_role, { expires: 1 });
  };
  console.log(userRole, "rola");
  // ---------------------------------
  // AXIOS INTERCEPTOR
  // ---------------------------------
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // ---------------------------------
  // UČITAVANJE KORISNIKA
  // ---------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !userRole) {
        setLoading(false);
        return;
      }

      const endpoint =
        userRole === "professor"
          ? `${API_URL}/professors/me`
          : `${API_URL}/students/me`;

      try {
        const res = await axios.get(endpoint);

        if (userRole === "professor") {
          setProfessor(res.data);
          setStudent(null);
        } else {
          setStudent(res.data);
          setProfessor(null);
        }
      } catch (err) {
        console.error(
          `Failed to fetch ${userRole}:`,
          err.response?.data || err.message
        );
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, userRole]);

  // ---------------------------------
  // AUTENTIFIKACIJA
  // ---------------------------------
  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserRole(null);
    setProfessor(null);
    setStudent(null);

    Cookies.remove("token");
    Cookies.remove("user_id");
    Cookies.remove("user_role");
  };

  const professorLogin = async (username, password) => {
    try {
      console.log(API_URL, "apiii");
      const res = await axios.post(`${API_URL}/login`, { username, password });
      setAuthCookies(res.data);
      console.log(res.data, "adsasd");
      return { success: true, role: "professor" };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Prijava profesora nije uspela",
      };
    }
  };

  const studentLogin = async (username, index_number) => {
    try {
      const res = await axios.post(`${API_URL}/students/login`, {
        username,
        index_number,
      });
      setAuthCookies(res.data);
      return { success: true, role: "student" };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Prijava studenta nije uspela",
      };
    }
  };

  const professorRegister = async (data) => {
    try {
      await axios.post(`${API_URL}/register`, data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.detail || "Registracija profesora nije uspela",
      };
    }
  };

  const isAuthenticated = () => {
    return !!token && !!(professor || student);
  };

  // ---------------------------------
  // CRUD FUNKCIJE - STUDENTI
  // ---------------------------------
  const createStudent = async (studentData) => {
    try {
      const res = await axios.post(`${API_URL}/students`, studentData);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Kreiranje studenta nije uspelo",
      };
    }
  };

  const getStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Učitavanje studenata nije uspelo",
      };
    }
  };

  const updateStudent = async (studentId, studentData) => {
    try {
      const res = await axios.put(
        `${API_URL}/students/${studentId}`,
        studentData
      );
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Ažuriranje studenta nije uspelo",
      };
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      await axios.delete(`${API_URL}/students/${studentId}`);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Brisanje studenta nije uspelo",
      };
    }
  };

  // ---------------------------------
  // CRUD FUNKCIJE - PREDMETI
  // ---------------------------------
  const createSubject = async (subjectData) => {
    try {
      const res = await axios.post(`${API_URL}/subjects`, subjectData);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Kreiranje predmeta nije uspelo",
      };
    }
  };

  const getSubjects = async () => {
    try {
      // Dinamički odaberi endpoint na osnovu uloge
      const endpoint =
        userRole === "student"
          ? `${API_URL}/subjects/student`
          : `${API_URL}/subjects`;

      const res = await axios.get(endpoint);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Učitavanje predmeta nije uspelo",
      };
    }
  };

  const deleteSubject = async (subject_Id) => {
    try {
      await axios.delete(`${API_URL}/subjects/delete/${subject_Id}`);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Brisanje nije uspelo",
      };
    }
  };

  // ---------------------------------
  // CRUD FUNKCIJE - ISPITI
  // ---------------------------------
  const createExam = async (examData) => {
    try {
      const res = await axios.post(`${API_URL}/exams`, examData);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Kreiranje ispita nije uspelo",
      };
    }
  };
  //
  const getExams = async () => {
    try {
      const endpoint =
        userRole === "student"
          ? `${API_URL}/exams/student`
          : `${API_URL}/exams`;

      const res = await axios.get(endpoint);
      console.log(res, "proba");
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Učitavanje ispita nije uspelo",
      };
    }
  };

  const getExam = async (examId) => {
    try {
      const res = await axios.get(`${API_URL}/exams/${examId}`);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Učitavanje ispita nije uspelo",
      };
    }
  };

  // ---------------------------------
  // CRUD FUNKCIJE - PRIJAVE ISPITA
  // ---------------------------------
  const createExamRegistration = async (registrationData) => {
    try {
      const res = await axios.post(
        `${API_URL}/exam-registrations`,
        registrationData
      );
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Prijava na ispit nije uspela",
      };
    }
  };

  const getExamRegistrations = async () => {
    try {
      // Dinamički odaberi endpoint na osnovu uloge
      const endpoint =
        userRole === "student"
          ? `${API_URL}/exam-registrations/student`
          : `${API_URL}/exam-registrations`;

      const res = await axios.get(endpoint);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Učitavanje prijava nije uspelo",
      };
    }
  };

  // ⭐ NOVA FUNKCIJA - Specifična za studente (alias)
  const getStudentRegistrations = async () => {
    try {
      const res = await axios.get(`${API_URL}/exam-registrations/student`);
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.detail ||
          "Učitavanje studentskih prijava nije uspelo",
      };
    }
  };

  const getExamRegistrationsByExam = async (examId) => {
    try {
      const res = await axios.get(
        `${API_URL}/exam-registrations/exam/${examId}`
      );
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.detail ||
          "Učitavanje prijava za ispit nije uspelo",
      };
    }
  };

  const updateExamRegistration = async (registrationId, updateData) => {
    try {
      const res = await axios.put(
        `${API_URL}/exam-registrations/${registrationId}`,
        updateData
      );
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Ažuriranje prijave nije uspelo",
      };
    }
  };

  // ⭐ STUDENTSKA PRIJAVA NA ISPIT
  const studentCreateExamRegistration = async (examId) => {
    try {
      // Koristi novi endpoint specifičan za studente
      const res = await axios.post(`${API_URL}/exam-registrations/student`, {
        exam_id: examId,
      });
      console.log(res, "provera sta je res");
      return { success: true, data: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Prijava na ispit nije uspela",
      };
    }
  };

  const deleteExam = async (examId) => {
    try {
      await axios.delete(`${API_URL}/exams/delete/${examId}`);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Brisanje ispita nije uspelo",
      };
    }
  };

  //  getExamRegistrations(),
  //         getExams(),
  //         getStudents(),
  //         getSubjects(),
  const value = {
    professor,
    student,
    token,
    userId,
    userRole,
    loading,

    // Auth
    professorLogin,
    studentLogin,
    professorRegister,
    logout,
    isAuthenticated,

    // Student CRUD
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,

    // Subject CRUD
    createSubject,
    getSubjects,
    deleteSubject,

    // Exam CRUD
    createExam,
    getExams,
    getExam,

    // Exam Registration CRUD
    createExamRegistration,
    getExamRegistrations,
    getStudentRegistrations, // ⭐⭐⭐ OVO JE KLJUČNO
    getExamRegistrationsByExam,
    updateExamRegistration,
    studentCreateExamRegistration, // ⭐⭐⭐ I OVO
    deleteExam,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
