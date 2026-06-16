console.log("app loaded");

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

monthSelect.addEventListener('change', (event) => {
  const selectedMonth = event.target.value;
  updatePageData(selectedMonth);
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

    displayMonth.textContent = 
    `${monthlyData[monthSelect.value].title}`;

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