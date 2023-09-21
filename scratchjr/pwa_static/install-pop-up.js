let deferredPrompt;

function createPopup() {
    let html = `
<div class="install-pop-up">
    <p class="content">ⓘ 安装 ScratchJr 客户端获得更好体验</p>
    <div class="actions">
        <button class="btn-cancel link">暂不安装</button> 
        <button class="btn-install primary">立即安装</button>
    </div>
</div>
`;
    let css = `
.popup {
    font-size: 16px;
    color: #444;
    background: white;
    position: fixed;
    top: 0;
    left: 50%;
    transform: translate3d(-50%, -150%, 0);
    z-index: 999;
    box-shadow: 0 1px 2px #bbb;
    border-radius: 8px;
    width: 480px;
    max-width: calc(100% - 32px);
    transition: transform 500ms ease-in-out;
}

.popup.show {
    transform: translate3d(-50%, 32px, 0);
}

.popup p {
    margin: 0;
}

.install-pop-up {
    padding: 16px;
    display: flex;
    align-content: center;
    align-items: flex-start;
    flex-direction: column;
}
.popup .content {
    margin-bottom: 16px;
}

.popup .actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: row;
    width: 100%;
    margin-top: 8px;
}
button {
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
}

button:active {
    color: #666;
}

button.link {
    color: #ffaa36;
    background: none;
}

button.primary {
    margin-left: 8px;
    background: #ffaa36;
    color: white;
}

button.primary:active {
    background: #77afff;
    color: white;
}
`;

    let shadowRoot = document.createElement("div");
    let root = shadowRoot.attachShadow({ mode: "open" });
    let style = document.createElement("style");
    style.textContent = css;

    let dom = document.createElement("div");
    dom.className = "popup";
    dom.innerHTML = html;

    root.appendChild(style);
    root.appendChild(dom);
    document.body.appendChild(shadowRoot);

    let showTimeout = null;
    function showInstallPromotion() {
        clearTimeout(showTimeout);
        dom.classList.add("show");
        showTimeout = setTimeout(() => {
            dom.classList.remove("show");
        }, 8000);
    }

    function hideInstallPromotion() {
        clearTimeout(showTimeout);
        dom.classList.remove("show");
    }

    let btnInstall = dom.querySelector(".btn-install");
    btnInstall.addEventListener(
        "click",
        async () => {
            hideInstallPromotion();
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
        },
        false
    );

    let btnNotNow = dom.querySelector(".btn-cancel");
    btnNotNow.addEventListener(
        "click",
        () => {
            hideInstallPromotion();
        },
        false
    );

    return { showInstallPromotion, hideInstallPromotion };
}

let popup = createPopup();

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    popup.showInstallPromotion();
    console.log(`'beforeinstallprompt' event was fired.`);
});

window.addEventListener("appinstalled", () => {
    popup.hideInstallPromotion();
    deferredPrompt = null;
    console.log("PWA was installed");
});
