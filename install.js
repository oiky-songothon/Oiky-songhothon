let deferredPrompt;

const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    if (installBtn) {
        installBtn.style.display = "block";
    }

});

if (installBtn) {

    installBtn.addEventListener("click", async () => {

        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {

            console.log("App Installed");

        }

        deferredPrompt = null;

        installBtn.style.display = "none";

    });

}

window.addEventListener("appinstalled", () => {

    console.log("App Successfully Installed");

    if (installBtn) {
        installBtn.style.display = "none";
    }

});