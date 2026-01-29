
"use client";

import { useState } from "react";
import { X, Calendar, Clock, Video, MapPin, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface AssignAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess: () => void;
}

export const AssignAppointmentModal = ({
  isOpen,
  onClose,
  patientId,
  onSuccess,
}: AssignAppointmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"virtual" | "in_clinic">("virtual");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/appointments", {
        patient_id: patientId,
        appointment_mode: mode,
        appointment_date: date,
        start_time: startTime,
        end_time: endTime,
        notes: notes,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Failed to create appointment:", err);
      setError(err.response?.data?.detail || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setDate("");
    setStartTime("");
    setEndTime("");
    setNotes("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">
                  Schedule Appointment
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Mode Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMode("virtual")}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        mode === "virtual"
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 hover:border-teal-200 text-slate-600"
                      }`}
                    >
                      <Video className="w-6 h-6 mb-2" />
                      <span className="font-medium">Virtual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("in_clinic")}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        mode === "in_clinic"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-blue-200 text-slate-600"
                      }`}
                    >
                      <MapPin className="w-6 h-6 mb-2" />
                      <span className="font-medium">In Clinic</span>
                    </button>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Start Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                            type="time"
                            required
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            End Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                            type="time"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                        </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any instructions or notes..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                      {error}
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  form="appointment-form"
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm Appointment
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
