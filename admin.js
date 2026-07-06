import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =====================
// HTML Elements
// =====================

const memberList = document.getElementById("adminMemberList");
const searchBox = document.getElementById("adminSearch");

let allMembers = [];

// =====================
// Login Check
// =====================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "signin.html";

        return;

    }

    const adminSnap = await getDoc(doc(db, "users", user.uid));

    if (!adminSnap.exists()) {

        alert("তথ্য পাওয়া যায়নি।");

        location.href = "signin.html";

        return;

    }

    const admin = adminSnap.data();

    if (admin.role !== "admin") {

        alert("আপনার Admin অনুমতি নেই।");

        location.href = "dashboard.html";

        return;

    }

    await loadMembers();

});// =====================
// Load Members
// =====================

async function loadMembers() {

    memberList.innerHTML = `
        <p style="text-align:center">
            লোড হচ্ছে...
        </p>
    `;

    allMembers = [];

    try {

        const snapshot = await getDocs(collection(db, "users"));

        snapshot.forEach((docSnap) => {

            allMembers.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        renderMembers(allMembers);

    } catch (err) {

        console.log(err);

        memberList.innerHTML = `
            <p style="text-align:center;color:red;">
                সদস্য লোড করা যায়নি।
            </p>
        `;

    }

}

// =====================
// Render Members
// =====================

function renderMembers(list) {

    memberList.innerHTML = "";

    if (list.length === 0) {

        memberList.innerHTML = `
            <p style="text-align:center">
                কোনো সদস্য পাওয়া যায়নি।
            </p>
        `;

        return;

    }

    list.forEach((member) => {

        const photo = member.photo && member.photo !== ""
            ? member.photo
            : "images/default-user.png";

        const badge =
            member.status === "approved"
            ? "<span style='color:green;font-weight:bold'>Approved</span>"
            : "<span style='color:orange;font-weight:bold'>Pending</span>";

        memberList.innerHTML += `

        <div class="card member-card">

            <div style="display:flex;align-items:center;gap:15px;">

                <img
                    src="${photo}"
                    style="
                        width:65px;
                        height:65px;
                        border-radius:50%;
                        object-fit:cover;
                    ">

                <div style="flex:1;">

                    <h3>${member.name}</h3>

                    <p>🏠 ${member.house}</p>

                    <p>📱 ${member.countryCode} ${member.phone}</p>

                    <p>${badge}</p>

                </div>

            </div>

            <div
                style="
                    display:flex;
                    gap:10px;
                    margin-top:15px;
                ">

                <button
                    class="btn open-payment"
                    data-id="${member.id}">
                    💰 চাঁদা
                </button>

                <button
                    class="btn delete-member"
                    data-id="${member.id}">
                    🗑️ Delete
                </button>

            </div>

        </div>

        `;

    });

}// =====================
// Search Member
// =====================

searchBox.addEventListener("input", () => {

    const keyword = searchBox.value.trim().toLowerCase();

    if (keyword === "") {
        renderMembers(allMembers);
        return;
    }

    const filtered = allMembers.filter((member) => {

        const name = (member.name || "").toLowerCase();
        const house = (member.house || "").toLowerCase();
        const phone = (member.phone || "").toLowerCase();

        return (
            name.includes(keyword) ||
            house.includes(keyword) ||
            phone.includes(keyword)
        );

    });

    renderMembers(filtered);

});

// =====================
// Delete Member Payments
// =====================

async function deleteMemberPayments(uid) {

    const q = query(
        collection(db, "payments"),
        where("uid", "==", uid)
    );

    const snapshot = await getDocs(q);

    for (const payment of snapshot.docs) {

        await deleteDoc(doc(db, "payments", payment.id));

    }

}

// =====================
// Card Button Events
// =====================

memberList.addEventListener("click", async (e) => {

    // Payment Page
    if (e.target.classList.contains("open-payment")) {

        const memberId = e.target.dataset.id;

        localStorage.setItem("selectedMember", memberId);

        location.href = "payment.html";

        return;

    }

    // Delete Member
    if (e.target.classList.contains("delete-member")) {

        const uid = e.target.dataset.id;

        if (!confirm("আপনি কি সদস্য এবং তার সব চাঁদার হিসাব মুছে ফেলতে চান?")) {
            return;
        }

        try {

            // প্রথমে Payment History Delete
            await deleteMemberPayments(uid);

            // তারপর Member Delete
            await deleteDoc(doc(db, "users", uid));

            alert("সদস্য সফলভাবে মুছে ফেলা হয়েছে।");

            await loadMembers();

        } catch (err) {

            console.error(err);

            alert("সদস্য মুছে ফেলা যায়নি।");

        }

    }

});// =====================
// Extra Functions
// =====================

// মোট সদস্য সংখ্যা দেখানো
function updateMemberCount() {

    const title = document.querySelector(".topbar h2");

    if (title) {
        title.textContent = `এডমিন প্যানেল (${allMembers.length})`;
    }

}

// renderMembers() এর পরে Member Count Update
const oldRenderMembers = renderMembers;

renderMembers = function (list) {

    oldRenderMembers(list);

    updateMemberCount();

    document.querySelectorAll(".member-card").forEach((card, index) => {

        const member = list[index];

        if (!member) return;

        if (member.role === "admin") {

            const badge = document.createElement("p");

            badge.innerHTML = "👑 Admin";
            badge.style.color = "#ff9800";
            badge.style.fontWeight = "bold";
            badge.style.marginTop = "6px";

            card.querySelector("div div").appendChild(badge);

        }

    });

};

console.log("Admin Module Loaded Successfully");