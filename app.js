import { db } from "./firebase-config.js";

import {
    doc,
    setDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

await setDoc(
    doc(db, "test", "hello"),
    {
        message: "firebase works"
    }
);

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

function loadDashboard() {

    loginScreen.style.display = "none";

    dashboard.style.display = "block";

    welcome.textContent =
        `Welcome ${currentUser}`;

    renderManagedBill();

    renderOwedBills();

    renderCurrentBills();
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

function updateBill(type) {

    const value =
        parseFloat(
            document.getElementById(
                `${type}-input`
            ).value
        );

    bills[type] = value;

    saveBills();

    renderOwedBills();

    renderCurrentBills();
}

window.updateBill = updateBill;

if (currentUser) {

    loadDashboard();

}