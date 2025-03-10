// sign in page logic
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.querySelector(".login-btn");
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rememberMe = document.getElementById("remember-me").checked;

    // Validate fields
    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in both email and password fields.",
      });
      return;
    }

    // Add loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = "Logging in...";

    // Make a POST request to the login endpoint
    fetch("http://attendance-service.5d-dev.com/api/Employee/DashboardLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        keyAddress: password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Login failed");
        }
        return response.json().catch(() => {
          throw new Error("Invalid response from server");
        });
      })
      .then((data) => {
        // Save the token in session or local storage based on "Remember Me"
        if (rememberMe) {
          localStorage.setItem("authToken", data.token); // Save in localStorage
        } else {
          sessionStorage.setItem("authToken", data.token); // Save in sessionStorage
        }

        // Redirect to the dashboard or another page
        window.location.href = "/employee.html"; // Change this to your desired redirect URL
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Login failed. Please check your credentials.",
        });
      })
      .finally(() => {
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.innerHTML = "Log in";
      });
    email.value = "";
    password.value = "";
  });
});
