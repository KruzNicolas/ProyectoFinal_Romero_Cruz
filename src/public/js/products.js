let things = {
  carritoId: "",
  email: "",
};

async function getUserInformation() {
  try {
    const res = await fetch(
      `https://proyectofinal-romero-cruz.onrender.com/api/sessions/status`
    );
    const dataJson = await res.json();
    const data = dataJson.data;
    return data;
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
}

async function getProducts() {
  try {
    const res = await fetch(
      `https://proyectofinal-romero-cruz.onrender.com/api/products/all`
    );
    const dataJson = await res.json();
    const data = dataJson.data;
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

async function getCart() {
  const userSession = await getUserInformation();

  try {
    const res = await fetch(
      `https://proyectofinal-romero-cruz.onrender.com/api/users/${userSession.username}/`
    );
    const dataJson = await res.json();
    const data = dataJson.data;

    if (!data.cartId) {
      try {
        const response = await fetch(
          `https://proyectofinal-romero-cruz.onrender.com/api/carts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const dataJsonPost = await response.json();
        const dataPost = dataJsonPost.data;
        try {
          const response = await fetch(
            `https://proyectofinal-romero-cruz.onrender.com/api/users/${userSession.username}/cart/${dataPost}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const dataJsonPostPost = await response.json();
          console.log(dataJsonPostPost);
        } catch (error) {
          console.error("Error", error);
          throw error;
        }
      } catch (error) {
        console.error("Error", error);
        throw error;
      }
    } else {
      return (things.carritoId = data.cartId), (things.email = data.email);
    }
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
}

getCart();

async function addToCart(productId) {
  try {
    const cartId = things.carritoId;
    const response = await fetch(
      `https://proyectofinal-romero-cruz.onrender.com/api/carts/${cartId}/products/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Error adding product to cart. Status: ${response.status}`
      );
    }

    console.log(`Producto con ID ${productId} agregado al carrito.`);
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
}

async function displayProducts() {
  try {
    const products = await getProducts();
    const container = document.getElementById("productContainer");

    products.forEach((product) => {
      const productId = product._id;
      const card = document.createElement("div");
      card.classList.add("product-card");

      const thumbnail = document.createElement("img");
      thumbnail.src = product.thumbnail;
      thumbnail.alt = product.title;
      thumbnail.classList.add("product-thumbnail");

      const title = document.createElement("div");
      title.textContent = product.title;
      title.classList.add("product-title");

      const description = document.createElement("div");
      description.textContent = product.description;
      description.classList.add("product-description");

      const price = document.createElement("div");
      price.textContent = `$${product.price.toFixed(2)}`;
      price.classList.add("product-price");

      const stockStatus = document.createElement("div");
      stockStatus.textContent = product.stock ? "In Stock" : "Out of Stock";
      stockStatus.classList.add(
        product.stock ? "product-stock-status" : "product-out-of-stock"
      );

      const addButton = document.createElement("button");
      addButton.textContent = "Add to cart";
      addButton.classList.add("add-button");

      addButton.addEventListener("click", () => {
        addToCart(productId);
      });

      card.appendChild(thumbnail);
      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(price);
      card.appendChild(stockStatus);
      card.appendChild(addButton);

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error displaying products:", error);
  }
}

document.getElementById("buyButton").addEventListener("click", function () {
  fetch(
    `https://proyectofinal-romero-cruz.onrender.com/api/carts/${things.carritoId}/purchase`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: things.email,
      }),
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data.status === "OK" && data.data.url) {
        window.location.href = data.data.url;
      } else {
        throw new Error("Purchase was not completed");
      }
    })
    .catch((error) => {
      // Aquí puedes manejar errores en la solicitud
      console.error("There was a problem with your fetch operation:", error);
    });
});

document.addEventListener("DOMContentLoaded", () => {
  displayProducts();
});
