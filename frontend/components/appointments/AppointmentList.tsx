
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Video, Calendar, Clock, MapPin, MoreVertical, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/cards/Card";

interface Appointment {
  id: string;
  appointment_mode: "virtual" | "in_clinic";
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  google_meet_link?: string;
  doctors?: { full_name: string };
  patients?: { full_name: string };
}

interface AppointmentListProps {
  patientId?: string;
  userRole: "doctor" | "patient";
}

export const AppointmentList = ({ patientId, userRole }: AppointmentListProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = patientId ? { patient_id: patientId } : {};
      const res = await api.get("/appointments", { params });
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
        await api.delete(`/appointments/${id}`);
        fetchAppointments();
    } catch (err) {
        alert("Failed to cancel appointment");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">No appointments scheduled.</p>
      </div>
    );
  }

  const upcoming = appointments.filter(a => new Date(`${a.appointment_date}T${a.start_time}`) >= new Date());
  const past = appointments.filter(a => new Date(`${a.appointment_date}T${a.start_time}`) < new Date());

  const renderList = (list: Appointment[], title: string) => {
      if (list.length === 0) return null;
      return (
          <div className="mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
              <div className="space-y-4">
                  {list.map((appt) => (
                    <Card key={appt.id}>
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        appt.appointment_mode === 'virtual' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                        {appt.appointment_mode === 'virtual' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-medium text-slate-900">
                                                {format(new Date(appt.appointment_date), "MMMM d, yyyy")}
                                            </h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                appt.appointment_mode === 'virtual' ? 'bg-teal-50 text-teal-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {appt.appointment_mode === 'virtual' ? 'Virtual' : 'In Clinic'}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500 mt-1 space-x-3">
                                            <span className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {appt.start_time.slice(0, 5)} - {appt.end_time.slice(0, 5)}
                                            </span>
                                            {userRole === 'patient' && appt.doctors && (
                                                <span>Dr. {appt.doctors.full_name}</span>
                                            )}
                                            {userRole === 'doctor' && appt.patients && (
                                               <span>Patient: {appt.patients.full_name}</span>
                                            )}
                                        </div>
                                        {appt.notes && (
                                            <p className="text-sm text-slate-600 mt-1 italic">"{appt.notes}"</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                    {appt.appointment_mode === 'virtual' && appt.google_meet_link && (
                                        <a
                                            href={appt.google_meet_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 transition-colors"
                                        >
                                            <Video className="w-3 h-3 mr-2" />
                                            Join Meet
                                        </a>
                                    )}
                                    
                                    {userRole === 'doctor' && (
                                        <button 
                                            onClick={() => handleCancel(appt.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Cancel Appointment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {appt.appointment_mode === 'virtual' && appt.google_meet_link && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-slate-500 font-medium">Meet Link:</span>
                                        <code className="flex-1 px-2 py-1 bg-slate-50 rounded text-xs text-slate-700 select-all truncate">
                                            {appt.google_meet_link}
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(appt.google_meet_link!);
                                                alert("Link copied to clipboard!");
                                            }}
                                            className="px-2 py-1 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded font-medium transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div>
        {renderList(upcoming, "Upcoming Appointments")}
        {renderList(past, "Past Appointments")}
    </div>
  );
};
