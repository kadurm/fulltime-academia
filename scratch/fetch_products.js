
const KV_REST_API_URL = "https://wise-gator-66505.upstash.io";
const KV_REST_API_TOKEN = "gQAAAAAAAQPJAAIncDI5YWNlM2I1MzhiNGI0YWQ2YWRhNDg0Y2QyNzU3YWU5YnAyNjY1MDU";

async function fetchProducts() {
  const response = await fetch(`${KV_REST_API_URL}/get/produtos`, {
    headers: {
      Authorization: `Bearer ${KV_REST_API_TOKEN}`
    }
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

fetchProducts();
