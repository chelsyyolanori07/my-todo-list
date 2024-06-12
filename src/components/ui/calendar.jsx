import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      selected={selected}
      onSelect={onSelect}
      className={cn("p-4 bg-white rounded-lg shadow-md", className)} // Add rounded corners and shadow
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center py-2 px-4 bg-gray-100 rounded-t-lg",
        caption_label: "text-lg font-semibold text-gray-800", // Larger and bolder text for caption
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-75 hover:opacity-100 text-gray-600"
        ),
        nav_button_previous: "ml-2",
        nav_button_next: "mr-2",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "rounded-md w-10 h-10 font-medium text-gray-700", // Adjust width, height, and font weight
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative text-gray-900 rounded-lg hover:bg-gray-200 transition duration-150", // Smooth transition for hover effect
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full" // Rounded days for selected effect
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-[#67E6DC] text-black hover:bg-blue-300 focus:bg-blue-300", // Use blue shades for selected days
        day_today: "bg-[#4BCFFA] text-black", // Update today's date style
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle: "bg-blue-200 text-blue-800",
        day_hidden: "invisible",
        ...classNames,
      }}
      dayClassName={(date) => {
        const isSelected = date.toDateString() === selected?.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        return cn({
          "text-white": isSelected,
          "text-black": !isSelected && !isToday,
          "bg-blue-500": !isSelected && date < new Date() && date > selected,
          "bg-blue-300 text-blue-900": isToday && !isSelected, // Update today's date style
        });
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5 text-gray-600" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5 text-gray-600" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

