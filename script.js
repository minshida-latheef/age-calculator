"use strict";

// ---------- Get HTML elements ----------
const form = document.getElementById("age-form");
const birthDateInput = document.getElementById("birth-date");
const errorMessage = document.getElementById("date-error");
const results = document.getElementById("results");

const yearsOutput = document.getElementById("years");
const monthsOutput = document.getElementById("months");
const daysOutput = document.getElementById("days");

const totalMonthsOutput = document.getElementById("total-months");
const totalWeeksOutput = document.getElementById("total-weeks");
const totalDaysOutput = document.getElementById("total-days");
const totalHoursOutput = document.getElementById("total-hours");

const ageMessage = document.getElementById("age-message");
const birthdayStatus = document.getElementById("birthday-status");

// ---------- Date utilities ----------

// Create a local date using year, month, and day.
// JavaScript months start at 0 (January).
function makeDate(year, month, day) {
    return new Date(year, month - 1, day);
}

// Convert a Date into a consistent YYYY-MM-DD string.
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Parse a date input without UTC/time-zone conversion.
function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = makeDate(year, month, day);

    // Reject impossible dates such as February 30.
    if (
        date.getFullYear() !== year ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}

// Return a date with the day limited to the target month's length.
// This correctly handles dates such as February 29.
function addMonthsClamped(date, amount) {
    const targetIndex =
        date.getFullYear() * 12 + date.getMonth() + amount;

    const year = Math.floor(targetIndex / 12);
    const monthIndex = ((targetIndex % 12) + 12) % 12;

    const lastDay = new Date(
        year,
        monthIndex + 1,
        0
    ).getDate();

    return new Date(
        year,
        monthIndex,
        Math.min(date.getDate(), lastDay)
    );
}

// Compare dates by calendar day, ignoring the time.
function compareDates(first, second) {
    const a = first.getFullYear() * 10000
        + (first.getMonth() + 1) * 100
        + first.getDate();

    const b = second.getFullYear() * 10000
        + (second.getMonth() + 1) * 100
        + second.getDate();

    return Math.sign(a - b);
}

// Calculate the number of calendar days between two dates.
function differenceInDays(start, end) {
    const startUTC = Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
    );

    const endUTC = Date.UTC(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
    );

    return Math.round(
        (endUTC - startUTC) / (24 * 60 * 60 * 1000)
    );
}

// ---------- Calculate exact age ----------
function calculateAge(birthDate, today) {
    let years = today.getFullYear() - birthDate.getFullYear();

    let anniversary = addMonthsClamped(
        birthDate,
        years * 12
    );

    if (compareDates(anniversary, today) > 0) {
        years--;
        anniversary = addMonthsClamped(
            birthDate,
            years * 12
        );
    }

    // Count complete months since the last yearly anniversary.
    let months =
        (today.getFullYear() - anniversary.getFullYear()) * 12
        + today.getMonth()
        - anniversary.getMonth();

    let monthDate = addMonthsClamped(anniversary, months);

    if (compareDates(monthDate, today) > 0) {
        months--;
        monthDate = addMonthsClamped(anniversary, months);
    }

    const days = differenceInDays(monthDate, today);
    const totalDays = differenceInDays(birthDate, today);

    // Completed calendar months since birth.
    let totalMonths =
        (today.getFullYear() - birthDate.getFullYear()) * 12
        + today.getMonth()
        - birthDate.getMonth();

    const currentMonthDate = addMonthsClamped(
        birthDate,
        totalMonths
    );

    if (compareDates(currentMonthDate, today) > 0) {
        totalMonths--;
    }

    return {
        years,
        months,
        days,
        totalMonths,
        totalDays,
        totalWeeks: Math.floor(totalDays / 7),
        totalHours: totalDays * 24
    };
}

// ---------- Birthday status ----------
function getBirthdayStatus(birthDate, today) {
    const thisYearBirthday = addMonthsClamped(
        birthDate,
        (today.getFullYear() - birthDate.getFullYear()) * 12
    );

    if (compareDates(thisYearBirthday, today) === 0) {
        return "🎉 Happy Birthday! Enjoy your special day!";
    }

    let nextBirthday = addMonthsClamped(
        birthDate,
        (today.getFullYear() - birthDate.getFullYear() + 1) * 12
    );

    // If the birthday is later this year, use that date.
    if (compareDates(thisYearBirthday, today) > 0) {
        nextBirthday = thisYearBirthday;
    }

    const daysUntil = differenceInDays(today, nextBirthday);

    if (daysUntil === 1) {
        return "🎂 Your birthday is tomorrow!";
    }

    if (daysUntil <= 7) {
        return `🎈 Your birthday is coming up in ${daysUntil} days!`;
    }

    return `🎁 ${daysUntil} days until your next birthday!`;
}

// ---------- Display results ----------
function displayResults(age, birthDate, today) {
    yearsOutput.textContent = age.years.toLocaleString();
    monthsOutput.textContent = age.months.toLocaleString();
    daysOutput.textContent = age.days.toLocaleString();

    totalMonthsOutput.textContent =
        age.totalMonths.toLocaleString();

    totalWeeksOutput.textContent =
        age.totalWeeks.toLocaleString();

    totalDaysOutput.textContent =
        age.totalDays.toLocaleString();

    totalHoursOutput.textContent =
        age.totalHours.toLocaleString();

    ageMessage.textContent =
        age.years === 0
            ? "Every day is a new beginning. Keep growing! ✨"
            : "You are growing wonderfully! ✨";

    birthdayStatus.textContent =
        getBirthdayStatus(birthDate, today);

    results.hidden = false;
}

// ---------- Form validation and submission ----------
function updateMaximumDate() {
    birthDateInput.max = formatDate(new Date());
}

// Set today's date as the maximum selectable birth date.
updateMaximumDate();

form.addEventListener("submit", function (event) {
    event.preventDefault();

    errorMessage.textContent = "";
    results.hidden = true;

    const value = birthDateInput.value;

    if (!value) {
        errorMessage.textContent =
            "Please enter your date of birth.";
        birthDateInput.focus();
        return;
    }

    const birthDate = parseDate(value);

    if (!birthDate) {
        errorMessage.textContent =
            "Please enter a valid date.";
        birthDateInput.focus();
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (compareDates(birthDate, today) > 0) {
        errorMessage.textContent =
            "Your date of birth cannot be in the future.";
        birthDateInput.focus();
        return;
    }

    const age = calculateAge(birthDate, today);

    displayResults(age, birthDate, today);
});

// ---------- Reset the calculator ----------
form.addEventListener("reset", function () {
    // Run after the browser resets the input.
    setTimeout(function () {
        errorMessage.textContent = "";
        results.hidden = true;

        yearsOutput.textContent = "0";
        monthsOutput.textContent = "0";
        daysOutput.textContent = "0";

        totalMonthsOutput.textContent = "0";
        totalWeeksOutput.textContent = "0";
        totalDaysOutput.textContent = "0";
        totalHoursOutput.textContent = "0";

        ageMessage.textContent = "";
        birthdayStatus.textContent = "";

        updateMaximumDate();
    }, 0);
});

// Refresh the maximum date if the page remains open across midnight.
document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
        updateMaximumDate();
    }
});