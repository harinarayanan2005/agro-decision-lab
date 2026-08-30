/* =========================================================
   FINAL 100% CORRECT VERSION
   ========================================================= */

const API_BASE = "/api/crop-planner";

export async function calculateCropPlan(inputs) {

  console.log("=================================");
  console.log("Sending request to AI engine:");
  console.log(inputs);
  console.log("=================================");

  const response = await fetch(`${API_BASE}/calculate`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      land_acres: Number(inputs.land_acres),
      budget: Number(inputs.budget),
      irrigation: inputs.irrigation,
      soil_type: inputs.soil_type,
      season: inputs.season
    })
  });

  const data = await response.json();

  console.log("=================================");
  console.log("AI engine response:");
  console.log(data);
  console.log("=================================");

  if (!response.ok)
    throw new Error(data.message || "Backend error");

  if (!data || data.status !== "SUCCESS")
    throw new Error(data.message || "AI engine failure");

  const results = data.results || [];

  // HANDLE NO_MATCH PROPERLY
  if (results.length === 1 && results[0].status === "NO_MATCH") {

    return {
      noMatch: true,
      message: results[0].message,
      results: []
    };
  }

  return {
    noMatch: false,
    results: results
  };
}