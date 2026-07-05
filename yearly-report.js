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

// ===========================
// HTML Elements
// ===========================

const reportYear = document.getElementById("reportYear");
const loadYearlyReport = document.getElementById("loadYearlyReport");

const yearTotalMembers = document.getElementById("yearTotalMembers");
const yearTotalPaid = document.getElementById("yearTotalPaid");
const yearTotalMoney = document.getElementById("yearTotalMoney");

const yearlyList = document.getElementById("yearlyList");

const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর"
];

let allMembers = [];
let yearlyPayments = [];

// ===========================
// Login Check
// ===========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "signin.html";
        return;

    }

    reportYear.value = new Date().getFullYear();

});

// ===========================
// Load Button
// ===========================

loadYearlyReport.addEventListener("click", async () => {

    await loadYearlyReportData();

});// ===========================
// Load Yearly Report
// ===========================

async function loadYearlyReportData() {

    yearlyList.innerHTML = `
        <p style="text-align:center;">লোড হচ্ছে...</p>
    `;

    yearTotalMembers.textContent = "0";
    yearTotalPaid.textContent = "0";
    yearTotalMoney.textContent = "৳ 0";

    allMembers = [];
    yearlyPayments = [];

    // সকল সদস্য
    const userSnapshot = await getDocs(
        collection(db, "users")
    );

    userSnapshot.forEach((doc) => {

        allMembers.push({
            uid: doc.id,
            ...doc.data()
        });

    });

    // নির্বাচিত বছরের Payment
    const paymentQuery = query(
        collection(db, "payments"),
        where("year", "==", reportYear.value)
    );

    const paymentSnapshot = await getDocs(paymentQuery);

    let totalMoney = 0;

    paymentSnapshot.forEach((doc) => {

        const pay = doc.data();

        yearlyPayments.push(pay);

        totalMoney += Number(pay.amount);

    });

    yearTotalMembers.textContent = allMembers.length;

    yearTotalPaid.textContent = yearlyPayments.length;

    yearTotalMoney.textContent = "৳ " + totalMoney;

    showMonthlyCollection();

}// ===========================
// Show Monthly Collection
// ===========================

function showMonthlyCollection() {

    yearlyList.innerHTML = "";

    months.forEach((month) => {

        let total = 0;
        let count = 0;

        yearlyPayments.forEach((pay) => {

            if (pay.month === month) {

                total += Number(pay.amount);
                count++;

            }

        });

        yearlyList.innerHTML += `

        <div class="payment-item">

            <div>

                <b>${month}</b><br>

                <small>${count} জন চাঁদা জমা দিয়েছেন</small>

            </div>

            <div>

                <b>৳ ${total}</b>

            </div>

        </div>

        `;

    });

}// ===========================
// Yearly PDF Download
// ===========================

document.getElementById("downloadYearlyPdf")
.addEventListener("click", () => {

    if (yearlyPayments.length === 0) {

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
    pdf.text("Yearly Report", 20, y);

    y += 10;

    pdf.setFontSize(12);

    pdf.text(
        "Year : " + reportYear.value,
        20,
        y
    );

    y += 10;

    pdf.text(
        "Total Members : " + allMembers.length,
        20,
        y
    );

    y += 10;

    pdf.text(
        "Total Payments : " + yearlyPayments.length,
        20,
        y
    );

    y += 10;

    pdf.text(
        "Total Collection : " + yearTotalMoney.textContent,
        20,
        y
    );

    y += 15;

    pdf.setFontSize(14);
    pdf.text("Monthly Collection", 20, y);

    y += 10;

    months.forEach((month) => {

        let total = 0;
        let count = 0;

        yearlyPayments.forEach((pay) => {

            if (pay.month === month) {

                total += Number(pay.amount);
                count++;

            }

        });

        pdf.setFontSize(11);

        pdf.text(
            `${month} : ${count} জন | ৳ ${total}`,
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
        `Yearly_Report_${reportYear.value}.pdf`
    );

});