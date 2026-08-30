const API_BASE = "/api/fertilizer";

export async function predictFertilizer(input){

  const response = await fetch(
    `${API_BASE}/predict`,
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify(input)
    }
  );

  if(!response.ok)
    throw new Error("Fertilizer AI failed");

  return await response.json();
}