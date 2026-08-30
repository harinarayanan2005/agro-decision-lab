export async function askAgriAI(message){

  const response =
    await fetch(
      "/api/agri-ai/ask",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          message
        })
      }
    );

  return await response.json();
}