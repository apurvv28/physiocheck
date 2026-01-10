"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Clock,
  Target,
  TrendingUp,
  Edit2,
  MessageSquare,
  FileText,
  History,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Download,
  MoreVertical,
} from "lucide-react";
import { Card } from "@/components/cards/Card";
import { ProgressRing } from "@/components/charts/ProgressRing";
import { AnimatedLoader } from "@/components/loaders/AnimatedLoader";
import { DoctorNotes } from "@/components/feedback/DoctoreNotes";
import { api } from "@/lib/api";

interface PatientDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  createdAt: string;
  status: "active" | "at_risk" | "inactive";
  conditions: string[];
  medications: string[];
  allergies: string[];
  emergencyContact?: string;
  emergencyPhone?: string;
  notes?: string;
}

interface PatientStats {
  totalSessions: number;
  avgAccuracy: number;
  totalDuration: number;
  compliance: number;
  lastSession?: string;
  nextAppointment?: string;
}

interface AssignedExercise {
  id: string;
  name: string;
  difficulty: string;
  sets: number;
  reps: number;
  frequency: string;
  progress: number;
  lastCompleted?: string;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  selectedDays?: string[];
}

interface SessionHistory {
  id: string;
  created_at: string;
  status: string;
  duration: number;
  exercise_name?: string;
  accuracy?: number;
}

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [exercises, setExercises] = useState<AssignedExercise[]>([]);
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "exercises" | "history" | "notes"
  >("overview");

  const fetchPatientData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch patient details
      const [patientRes, statsRes, exercisesRes, historyRes] = await Promise.all([
        api.get(`/doctor/patients/${patientId}`),
        api.get(`/doctor/patients/${patientId}/stats`),
        api.get(`/doctor/patients/${patientId}/exercises`),
        api.get(`/doctor/patients/${patientId}/history`),
      ]);

      const patientData = patientRes.data;
      setPatient({
          ...patientData,
          createdAt: patientData.created_at || patientData.createdAt, // Handle both cases
          name: patientData.full_name || patientData.name // Ensure name is populated
      });
      setStats(statsRes.data);
      
      // Map exercises to flattened structure using ex.exercises.*
      const mappedExercises = (exercisesRes.data || []).map((ex: any) => ({
        id: ex.id,
        name: ex.exercises?.name || "Unknown Exercise",
        difficulty: ex.exercises?.difficulty || "beginner", // Use exercise difficulty or fallback
        sets: ex.sets || 0,
        reps: ex.reps || 0,
        frequency: ex.frequency || "daily",
        startDate: ex.start_date,
        endDate: ex.end_date,
        selectedDays: ex.selected_days || [],
        progress: 0, // Placeholder
        lastCompleted: undefined, // Placeholder
        dueDate: undefined // Placeholder
      }));
      
      setExercises(mappedExercises);
      
      const mappedHistory = (historyRes.data || []).map((s: any) => ({
          id: s.id,
          created_at: s.created_at,
          status: s.status,
          duration: s.duration_seconds || s.duration || 0,
          exercise_name: s.exercises?.name || 'Unknown',
          accuracy: s.metrics?.accuracy || 0 
      }));
      setHistory(mappedHistory);
    } catch (error) {
      // console.error("Error fetching patient data:", error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId, fetchPatientData]);

  const handleSendMessage = () => {
    // Implement message sending functionality
    // console.log("Send message to:", patient?.email);
  };

  const handleAddExercise = () => {
    router.push(`/doctor/assign-exercises?patient=${patientId}`);
  };

  const handleViewSession = (sessionId: string) => {
    router.push(`/doctor/sessions/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AnimatedLoader message="Loading patient profile..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Patient Not Found
        </h2>
        <p className="text-slate-600">
          The requested patient could not be found.
        </p>
        <button
          onClick={() => router.push("/doctor/patients")}
          className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </button>
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    at_risk: "bg-coral-100 text-coral-800",
    inactive: "bg-slate-100 text-slate-800",
  };

  const statusLabels = {
    active: "Active",
    at_risk: "At Risk",
    inactive: "Inactive",
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/doctor/patients")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {patient.name}
                </h1>
                <p className="text-slate-600">Patient Profile & Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSendMessage}
                className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Patient Info & Stats */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Patient Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {patient.name}
                    </h2>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        statusColors[patient.status]
                      }`}
                    >
                      {statusLabels[patient.status]}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">{patient.phone}</span>
                  </div>
                  {patient.dateOfBirth && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-700">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700">
                      Joined {new Date(patient.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-medium text-slate-900 mb-3">
                    Medical Information
                  </h3>
                  <div className="space-y-3">
                    {patient.conditions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-1">
                          Conditions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {patient.conditions.map((condition, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {patient.allergies.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-1">
                          Allergies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {patient.allergies.map((allergy, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-coral-50 text-coral-700 text-xs rounded"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {patient.emergencyContact && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="font-medium text-slate-900 mb-3">
                      Emergency Contact
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Name:</span>{" "}
                        {patient.emergencyContact}
                      </p>
                      {patient.emergencyPhone && (
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Phone:</span>{" "}
                          {patient.emergencyPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Stats & Tabs */}
          <div className="lg:col-span-2">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  title: "Total Sessions",
                  value: stats?.totalSessions || 0,
                  icon: <Activity className="w-5 h-5" />,
                  color: "teal",
                },
                {
                  title: "Avg Accuracy",
                  value: `${stats?.avgAccuracy || 0}%`,
                  icon: <Target className="w-5 h-5" />,
                  color: "green",
                },
                {
                  title: "Compliance",
                  value: `${stats?.compliance || 0}%`,
                  icon: <TrendingUp className="w-5 h-5" />,
                  color: "blue",
                },
                {
                  title: "Duration",
                  value: `${stats?.totalDuration || 0}m`,
                  icon: <Clock className="w-5 h-5" />,
                  color: "purple",
                },
              ].map((stat) => (
                <Card key={stat.title}>
                  <div className="p-4">
                    <div
                      className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600 w-fit mb-3`}
                    >
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-600">{stat.title}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <Card>
              <div className="border-b border-slate-200">
                <div className="flex space-x-1 overflow-x-auto">
                  {[
                    {
                      id: "overview",
                      label: "Overview",
                      icon: <Activity className="w-4 h-4" />,
                    },
                    {
                      id: "exercises",
                      label: "Exercises",
                      icon: <Target className="w-4 h-4" />,
                    },
                    {
                      id: "history",
                      label: "History",
                      icon: <History className="w-4 h-4" />,
                    },
                    {
                      id: "notes",
                      label: "Notes",
                      icon: <FileText className="w-4 h-4" />,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(
                          tab.id as
                            | "overview"
                            | "exercises"
                            | "history"
                            | "notes"
                        )
                      }
                      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200 whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-teal-500 text-teal-600"
                          : "border-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4">
                        Recent Activity
                      </h3>
                      {stats?.lastSession ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">
                                  Last Session Completed
                                </p>
                                <p className="text-sm text-green-700">
                                  {new Date(
                                    stats.lastSession
                                  ).toLocaleDateString()}{" "}
                                  •
                                  {new Date(
                                    stats.lastSession
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              Good Progress
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-coral-50 border border-coral-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-coral-600" />
                            <div>
                              <p className="font-medium text-coral-900">
                                No Recent Activity
                              </p>
                              <p className="text-sm text-coral-700">
                                Patient hasn`t completed any sessions recently
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {stats?.nextAppointment && (
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-4">
                          Next Appointment
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-900">
                                  Scheduled Follow-up
                                </p>
                                <p className="text-sm text-blue-700">
                                  {new Date(
                                    stats.nextAppointment
                                  ).toLocaleDateString()}{" "}
                                  •
                                  {new Date(
                                    stats.nextAppointment
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200">
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">
                          Assigned Exercises
                        </h3>
                        <button
                          onClick={handleAddExercise}
                          className="text-sm font-medium text-teal-600 hover:text-teal-700"
                        >
                          + Assign New
                        </button>
                      </div>
                      {exercises.length === 0 ? (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-600">
                            No exercises assigned
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            Assign exercises to start the rehabilitation program
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {exercises.slice(0, 3).map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <div>
                                <h4 className="font-medium text-slate-900">
                                  {exercise.name}
                                </h4>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                                  <span>
                                    {exercise.sets} sets × {exercise.reps} reps
                                  </span>
                                  <span>
                                      {exercise.frequency === 'specific_days' && exercise.selectedDays 
                                          ? exercise.selectedDays.map(d=>d.slice(0,3)).join(', ') 
                                          : exercise.frequency
                                      }
                                  </span>
                                  {exercise.endDate && new Date(exercise.endDate) < new Date() ? (
                                      <span className="text-green-600 font-medium">All sessions completed</span>
                                  ) : exercise.endDate ? (
                                      <span className="text-slate-500">
                                          Ends: {new Date(exercise.endDate).toLocaleDateString()}
                                      </span>
                                  ) : null}
                                </div>
                              </div>
                              <ProgressRing
                                value={exercise.progress}
                                size={40}
                              />
                            </div>
                          ))}
                          {exercises.length > 3 && (
                            <button className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2">
                              View all {exercises.length} exercises →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "exercises" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">
                        Assigned Exercises
                      </h3>
                      <button
                        onClick={handleAddExercise}
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                      >
                        + Assign New Exercise
                      </button>
                    </div>

                    {exercises.length === 0 ? (
                      <div className="text-center py-12">
                        <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">
                          No Exercises Assigned
                        </h4>
                        <p className="text-slate-600 mb-6">
                          Assign exercises to create a rehabilitation program
                          for {patient.name}
                        </p>
                        <button
                          onClick={handleAddExercise}
                          className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
                        >
                          <Target className="w-5 h-5 mr-2" />
                          Assign First Exercise
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {exercises.map((exercise) => (
                          <Card key={exercise.id}>
                            <div className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-teal-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-900">
                                      {exercise.name}
                                    </h4>
                                    <div className="flex items-center space-x-3 mt-1">
                                      <span className="text-sm text-slate-600">
                                        {exercise.difficulty}
                                      </span>
                                      <span className="text-sm text-slate-600">
                                        {exercise.sets} sets × {exercise.reps}{" "}
                                        reps
                                      </span>
                                      <span className="text-sm text-slate-600">
                                        {exercise.frequency}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-slate-900 mb-1">
                                    {exercise.progress}%
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    Progress
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                  {exercise.lastCompleted && (
                                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                      <span>
                                        Last completed:{" "}
                                        {new Date(
                                          exercise.lastCompleted
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {exercise.endDate && new Date(exercise.endDate) < new Date() ? (
                                       <div className="flex items-center space-x-2 text-sm text-green-600">
                                          <CheckCircle className="w-4 h-4" />
                                          <span className="font-medium">All sessions completed</span>
                                      </div>
                                  ) : exercise.endDate ? (
                                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                                          <Calendar className="w-4 h-4 text-blue-600" />
                                          <span className="text-blue-700">
                                              Ends: {new Date(exercise.endDate).toLocaleDateString()}
                                          </span>
                                      </div>
                                  ) : null}
                                </div>
                                <div className="flex items-center space-x-3">
                                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                                    Edit
                                  </button>
                                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200">
                                    View Results
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <div>
                  </div>
                )} {activeTab === "history" && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-6">
                      Session History
                    </h3>
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600">
                                No sessions recorded yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((session) => (
                                <Card key={session.id}>
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900">{session.exercise_name}</h4>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(session.created_at).toLocaleDateString()} • {new Date(session.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Duration</p>
                                                <p className="font-medium text-slate-900">{Math.round((session.duration || 0) / 60)}m</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Status</p>
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                    session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                  </div>
                )}

                {activeTab === "notes" && (
                  <DoctorNotes
                    patientId={patientId}
                    patientName={patient.name}
                    notes={[]} // Pass actual notes here
                    isDoctor={true}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={handleAddExercise}
                className="p-4 text-left border border-slate-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors duration-200"
              >
                <Target className="w-6 h-6 text-teal-600 mb-2" />
                <h4 className="font-medium text-slate-900">Assign Exercise</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Add new exercise to program
                </p>
              </button>
              <button
                onClick={handleSendMessage}
                className="p-4 text-left border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
              >
                <MessageSquare className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-slate-900">Send Message</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Communicate with patient
                </p>
              </button>
              <button className="p-4 text-left border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200">
                <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-slate-900">
                  Schedule Follow-up
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Book next appointment
                </p>
              </button>
              <button className="p-4 text-left border border-slate-200 rounded-lg hover:border-coral-300 hover:bg-coral-50 transition-colors duration-200">
                <Download className="w-6 h-6 text-coral-600 mb-2" />
                <h4 className="font-medium text-slate-900">Export Report</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Download patient summary
                </p>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
