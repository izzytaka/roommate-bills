console.log("app loaded");

import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ─────────────────────────────────────────────
// Password hashing utility (SHA-256)
// ─────────────────────────────────────────────
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─────────────────────────────────────────────
// Login form handling
// ─────────────────────────────────────────────
const loginForm = document.getElementById("login-form");
const userSelect = document.getElementById("user-select");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const selectedUser = userSelect.value;
    const password = passwordInput.value;

    if (!selectedUser) {
        loginError.textContent = "Please select a name.";
        return;
    }

    const userDocRef = doc(db, "users", selectedUser);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
        loginError.textContent = "No password set. Please set one first.";
        return;
    }

    const storedHash = userSnap.data().passwordHash;
    const inputHash = await hashPassword(password);

    if (inputHash !== storedHash) {
        loginError.textContent = "Incorrect password.";
        return;
    }

    // Success
    currentUser = selectedUser;
    localStorage.setItem("currentUser", currentUser);
    loadDashboard();
});

// ─────────────────────────────────────────────
// Set / Reset password UI toggle
// ─────────────────────────────────────────────
const setPasswordLink = document.getElementById("set-password-link");
const setPasswordSection = document.getElementById("set-password-section");
const backToLogin = document.getElementById("back-to-login");

setPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    setPasswordLink.style.display = "none";
    setPasswordSection.style.display = "block";
});

backToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    setPasswordSection.style.display = "none";
    loginForm.style.display = "block";
    setPasswordLink.style.display = "inline";
});

// ─────────────────────────────────────────────
// Save new password
// ─────────────────────────────────────────────
const setUserSelect = document.getElementById("set-user-select");
const newPasswordInput = document.getElementById("new-password-input");
const confirmPasswordInput = document.getElementById("confirm-password-input");
const savePasswordBtn = document.getElementById("save-password-btn");
const setPasswordMsg = document.getElementById("set-password-msg");

savePasswordBtn.addEventListener("click", async () => {
    setPasswordMsg.textContent = "";
    setPasswordMsg.style.color = "black";

    const selectedUser = setUserSelect.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!selectedUser) {
        setPasswordMsg.style.color = "red";
        setPasswordMsg.textContent = "Please select a name.";
        return;
    }

    if (newPassword.length < 4) {
        setPasswordMsg.style.color = "red";
        setPasswordMsg.textContent = "Password must be at least 4 characters.";
        return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordMsg.style.color = "red";
        setPasswordMsg.textContent = "Passwords do not match.";
        return;
    }

    const hash = await hashPassword(newPassword);

    await setDoc(doc(db, "users", selectedUser), {
        passwordHash: hash
    });

    setPasswordMsg.style.color = "green";
    setPasswordMsg.textContent = "Password saved! You can now log in.";

    // Clear inputs
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
});


const roommates = [
    "Izzy Tak",
    "Milla",
    "Caliee",
    "Vic",
    "Izzy Tate"
];

const billOwners = {
    Gas: "Izzy Tak",
    WiFi: "Milla",
    Hydro: "Caliee"
};

let bills =
    JSON.parse(localStorage.getItem("bills")) || {
        Gas: 0,
        WiFi: 0,
        Hydro: 0
    };

let currentUser =
    localStorage.getItem("currentUser");


// All monthly data stuff
const monthSelect = 
    document.getElementById('monthSelect');

const displayMonth = 
    document.getElementById('displayMonth');

const monthlyData = {
  may26: { title: "May 2026"},
  jun26: { title: "June 2026"},
  jul26: { title: "July 2026"},
  aug26: { title: "August 2026"},
  sep26: { title: "September 2026"},
  oct26: { title: "October 2026"},
  nov26: { title: "November 2026"},
  dec26: { title: "December 2026"},
  jan27: { title: "January 2027"},
  feb27: { title: "February 2027"},
  mar27: { title: "March 2027"},
  apr27: { title: "April 2027"}
};

function updatePageData(monthKey) {
  const data = monthlyData[monthKey];
  
  if (data) {
    displayMonth.textContent = data.title;
  }
}

monthSelect.addEventListener(
  'change',
  async (event) => {

    const selectedMonth =
      event.target.value;

    updatePageData(
      selectedMonth
    );

    await loadMonthData();
});

// end of monthly data stuff

const loginScreen =
    document.getElementById("login-screen");

const dashboard =
    document.getElementById("dashboard");

const welcome =
    document.getElementById("welcome");

const managedBill =
    document.getElementById("managed-bill");

const owedList =
    document.getElementById("owed-list");

const currentBills =
    document.getElementById("current-bills");

    /*
document
    .querySelectorAll("[data-user]")
    .forEach(button => {

        button.addEventListener("click", () => {

            currentUser =
                button.dataset.user;

            localStorage.setItem(
                "currentUser",
                currentUser
            );

            loadDashboard();
        });
    });
    */

document
    .getElementById("change-user")
    .addEventListener("click", () => {

        localStorage.removeItem(
            "currentUser"
        );

        location.reload();
    });

function saveBills() {

    localStorage.setItem(
        "bills",
        JSON.stringify(bills)
    );
}

async function loadDashboard() {

    loginScreen.style.display = "none";

    dashboard.style.display = "block";

    welcome.textContent =
        `Welcome ${currentUser}`;

    displayMonth.textContent = 
    `${monthlyData[monthSelect.value].title}`;

    renderManagedBill();

    renderOwedBills();

    renderCurrentBills();

    await loadMonthData();
}

function renderManagedBill() {

    managedBill.innerHTML = "";

    Object.entries(billOwners)
        .forEach(([bill, owner]) => {

            if (owner !== currentUser)
                return;

            managedBill.innerHTML += `
                <h2>${bill} Bill</h2>

                <input
                    type="number"
                    id="${bill}-input"
                    value="${bills[bill]}">

                <button
                    onclick="updateBill('${bill}')">
                    Save
                </button>
            `;
        });
}

function renderOwedBills() {

    owedList.innerHTML = "";

    Object.entries(billOwners)
        .forEach(([bill, owner]) => {

            const amount =
                Number(bills[bill]);

            if (amount <= 0)
                return;

            const share =
                amount / 5;

            owedList.innerHTML += `
                <div class="bill-card">

                    <strong>${bill}</strong>

                    <p>
                        Owe
                        $${share.toFixed(2)}
                        to
                        ${owner}
                    </p>

                </div>
            `;
        });
}

function renderCurrentBills() {

    currentBills.innerHTML = "";

    Object.entries(bills)
        .forEach(([bill, amount]) => {

            currentBills.innerHTML += `
                <div class="bill-card">

                    <strong>${bill}</strong>

                    <p>
                        $${Number(amount)
                            .toFixed(2)}
                    </p>

                </div>
            `;
        });
}

async function updateBill(type) {

    const value = parseFloat(
        document.getElementById(
            `${type}-input`
        ).value
    );

    bills[type] = value;

    saveBills();

    const month =
        monthSelect.value;

    await setDoc(
        doc(
            db,
            "months",
            month
        ),
        {
            Gas: bills.Gas,
            WiFi: bills.WiFi,
            Hydro: bills.Hydro
        }
    );

    renderOwedBills();

    renderCurrentBills();

    console.log(
        "Saved to Firebase"
    );
}


//window.updateBill = updateBill;

//if (currentUser) {

//    loadDashboard();

//}

async function loadMonthData() {

    const month =
        monthSelect.value;

    const snap =
        await getDoc(
            doc(
                db,
                "months",
                month
            )
        );

    if (snap.exists()) {

        bills = snap.data();

    } else {

        bills = {
            Gas: 0,
            WiFi: 0,
            Hydro: 0
        };
    }

    renderManagedBill();
    renderOwedBills();
    renderCurrentBills();
}

