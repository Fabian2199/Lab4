const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());
const port = process.env.PORT || 4001;

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
    io.emit("port", port);
},1000);

const server=  app.listen(port, ()=>{
    console.log(`App is listening at port ${port}`)
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
    res.json({difference:difference})
})

app.post('/adjust',(req,res)=>{
    let aux = req.body.data;
    let ajust = aux-difference;
    let oldDate = new Date(date);
    hourAdjust(ajust,date);
    let info = {
        oldDate: " "+oldDate,
        adjust: ajust,
        newDate : " "+date
    }
    console.log(info);
    io.sockets.emit('info', info)
    //res.json({message:"Hora ajustada correctamente"})
    console.log("date"+ date)
})

app.get('/status', (req, res) => { 
    res.send("server ok")
})

function hourAdjust(ajust, date){
    let hour = parseInt(ajust/3600000)
    console.log("hora "+hour)
    let minutes = parseInt((ajust%3600000)/60000)
    console.log("minutos "+minutes)
    let seconds = parseInt(((ajust%3600000)%60000)/1000)
    console.log("segundos "+seconds)
    date.setHours(date.getHours()+hour,date.getMinutes()+minutes,date.getSeconds()+seconds) 
};

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
