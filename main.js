import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =======================
// Show / Hide Password
// =======================

const togglePassword = document.getElementById("togglePassword");

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        const pass = document.getElementById("password");

        if(pass.type==="password"){
            pass.type="text";
            togglePassword.innerHTML="🙈";
        }else{
            pass.type="password";
            togglePassword.innerHTML="👁";
        }

    });

}

// =======================
// Register
// =======================

const registerForm=document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const name=document.getElementById("name").value.trim();

const house=document.getElementById("house").value;

const code=document.getElementById("countryCode").value;

const phone=document.getElementById("phone").value.trim();

const password=document.getElementById("password").value;

const email=(code+phone).replace("+","")+"@oikko.app";

try{

const userCredential=await createUserWithEmailAndPassword(auth,email,password);

const uid=userCredential.user.uid;

await setDoc(doc(db,"users",uid),{
status: "pending",
approvedBy: "",
approvedAt: "",
name:name,

house:house,

countryCode:code,

phone:phone,

role:"member",

photo:"",

createdAt:new Date().toISOString()

});

alert("রেজিস্ট্রেশন সফল হয়েছে।");

location.href="signin.html";

}catch(err){

alert(err.message);

}

});

}

// =======================
// Login
// =======================

const loginForm=document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const phone=document.getElementById("loginPhone").value.trim();

const password=document.getElementById("loginPassword").value;

const code=document.getElementById("loginCountryCode").value;

const email=(code+phone).replace("+","")+"@oikko.app";

try{

const userCredential=await signInWithEmailAndPassword(auth,email,password);

localStorage.setItem("uid",userCredential.user.uid);

const docSnap=await getDoc(doc(db,"users",userCredential.user.uid));

const docSnap = await getDoc(
    doc(db, "users", userCredential.user.uid)
);

if (!docSnap.exists()) {

    alert("ব্যবহারকারীর তথ্য পাওয়া যায়নি।");

    return;

}

const data = docSnap.data();

if (data.status !== "approved") {

    alert("আপনার সদস্যপদ এখনও অনুমোদিত হয়নি।");

    return;

}

location.href = "dashboard.html";

}catch(err){

alert("লগইন ব্যর্থ");

}

});

}