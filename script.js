// 1. AMBIL NAMA TAMU DARI URL (?to=Nama+Tamu)
const urlParams = new URLSearchParams(window.location.search);
const guestName = urlParams.get('to');
if (guestName) {
    document.getElementById('guest-name').innerText = guestName;
}

// Elemen Audio & Tombol Musik
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-control');
const musicIcon = document.getElementById('music-icon');
let isPlaying = false;

// 2. FUNGSI BUKA UNDANGAN (SLIDE UP COVER)
function bukaUndangan() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');

    // Slide up animation cover
    cover.classList.add('slide-up');
    
    setTimeout(() => {
        cover.style.display = 'none';
        mainContent.classList.remove('hidden');
        
        // Scroll container mobile ke paling atas
        document.querySelector('.mobile-container').scrollTop = 0;
    }, 800);

    // Putar Musik
    bgMusic.play().then(() => {
        isPlaying = true;
        musicIcon.innerText = '🎵';
        musicBtn.classList.add('rotating');
    }).catch(e => {
        console.log("Gagal memutar musik otomatis:", e);
    });
}

// 3. FUNGSI TOGGLE MUSIK
function toggleMusic() {
    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        musicIcon.innerText = '🔇';
        musicBtn.classList.remove('rotating');
    } else {
        bgMusic.play();
        isPlaying = true;
        musicIcon.innerText = '🎵';
        musicBtn.classList.add('rotating');
    }
}

// 4. COUNTDOWN TIMER REAL-TIME
const targetDate = new Date("December 12, 2026 08:00:00").getTime();

setInterval(function() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (document.getElementById('days')) {
        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }
}, 1000);

// 5. FITUR INTERAKTIF BUKU TAMU / RSVP (TERHUBUNG KE GOOGLE SHEETS)
const SCRIPT_URL = "URL_WEB_APP_BARU_ANDA"; // Tempel URL baru di sini

function muatUcapan() {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            commentsList.innerHTML = '';
            
            if (!data || data.length === 0) {
                commentsList.innerHTML = '<p style="text-align:center; color:#777; font-size:0.85rem;">Belum ada ucapan tersimpan.</p>';
                return;
            }

            // Tampilkan dari ucapan terbaru di paling atas
            data.reverse().forEach(item => {
                const badgeClass = item.status === 'Hadir' ? 'hadir' : 'berhalangan';
                const card = document.createElement('div');
                card.className = 'comment-card';
                card.innerHTML = `
                    <h4>${item.nama} <span class="badge ${badgeClass}">${item.status}</span></h4>
                    <p>"${item.ucapan}"</p>
                `;
                commentsList.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error muat ucapan:', error);
        });
}

function tambahUcapan(event) {
    event.preventDefault();

    const btnSubmit = document.getElementById('btn-submit');
    const name = document.getElementById('rsvp-name').value;
    const status = document.getElementById('rsvp-status').value;
    const message = document.getElementById('rsvp-message').value;

    if (btnSubmit) {
        btnSubmit.innerText = "Mengirim...";
        btnSubmit.disabled = true;
    }

    const payload = {
        nama: name,
        status: status,
        ucapan: message
    };

    // Kirim menggunakan POST mode no-cors agar lolos dari batasan CORS browser
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        alert("Terima kasih! Ucapan Anda telah berhasil dikirim.");
        document.getElementById('rsvp-form').reset();
        if (btnSubmit) {
            btnSubmit.innerText = "Kirim Ucapan";
            btnSubmit.disabled = false;
        }
        // Tunggu 1,5 detik agar Google Sheets selesai menulis baris baru, lalu muat ulang ucapan
        setTimeout(muatUcapan, 1500);
    })
    .catch(error => {
        console.error('Error kirim ucapan:', error);
        alert("Terjadi kesalahan saat mengirim ucapan.");
        if (btnSubmit) {
            btnSubmit.innerText = "Kirim Ucapan";
            btnSubmit.disabled = false;
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    muatUcapan();
});

// 6. FITUR SALIN REKENING
function salinRekening(elementId, buttonElement) {
    const nomorRekening = document.getElementById(elementId).innerText;

    navigator.clipboard.writeText(nomorRekening).then(() => {
        const teksAsli = buttonElement.innerText;
        buttonElement.innerText = "✅ Berhasil Disalin!";
        buttonElement.style.backgroundColor = "#4CAF50";
        buttonElement.style.color = "white";

        setTimeout(() => {
            buttonElement.innerText = teksAsli;
            buttonElement.style.backgroundColor = "#f3e5ab";
            buttonElement.style.color = "#5a401c";
        }, 2000);
    });
}