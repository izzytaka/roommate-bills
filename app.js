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

    // ===============================================
    // Fetch user data from Firestore //
    // ===============================================
    const userDocRef = doc(db, "users", selectedUser);
    const userSnap = await getDoc(userDocRef);
    // ===============================================
    // ===============================================

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

    // ===============================================
    // Save to Firestore //
    await setDoc(doc(db, "users", selectedUser), {
        passwordHash: hash
    });
    // ===============================================

    setPasswordMsg.style.color = "green";
    setPasswordMsg.textContent = "Password saved! You can now log in :)";

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
    Hydro: "Caliee",
    Water: "Milla"
};

const defaultMonthData = {
    Gas: 0,
    Hydro: 0,
    Water: 0,
    archived: false
};

let currentMonthData =
    JSON.parse(localStorage.getItem("currentMonthData")) || {
        ...defaultMonthData
    };

let currentUser =
    localStorage.getItem("currentUser");


// All monthly data stuff
const monthSelect = 
    document.getElementById('monthSelect');

const displayMonth = 
    document.getElementById('displayMonth');

const monthlyData = {
  may2026: { title: "May 2026"},
  jun2026: { title: "June 2026"},
  jul2026: { title: "July 2026"},
  aug2026: { title: "August 2026"},
  sep2026: { title: "September 2026"},
  oct2026: { title: "October 2026"},
  nov2026: { title: "November 2026"},
  dec2026: { title: "December 2026"},
  jan2027: { title: "January 2027"},
  feb2027: { title: "February 2027"},
  mar2027: { title: "March 2027"},
  apr2027: { title: "April 2027"}
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

document
    .getElementById("change-user")
    .addEventListener("click", () => {

        localStorage.removeItem(
            "currentUser"
        );

        location.reload();
    });

async function loadDashboard() {

    loginScreen.style.display = "none";

    dashboard.style.display = "block";

    welcome.textContent =
        `Welcome ${currentUser}`;

    updatePageData(monthSelect.value);
    await loadMonthData();
}

function renderManagedBill() {
    managedBill.innerHTML = "";

    if (currentMonthData.archived) {
        managedBill.innerHTML = `
            <div class="archived-banner">
                <strong>This month is archived.</strong>
                <p>No bill edits are allowed until a new month is selected.</p>
            </div>
        `;
        return;
    }

    Object.entries(billOwners)
        .forEach(([bill, owner]) => {
            if (owner !== currentUser)
                return;

            managedBill.innerHTML += `
                <h2>${bill} Bill</h2>

                <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="${bill}-input"
                    value="${currentMonthData[bill] ?? 0}">

                <button
                    onclick="updateBill('${bill}')">
                    Save
                </button>
            `;
        });
}

function renderOwedBills() {
    owedList.innerHTML = "";

    if (currentMonthData.archived) {
        owedList.innerHTML = `
            <div class="bill-card archived-card">
                <strong>Archived</strong>
                <p>All bills for this month are complete.</p>
            </div>
        `;
        return;
    }

    Object.entries(billOwners)
        .forEach(([bill, owner]) => {
            const amount = Number(currentMonthData[bill] ?? 0);

            if (amount <= 0)
                return;

            const share = amount / roommates.length;

            owedList.innerHTML += `
                <div class="bill-card">
                    <strong>${bill}</strong>
                    <p>
                        Owe $${share.toFixed(2)} to ${owner}
                    </p>
                </div>
            `;
        });
}

function renderCurrentBills() {

    currentBills.innerHTML = "";

    Object.entries(currentMonthData)
        .forEach(([bill, amount]) => {
            if (bill === "archived")
                return;

            currentBills.innerHTML += `
                <div class="bill-card ${bill.toLowerCase()}-card">

                    <strong>${bill}</strong>

                    <p>
                        $${Number(amount)
                            .toFixed(2)}
                    </p>

                </div>
            `;
        });

    if (currentMonthData.archived) {
        currentBills.innerHTML += `
            <div class="bill-card archived-card">
                <strong>Archived</strong>
                <p>This month has been archived.</p>
            </div>
        `;
    }
}

async function saveMonthData() {
    const month = monthSelect.value;

    await setDoc(doc(db, "months", month), currentMonthData);
    localStorage.setItem("currentMonthData", JSON.stringify(currentMonthData));
}

async function updateBill(type) {

    const value = parseFloat(
        document.getElementById(
            `${type}-input`
        ).value
    );

    currentMonthData[type] = Number.isFinite(value) ? value : 0;
    currentMonthData.archived = ["Gas", "Hydro", "Water"].every(
        (bill) => Number(currentMonthData[bill]) > 0
    );

    await saveMonthData();

    renderManagedBill();
    renderOwedBills();
    renderCurrentBills();

    console.log("Saved to Firebase", monthSelect.value, currentMonthData);
}

window.updateBill = updateBill;

if (currentUser) {
    loadDashboard();
}

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

        currentMonthData = {
            ...defaultMonthData,
            ...snap.data()
        };

    } else {

        currentMonthData = {
            ...defaultMonthData
        };
    }

    renderManagedBill();
    renderOwedBills();
    renderCurrentBills();
}

