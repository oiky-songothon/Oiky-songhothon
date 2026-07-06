import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================
// HTML Elements
// ==========================

const reportMonth = document.getElementById("reportMonth");
const reportYear = document.getElementById("reportYear");
const loadReport = document.getElementById("loadReport");

const reportMembers = document.getElementById("reportMembers");
const reportPaid = document.getElementById("reportPaid");
const reportDue = document.getElementById("reportDue");
const reportMoney = document.getElementById("reportMoney");

const paidList = document.getElementById("paidList");
const dueList = document.getElementById("dueList");

let allMembers = [];
let paidMembers = [];

// ==========================
// Login Check
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "signin.html";

        return;

    }

    reportYear.value = new Date().getFullYear();

});

// ==========================
// Load Report Button
// ==========================

loadReport.addEventListener("click", async () => {

    await loadMonthlyReport();

});// ==========================
// Load Monthly Report
// ==========================

async function loadMonthlyReport() {

    paidList.innerHTML = "লোড হচ্ছে...";
    dueList.innerHTML = "লোড হচ্ছে...";

    reportMembers.textContent = "0";
    reportPaid.textContent = "0";
    reportDue.textContent = "0";
    reportMoney.textContent = "৳ 0";

    paidList.innerHTML = "";
    dueList.innerHTML = "";

    allMembers = [];
    paidMembers = [];

    let totalMoney = 0;

    // সকল সদস্য আনুন
    const userSnapshot = await getDocs(collection(db, "users"));

    userSnapshot.forEach((doc) => {

        allMembers.push({
            uid: doc.id,
            ...doc.data()
        });

    });

    // নির্বাচিত মাসের Payment আনুন
    const paymentQuery = query(
        collection(db, "payments"),
        where("month", "==", reportMonth.value),
        where("year", "==", reportYear.value)
    );

    const paymentSnapshot = await getDocs(paymentQuery);

    paymentSnapshot.forEach((doc) => {

        const pay = doc.data();

        paidMembers.push(pay);

        totalMoney += Number(pay.amount);

    });

    reportMembers.textContent = allMembers.length;
    reportPaid.textContent = paidMembers.length;
    reportDue.textContent =
        allMembers.length - paidMembers.length;
    reportMoney.textContent = "৳ " + totalMoney;

    showPaidMembers();
    showDueMembers();

}// ==========================
// Show Paid Members
// ==========================

function showPaidMembers() {

    paidList.innerHTML = "";

    if (paidMembers.length === 0) {

        paidList.innerHTML = `
            <p style="text-align:center;">
                এই মাসে কেউ চাঁদা দেয়নি।
            </p>
        `;

        return;

    }

    paidMembers.forEach((pay) => {

        const member = allMembers.find(m => m.uid === pay.uid);

        if (!member) return;

        paidList.innerHTML += `

        <div class="payment-item">

            <div>

                <b>${member.name}</b><br>

                <small>🏠 ${member.house}</small>

            </div>

            <div>

                <b>৳ ${pay.amount}</b>

            </div>

        </div>

        `;

    });

}

// ==========================
// Show Due Members
// ==========================

function showDueMembers() {

    dueList.innerHTML = "";

    const paidIds = paidMembers.map(p => p.uid);

    const dueMembers = allMembers.filter(member =>
        !paidIds.includes(member.uid)
    );

    if (dueMembers.length === 0) {

        dueList.innerHTML = `
            <p style="text-align:center;color:green;">
                🎉 সকল সদস্য চাঁদা পরিশোধ করেছেন।
            </p>
        `;

        return;

    }

    dueMembers.forEach((member) => {

        dueList.innerHTML += `

        <div class="payment-item">

            <div>

                <b>${member.name}</b><br>

                <small>🏠 ${member.house}</small>

            </div>

            <div style="color:red;font-weight:bold;">

                বকেয়া

            </div>

        </div>

        `;

    });

}// ==========================
// Monthly PDF Download
// ==========================

document.getElementById("downloadMonthlyPdf")
.addEventListener("click", async () => {

    if (allMembers.length === 0) {

        alert("আগে রিপোর্ট লোড করুন।");

        return;

    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    let y = 20;

    pdf.setFontSize(18);
    pdf.text("OIKKO ORGANIZATION", 20, y);

    y += 10;

    pdf.setFontSize(14);
    pdf.text("Monthly Report", 20, y);

    y += 10;

    pdf.setFontSize(12);

    pdf.text(
        "Month : " +
        reportMonth.value +
        " " +
        reportYear.value,
        20,
        y
    );

    y += 10;

    pdf.text(
        "Total Members : " +
        allMembers.length,
        20,
        y
    );

    y += 10;

    pdf.text(
        "Paid Members : " +
        paidMembers.length,
        20,
        y
    );

    y += 10;

    pdf.text(
        "Due Members : " +
        (allMembers.length - paidMembers.length),
        20,
        y
    );

    y += 10;

    pdf.text(
        "Total Collection : " +
        reportMoney.textContent,
        20,
        y
    );

    y += 15;

    pdf.setFontSize(14);
    pdf.text("Paid Members", 20, y);

    y += 10;

    paidMembers.forEach((pay) => {

        const member = allMembers.find(
            m => m.uid === pay.uid
        );

        if (!member) return;

        pdf.setFontSize(11);

        pdf.text(
            `${member.name} - Tk ${pay.amount}`,
            20,
            y
        );

        y += 8;

        if (y > 270) {

            pdf.addPage();

            y = 20;

        }

    });

    y += 10;

    pdf.setFontSize(14);
    pdf.text("Due Members", 20, y);

    y += 10;

    const paidIds = paidMembers.map(p => p.uid);

    const dueMembers = allMembers.filter(
        m => !paidIds.includes(m.uid)
    );

    dueMembers.forEach((member) => {

        pdf.setFontSize(11);

        pdf.text(
            member.name,
            20,
            y
        );

        y += 8;

        if (y > 270) {

            pdf.addPage();

            y = 20;

        }

    });

    pdf.save(
        `Monthly_Report_${reportMonth.value}_${reportYear.value}.pdf`
    );

});