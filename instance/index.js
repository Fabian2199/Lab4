const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());
const port = 4000;

date = new Date();
function setTime(hours, minutes, seconds){
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);    
}

setInterval(()=>{
    date.setSeconds(date.getSeconds()+1);
    const time = {
        hour: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
    }
    io.emit("time", time); 
},1000);

const server=  app.listen(port, ()=>{
    console.log(`AppP is listenign at port ${port}`)
    let hours = parseInt(getRandomArbitrary(0,24))
    let minutes = parseInt(getRandomArbitrary(0,60))
    let seconds = parseInt(getRandomArbitrary(0,60))
    setTime(hours,minutes,seconds)
});

//Web Sockets
const SocketIO = require('socket.io');
const io = SocketIO(server);

app.post('/timechange',(req, res) =>{
    const time = req.body;
    setTime(time.hours, time.minutes, time.seconds);
    console.log(req.body);    
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

app.post('/currentTime',(req,res)=>{
    let serverCorDate = new Date(req.body.date)
    console.log('hola '+date)
    difference = date - serverCorDate;
    console.log(date+'===='+serverCorDate)
    console.log(difference)
    res.json({difference:difference})
})

app.post('/adjust',(req,res)=>{
    let aux = req.body.data;
    let ajust = aux-difference;
    hourAdjust(ajust,date);
    /*let info = {
        actualDate: aux,
        adjust: req.body.data/1000,
        newDate : dateServer
    }
    io.sockets.emit('info', info)
    res.json({message:"Hora ajustada correctamente"})*/
    console.log("date"+ date)
})
function hourAdjust(ajust, date){
    let hour = ajust/3600000
    let minutes = (ajust%3600000)/60000
    let seconds = ((ajust%3600000)%60000)/1000
    date.setHours(date.getHours()+hour,date.getMinutes()+minutes,date.getSeconds()+seconds) 
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
