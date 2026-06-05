const tabs = document.querySelectorAll(".service-tabs button");
const cards = document.querySelectorAll(".service-card");
const serviceSelect = document.querySelector("#service-select");
const bookingTotal = document.querySelector("#booking-total");
const bookingMoment = document.querySelector("#booking-moment");
const calendarGrid = document.querySelector("#calendar-grid");
const timeSlots = document.querySelector("#time-slots");
const bookingDate = document.querySelector("#booking-date");
const bookingTime = document.querySelector("#booking-time");

const dayLabels = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
const monthFormatter = new Intl.DateTimeFormat("nl-BE", { month: "short" });
const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
  timeZone: "Europe/Brussels",
  weekday: "long",
  day: "numeric",
  month: "long",
});
const brusselsDateParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Brussels",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const schedule = {
  weekday: ["09:30", "10:30", "11:30", "13:00", "14:00", "15:00", "16:30", "18:00"],
  saturday: ["10:00", "11:00", "12:00", "13:30", "14:30", "15:30", "16:30"],
  sunday: ["11:00", "12:00", "13:00", "14:00"],
};

let selectedDate = "";
let selectedTime = "";

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    tabs.forEach((item) => item.classList.toggle("active", item === tab));
    cards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

function updateBookingSummary() {
  const [price, minutes] = serviceSelect.value.split("|");
  bookingTotal.textContent = `${price} euro · ${minutes} min`;

  if (!selectedDate || !selectedTime) {
    bookingMoment.textContent = "Kies een datum en uur";
    return;
  }

  const date = new Date(`${selectedDate}T12:00:00`);
  bookingMoment.textContent = `${dateFormatter.format(date)} om ${selectedTime}`;
}

serviceSelect.addEventListener("change", updateBookingSummary);

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBrusselsToday() {
  const parts = Object.fromEntries(
    brusselsDateParts.formatToParts(new Date()).map((part) => [part.type, part.value]),
  );
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

function getSlotsForDate(date) {
  if (date.getDay() === 0) return schedule.sunday;
  if (date.getDay() === 6) return schedule.saturday;
  return schedule.weekday;
}

function renderTimeSlots(date) {
  timeSlots.innerHTML = "";
  const slots = getSlotsForDate(date);

  if (!slots.includes(selectedTime)) {
    selectedTime = slots[0];
  }

  slots.forEach((slot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-button";
    button.textContent = slot;
    button.setAttribute("aria-pressed", String(slot === selectedTime));

    if (slot === selectedTime) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => {
      selectedTime = slot;
      bookingTime.value = slot;
      renderTimeSlots(date);
      updateBookingSummary();
    });

    timeSlots.append(button);
  });

  bookingTime.value = selectedTime;
}

function selectDate(date) {
  selectedDate = toIsoDate(date);
  bookingDate.value = selectedDate;
  selectedTime = "";
  renderCalendar();
  renderTimeSlots(date);
  updateBookingSummary();
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const today = getBrusselsToday();
  today.setHours(0, 0, 0, 0);

  const firstDayOffset = (today.getDay() + 6) % 7;
  for (let i = 0; i < firstDayOffset; i += 1) {
    const placeholder = document.createElement("span");
    placeholder.className = "date-button is-placeholder";
    calendarGrid.append(placeholder);
  }

  for (let i = 0; i < 14; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const iso = toIsoDate(date);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-button";
    button.setAttribute("aria-pressed", String(iso === selectedDate));
    button.setAttribute("aria-label", dateFormatter.format(date));
    button.innerHTML = `<span>${dayLabels[date.getDay()]} · ${monthFormatter.format(date)}</span><strong>${date.getDate()}</strong>`;

    if (iso === selectedDate) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => selectDate(date));
    calendarGrid.append(button);
  }
}

function initBooking() {
  const firstDate = getBrusselsToday();
  firstDate.setHours(0, 0, 0, 0);
  selectedDate = toIsoDate(firstDate);
  bookingDate.value = selectedDate;
  selectedTime = getSlotsForDate(firstDate)[0];
  bookingTime.value = selectedTime;
  renderCalendar();
  renderTimeSlots(firstDate);
  updateBookingSummary();
}

initBooking();
