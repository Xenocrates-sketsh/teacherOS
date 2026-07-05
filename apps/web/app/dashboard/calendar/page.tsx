"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: teacherSchools } = await supabase
        .from("teacher_schools")
        .select("school_id")
        .eq("teacher_id", user.id);

      const { data: classesList } = await supabase
        .from("classes")
        .select("id, name, school_id")
        .in(
          "school_id",
          teacherSchools?.map((ts) => ts.school_id) || []
        );

      setClasses(classesList || []);

      const { data: eventsList } = await supabase
        .from("events")
        .select("*")
        .in(
          "class_id",
          classesList?.map((c) => c.id) || []
        );

      setEvents(eventsList || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      description: newEvent.description || null,
      event_type: newEvent.event_type,
      start_time: newEvent.start_time,
      end_time: newEvent.end_time || null,
      class_id: newEvent.class_id,
      created_by: user.id,
    });

    if (!error) {
      setShowCreateModal(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "other",
        start_time: "",
        end_time: "",
        class_id: "",
      });
      // Refetch events
      const { data: eventsList } = await supabase
        .from("events")
        .select("*")
        .in(
          "class_id",
          classes.map((c) => c.id)
        );
      setEvents(eventsList || []);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="class">Class</option>
              <option value="homework_due">Homework Due</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={newEvent.class_id}
              onChange={(e) =>
                setNewEvent({ ...newEvent, class_id: e.target.value })
              }
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
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
