import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp
  updateDoc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const memberName = document.getElementById("memberName");
const memberHouse = document.getElementById("memberHouse");
const memberPhone = document.getElementById("memberPhone");

const month = document.getElementById("month");
const year = document.getElementById("year");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const note = document.getElementById("note");

savePayment.addEventListener("click", async () => {

    if (amount.value == "") {
        alert("টাকার পরিমাণ লিখুন");
        return;
    }

    const paymentData = {
        uid: memberId,
        month: month.value,
        year: year.value,
        amount: Number(amount.value),
        date: date.value,
        note: note.value
    };

    if (editingPaymentId) {

        await updateDoc(
            doc(db, "payments", editingPaymentId),
            paymentData
        );

        alert("হিসাব সফলভাবে আপডেট হয়েছে।");

        editingPaymentId = null;
        savePayment.textContent = "চাঁদা সংরক্ষণ করুন";

    } else {

        paymentData.createdAt = serverTimestamp();

        await addDoc(collection(db, "payments"), paymentData);

        alert("চাঁদা সফলভাবে সংরক্ষণ হয়েছে।");

    }

    amount.value = "";
    note.value = "";

    loadPayments();

});
const paymentHistory = document.getElementById("paymentHistory");

let memberId = "";
let editingPaymentId = null;
onAuthStateChanged(auth, async(user)=>{

    if(!user){
        location.href="signin.html";
        return;
    }

    memberId = localStorage.getItem("selectedMember");

    if(!memberId){
        alert("সদস্য নির্বাচন করা হয়নি");
        history.back();
        return;
    }

    await loadMember();
    await loadPayments();

});

async function loadMember(){

    const snap = await getDoc(doc(db,"users",memberId));

    if(!snap.exists()) return;

    const data = snap.data();

    memberName.innerHTML = data.name;
    memberHouse.innerHTML = "🏠 " + data.house;
    memberPhone.innerHTML = "📱 " + data.countryCode + " " + data.phone;

}

paymentHistory.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (e.target.classList.contains("delete-btn")) {

        if (!confirm("এই হিসাবটি মুছে ফেলতে চান?")) return;

        await deleteDoc(doc(db, "payments", id));

        alert("হিসাব মুছে ফেলা হয়েছে।");

        loadPayments();

        return;
    }

    if (e.target.classList.contains("edit-btn")) {

        const snap = await getDoc(doc(db, "payments", id));

        if (!snap.exists()) return;

        const p = snap.data();

        month.value = p.month;
        year.value = p.year;
        amount.value = p.amount;
        date.value = p.date;
        note.value = p.note;

        editingPaymentId = id;

        savePayment.textContent = "আপডেট করুন";
    }

});

    alert("চাঁদা সফলভাবে সংরক্ষণ হয়েছে।");

    amount.value="";
    note.value="";

    loadPayments();

});

async function loadPayments(){

    paymentHistory.innerHTML="লোড হচ্ছে...";
<button
class="edit-btn"
data-id="${d.id}">
✏ Edit
</button>
    const q=query(
        collection(db,"payments"),
        where("uid","==",memberId),
        orderBy("createdAt","desc")
    );

    const snapshot=await getDocs(q);

    paymentHistory.innerHTML="";

    if(snapshot.empty){

        paymentHistory.innerHTML="<p>এখনও কোনো হিসাব নেই।</p>";
        return;

    }

    snapshot.forEach((d)=>{

    const p = d.data();

    paymentHistory.innerHTML += `

    <div class="payment-item">

        <div>

            <b>${p.month} ${p.year}</b><br>

            <small>${p.date}</small><br>

            <small>${p.note || ""}</small>

        </div>

        <div style="text-align:right">

            <b>৳ ${p.amount}</b><br><br>

            <button
                class="delete-btn"
                data-id="${d.id}">
                🗑 Delete
            </button>

        </div>

    </div>

    `;

});import {
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

paymentHistory.addEventListener("click", async(e)=>{

    if(!e.target.classList.contains("delete-btn")) return;

    const id = e.target.dataset.id;

    const ok = confirm("এই হিসাবটি মুছে ফেলতে চান?");

    if(!ok) return;

    await deleteDoc(doc(db,"payments",id));

    alert("হিসাব সফলভাবে মুছে ফেলা হয়েছে।");

    loadPayments();

});