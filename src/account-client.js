export async function accountRequest(payload){
 const response=await fetch('/api/account',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 let data;try{data=await response.json();}catch{throw Error('Não foi possível carregar sua conta.');}
 if(!response.ok)throw Object.assign(Error(data.error||'Falha na conta.'),{status:response.status});return data;
}
export async function currentAccount(){const response=await fetch('/api/account',{credentials:'same-origin',cache:'no-store'});let data;try{data=await response.json();}catch{throw Error('Serviço de contas indisponível.');}if(!response.ok)throw Object.assign(Error(data.error||'Serviço de contas indisponível.'),{status:response.status});return data;}
