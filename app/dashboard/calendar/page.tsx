"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import { getTeacherSchools, getClasses, getEvents, saveEvent } from "@/lib/store";
import Calendar from "@/app/components/calendar/Calendar";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Modal from "@/app/components/ui/Modal";
import { Plus } from "lucide-react";

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  event_type: string;
  description?: string;
  class_id: string;
}

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "other" as const,
    start_time: "",
    end_time: "",
    class_id: "",
  });

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const teacherSchools = getTeacherSchools(session.id);
    const schoolIds = teacherSchools.map((ts) => ts.school_id);
    const classesList = getClasses().filter((c) => schoolIds.includes(c.school_id));
    setClasses(classesList);

    const classIds = classesList.map((c) => c.id);
    const allEvents = classIds.length > 0
      ? getEvents().filter((e) => e.class_id && classIds.includes(e.class_id))
      : [];

    setEvents(allEvents);
    setLoading(false);
  }, []);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!session) return;

    const evt = saveEvent({
      title: newEvent.title,
      description: newEvent.description || null,
      event_type: newEvent.event_type,
      start_time: newEvent.start_time,
      end_time: newEvent.end_time || null,
      class_id: newEvent.class_id,
      workspace_id: null,
      created_by: session.id,
    });

    setShowCreateModal(false);
    setNewEvent({
      title: "",
      description: "",
      event_type: "other",
      start_time: "",
      end_time: "",
      class_id: "",
    });

    const classIds = classes.map((c) => c.id);
    setEvents(getEvents().filter((e) => e.class_id && classIds.includes(e.class_id)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#7b6b8d]">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f8f4ff]">Calendar</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <Calendar
        events={events}
        onEventClick={(e) => setSelectedEvent(e as any)}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Event"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Title"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent({ ...newEvent, title: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-1">
              Type
            </label>
            <select
              value={newEvent.event_type}
              onChange={(e) =>
                setNewEvent({
                  ...newEvent,
                  event_type: e.target.value as any,
                })
              }
              className="w-full rounded-lg border border-[rgba(212,175,55,0.15)] px-3 py-2 text-sm focus:ring-2 focus:ring-gold-500"
            >
              <option value="class">Class</option>
              <option value="homework_due">Homework Due</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#cbd5e1] mb-1">
              Class
            </label>
            <select
              value={newEvent.class_id}
              onChange={(e) =>
                setNewEvent({ ...newEvent, class_id: e.target.value })
              }
              required
              className="w-full rounded-lg border border-[rgba(212,175,55,0.15)] px-3 py-2 text-sm focus:ring-2 focus:ring-gold-500"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Start Time"
            type="datetime-local"
            value={newEvent.start_time}
            onChange={(e) =>
              setNewEvent({ ...newEvent, start_time: e.target.value })
            }
            required
          />
          <Input
            label="End Time (optional)"
            type="datetime-local"
            value={newEvent.end_time}
            onChange={(e) =>
              setNewEvent({ ...newEvent, end_time: e.target.value })
            }
          />
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth>
              Create Event
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
      >
        {selectedEvent && (
          <div className="space-y-3">
            <p className="text-sm text-[#9d8ab5]">
              <strong>Type:</strong> {selectedEvent.event_type}
            </p>
            <p className="text-sm text-[#9d8ab5]">
              <strong>Start:</strong>{" "}
              {new Date(selectedEvent.start_time).toLocaleString()}
            </p>
            {selectedEvent.end_time && (
              <p className="text-sm text-[#9d8ab5]">
                <strong>End:</strong>{" "}
                {new Date(selectedEvent.end_time).toLocaleString()}
              </p>
            )}
            {selectedEvent.description && (
              <p className="text-sm text-[#9d8ab5]">
                <strong>Description:</strong> {selectedEvent.description}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
