import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const profilePhoto = document.getElementById("profilePhoto");
const profileName = document.getElementById("profileName");
const profileHouse = document.getElementById("profileHouse");
const profilePhone = document.getElementById("profilePhone");
const photoInput = document.getElementById("photoInput");
const uploadBtn = document.getElementById("uploadBtn");

let currentUser = null;

// Login Check
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.href = "signin.html";
        return;
    }

    currentUser = user;

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    const data = snap.data();

    profileName.textContent = data.name;
    profileHouse.textContent = "🏠 " + data.house;
    profilePhone.textContent =
        "📱 " + data.countryCode + " " + data.phone;

    if (data.photo) {
        profilePhoto.src = data.photo;
    }

});

// // ==============================
// Image Preview
// ==============================

photoInput.addEventListener("change", () => {

    const file = photoInput.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("শুধুমাত্র ছবি নির্বাচন করুন।");

        photoInput.value = "";

        return;

    }

    if (file.size > 5 * 1024 * 1024) {

        alert("ছবির সাইজ ৫ MB এর কম হতে হবে।");

        photoInput.value = "";

        return;

    }

    profilePhoto.src = URL.createObjectURL(file);

});

// ==============================
// Upload Photo
// ==============================

uploadBtn.addEventListener("click", async () => {

    if (!currentUser) {

        alert("ব্যবহারকারী পাওয়া যায়নি।");

        return;

    }

    if (!photoInput.files.length) {

        alert("প্রথমে একটি ছবি নির্বাচন করুন।");

        return;

    }

    try {

        uploadBtn.disabled = true;
        uploadBtn.textContent = "আপলোড হচ্ছে...";

        const file = photoInput.files[0];

        const storageRef = ref(storage, `profiles/${currentUser.uid}`);

        await uploadBytes(storageRef, file);

        const photoURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "users", currentUser.uid), {

            photo: photoURL

        });

        profilePhoto.src = photoURL;

        photoInput.value = "";

        alert("✅ প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে।");

    } catch (err) {

        console.error(err);

        alert("ছবি আপলোড ব্যর্থ হয়েছে।");

    } finally {

        uploadBtn.disabled = false;

        uploadBtn.textContent = "ছবি আপলোড করুন";

    }

});