// Ambil elemen canvas dan konteks 2D
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Load gambar latar belakang (background), karakter, dan buah-buahan
var bgImage = new Image();
bgImage.src = "assets/images/BACKGROUND.png"; 
// ^ GANTI jika path gambar latar berbeda

var playerImage = new Image();
playerImage.src = "assets/images/karakterfinal.png"; 
// ^ GANTI jika nama atau lokasi gambar karakter berbeda

// Buah-buahan: jeruk, pisang, anggur
var fruitImages = [];

// Jeruk
var orangeImage = new Image();
orangeImage.src = "assets/images/jeruk.png"; 
fruitImages.push(orangeImage);

// Pisang
var bananaImage = new Image();
bananaImage.src = "assets/images/pisang.png"; 
fruitImages.push(bananaImage);

// Anggur
var grapesImage = new Image();
grapesImage.src = "assets/images/anggur.png"; 
fruitImages.push(grapesImage);

// **Status game**: skor, jumlah gagal (misses), dan flag game over
var score = 0;
var misses = 0;
var maxMisses = 3;   // Batas gagal (game over saat gagal >= 3)
var gameOver = false;

// **Objek pemain (karakter)** dengan properti awal
var player = {
    x: 0,          // Posisi X (dapat disesuaikan, akan diatur ulang saat background load)
    y: 0,            // Posisi Y (akan diatur ulang saat background load)
    width: 140,       // Lebar karakter (ubah agar sesuai ukuran gambar karakter)
    height: 150,      // Tinggi karakter (ubah sesuai gambar karakter)
    speed: 10         // Kecepatan gerak karakter (atur lebih tinggi untuk karakter lebih cepat)
};

// Daftar buah-buah yang sedang jatuh
var fruits = [];

// **Pengaturan spawn buah** (waktu mulai dan interval)
var spawnStartTime = Date.now();
var lastSpawnTime = Date.now();
var spawnInterval = 1000; // Waktu antar spawn buah dalam milidetik (1 detik). Bisa diubah.
var spawnMax = 1;         // Jumlah maksimal buah bersamaan (akan naik setelah 10 detik)

// **Bunyi**: suara tangkap buah dan suara game over
var catchSound = new Audio("assets/sounds/catch.mp3");         // Ganti nama file suara tangkap jika perlu
var gameOverSound = new Audio("assets/sounds/gameover.mp3");   // Ganti nama file suara game over jika perlu

// Setelah gambar latar load, atur ukuran canvas dan pos karakter, lalu mulai game loop
bgImage.onload = function() {
    // Sesuaikan canvas dengan ukuran background
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Posisi karakter di atas background (sedikit jarak dari bawah)
    player.y = canvas.height - player.height - 90;
    // Mulai loop utama game
    requestAnimationFrame(gameLoop);
};

// **Input keyboard** untuk gerakan karakter
var keys = {};
window.addEventListener("keydown", function(e) {
    keys[e.key] = true;
});
window.addEventListener("keyup", function(e) {
    keys[e.key] = false;
});

// Fungsi membuat buah baru di posisi X acak atas canvas
function spawnFruit() {
    var idx = Math.floor(Math.random() * fruitImages.length); // Pilih jenis buah secara acak
    var img = fruitImages[idx];

    var scale = 2;
    var fruit = {
        x: Math.random() * (canvas.width - img.width * scale), // Posisi horizontal acak (30 = lebar perkiraan buah)
        y: -img.height * scale,     // Mulai di luar layar (atas)
        width: img.width * scale,  // Lebar buah (sesuaikan jika perlu memperbesar/memperkecil)
        height: img.height * scale, // Tinggi buah (sesuaikan sesuai proporsi gambar)
        speed: 2 + Math.random() * 2, // Kecepatan jatuh (acak antara 2-4). Atur di sini untuk mengubah kecepatan buah.
        img: img
    };
    fruits.push(fruit);
}

// Fungsi utama: update dan gambar semua elemen
function gameLoop() {
    if (gameOver) return; // Jika game over, hentikan loop

    // Hitung waktu bermain (dalam detik) untuk menambah kesulitan
    var elapsed = (Date.now() - spawnStartTime) / 1000;
    // Setelah 10 detik, izinkan 2 buah muncul sekaligus
    if (elapsed > 10) spawnMax = 2;
    // Setelah 20 detik, izinkan 3 buah muncul sekaligus (bisa disesuaikan atau ditambah levelnya)
    if (elapsed > 20) spawnMax = 3;

    // Spawn buah baru bila interval tercapai dan jumlah buah kurang dari spawnMax
    if (Date.now() - lastSpawnTime > spawnInterval && fruits.length < spawnMax) {
        spawnFruit();
        lastSpawnTime = Date.now();
    }

    // Bersihkan canvas dan gambar ulang background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

    // Gerakkan karakter berdasarkan input (tombol panah atau A/D)
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        player.x -= player.speed;  // ke kiri
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        player.x += player.speed;  // ke kanan
    }
    // Batasi agar karakter tidak keluar layar
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Gambar karakter di posisi baru
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // Update posisi dan gambar setiap buah
    for (var i = 0; i < fruits.length; i++) {
        var f = fruits[i];
        f.y += f.speed; // Gerakkan buah turun
        ctx.drawImage(f.img, f.x, f.y, f.width, f.height);

        // Deteksi tumbukan: jika buah mengenai area karakter
        if (
            f.y + f.height >= player.y &&  // sudut bawah buah sudah sama tinggi atau di bawah karakter
            f.x + f.width >= player.x &&
            f.x <= player.x + player.width
        ) {
            // Tangkap buah
            score++;
            catchSound.play(); // Putar suara tangkap buah
            fruits.splice(i, 1); // Hapus buah yang tertangkap
            i--;
            continue;
        }

        // Jika buah sudah jatuh di bawah layar (gagal ditangkap)
        if (f.y > canvas.height) {
            misses++;
            fruits.splice(i, 1);
            i--;
            // Jika gagal 3 kali, game over
            if (misses >= maxMisses) {
                gameOver = true;
                gameOverSound.play(); // Suara game over
                // Gambar teks Game Over
                ctx.font = "30px Arial";
                ctx.fillStyle = "red";
                ctx.fillText("Anda tidak bersyukur!", canvas.width/2 - 80, canvas.height/2);
                ctx.fillText("rezeki buah anda: " + score, canvas.width/2 - 90, canvas.height/2 + 40);
            }
        }
    }

    // Tampilkan skor di pojok atas (ubah koordinat untuk memindahkan posisi teks jika perlu)
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Skor: " + score, 10, 30); // (10, 30) = posisi x,y teks

    // Lanjutkan loop game selama belum game over
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}
