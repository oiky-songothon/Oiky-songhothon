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
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ======================
// HTML Elements
// ======================

const memberPhoto = document.getElementById("memberPhoto");
const memberName = document.getElementById("memberName");
const memberHouse = document.getElementById("memberHouse");
const memberPhone = document.getElementById("memberPhone");

const month = document.getElementById("month");
const year = document.getElementById("year");
const amount = document.getElementById("amount");

const savePayment = document.getElementById("savePayment");

const paymentHistory = document.getElementById("paymentHistory");
const totalPaid = document.getElementById("totalPaid");

let memberId = "";

// ======================
// Login Check
// ======================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "signin.html";
        return;

    }
const userSnap = await getDoc(doc(db, "users", user.uid));

if (!userSnap.exists()) {

    location.href = "signin.html";
    return;

}

const userData = userSnap.data();

if (userData.role !== "admin") {

    alert("আপনার এই পেজে প্রবেশের অনুমতি নেই।");

    location.href = "dashboard.html";

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

// ======================
// Load Member
// ======================

async function loadMember() {

    try {

        const snap = await getDoc(doc(db, "users", memberId));

        if (!snap.exists()) {

            alert("সদস্য পাওয়া যায়নি।");

            history.back();

            return;

        }

        const data = snap.data();

        memberName.textContent = data.name;

        memberHouse.textContent = "🏠 " + data.house;

        memberPhone.textContent =
            "📱 " + data.countryCode + " " + data.phone;

        if (data.photo && data.photo !== "") {

            memberPhoto.src = data.photo;

        }

        await loadPaymentHistory();

    } catch (err) {

        console.log(err);

        alert("সদস্যের তথ্য লোড করা যায়নি।");

    }

}// ======================
// Save Payment
// ======================

savePayment.addEventListener("click", async () => {

    const paymentAmount = amount.value.trim();

    if (paymentAmount === "") {
        alert("টাকার পরিমাণ লিখুন।");
        return;
    }

    if (Number(paymentAmount) <= 0) {
        alert("সঠিক টাকার পরিমাণ লিখুন।");
        return;
    }

    try {

        // একই মাসে আগে টাকা জমা হয়েছে কিনা
        const paymentQuery = query(
            collection(db, "payments"),
            where("uid", "==", memberId),
            where("month", "==", month.value),
            where("year", "==", year.value)
        );

        const paymentSnapshot = await getDocs(paymentQuery);

        if (!paymentSnapshot.empty) {

            alert("এই মাসের চাঁদা ইতোমধ্যে যোগ করা হয়েছে।");

            return;

        }

        savePayment.disabled = true;
        savePayment.textContent = "সংরক্ষণ হচ্ছে...";

        await addDoc(collection(db, "payments"), {

            uid: memberId,

            month: month.value,

            year: year.value,

            amount: Number(paymentAmount),

            date: new Date().toLocaleDateString("en-CA"),

            note: "",

            createdAt: serverTimestamp()

        });

        amount.value = "";

        alert("চাঁদা সফলভাবে সংরক্ষণ হয়েছে।");


    } catch (err) {

        console.log(err);

        alert("চাঁদা সংরক্ষণ করা যায়নি।");

    } finally {

        savePayment.disabled = false;
        savePayment.innerHTML = "💰 চাঁদা সংরক্ষণ করুন";

    }

});// ======================
// Payment History
// ======================

async function loadPaymentHistory() {

    paymentHistory.innerHTML = "";

    let total = 0;

    const q = query(
        collection(db, "payments"),
        where("uid", "==", memberId)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

        paymentHistory.innerHTML = `
            <p style="text-align:center;">
                এখনো কোনো চাঁদা যোগ করা হয়নি।
            </p>
        `;

        totalPaid.textContent = "৳ 0";

        return;

    }

    snapshot.forEach((d) => {

        const p = d.data();

        total += Number(p.amount || 0);

        paymentHistory.innerHTML += `

        <div class="payment-item">

            <h4>${p.month} ${p.year}</h4>

            <p>💰 ${p.amount} টাকা</p>

            <p>📅 ${p.date}</p>

            <div class="payment-actions">

                <button
                    class="edit-btn"
                    data-id="${d.id}"
                    data-amount="${p.amount}">
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    data-id="${d.id}">
                    🗑️ Delete
                </button>

            </div>

        </div>

        `;

    });

    totalPaid.textContent = "৳ " + total;

}

// ======================
// Edit & Delete Payment
// ======================

paymentHistory.addEventListener("click", async (e) => {

    // Edit
    if (e.target.classList.contains("edit-btn")) {

        const id = e.target.dataset.id;

        const oldAmount = e.target.dataset.amount;

        const newAmount = prompt(
            "নতুন টাকার পরিমাণ লিখুন",
            oldAmount
        );

        if (newAmount === null) return;

        if (newAmount.trim() === "") return;

        if (isNaN(newAmount) || Number(newAmount) <= 0) {

            alert("সঠিক টাকার পরিমাণ লিখুন।");

            return;

        }

        try {

            await updateDoc(doc(db, "payments", id), {

                amount: Number(newAmount)

            });

            alert("হিসাব সফলভাবে আপডেট হয়েছে।");

            await loadPaymentHistory();

        } catch (err) {

            console.log(err);

            alert("আপডেট করা যায়নি।");

        }

        return;

    }

    // Delete
    if (e.target.classList.contains("delete-btn")) {

        if (!confirm("এই হিসাবটি মুছে ফেলতে চান?")) return;

        try {

            await deleteDoc(doc(db, "payments", e.target.dataset.id));

            alert("হিসাব মুছে ফেলা হয়েছে।");

            await loadPaymentHistory();

        } catch (err) {

            console.log(err);

            alert("হিসাব মুছতে সমস্যা হয়েছে।");

        }

    }

});// ======================
// Helper Functions
// ======================

// বর্তমান মাস ও বছর স্বয়ংক্রিয়ভাবে নির্বাচন
(function () {

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

    month.value = months[today.getMonth()];
    year.value = today.getFullYear();

})();

// Enter চাপলে Save হবে
amount.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        savePayment.click();

    }

});

// Amount এ শুধু সংখ্যা
amount.addEventListener("input", () => {

    amount.value = amount.value.replace(/[^0-9]/g, "");

});

// ======================
// Refresh Payment History
// ======================

async function refreshPageData() {

    try {

        await loadMember();
        await loadPaymentHistory();

    } catch (err) {

        console.log(err);

    }

}

// ======================
// Console Message
// ======================

console.log("Payment Module Loaded Successfully");