import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const memberList = document.getElementById("memberList");
const searchBox = document.getElementById("searchBox");

let members = [];// ======================
// Login Check
// ======================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "signin.html";

        return;

    }

    await loadMembers();

});// ======================
// Load Members
// ======================

async function loadMembers() {

    memberList.innerHTML = `
        <p style="text-align:center;">
            লোড হচ্ছে...
        </p>
    `;

    members = [];

    try {

        const querySnapshot = await getDocs(
            collection(db, "users")
        );

        querySnapshot.forEach((docSnap) => {

            members.push({
                id: docSnap.id,
                ...docSnap.data()
            });

        });

        showMembers(members);

    } catch (err) {

        console.error(err);

        memberList.innerHTML = `
            <p style="text-align:center;color:red;">
                সদস্য লোড করা যায়নি।
            </p>
        `;

    }

}// ======================
// Show Members
// ======================

function showMembers(list) {

    memberList.innerHTML = "";

    if (list.length === 0) {

        memberList.innerHTML = `
            <p style="text-align:center;">
                কোনো সদস্য পাওয়া যায়নি।
            </p>
        `;

        return;

    }

    list.forEach((member) => {

        const photo =
            member.photo && member.photo !== ""
            ? member.photo
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const card = document.createElement("div");

        card.className = "member-card";

        card.innerHTML = `

            <div class="member-info">

                <h3>${member.name}</h3>

                <p>🏠 ${member.house}</p>

            </div>

            <img
                class="member-avatar"
                src="${photo}"
                alt="${member.name}">

        `;

        card.addEventListener("click", () => {

            localStorage.setItem(
                "selectedMember",
                member.id
            );

            location.href = "member-details.html";

        });

        memberList.appendChild(card);

    });

}

// ======================
// Search Members
// ======================

searchBox.addEventListener("input", () => {

    const text = searchBox.value
        .trim()
        .toLowerCase();

    if (text === "") {

        showMembers(members);

        return;

    }

    const filtered = members.filter((member) => {

        return (
            (member.name || "")
            .toLowerCase()
            .includes(text)
        );

    });

    showMembers(filtered);

});

// ======================
// Console
// ======================

console.log("Members Module Loaded Successfully");