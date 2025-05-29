const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function startGame() {
    startBtn.style.display = "none";
    restartBtn.style.display = "none";
    resetGame();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    restartBtn.style.display = "none";
    resetGame();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    score = 0;
    misses = 0;
    gameOver = false;
    fruits = [];
    spawnStartTime = Date.now();
    lastSpawnTime = Date.now();
    spawnMax = 1;
    player.x = canvas.width / 2 - player.width / 2;
}

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

leftBtn.addEventListener("touchstart", () => isTouchingLeft = true);
leftBtn.addEventListener("touchend", () => isTouchingLeft = false);

rightBtn.addEventListener("touchstart", () => isTouchingRight = true);
rightBtn.addEventListener("touchend", () => isTouchingRight = false);

var isTouchingLeft = false;
var isTouchingRight = false;

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
var maxMisses = 0;   // Batas gagal (game over saat gagal >= 3)
var gameOver = false;

// **Objek pemain (karakter)** dengan properti awal
var player = {
    x: 80,          // Posisi X (dapat disesuaikan, akan diatur ulang saat background load)
    y: 0,            // Posisi Y (akan diatur ulang saat background load)
    width: 30,       // Lebar karakter (ubah agar sesuai ukuran gambar karakter)
    height: 30,      // Tinggi karakter (ubah sesuai gambar karakter)
    speed: 5        // Kecepatan gerak karakter (atur lebih tinggi untuk karakter lebih cepat)
};

// Daftar buah-buah yang sedang jatuh
var fruits = [];

// **Pengaturan spawn buah** (waktu mulai dan interval)
var spawnStartTime = Date.now();
var lastSpawnTime = Date.now();
var spawnInterval = 1000; // Waktu antar spawn buah dalam milidetik (1 detik). Bisa diubah.
var spawnMax = 1;         // Jumlah maksimal buah bersamaan (akan naik setelah 10 detik)

// **Bunyi**: suara tangkap buah dan suara game over
var catchSound = new Audio("assets/sounds/catch.wav");         // Ganti nama file suara tangkap jika perlu
var gameOverSound = new Audio("assets/sounds/endsound.mp3");   // Ganti nama file suara game over jika perlu

// Setelah gambar latar load, atur ukuran canvas dan pos karakter, lalu mulai game loop
bgImage.onload = function() {
    // Sesuaikan canvas dengan ukuran background
    canvas.width = bgImage.width;
    canvas.height = bgImage.height;
    // Posisi karakter di atas background (sedikit jarak dari bawah)
    player.y = canvas.height - player.height - 10;
    // Mulai loop utama game
    
    if (misses >= maxMisses) {
        gameOver = true;
        gameOverSound.play();
        
        ctx.font = "bold 10px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";

        ctx.fillText("Made by Fikhar", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText("NPM 24072123014 ", canvas.width / 2, canvas.height / 2.5 + 20);
    
        // Tampilkan tombol restart
        
   
       
        return;
    }
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
    var scale = 0.5;
    var fruit = {
        x: Math.random() * (canvas.width -img.width * scale), // Posisi horizontal acak (30 = lebar perkiraan buah)
        y: -img.width * scale,     // Mulai di luar layar (atas)
        width: img.width * scale,  // Lebar buah (sesuaikan jika perlu memperbesar/memperkecil)
        height: img.width * scale, // Tinggi buah (sesuaikan sesuai proporsi gambar)
        speed: 1 + Math.random() * 2, // Kecepatan jatuh (acak antara 2-4). Atur di sini untuk mengubah kecepatan buah.
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
    // Gerakkan karakter berdasarkan input keyboard atau sentuhan layar
    if (keys["ArrowLeft"] || keys["a"] || keys["A"] || isTouchingLeft) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"] || isTouchingRight) {
        player.x += player.speed;
    }

    // Batasi agar karakter tidak keluar layar
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Kontrol mobile: sentuh layar kiri/kanan
canvas.addEventListener("touchstart", function(e) {
    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
      isTouchingLeft = true;
    } else {
      isTouchingRight = true;
    }
  });
  
 // Kontrol mobile: sentuh layar kiri/kanan
canvas.addEventListener("touchstart", function(e) {
    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
      isTouchingLeft = true;
    } else {
      isTouchingRight = true;
    }
  });
  
  canvas.addEventListener("touchend", function() {
    isTouchingLeft = false;
    isTouchingRight = false;
  });
  
  

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
                ctx.font = "bold 10px Joystix";
                ctx.fillStyle = "red";
                
                ctx.fillText("Terimakasih sudah main!", canvas.width/2 , canvas.height/2 - 10);
                ctx.fillText("Score Anda: " + score, canvas.width/2 , canvas.height/2 + 5);

                restartBtn.style.display = "block";
                return;
            }
        }
    }

    // Tampilkan skor di pojok atas (ubah koordinat untuk memindahkan posisi teks jika perlu)
    ctx.font = "bold 9px Joystix";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 23, 12); // (10, 30) = posisi x,y teks

    // Lanjutkan loop game selama belum game over
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}


