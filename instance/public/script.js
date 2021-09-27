const socket = io();
var h, m, s;
function showTime(date){
    h = date.hour; // 0 - 23
    m = date.minutes; // 0 - 59
    s = date.seconds; // 0 - 59
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s;
    document.getElementById("clock-display").innerText = time;
    document.getElementById("clock-display").textContent = time;
    
}
let port = 0000;
socket.on("port", (arg)=>{
    port = arg;
});
socket.on("time", (arg) =>{
    showTime(arg);
});
document.getElementById("submit-time").addEventListener("click", function(){
    time = {
        hours:document.getElementById("hour-modifier").value,
        minutes:document.getElementById("minute-modifier").value,
        seconds:document.getElementById("second-modifier").value,
    }
    document.querySelector('#content').innerHTML += `<tr>
    <td class="text-center">${h + ":" + m + ":" + s}</td>
    <td class="text-center">Cambio manual de hora</td>
    <td class="text-center">${time.hours + ":" + time.minutes + ":" + time.seconds}</td>
    </tr>`;
    timechange(time);
});
function timechange(time){
    $.ajax({
        url:`http://localhost:${port}/timechange`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(time)
    }).then(res=> console.log(res))
}