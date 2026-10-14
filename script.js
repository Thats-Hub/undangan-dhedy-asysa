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

// 3. Fungsi Buka Undangan (Sampul Cover)
function bukaUndangan() {
    const cover = document.getElementById('cover');
    if (cover) {
        cover.style.transform = 'translateY(-100%)';
        cover.style.opacity = '0';
        setTimeout(() => {
            cover.style.display = 'none';
        }, 800);
    }
}

// 4. Konfigurasi Google Sheets URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxDNxlTlMOmJ3KY0EEaP89595FnHxw2fMrSAlImkWp5nH9hpPvXtujd9Zt1XRJNk1R9MA/exec";

// 5. Fungsi Ambil & Tampilkan Ucapan
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

// 6. Fungsi Kirim Ucapan ke Google Sheets
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

// 7. Fungsi Salin Nomor Rekening
function salinRekening(elementId, buttonElement) {
    const nomorRekening = document.getElementById(elementId).innerText;

    navigator.clipboard.writeText(nomorRekening).then(() => {
        const teksAsli = buttonElement.innerText;
        buttonElement.innerText = "✔ Berhasil Disalin!";
        buttonElement.style.backgroundColor = "#4CAF50";
        buttonElement.style.color = "white";

        setTimeout(() => {
            buttonElement.innerText = teksAsli;
            buttonElement.style.backgroundColor = "";
            buttonElement.style.color = "";
        }, 2000);
    });
}