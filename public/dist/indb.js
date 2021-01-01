let db;const request=indexedDB.open("budget",1);request.onupgradeneeded=function(a){const b=a.target.result;b.createObjectStore("pending",{autoIncrement:!0})},request.onsuccess=function(a){db=a.target.result,navigator.onLine&&checkDatabase()},request.onerror=function(a){console.log("Woops! "+a.target.errorCode)};function saveRecord(a){const b=db.transaction(["pending"],"readwrite"),c=b.objectStore("pending");c.add(a)}function checkDatabase(){const a=db.transaction(["pending"],"readwrite"),b=a.objectStore("pending"),c=b.getAll();c.onsuccess=function(){0<c.result.length&&fetch("/api/transaction/bulk",{method:"POST",body:JSON.stringify(c.result),headers:{Accept:"application/json, text/plain, */*","Content-Type":"application/json"}}).then(a=>a.json()).then(()=>{const a=db.transaction(["pending"],"readwrite"),b=a.objectStore("pending");b.clear()})}}window.addEventListener("online",checkDatabase);let myChart,transactions=[];fetch("/api/transaction").then(a=>a.json()).then(a=>{transactions=a,populateTotal(),populateTable(),populateChart()});function populateTotal(){const a=transactions.reduce((a,b)=>a+parseInt(b.value),0),b=document.querySelector("#total");b.textContent=a}function populateTable(){const a=document.querySelector("#tbody");a.innerHTML="",transactions.forEach(b=>{const c=document.createElement("tr");c.innerHTML=`
      <td>${b.name}</td>
      <td>${b.value}</td>
    `,a.appendChild(c)})}function populateChart(){const a=transactions.slice().reverse();let b=0;const c=a.map(a=>{const b=new Date(a.date);return`${b.getMonth()+1}/${b.getDate()}/${b.getFullYear()}`}),d=a.map(a=>(b+=parseInt(a.value),b));myChart&&myChart.destroy();const e=document.getElementById("my-chart").getContext("2d");myChart=new Chart(e,{type:"line",data:{labels:c,datasets:[{label:"Total Over Time",fill:!0,backgroundColor:"#6666ff",data:d}]}})}function sendTransaction(a){const b=document.querySelector("#t-name"),c=document.querySelector("#t-amount"),d=document.querySelector("form .error");if(""===b.value||""===c.value)return void(d.textContent="Missing Information");d.textContent="";const e={name:b.value,value:c.value,date:new Date().toISOString()};a||(e.value*=-1),transactions.unshift(e),populateChart(),populateTable(),populateTotal(),fetch("/api/transaction",{method:"POST",body:JSON.stringify(e),headers:{Accept:"application/json, text/plain, */*","Content-Type":"application/json"}}).then(a=>a.json()).then(a=>{a.errors?d.textContent="Missing Information":(b.value="",c.value="")}).catch(()=>{saveRecord(e),b.value="",c.value=""})}document.querySelector("#add-btn").addEventListener("click",function(a){a.preventDefault(),sendTransaction(!0)}),document.querySelector("#sub-btn").addEventListener("click",function(a){a.preventDefault(),sendTransaction(!1)});