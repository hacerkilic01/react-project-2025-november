/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

import type { ScheduleInstance } from "../../models/schedule";
import type { UserInstance } from "../../models/user";

import FullCalendar from "@fullcalendar/react";

import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";

import type { EventInput } from "@fullcalendar/core/index.js";

import "../profileCalendar.scss";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

type CalendarContainerProps = {
  schedule: ScheduleInstance;
  auth: UserInstance;
};

// Shift ve staff bazlı renk üretme fonksiyonu
const generateColor = (shiftId: string, staffId: string) => {
  const hash = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = str.charCodeAt(i) + ((h << 5) - h);
    }
    return h;
  };

  const combined = `${shiftId}-${staffId}`;
  const hue = Math.abs(hash(combined)) % 360;
  return `hsl(${hue}, 65%, 55%)`;
};

const CalendarContainer = ({ schedule, auth }: CalendarContainerProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [initialDate, setInitialDate] = useState<Date>(
    dayjs(schedule?.scheduleStartDate).toDate()
  );

  const getPlugins = () => {
    const plugins = [dayGridPlugin];
    plugins.push(interactionPlugin);
    return plugins;
  };

  const getShiftById = (id: string) => {
    return schedule?.shifts?.find((shift: { id: string }) => id === shift.id);
  };

  const getAssignmentById = (id: string) => {
    return schedule?.assignments?.find((assign) => id === assign.id);
  };

  const getStaffById = (id: string) => {
    return schedule?.staffs?.find((staff: { id: string }) => id === staff.id);
  };

  const validDates = () => {
    const dates = [];
    let currentDate = dayjs(schedule.scheduleStartDate);
    while (
      currentDate.isBefore(schedule.scheduleEndDate) ||
      currentDate.isSame(schedule.scheduleEndDate)
    ) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return dates;
  };

  const getDatesBetween = (startDate: string, endDate: string) => {
    const dates = [];
    const start = dayjs(startDate, "DD.MM.YYYY").toDate();
    const end = dayjs(endDate, "DD.MM.YYYY").toDate();
    const current = new Date(start);

    while (current <= end) {
      dates.push(dayjs(current).format("DD-MM-YYYY"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateStaffBasedCalendar = () => {
    if (!selectedStaffId) return;

    const works: EventInput[] = [];

    const filteredAssignments =
      schedule?.assignments?.filter(
        (assign) => assign.staffId === selectedStaffId
      ) || [];

    for (let i = 0; i < filteredAssignments.length; i++) {
      const assignment = filteredAssignments[i];
      const assignmentDate = dayjs
        .utc(assignment?.shiftStart)
        .format("YYYY-MM-DD");
      const isValidDate = validDates().includes(assignmentDate);
      const shift = getShiftById(assignment?.shiftId);

      const eventColor = generateColor(assignment.shiftId, assignment.staffId);

      const work = {
        id: assignment?.id,
        title: shift?.name || "Unknown Shift",
        duration: "01:00",
        date: assignmentDate,
        start: assignment?.shiftStart,
        end: assignment?.shiftEnd,
        staffId: assignment?.staffId,
        shiftId: assignment?.shiftId,
        backgroundColor: eventColor,
        borderColor: eventColor,
        textColor: "#ffffff",
        className: `event ${
          getAssignmentById(assignment?.id)?.isUpdated ? "highlight" : ""
        } ${!isValidDate ? "invalid-date" : ""}`,
        extendedProps: {
          assignment: assignment,
          shift: shift,
          color: eventColor,
        },
      };
      works.push(work);
    }

    const offDays = schedule?.staffs?.find(
      (staff) => staff.id === selectedStaffId
    )?.offDays;
    const dates = getDatesBetween(
      dayjs(schedule.scheduleStartDate).format("DD.MM.YYYY"),
      dayjs(schedule.scheduleEndDate).format("DD.MM.YYYY")
    );
    let highlightedDates: string[] = [];

    dates.forEach((date) => {
      const transformedDate = dayjs(date, "DD-MM-YYYY").format("DD.MM.YYYY");
      if (offDays?.includes(transformedDate)) highlightedDates.push(date);
    });

    setHighlightedDates(highlightedDates);
    setEvents(works);
  };

  useEffect(() => {
    if (schedule?.staffs && schedule.staffs.length > 0) {
      const firstStaffId = schedule.staffs[0].id;
      setSelectedStaffId(firstStaffId);
    }
  }, [schedule]);

  useEffect(() => {
    if (selectedStaffId) {
      generateStaffBasedCalendar();
    }
  }, [selectedStaffId, schedule]);

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    const assignment = event.extendedProps.assignment;
    const shift = event.extendedProps.shift;
    const staff = getStaffById(event.extendedProps.assignment.staffId);

    setSelectedEvent({
      staffName: staff?.name || "Unknown Staff",
      shiftName: shift?.name || "Unknown Shift",
      date: dayjs(assignment.shiftStart).format("DD.MM.YYYY"),
      startTime: dayjs(assignment.shiftStart).format("HH:mm"),
      endTime: dayjs(assignment.shiftEnd).format("HH:mm"),
    });
    setShowPopup(true);
  };

  const RenderEventContent = ({ eventInfo }: any) => {
    const color = eventInfo.event.extendedProps.color;
    return (
      <div
        className="event-content"
        style={{
          backgroundColor: color,
          borderColor: color,
          color: "#ffffff",
          padding: "2px 4px",
          borderRadius: "3px",
          border: `1px solid ${color}`,
        }}
      >
        <p style={{ margin: 0, fontSize: "12px" }}>{eventInfo.event.title}</p>
      </div>
    );
  };

  return (
    <div className="calendar-section">
      <div className="calendar-wrapper">
        <div className="staff-list">
          {schedule?.staffs?.map((staff: any) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaffId(staff.id)}
              className={`staff ${
                staff.id === selectedStaffId ? "active" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
              >
                <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T480-440q67 0 131.5 16T736-378q30 15 47 43.5t17 62.5v112H160Zm320-400q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm160 228v92h80v-32q0-11-5-20t-15-14q-14-8-29.5-14.5T640-332Zm-240-21v53h160v-53q-20-4-40-5.5t-40-1.5q-20 0-40 1.5t-40 5.5ZM240-240h80v-92q-15 5-30.5 11.5T260-306q-10 5-15 14t-5 20v32Zm400 0H320h320ZM480-640Z" />
              </svg>
              <span>{staff.name}</span>
            </div>
          ))}
        </div>
        <FullCalendar
          ref={calendarRef}
          locale={auth.language}
          plugins={getPlugins()}
          contentHeight={400}
          handleWindowResize={true}
          selectable={true}
          editable={true}
          eventOverlap={true}
          eventDurationEditable={false}
          initialView="dayGridMonth"
          initialDate={initialDate}
          events={events}
          firstDay={1}
          eventDisplay="block"
          dayMaxEventRows={4}
          fixedWeekCount={true}
          showNonCurrentDates={true}
          eventClick={handleEventClick}
          eventContent={(eventInfo: any) => (
            <RenderEventContent eventInfo={eventInfo} />
          )}
          datesSet={(info: any) => {
            const prevButton = document.querySelector(
              ".fc-prev-button"
            ) as HTMLButtonElement;
            const nextButton = document.querySelector(
              ".fc-next-button"
            ) as HTMLButtonElement;

            if (
              calendarRef?.current?.getApi().getDate() &&
              !dayjs(schedule?.scheduleStartDate).isSame(
                calendarRef?.current?.getApi().getDate()
              )
            )
              setInitialDate(calendarRef?.current?.getApi().getDate());

            const startDiff = dayjs(info.start)
              .utc()
              .diff(
                dayjs(schedule.scheduleStartDate).subtract(1, "day").utc(),
                "days"
              );
            const endDiff = dayjs(dayjs(schedule.scheduleEndDate)).diff(
              info.end,
              "days"
            );
            if (startDiff < 0 && startDiff > -35) prevButton.disabled = true;
            else prevButton.disabled = false;

            if (endDiff < 0 && endDiff > -32) nextButton.disabled = true;
            else nextButton.disabled = false;
          }}
          dayCellContent={({ date }) => {
            const found = validDates().includes(
              dayjs(date).format("YYYY-MM-DD")
            );
            const isHighlighted = highlightedDates.includes(
              dayjs(date).format("DD-MM-YYYY")
            );

            return (
              <div
                className={`${found ? "" : "date-range-disabled"} ${
                  isHighlighted ? "highlighted-date-orange" : ""
                } highlightedPair`}
              >
                {dayjs(date).date()}
              </div>
            );
          }}
        />
      </div>

      {/* Event Detail Popup */}
      {showPopup && selectedEvent && (
        <div
          className="event-popup-overlay"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="event-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popup-header">
              <h3>Etkinlik Detayları</h3>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                ×
              </button>
            </div>
            <div className="popup-body">
              <div className="popup-row">
                <strong>Personel:</strong>
                <span>{selectedEvent.staffName}</span>
              </div>
              <div className="popup-row">
                <strong>Vardiya:</strong>
                <span>{selectedEvent.shiftName}</span>
              </div>
              <div className="popup-row">
                <strong>Tarih:</strong>
                <span>{selectedEvent.date}</span>
              </div>
              <div className="popup-row">
                <strong>Başlangıç Saati:</strong>
                <span>{selectedEvent.startTime}</span>
              </div>
              <div className="popup-row">
                <strong>Bitiş Saati:</strong>
                <span>{selectedEvent.endTime}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarContainer;
