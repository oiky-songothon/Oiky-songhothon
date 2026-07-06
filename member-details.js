import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==========================
// HTML Elements
// ==========================

const detailPhoto = document.getElementById("detailPhoto");
const detailName = document.getElementById("detailName");
const detailHouse = document.getElementById("detailHouse");
const detailPhone = document.getElementById("detailPhone");

const totalAmount = document.getElementById("totalAmount");
const paymentList = document.getElementById("paymentList");

const downloadPdf = document.getElementById("downloadPdf");

let memberId = "";
let memberData = null;
let paymentData = [];

// ==========================
// Login Check
// ==========================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "signin.html";
        return;

    }

    memberId = localStorage.getItem("selectedMember");

    if (!memberId) {

        alert("কোন সদস্য নির্বাচন করা হয়নি।");
        history.back();
        return;

    }

    await loadMember();

});

// ==========================
// Load Member
// ==========================

async function loadMember() {

    try {

        const snap = await getDoc(doc(db, "users", memberId));

        if (!snap.exists()) {

            alert("সদস্য পাওয়া যায়নি।");
            history.back();
            return;

        }

        memberData = snap.data();

        detailName.textContent = memberData.name;

        detailHouse.textContent =
            "🏠 " + memberData.house;

        detailPhone.textContent =
            "📱 " +
            memberData.countryCode +
            " " +
            memberData.phone;

        if (memberData.photo && memberData.photo !== "") {

            detailPhoto.src = memberData.photo;

        }

        await loadPayments();

    } catch (err) {

        console.error(err);

        alert("সদস্যের তথ্য লোড করা যায়নি।");

    }

}// ==========================
// Load Payments
// ==========================

async function loadPayments() {

    paymentList.innerHTML = `
        <p style="text-align:center;">লোড হচ্ছে...</p>
    `;

    paymentData = [];

    let total = 0;

    const q = query(
        collection(db, "payments"),
        where("uid", "==", memberId)
    );

    const snapshot = await getDocs(q);

    paymentList.innerHTML = "";

    if (snapshot.empty) {

        paymentList.innerHTML = `
            <p style="text-align:center;">
                এখনো কোনো চাঁদা যোগ করা হয়নি।
            </p>
        `;

        totalAmount.textContent = "৳ 0";

        return;

    }

    snapshot.forEach((docSnap) => {

        paymentData.push({
            id: docSnap.id,
            ...docSnap.data()
        });

    });

    // নতুন হিসাব আগে দেখাবে
    paymentData.sort((a, b) => {

        if (a.year !== b.year) {
            return Number(b.year) - Number(a.year);
        }

        return b.month.localeCompare(a.month);

    });

    paymentData.forEach((pay) => {

        total += Number(pay.amount || 0);

        paymentList.innerHTML += `

        <div class="payment-item">

            <div style="display:flex;justify-content:space-between;align-items:center;">

                <div>

                    <h4>${pay.month} ${pay.year}</h4>

                    <p>📅 ${pay.date}</p>

                </div>

                <div style="font-size:18px;font-weight:bold;color:green;">

                    ৳ ${pay.amount}

                </div>

            </div>

        </div>

        `;

    });

    totalAmount.textContent = "৳ " + total;
updateSummary();
}// ==========================
// PDF Download
// ==========================

downloadPdf.addEventListener("click", async () => {

    try {

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF();

        pdf.setFontSize(18);
        pdf.text("OIKKO ORGANIZATION", 20, 20);

        pdf.setFontSize(14);
        pdf.text("Member Report", 20, 32);

        pdf.setFontSize(12);

        pdf.text("Name : " + memberData.name, 20, 48);
        pdf.text("House : " + memberData.house, 20, 58);
        pdf.text(
            "Phone : " +
            memberData.countryCode +
            " " +
            memberData.phone,
            20,
            68
        );

        pdf.text("Total Deposit : " + totalAmount.textContent, 20, 82);

        pdf.line(20, 88, 190, 88);

        let y = 100;

        pdf.setFontSize(14);
        pdf.text("Payment History", 20, y);

        y += 10;

        paymentData.forEach((pay) => {

            pdf.setFontSize(11);

            pdf.text(
                `${pay.month} ${pay.year}`,
                20,
                y
            );

            pdf.text(
                `Tk ${pay.amount}`,
                100,
                y
            );

            pdf.text(
                pay.date,
                145,
                y
            );

            y += 10;

            if (y > 270) {

                pdf.addPage();

                y = 20;

            }

        });

        pdf.save(
            `${memberData.name}_Report.pdf`
        );

    } catch (err) {

        console.error(err);

        alert("PDF তৈরি করা যায়নি।");

    }

});// ==========================
// Summary & Current Month Status
// ==========================

function updateSummary() {

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

    const today = new Date();

    const currentMonth = months[today.getMonth()];
    const currentYear = today.getFullYear().toString();

    const paid = paymentData.find(item =>
        item.month === currentMonth &&
        item.year === currentYear
    );

    // আগের Summary Card থাকলে মুছে ফেলো
    const oldCard = document.getElementById("summaryCard");

    if (oldCard) {
        oldCard.remove();
    }

    // নতুন Summary Card
    const card = document.createElement("div");

    card.id = "summaryCard";
    card.className = "card";
    card.style.marginTop = "20px";

    card.innerHTML = `
        <h3>সংক্ষিপ্ত তথ্য</h3>

        <p>💰 মোট জমা: <b>${totalAmount.textContent}</b></p>

        <p>📅 মোট চাঁদা জমা: <b>${paymentData.length}</b> মাস</p>

        <hr style="margin:15px 0;">

        <h3>${paid ? "✅ চলতি মাসের চাঁদা পরিশোধ হয়েছে" : "❌ চলতি মাসের চাঁদা বাকি"}</h3>

        <p>
            <b>মাস:</b> ${currentMonth} ${currentYear}
        </p>

        ${
            paid
            ? `<p><b>পরিমাণ:</b> ৳ ${paid.amount}</p>`
            : ""
        }
    `;

    document.querySelector(".container").appendChild(card);

}