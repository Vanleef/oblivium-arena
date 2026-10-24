export async function arenaRequest(payload,signal){
 const response=await fetch('/api/arena',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
 let data;try{data=await response.json();}catch{throw new Error('Arena indisponível. Tente novamente.');}
 if(!response.ok)throw Object.assign(new Error(data.error||'Falha na conexão.'),{status:response.status});return data;
}

