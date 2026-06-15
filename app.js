import { db } from './firebase-config.js';
import {
collection,doc,setDoc,onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const roommates=['Izzy Tak','Milla','Caliee','Vic','Izzy Tate'];
const payers={Gas:'Izzy Tak',WiFi:'Milla',Hydro:'Caliee'};

window.saveBill=async function(){
 const month=document.getElementById('month').value;
 const type=document.getElementById('billType').value;
 const amount=parseFloat(document.getElementById('amount').value);
 if(!month||!amount)return;

 await setDoc(doc(db,'months',month,'bills',type),{
   amount,
   payer:payers[type],
   type
 });
};

onSnapshot(collection(db,'months'),()=>loadDashboard());

async function loadDashboard(){
 const root=document.getElementById('dashboard');
 root.innerHTML='';

 roommates.forEach(person=>{
   const card=document.createElement('div');
   card.className='card person';
   card.innerHTML=`<h2>${person}</h2>
   <p>Dashboard placeholder. Next step: monthly balances, payment tracking, archives.</p>`;
   root.appendChild(card);
 });
}

loadDashboard();
