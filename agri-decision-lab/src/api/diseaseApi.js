export async function predictDisease(image) {
  const formData = new FormData();
  formData.append("image", image);

  const res = await fetch("/api/disease/predict", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  return await res.json();
}