export async function compactArenaRequest(payload,signal){
 const response=await fetch('/api/arena-compact',{
  method:'POST',credentials:'same-origin',cache:'no-store',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify(payload),signal
 });
 let data;
 try{data=await response.json();}catch{throw Error('A Arena compacta não respondeu.');}
 if(!response.ok)throw Object.assign(Error(data.error||'Falha na Arena compacta.'),{status:response.status});
 return data;
}
