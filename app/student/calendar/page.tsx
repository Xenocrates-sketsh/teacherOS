"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { getStudentClasses, getEvents } from "@/lib/store";
import Calendar from "@/app/components/calendar/Calendar";
import Modal from "@/app/components/ui/Modal";

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  event_type: string;
  description?: string;
  class_id: string;
}

export default function StudentCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const enrollments = getStudentClasses(session.id);
    const classIds = enrollments.map((e) => e.class_id);

    const allEvents = classIds.length > 0
      ? getEvents().filter((e) => e.class_id && classIds.includes(e.class_id))
      : [];

    setEvents(allEvents);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>

      <Calendar
        events={events}
        onEventClick={(e) => setSelectedEvent(e as any)}
      />

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
      >
        {selectedEvent && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {selectedEvent.event_type}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Start:</strong>{" "}
              {new Date(selectedEvent.start_time).toLocaleString()}
            </p>
            {selectedEvent.end_time && (
              <p className="text-sm text-gray-600">
                <strong>End:</strong>{" "}
                {new Date(selectedEvent.end_time).toLocaleString()}
              </p>
            )}
            {selectedEvent.description && (
              <p className="text-sm text-gray-600">
                <strong>Description:</strong> {selectedEvent.description}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
