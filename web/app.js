
let typingFinished = false;
const floatingImages = [];

let loaded=0;
let total=0;

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

function updateProgress() {

    loaded++;

    const percent = Math.floor((loaded / total) * 100);

    progressBar.style.width = percent + "%";
    progressText.textContent = `${loaded} / ${total}`;

}

const message = document.getElementById("message");
const buttons = document.getElementById("buttons");
const finalScreen = document.getElementById("finalScreen");

const preloadedVideos = {};
const videoPromise = [

    "assets/videos/stupid.webm",
    "assets/videos/crazy.webm",
    "assets/videos/disco.webm",
    "assets/videos/2k17.webm",
    "assets/videos/wave.webm",
    "assets/videos/sad.webm"

].map(src=>{

    return new Promise(resolve=>{

        const video=document.createElement("video");

        video.src=src;
        video.preload="auto";

        video.oncanplaythrough= () => {
            updateProgress();
            resolve();
        };
        video.onerror = () => {
            updateProgress();
            resolve();
        };

        video.load();

        preloadedVideos[src]=video;

    });

});

const happyMusic = document.getElementById("bgHappyMusic");
const sadMusic = document.getElementById("bgSadMusic");

// ===== FIX =====
// Promise загрузки музыки

const audioPromises = [
    happyMusic,
    sadMusic
].map(audio => {

    return new Promise(resolve => {

        audio.addEventListener("canplaythrough", () => {
            updateProgress();
            resolve();
        }, { once:true });

        audio.addEventListener("error", () => {
            updateProgress();
            resolve();
        }, { once:true });

        audio.load();

    });

});

function withTimeout(promise,time=5000){

    return Promise.race([

        promise,

        new Promise(resolve=>setTimeout(resolve,time))

    ]);

}

document.addEventListener("DOMContentLoaded", () => {

    const bg = document.getElementById("background");

    fetch("manifest.json")
        .then(r => r.json())
        .then(data => {

            const all = [...data.photos, ...data.gifs];
            const size = getImageSize();

            // ===== FIX =====
            // Всего файлов

            total =
                all.length +   // картинки
                6 +            // видео
                2;             // музыка

            // ===== FIX #2 =====
            // Ждем загрузки всех изображений
            const imagePromises = all.map(src => {

                return new Promise(resolve => {

                    const img = document.createElement("img");

                    img.className = "float";

                    img.onload = () => {
                        updateProgress();
                        resolve();
                    };

                    img.onerror = () => {
                        updateProgress();
                        resolve();
                    };

                    img.src = src;

                    const x = Math.random() * window.innerWidth;
                    const y = Math.random() * window.innerHeight;

                    // Лучше убрать эти две строки, если потом перейдешь на transform
                    // img.style.left = x + "px";
                    // img.style.top = y + "px";

                    const rotation = Math.random() * 20 - 10;

                    img.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

                    img.style.width = size + "px";

                    bg.appendChild(img);

                    floatingImages.push({
                        element: img,
                        x,
                        y,
                        size,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        rotation
                    });

                });

            });

            Promise.all([
                ...imagePromises.map(withTimeout),
                ...videoPromise.map(withTimeout),
                ...audioPromises.map(withTimeout)
            ]).then(() => {
                 // ===== FIX =====
                const loader = document.getElementById("loader");

                 loader.style.opacity = "0";

                 setTimeout(() => {
                    loader.remove();

                    animateBackground();
                    requestAnimationFrame(typeText);
                       }, 400);
            });

        });

});


function animateBackground() {

    floatingImages.forEach(img => {

        img.x += img.vx;
        img.y += img.vy;

        if (img.x < -200) img.x = window.innerWidth;
        if (img.x > window.innerWidth) img.x = -200;

        if (img.y < -200) img.y = window.innerHeight;
        if (img.y > window.innerHeight) img.y = -200;

        // img.element.style.left = img.x + "px";
        // img.element.style.top = img.y + "px";

        // img.element.style.transform =
        //     `rotate(${img.rotation}deg)`;
        img.element.style.transform = `translate(${img.x}px,${img.y}px) rotate(${img.rotation}deg)`;
    });

    requestAnimationFrame(animateBackground);
}

window.addEventListener("resize", () => {

    const r = document.getElementById("rain");
    const c = document.getElementById("confetti");

    r.width = innerWidth;
    r.height = innerHeight;

    c.width = innerWidth;
    c.height = innerHeight;

    // пересобираем фон
    // rebuildBackground();
});

// --------------------
// ПЕЧАТАНИЕ ТЕКСТА
// --------------------
let text = `
    Я до сих пор не понял что случилось.

    И мне тяжело смириться.

    Я знаю, что многое успел натворить за короткий промежуток.

    Не буду искать оправданий.

    Просто хочу спросить тебя один раз.
    `;

const yesText = `
    Спасибо ❤️

    Это значит для меня намного больше,
    чем ты думаешь.
    НО! Я не узнаю что ты ответила и попросил бы дать мне знак в тг)
    <img src="assets/photos/success.png">
    `;

const noText = `
    Ничего страшного.

    Я всё пойму. Единственное чего я хотел бы узнать
    Это то, как ты относилась к нашему короткому и хорошему общению)

    Спасибо за этот месяц.
    Береги себя.
    `;

let i = 0;

function typeText() {

    if (i >= text.length) {

        typingFinished = true;

        buttons.style.display = "flex";

        buttons.animate([
            { opacity: 0, transform: "translateY(20px)" },
            { opacity: 1, transform: "translateY(0)" }
        ], {
            duration: 700,
            fill: "forwards"
        });

        return;
    }

    // message.innerHTML += text[i];
    message.append(text[i]);

    const current = text[i];
    i++;

    const delay =
        current === "." ? 250 :
        current === "," ? 120 :
        35;

    setTimeout(typeText, delay);
}

// typeText();

const face = document.getElementById("face");
[
"assets/faces/happy.png",
"assets/faces/sad.png",
"assets/faces/neutral.png"
].forEach(src=>{

    const img=new Image();
    img.src=src;

});

function getDistance(el, mouseX, mouseY) {
    const rect = el.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    return Math.hypot(mouseX - cx, mouseY - cy);
}

document.addEventListener("mousemove", (e) => {

    const dYes = getDistance(yesBtn, e.clientX, e.clientY);
    const dNo = getDistance(noBtn, e.clientX, e.clientY);

    const threshold = 120;

    if (dYes < threshold) {
        face.src = "assets/faces/happy.png";
        face.style.transform = "translateY(5px) scale(1.05)";
        return;
    }

    if (dNo < threshold) {
        face.src = "assets/faces/sad.png";
        face.style.transform = "translateY(5px) scale(1.05)";
        return;
    }

    face.src = "assets/faces/neutral.png";
    face.style.transform = "translateY(0px) scale(1)";
});

const yesBtn = document.getElementById("yesBtn");
// --------------------
// YES
// --------------------
yesBtn.addEventListener("click", () => {
    logEvent("yes");

    face.src = "assets/faces/happy.png";
    face.style.transform = "translateY(5px) scale(1.05)";

    buttons.style.display = "none";
    //finalScreen.style.display = "block";
    finalScreen.style.display = "none";

    hideFace(); // 👈 ЛИЦО ПРЯЧЕТСЯ

    message.innerHTML = yesText;

    const music = document.getElementById("bgHappyMusic"); // logic music on
    music.volume = 0.5;
    music.play().catch(err => {
        console.log("autoplay blocked:", err);
    });

    startConfetti();

    showYesVideos(); // 👈 ВОТ ТУТ
});



const noBtn = document.getElementById("noBtn");

// --------------------
// NO (убегание + финал)
// --------------------
let attempts = 0;

const offsets = [
    { x: 60, y: -20 },
    { x: -70, y: 15 },
    { x: 40, y: 25 }
];

noBtn.addEventListener("mouseenter", moveNo);
noBtn.addEventListener("touchstart", moveNo);

function moveNo(e) {
    logEvent("move no button");

    face.src = "assets/faces/sad.png";
    face.style.transform = "translateY(5px) scale(1.05)";

     if (!typingFinished) return; // ❗ ВАЖНО

    if (attempts >= 3) return;

    if (e) e.preventDefault();

    const pos = offsets[attempts];

    noBtn.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

    attempts++;
}

noBtn.addEventListener("click", () => {
    logEvent("no");

    face.src = "assets/faces/sad.png";
    face.style.transform = "translateY(5px) scale(1.05)";

    if (!typingFinished) return; // ❗ ВАЖНО

    if (attempts < 3) return;

    buttons.style.display = "none";
    // finalScreen.style.display = "block";
     finalScreen.style.display = "none";

    switchToSadTheme(); // ← ДОБАВИТЬ

    hideFace(); // 👈 ЛИЦО ПРЯЧЕТСЯ

    message.innerHTML = noText;

    const sadMusic = document.getElementById("bgSadMusic"); // logic music on
    sadMusic.volume = 0.5;
    sadMusic.play().catch(err => {
        console.log("autoplay blocked:", err);
    });

    startRain();
    startLightning(); // ← ДОБАВИТЬ

    showNoVideo(); // 👈 ВОТ ТУТ
});

// --------------------
// КОНФЕТТИ
// --------------------
function startConfetti() {

    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const particles = Array.from({ length: 180 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 4 + 2,
        rot: Math.random() * 360,

        depth: Math.random() // 👈 НОВОЕ
    }));

    function animate() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {

            p.y += p.speed;
            p.rot += 4;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot * Math.PI / 180);

            // ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#f5d76e";
            // ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                        const colors = ["#ffffff", "#ffd166", "#ff6b6b"]; // , "#4dabf7"

                        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

                        ctx.shadowColor = "rgba(0,0,0,0.25)";
                        ctx.shadowBlur = 6;
                        ctx.shadowOffsetX = 2;
                        ctx.shadowOffsetY = 2;

                        ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);

                        // обводка для читаемости
                        ctx.strokeStyle = "rgba(0,0,0,0.15)";
                        ctx.lineWidth = 1;
                        ctx.strokeRect(-p.size/2, -p.size/2, p.size, p.size);

                        ctx.shadowBlur = 0;

            ctx.restore();
        });

        requestAnimationFrame(animate);
    }

    animate();
}


// --------------------
// ДОЖДЬ
// --------------------
function startRain() {

    const canvas = document.getElementById("rain");
    const ctx = canvas.getContext("2d");

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const drops = Array.from({ length: 250 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 20 + 10,
        speed: Math.random() * 6 + 4
    }));

    function animate() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(120,160,255,0.5)";

        drops.forEach(d => {

            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d.x, d.y + d.len);
            ctx.stroke();

            d.y += d.speed;

            if (d.y > canvas.height) {
                d.y = -20;
                d.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}

function switchToSadTheme() {

    document.body.style.background = `
        linear-gradient(
            135deg,
            #1e293b 0%,
            #0f172a 50%,
            #020617 100%
        )
    `;

    document.querySelector(".card").style.background =
        "rgba(20,20,30,0.45)";

    document.querySelector(".card").style.color =
        "#e2e8f0";

    document.querySelector("h1").style.color =
        "#93c5fd";

    floatingImages.forEach(img => {
        img.element.style.opacity = "0.25";
        img.element.style.filter = "grayscale(100%)";
    });
}

function startLightning() {

    const flash = document.getElementById("lightning");

    setInterval(() => {

        if (Math.random() > 0.7) {

            flash.animate([
                { opacity: 0 },
                { opacity: 0.8 },
                { opacity: 0 }
            ], {
                duration: 200
            });

        }

    }, 3000);
}

const videoLayer = document.getElementById("videoLayer");

function clearVideos() {
    videoLayer.innerHTML = "";
    videoLayer.classList.remove("show");
}

function showNoVideo() {

    clearVideos();

    const video = preloadedVideos["assets/videos/sad.webm"].cloneNode();
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    videoLayer.appendChild(video);

    requestAnimationFrame(() => {
        videoLayer.classList.add("show");
    });
}

function showYesVideos() {

    clearVideos();

    const sources = [
        "assets/videos/stupid.webm",
        "assets/videos/crazy.webm",
        "assets/videos/disco.webm",
        "assets/videos/2k17.webm",
        "assets/videos/wave.webm"
    ];

    sources.forEach(src => {

        const video = preloadedVideos[src].cloneNode(true);
        video.src = src;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        videoLayer.appendChild(video);
    });

    requestAnimationFrame(() => {
        videoLayer.classList.add("show");
    });
}

function hideFace() {
    face.classList.add("hide");
}

// --------------------
// RESIZE FIX
// --------------------
window.addEventListener("resize", () => {
    const r = document.getElementById("rain");
    const c = document.getElementById("confetti");

    r.width = innerWidth;
    r.height = innerHeight;

    c.width = innerWidth;
    c.height = innerHeight;

    const newSize = getImageSize();

    floatingImages.forEach(img => {
        img.size = newSize;
        img.element.style.width = newSize + "px";
    });

    const videos = document.querySelectorAll("#videoLayer video");

    videos.forEach(v => {
        // просто триггерим reflow адаптацию CSS clamp'а
        v.style.transform = "translateZ(0)";
    });
});

function getImageSize() {
    const w = window.innerWidth;

    if (w < 480) return 70;      // телефон
    if (w < 900) return 110;     // планшет
    return 160;                  // десктоп
}

async function logEvent(action){
fetch("/api/event",{

    method:"POST",

    headers:{
        "Content-Type":"application/json"
    },

    body:JSON.stringify({
        action
    }),

    keepalive:true

}).catch(()=>{});
}
