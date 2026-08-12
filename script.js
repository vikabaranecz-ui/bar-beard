const tabs = document.querySelectorAll(".service-tabs button");
const cards = document.querySelectorAll(".service-card");
const serviceButtons = document.querySelectorAll(".booking-service button");
const bookingTotal = document.querySelector("#booking-total");
const bookingMoment = document.querySelector("#booking-moment");
const calendarGrid = document.querySelector("#calendar-grid");
const timeSlots = document.querySelector("#time-slots");
const bookingConfirmTrigger = document.querySelector("#booking-confirm-trigger");
const bookingConfirmation = document.querySelector("#booking-confirmation");
const confirmationClose = document.querySelector(".confirmation-close");
const confirmationService = document.querySelector("#confirmation-service");
const confirmationMoment = document.querySelector("#confirmation-moment");
const confirmationTotal = document.querySelector("#confirmation-total");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

const dayLabels = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];
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
let selectedService = "50|55";
let selectedServiceTitle = "Herenkapsel + baard";

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
  const [price, minutes] = selectedService.split("|");
  bookingTotal.textContent = `${price} euro · ${minutes} min`;

  if (!selectedDate || !selectedTime) {
    bookingMoment.textContent = "Kies een datum en uur";
    return;
  }

  const date = new Date(`${selectedDate}T12:00:00`);
  bookingMoment.textContent = `${dateFormatter.format(date)} om ${selectedTime}`;
}

serviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedService = button.dataset.service;
    selectedServiceTitle = button.dataset.title;
    serviceButtons.forEach((item) => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    updateBookingSummary();
  });
});

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
      renderTimeSlots(date);
      updateBookingSummary();
    });

    timeSlots.append(button);
  });
}

function selectDate(date) {
  selectedDate = toIsoDate(date);
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
    button.innerHTML = `<span>${dayLabels[date.getDay()]}</span><strong>${date.getDate()}</strong>`;

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
  selectedTime = getSlotsForDate(firstDate)[0];
  serviceButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-selected")));
  });
  renderCalendar();
  renderTimeSlots(firstDate);
  updateBookingSummary();
}

initBooking();

function openBookingConfirmation() {
  confirmationService.textContent = selectedServiceTitle;
  confirmationMoment.textContent = bookingMoment.textContent;
  confirmationTotal.textContent = bookingTotal.textContent;
  bookingConfirmation.hidden = false;
  document.body.classList.add("has-confirmation-open");
  confirmationClose.focus();
}

function closeBookingConfirmation() {
  bookingConfirmation.hidden = true;
  document.body.classList.remove("has-confirmation-open");
  bookingConfirmTrigger.focus();
}

bookingConfirmTrigger.addEventListener("click", openBookingConfirmation);
confirmationClose.addEventListener("click", closeBookingConfirmation);
bookingConfirmation.addEventListener("click", (event) => {
  if (event.target === bookingConfirmation) {
    closeBookingConfirmation();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !bookingConfirmation.hidden) {
    closeBookingConfirmation();
  }
});

function initRevealMotion() {
  const revealItems = document.querySelectorAll(
    ".promise, .booking, .section, .packages, .contact-section",
  );
  const staggerItems = document.querySelectorAll(
    ".works-grid, .service-grid, .packages, .product-gallery, .process-list",
  );

  revealItems.forEach((item) => item.classList.add("reveal"));
  staggerItems.forEach((item) => item.classList.add("reveal-stagger"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    [...revealItems, ...staggerItems].forEach((item) => revealObserver.observe(item));
  } else {
    [...revealItems, ...staggerItems].forEach((item) => item.classList.add("is-visible"));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRevealMotion, { once: true });
} else {
  initRevealMotion();
}

function closeMobileMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  const willOpen = mobileMenu.hidden;
  mobileMenu.hidden = !willOpen;
  menuToggle.setAttribute("aria-expanded", String(willOpen));
}

menuToggle.addEventListener("click", toggleMobileMenu);
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});
document.addEventListener("click", (event) => {
  if (!mobileMenu.hidden && !event.target.closest(".site-header")) {
    closeMobileMenu();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileMenu.hidden) {
    closeMobileMenu();
    menuToggle.focus();
  }
});
