
const BASE = "/api/supply-chain";

export async function addSupplyEvent(data) {
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function traceBatch(batchId) {
  const res = await fetch(`${BASE}/trace/${batchId}`);
  return res.json();
}