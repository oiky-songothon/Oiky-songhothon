import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Login Check
onAuthStateChanged(auth, async (user) => {

    onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.href = "signin.html";
        return;
    }

    try {

        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (!userSnap.exists()) {
            alert("User data পাওয়া যায়নি");
            location.href = "signin.html";
            return;
        }

        const data = userSnap.data();

        // Admin Check
        if (data.role !== "admin") {

            alert("আপনার Admin Dashboard ব্যবহারের অনুমতি নেই।");

            location.href = "profile.html";

            return;
        }

        document.getElementById("memberName").textContent =
            "স্বাগতম, " + data.name;

        if (data.photo) {
            document.getElementById("profileImage").src = data.photo;
        }

        await loadStatistics();

    } catch (err) {

        console.error(err);

    }

});
    try {

        const userSnap = await getDoc(doc(db, "users", user.uid));

        const data = userSnap.data();

// শুধুমাত্র Admin Dashboard ব্যবহার করতে পারবে
if (data.role !== "admin") {

    alert("আপনার Admin Dashboard ব্যবহারের অনুমতি নেই।");

    location.href = "profile.html";

    return;

}

document.getElementById("memberName").textContent =
    "স্বাগতম, " + data.name;

if (data.photo) {
    document.getElementById("profileImage").src = data.photo;
}

await loadStatistics();

    } catch (err) {

        console.error(err);

    }

});

// Logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {

    if (confirm("আপনি কি লগআউট করতে চান?")) {

        await signOut(auth);

        location.href = "signin.html";

    }

});

// Dashboard Statistics
async function loadStatistics() {

    let memberCount = 0;
    let adminCount = 0;
    let totalMoney = 0;
    let monthMoney = 0;
    let dueMembers = 0;

    const paidMembers = new Set();

    const monthNames = [
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

    const currentMonth = monthNames[today.getMonth()];
    const currentYear = today.getFullYear().toString();

    // Users
    const users = await getDocs(collection(db, "users"));

    users.forEach((d) => {

        const user = d.data();

        memberCount++;

        if (user.role === "admin") {
            adminCount++;
        }

    });

    // Payments
    const payments = await getDocs(collection(db, "payments"));

    payments.forEach((d) => {

        const p = d.data();

        totalMoney += Number(p.amount || 0);

        if (p.month === currentMonth && p.year === currentYear) {

            monthMoney += Number(p.amount || 0);

            paidMembers.add(p.uid);

        }

    });

    dueMembers = memberCount - paidMembers.size;

    if (dueMembers < 0) {
        dueMembers = 0;
    }

    document.getElementById("totalMembers").textContent = memberCount;
    document.getElementById("totalAdmins").textContent = adminCount;
    document.getElementById("totalCollection").textContent = "৳ " + totalMoney;
    document.getElementById("currentMonthCollection").textContent = "৳ " + monthMoney;
    document.getElementById("dueMembers").textContent = dueMembers;

}