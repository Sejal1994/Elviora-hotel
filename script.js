// ELVIORA site functionality
document.addEventListener("DOMContentLoaded", function () {
    // Keep the homepage navbar scroll behavior, without errors on other pages.
    const navbar = document.querySelector(".navbar");
    const aboutSection = document.querySelector("#about");
    if (navbar && aboutSection) {
        function updateNavbar() {
            navbar.classList.toggle("scrolled", window.scrollY >= aboutSection.offsetTop - 90);
        }
        window.addEventListener("scroll", updateNavbar);
        updateNavbar();
    }

    const USERS_KEY = "elvioraUsers";
    const SESSION_KEY = "elvioraCurrentUser";
    const BOOKINGS_KEY = "elvioraBookings";

    const readJSON = (key, fallback) => {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch (error) { return fallback; }
    };
    const currentUser = () => localStorage.getItem(SESSION_KEY);
    const users = () => readJSON(USERS_KEY, []);
    const setMessage = (element, message, isError = false) => {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle("error", isError);
    };

    // Account page: create account / login tabs.
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showSignup = document.getElementById("showSignup");
    const showLogin = document.getElementById("showLogin");
    const heading = document.getElementById("accountHeading");
    const accountMessage = document.getElementById("accountMessage");
    const logoutButton = document.getElementById("logoutButton");

    function setAccountMode(mode) {
        if (!signupForm || !loginForm) return;
        const signingUp = mode === "signup";
        signupForm.hidden = !signingUp;
        loginForm.hidden = signingUp;
        showSignup?.classList.toggle("active", signingUp);
        showLogin?.classList.toggle("active", !signingUp);
        if (heading) heading.textContent = signingUp ? "Create Your Account" : "Login";
        setMessage(accountMessage, "");
    }
    showSignup?.addEventListener("click", () => setAccountMode("signup"));
    showLogin?.addEventListener("click", () => setAccountMode("login"));

    function continueToBooking() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    window.location.href =
        next === "booking"
            ? "book-now.html?step=details"
            : "index.html";
    }

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const name = document.getElementById("signupName").value.trim();
            const email = document.getElementById("signupEmail").value.trim().toLowerCase();
            const password = document.getElementById("signupPassword").value;
            const allUsers = users();

            if (allUsers.some(user => user.email === email)) {
                setMessage(accountMessage, "An account with this email already exists. Please log in.", true);
                setAccountMode("login");
                document.getElementById("loginEmail").value = email;
                return;
            }

            // Front-end demonstration only. Never store real passwords this way in a production site.
            allUsers.push({ name, email, password, createdAt: new Date().toISOString() });
            localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
            localStorage.setItem(SESSION_KEY, email);
            setMessage(accountMessage, "Account created successfully. Booking is now enabled.");
            continueToBooking();
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;
            const user = users().find(item => item.email === email && item.password === password);
            if (!user) {
                setMessage(accountMessage, "Email or password is incorrect. Please try again.", true);
                return;
            }
            localStorage.setItem(SESSION_KEY, email);
            setMessage(accountMessage, "Login successful. Booking is now enabled.");
            continueToBooking();
        });
    }

    if (logoutButton) {
        logoutButton.hidden = !currentUser();
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem(SESSION_KEY);
            setMessage(accountMessage, "You have logged out.");
            logoutButton.hidden = true;
        });
    }
    if (signupForm && currentUser()) {
        setMessage(accountMessage, "You are logged in. You can continue booking or log out below.");
        if (logoutButton) logoutButton.hidden = false;
    }


    // BOOK NOW: open the actual booking page.
    document.querySelectorAll(".book-btn, .hero-btn").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            if (!currentUser()) {
                window.location.href = "account.html?next=booking";
            } else {
                window.location.href = "book-now.html";
            }
        });
    });

    // HOMEPAGE BOOK NOW BUTTON
    const bookingButton = document.getElementById("checkAvailabilityBtn");

    if (bookingButton) {
        bookingButton.addEventListener("click", function () {
            const checkin = document.getElementById("checkin")?.value || "";
            const checkout = document.getElementById("checkout")?.value || "";
            const guests = document.getElementById("guests")?.value || "2 Guests";
            const room = document.getElementById("room")?.value || "Deluxe Room";

            if (checkin && checkout && checkout <= checkin) {
                alert("Check-out date must be after check-in date.");
                return;
            }

            // Save the selected dates and preferences for the booking page.
            const draft = {
                hotel: "ELVIORA Hotel & Resort",
                checkin: checkin,
                checkout: checkout,
                guests: parseInt(guests, 10) || 2,
                rooms: 1,
                roomType: room
            };

            localStorage.setItem(
                "elvioraBookingDraft",
                JSON.stringify(draft)
            );

            if (!currentUser()) {
                window.location.href = "account.html?next=booking";
            } else {
                window.location.href = "book-now.html?step=details";
            }
        });
    }
});
