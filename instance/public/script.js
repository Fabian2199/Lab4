const socket = io();

function showTime(date){
    var h = date.hour; // 0 - 23
    var m = date.minutes; // 0 - 59
    var s = date.seconds; // 0 - 59
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m + ":" + s;
    document.getElementById("clock-display").innerText = time;
    document.getElementById("clock-display").textContent = time;
    
}
socket.on("time", (arg) =>{
    showTime(arg);
});
document.getElementById("submit-time").addEventListener("click", function(){
    time = {
        hours:document.getElementById("hour-modifier").value,
        minutes:document.getElementById("minute-modifier").value,
        seconds:document.getElementById("second-modifier").value,
    }
    timechange(time);
});
function timechange(time){
    $.ajax({
        url:'http://localhost:4000/timechange',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(time)
    }).then(res=> console.log(res))
}