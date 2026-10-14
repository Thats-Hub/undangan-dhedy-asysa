document.addEventListener("DOMContentLoaded", function() {
    // 1. Ambil nama tamu dari URL (?to=Nama)
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    const guestContainer = document.getElementById('guest-name');
    
    if (guestName && guestContainer) {
        guestContainer.innerText = guestName;
    }

    // 2. Muat ucapan dari Google Sheets saat halaman siap
    muatUcapan();
});

// 3. Fungsi Buka Undangan (Membuka Cover & Menampilkan Konten Utama)
function bukaUndangan() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    
    // Tampilkan konten utama dengan menghapus class 'hidden'
    if (mainContent) {
        mainContent.classList.remove('hidden');
    }

    // Geser cover ke atas
    if (cover) {
        cover.style.transform = 'translateY(-100%)';
        cover.style.opacity = '0';
        setTimeout(() => {
            cover.style.display = 'none';
        }, 800);
    }

    // Putar musik latar otomatis
    const music = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    if (music) {
        music.play().then(() => {
            if (musicIcon) musicIcon.classList.add('rotating');
        }).catch(err => {
            console.log("Autoplay diblokir browser:", err);
        });
    }
}

// 4. Fungsi Kontrol Musik Melayang
function toggleMusic() {
    const music = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-icon');
    if (music.paused) {
        music.play();
        if (musicIcon) musicIcon.classList.add('rotating');
    } else {
        music.pause();
        if (musicIcon) musicIcon.classList.remove('rotating');
    }
}

// 5. Konfigurasi Google Sheets URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDNxlTlMOmJ3KY0EEaP89595FnHxw2fMrSAlImkWp5nH9hpPvXtujd9Zt1XRJNk1R9MA/exec";

// 6. Fungsi Ambil & Tampilkan Ucapan dari Google Sheets
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

// 7. Fungsi Kirim Ucapan ke Google Sheets
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

// 8. Fungsi Salin Nomor Rekening
function salinRekening(elementId, buttonElement) {
    const nomorRekening = document.getElementById(elementId).innerText;

    navigator.clipboard.writeText(nomorRekening).then(() => {
        const teksAsli = buttonElement.innerText;
        buttonElement.innerText = "✔ Berhasil Disalin!";
        buttonElement.style.background = "#4CAF50";
        buttonElement.style.color = "white";

        setTimeout(() => {
            buttonElement.innerText = teksAsli;
            buttonElement.style.background = "";
            buttonElement.style.color = "";
        }, 2000);
    });
}