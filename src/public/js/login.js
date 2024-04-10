document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", function async(event) {
    event.preventDefault();

    const user = {
      username: form.elements.username.value,
      password: form.elements.password.value,
    };

    const REGISTER_URL =
      "https://proyectofinal-romero-cruz.onrender.com/api/sessions/login";

    fetch(REGISTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status === "ERROR") {
          console.error(`Error: ${data.data}`);
          errorMessage.textContent = `Error: ${data.data}`;
        } else {
          window.location.href =
            "https://proyectofinal-romero-cruz.onrender.com/products";
          console.log("Datos enviados con éxito:", data.data);
        }
      });
  });
});

function toGithub() {
  window.location.href =
    "https://proyectofinal-romero-cruz.onrender.com/api/sessions/github";
}

function toGoogle() {
  window.location.href =
    "https://proyectofinal-romero-cruz.onrender.com/api/sessions/google";
}
