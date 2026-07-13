const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const body = document.body;

function closeMenu() {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  body.classList.remove("menu-open");
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
    body.classList.toggle("menu-open", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

const filterButtons = document.querySelectorAll("[data-filter]");
const projects = document.querySelectorAll("[data-category]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));

    projects.forEach((project) => {
      const categories = project.dataset.category.split(" ");
      project.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const estimateForm = document.querySelector(".estimate-form");
const humanQuestion = document.querySelector("[data-human-question]");
const humanAnswerInput = document.querySelector("[data-human-answer]");
const humanError = document.querySelector("[data-human-error]");
const honeypotInput = document.querySelector("[data-honeypot]");
const formStatus = document.querySelector("[data-form-status]");
const formSubmitButton = document.querySelector("[data-form-submit]");
const formSubmitText = document.querySelector("[data-form-submit-text]");
let humanAnswer = 7;
let submitResetTimer;

function setHumanChallenge() {
  if (!humanQuestion || !humanAnswerInput) return;

  const firstNumber = Math.floor(Math.random() * 7) + 3;
  const secondNumber = Math.floor(Math.random() * 6) + 2;
  humanAnswer = firstNumber + secondNumber;
  humanQuestion.textContent = `What is ${firstNumber} + ${secondNumber}?`;
  humanAnswerInput.value = "";
  humanAnswerInput.removeAttribute("aria-invalid");

  if (humanError) humanError.hidden = true;
}

function hideFormStatus() {
  if (formStatus) formStatus.hidden = true;
  formStatus?.classList.remove("form-status--success", "form-status--error");
}

function setSubmitState(state) {
  window.clearTimeout(submitResetTimer);

  if (formSubmitButton) {
    formSubmitButton.classList.toggle("is-confirmed", state === "sent");
    formSubmitButton.disabled = state === "sending";
  }

  if (!formSubmitText) return;

  if (state === "sending") {
    formSubmitText.textContent = "Sending Request...";
  } else if (state === "sent") {
    formSubmitText.textContent = "Request Sent";
    submitResetTimer = window.setTimeout(() => setSubmitState("idle"), 3000);
  } else {
    formSubmitText.textContent = "Send Estimate Request";
  }
}

function showFormStatus(type, title, message) {
  if (formStatus) {
    const titleElement = formStatus.querySelector("strong");
    const messageElement = formStatus.querySelector("span");

    formStatus.classList.remove("form-status--success", "form-status--error");
    formStatus.classList.add(`form-status--${type}`);
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    formStatus.hidden = false;

    requestAnimationFrame(() => {
      formStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
}

if (estimateForm && humanAnswerInput) {
  setHumanChallenge();

  estimateForm.addEventListener("input", () => {
    hideFormStatus();
    setSubmitState("idle");
  });

  humanAnswerInput.addEventListener("input", () => {
    humanAnswerInput.removeAttribute("aria-invalid");
    humanAnswerInput.setCustomValidity("");
    if (humanError) humanError.hidden = true;
  });

  estimateForm.addEventListener("submit", (event) => {
    hideFormStatus();

    if (honeypotInput && honeypotInput.value.trim() !== "") {
      event.preventDefault();
      return;
    }

    const providedAnswer = humanAnswerInput.value.trim();

    if (providedAnswer !== String(humanAnswer)) {
      event.preventDefault();
      humanAnswerInput.setAttribute("aria-invalid", "true");
      humanAnswerInput.setCustomValidity("Please answer the verification question correctly.");
      if (humanError) humanError.hidden = false;
      humanAnswerInput.reportValidity();
      humanAnswerInput.focus();
    } else {
      humanAnswerInput.setCustomValidity("");
      setSubmitState("sending");
      showFormStatus(
        "success",
        "Sending your estimate request...",
        "Please wait while Netlify receives your message."
      );
    }
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
