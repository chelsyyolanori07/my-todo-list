"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

export function CalendarDemo({ task, setDeadline }) {
  const [selectedDate, setSelectedDate] = React.useState(task?.deadline ? new Date(task.deadline) : null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDeadline(task.id, date);
  };
  
  return (
    <Calendar
      mode="single"
      className="rounded-md border"
      selected={selectedDate}
      onSelect={handleDateChange}
    />
  );
}
