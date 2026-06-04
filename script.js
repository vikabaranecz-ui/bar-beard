const tabs = document.querySelectorAll(".service-tabs button");
const cards = document.querySelectorAll(".service-card");
const serviceSelect = document.querySelector("#service-select");
const bookingTotal = document.querySelector("#booking-total");

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
}

serviceSelect.addEventListener("change", updateBookingSummary);
updateBookingSummary();
