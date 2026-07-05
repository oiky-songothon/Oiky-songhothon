import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const pendingList = document.getElementById("pendingList");

// Login & Admin Check
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.href = "signin.html";
        return;
    }

    const adminDoc = await getDoc(doc(db, "users", user.uid));

    if (!adminDoc.exists()) {
        location.href = "dashboard.html";
        return;
    }

    if (adminDoc.data().role !== "admin") {
        alert("আপনার Admin অনুমতি নেই।");
        location.href = "dashboard.html";
        return;
    }

    await loadPendingMembers(user.uid);

});

async function loadPendingMembers(adminId) {

    pendingList.innerHTML = "<p style='text-align:center'>লোড হচ্ছে...</p>";

    const q = query(
        collection(db, "users"),
        where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);

    pendingList.innerHTML = "";

    if (snapshot.empty) {
        pendingList.innerHTML = "<p style='text-align:center'>কোন নতুন আবেদন নেই।</p>";
        return;
    }

    snapshot.forEach((d) => {

        const m = d.data();

        pendingList.innerHTML += `

        <div class="member-card">

            <div>

                <h3>${m.name}</h3>

                <p>${m.house}</p>

                <p>${m.countryCode} ${m.phone}</p>

            </div>

            <div>

                <button
                class="approve-btn"
                data-id="${d.id}"
                data-admin="${adminId}">
                ✅ অনুমোদন
                </button>

                <br><br>

                <button
                class="reject-btn"
                data-id="${d.id}">
                ❌ বাতিল
                </button>

            </div>

        </div>

        `;

    });

}

pendingList.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (e.target.classList.contains("approve-btn")) {

        await updateDoc(doc(db, "users", id), {

    status: "approved",

    approvedBy: e.target.dataset.admin,

    approvedAt: new Date().toISOString()

});

        alert("সদস্য অনুমোদিত হয়েছে।");

        loadPendingMembers(e.target.dataset.admin);

        return;

    }

    if (e.target.classList.contains("reject-btn")) {

        if (!confirm("এই আবেদনটি বাতিল করতে চান?")) return;

        await deleteDoc(doc(db, "users", id));

        alert("আবেদন বাতিল করা হয়েছে।");

        await loadPendingMembers(auth.currentUser.uid);

    }

});