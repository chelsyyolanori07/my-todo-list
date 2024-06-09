"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

export function CalendarDemo({ task, setDeadline, closeModal }) {
  const [selectedDate, setSelectedDate] = React.useState(task?.deadline ? new Date(task.deadline) : null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDeadline(task.id, date);
    closeModal();
  };

  const customDayClassNames = (date) => {
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const customClasses = [];

    if (isSelected) {
      customClasses.push("text-white"); 
    } else {
      customClasses.push("text-black"); 
    }

    if (task?.deadline) {
      const deadlineDate = new Date(task.deadline);
      if (date < new Date() && date > deadlineDate) {
        customClasses.push("bg-blue-500 text-white"); 
      }
    }

    return customClasses.join(" ");
  };
  
  return (
    <Calendar
      mode="single"
      className="rounded-md border"
      selected={selectedDate}
      onSelect={handleDateChange}
      dayClassName={customDayClassNames}
    />
  );
}
