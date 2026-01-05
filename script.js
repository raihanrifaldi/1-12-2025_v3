function login() {
  // Ambil nilai input
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("error-msg");

  // Validasi sederhana
  if (username === "admin" && password === "admin") {
    // Redirect ke dashboard
    window.location.href = "app.html";
  } else {
    // Tampilkan error
    errorMsg.textContent = "Username atau password salah!";
  }
}