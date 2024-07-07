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
      className={cn("p-10 bg-[#b8b9c6] rounded-lg border-4 border-white shadow-xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between items-center py-2 px-4 bg-gray-100 rounded-t-lg",
        caption_label: "text-lg font-semibold text-black",
        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-75 text-gray-600"
        ),
        nav_button_previous: "ml-2",
        nav_button_next: "mr-2",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "rounded-md w-10 h-10 font-medium text-gray-700",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative text-gray-900 rounded-lg transition duration-150",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full",
          "hover:bg-transparant"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-[#25547B] text-white",
        day_today: "bg-[#E60909] text-white",
        day_outside: "text-gray-600",
        day_disabled: "text-gray-400",
        day_range_middle: "bg-blue-200 text-blue-800",
        day_hidden: "invisible",
        ...classNames,
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
