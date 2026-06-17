console.log("app loaded");

import { db } from "./firebase-config.js";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection
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
    WiFi: "Milla"
};

const defaultMonthData = {
    Gas: 0,
    Hydro: 0,
    WiFi: 0,
    archived: false,
    payments: {}
};

let currentMonthData =
    JSON.parse(localStorage.getItem("currentMonthData")) || {
        ...defaultMonthData
    };

let currentUser =
    localStorage.getItem("currentUser");

const ARCHIVE_OPTION = "archive";
let lastSelectedMonth = "may2026";

// All monthly data stuff
const monthSelect =
    document.getElementById('monthSelect');

const displayMonth =
    document.getElementById('displayMonth');

const archivePage =
    document.getElementById('archive-page');

const archivedMonthList =
    document.getElementById('archived-month-list');

const backFromArchive =
    document.getElementById('back-from-archive');

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
  apr2027: { title: "April 2027"},
  archive: { title: "Archived months" }
};

function updatePageData(monthKey) {
  const data = monthlyData[monthKey];
  
  if (data) {
    displayMonth.textContent = data.title;
  }
}

function ensurePaymentsForMonth(data) {
    data.payments = data.payments || {};

    Object.keys(billOwners).forEach((bill) => {
        data.payments[bill] = data.payments[bill] || {};

        roommates.forEach((roommate) => {
            if (!data.payments[bill][roommate]) {
                data.payments[bill][roommate] = {
                    paid: false,
                    approved: false
                };
            }
        });
    });
}

function updateArchiveStatus() {
    currentMonthData.archived = Object.keys(billOwners).every((bill) => {
        return Object.values(currentMonthData.payments[bill] || {}).every(
            (payment) => payment.approved === true
        );
    });
}

function refreshMonthSelectOptions(archivedSet = new Set()) {
    monthSelect.innerHTML = "";

    const activeGroup = document.createElement('optgroup');
    activeGroup.label = 'Active months';

    const archiveGroup = document.createElement('optgroup');
    archiveGroup.label = 'Archived months';

    Object.keys(monthlyData).forEach((monthKey) => {
        if (monthKey === 'archive')
            return;

        const option = document.createElement('option');
        option.value = monthKey;
        option.textContent = monthlyData[monthKey].title;

        if (archivedSet.has(monthKey)) {
            archiveGroup.appendChild(option);
        } else {
            activeGroup.appendChild(option);
        }
    });

    const archiveViewGroup = document.createElement('optgroup');
    archiveViewGroup.label = 'Archive';

    const archiveViewOption = document.createElement('option');
    archiveViewOption.value = ARCHIVE_OPTION;
    archiveViewOption.textContent = 'View archived months';
    archiveViewGroup.appendChild(archiveViewOption);

    monthSelect.appendChild(activeGroup);
    monthSelect.appendChild(archiveGroup);
    monthSelect.appendChild(archiveViewGroup);

    if (archivedSet.has(lastSelectedMonth)) {
        monthSelect.value = lastSelectedMonth;
    } else if (!archivedSet.has(monthSelect.value)) {
        monthSelect.value = lastSelectedMonth;
    }
}

async function loadMonthList() {
    const monthDocs = await getDocs(collection(db, 'months'));
    const archivedSet = new Set();

    monthDocs.forEach((monthDoc) => {
        const data = monthDoc.data();
        const key = monthDoc.id;
        if (data.archived) {
            archivedSet.add(key);
        }
    });

    refreshMonthSelectOptions(archivedSet);
}

async function renderArchiveList() {
    const monthDocs = await getDocs(collection(db, 'months'));
    const archived = [];

    monthDocs.forEach((monthDoc) => {
        const data = monthDoc.data();
        if (data.archived) {
            const title = monthlyData[monthDoc.id]?.title || monthDoc.id;
            archived.push({ key: monthDoc.id, title });
        }
    });

    if (!archived.length) {
        archivedMonthList.innerHTML = '<p>No archived months yet.</p>';
        return;
    }

    archivedMonthList.innerHTML = archived.map((month) => `
        <div class="bill-card archived-card">
            <strong>${month.title}</strong>
            <p>${month.key}</p>
        </div>
    `).join('');
}

function showArchivePage() {
    dashboard.style.display = 'none';
    archivePage.style.display = 'block';
    renderArchiveList();
}

async function openMonth(monthKey) {
    archivePage.style.display = 'none';
    dashboard.style.display = 'block';
    lastSelectedMonth = monthKey;
    monthSelect.value = monthKey;
    updatePageData(monthKey);
    await loadMonthData();
}

monthSelect.addEventListener(
  'change',
  async (event) => {
    const selectedMonth = event.target.value;

    if (selectedMonth === ARCHIVE_OPTION) {
        showArchivePage();
        return;
    }

    await loadMonthList();
    await openMonth(selectedMonth);
});

backFromArchive.addEventListener('click', () => {
    archivePage.style.display = 'none';
    dashboard.style.display = 'block';
    monthSelect.value = lastSelectedMonth;
    updatePageData(lastSelectedMonth);
    loadMonthData();
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

const pendingApprovals =
    document.getElementById("pending-approvals");

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

    await loadMonthList();
    await openMonth(monthSelect.value);
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

            const paymentRows = Object.entries(currentMonthData.payments[bill] || {})
                .map(([payer, payment]) => {
                    if (payer === currentUser) {
                        return `
                            <div class="payment-row">
                                <strong>${payer}</strong>
                                <span>${payment.paid ? 'Paid' : 'Not paid'}</span>
                                <span>${payment.approved ? 'Approved' : 'Needs approval'}</span>
                            </div>
                        `;
                    }

                    if (!payment.paid) {
                        return `
                            <div class="payment-row">
                                <strong>${payer}</strong>
                                <span>Not paid yet</span>
                            </div>
                        `;
                    }

                    return `
                        <div class="payment-row">
                            <strong>${payer}</strong>
                            <span>Paid</span>
                            <button onclick="approvePayment('${bill}', '${payer}')">Approve</button>
                            <span>${payment.approved ? 'Approved' : 'Pending'}</span>
                        </div>
                    `;
                })
                .join('');

            managedBill.innerHTML += `
                <div class="owner-bill-card">
                    <h2>${bill} Bill</h2>
                    <label>
                        Amount
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            id="${bill}-input"
                            value="${currentMonthData[bill] ?? 0}">
                    </label>
                    <button onclick="updateBill('${bill}')">Save</button>
                    <div class="owner-approvals">
                        <h3>Payments</h3>
                        ${paymentRows}
                    </div>
                </div>
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
            const payment = currentMonthData.payments?.[bill]?.[currentUser];

            if (amount <= 0 || !payment)
                return;

            if (payment.approved)
                return;

            const share = amount / roommates.length;
            const checkboxId = `${bill}-paid`;

            owedList.innerHTML += `
                <div class="bill-card">
                    <strong>${bill}</strong>
                    <p>Owe $${share.toFixed(2)} to ${owner}</p>
                    <label>
                        <input
                            type="checkbox"
                            id="${checkboxId}"
                            ${payment.paid ? 'checked' : ''}>
                        Paid
                    </label>
                    <button onclick="savePayment('${bill}')">Save</button>
                    ${payment.paid && !payment.approved ? `<p>Waiting approval from ${owner}</p>` : ''}
                </div>
            `;
        });
}

function renderPendingApprovals() {
    pendingApprovals.innerHTML = "";

    if (currentMonthData.archived) {
        pendingApprovals.innerHTML = `
            <div class="bill-card archived-card">
                <p>This month is archived. No pending approvals.</p>
            </div>
        `;
        return;
    }

    const approvals = Object.entries(billOwners)
        .filter(([, owner]) => owner === currentUser)
        .flatMap(([bill]) => {
            const amount = Number(currentMonthData[bill] ?? 0);
            const share = amount > 0 ? (amount / roommates.length).toFixed(2) : "0.00";
            return Object.entries(currentMonthData.payments?.[bill] || {})
                .filter(([payer, payment]) => payer !== currentUser && payment.paid && !payment.approved)
                .map(([payer]) => ({ bill, payer, share }));
        });

    if (!approvals.length) {
        pendingApprovals.innerHTML = `
            <div class="bill-card">
                <p>No pending approvals at the moment.</p>
            </div>
        `;
        return;
    }

    pendingApprovals.innerHTML = approvals.map((approval) => `
        <div class="bill-card approval-card">
            <strong>${approval.bill} payment</strong>
            <p>${approval.payer} marked their payment as paid.</p>
            <p>Amount: $${approval.share}</p>
            <button onclick="approvePayment('${approval.bill}', '${approval.payer}')">Approve</button>
        </div>
    `).join('');
}

function renderCurrentBills() {

    currentBills.innerHTML = "";

    Object.entries(currentMonthData)
        .forEach(([bill, amount]) => {
            if (bill === "archived" || bill === "payments")
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
    updateArchiveStatus();

    await setDoc(doc(db, "months", month), currentMonthData);
    localStorage.setItem("currentMonthData", JSON.stringify(currentMonthData));
    await loadMonthList();
}

async function updateBill(type) {

    const value = parseFloat(
        document.getElementById(
            `${type}-input`
        ).value
    );

    currentMonthData[type] = Number.isFinite(value) ? value : 0;
    ensurePaymentsForMonth(currentMonthData);
    updateArchiveStatus();

    await saveMonthData();

    renderManagedBill();
    renderOwedBills();
    renderPendingApprovals();
    renderCurrentBills();

    console.log("Saved to Firebase", monthSelect.value, currentMonthData);
}

async function savePayment(bill) {
    const checkbox = document.getElementById(`${bill}-paid`);
    if (!checkbox) return;

    ensurePaymentsForMonth(currentMonthData);

    const payment = currentMonthData.payments[bill][currentUser];
    payment.paid = checkbox.checked;

    if (currentUser === billOwners[bill]) {
        payment.approved = payment.paid;
    }

    if (payment.paid && currentUser !== billOwners[bill]) {
        payment.approved = false;
    }

    await saveMonthData();
    renderManagedBill();
    renderOwedBills();
    renderPendingApprovals();
    renderCurrentBills();
}

async function approvePayment(bill, payer) {
    ensurePaymentsForMonth(currentMonthData);

    const payment = currentMonthData.payments[bill][payer];
    payment.approved = true;

    await saveMonthData();
    renderManagedBill();
    renderOwedBills();
    renderPendingApprovals();
    renderCurrentBills();
}

window.updateBill = updateBill;
window.savePayment = savePayment;
window.approvePayment = approvePayment;

if (currentUser) {
    loadDashboard();
}

async function loadMonthData() {

    if (monthSelect.value === ARCHIVE_OPTION) {
        showArchivePage();
        return;
    }

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

    ensurePaymentsForMonth(currentMonthData);
    updateArchiveStatus();

    renderManagedBill();
    renderOwedBills();
    renderPendingApprovals();
    renderCurrentBills();
}

