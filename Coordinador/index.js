const express = require('express');
const exec = require('child_process').exec;
const readLastLines = require('read-last-lines')
const app = express();
const axios = require("axios");
app.use(express.static('public'));

const port = 5000;

let dateServer = new Date();
let adjustment = [];
var servers = [];
var currentPort = 4001;
const ip = "127.0.0.1"

app.listen(port, () => {
	console.log(`App is listening to port ${port}`);
  addServer();
  monitor();
  setTimeServer();
  statusTime();
}); 

app.get("/", (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

function setTimeServer() {
  axios
      .get("http://worldtimeapi.org/api/timezone/America/Santiago")
      .then(function (response) {
        dateApi =response.data.datetime;
        data = dateApi.split("T")
        times = data[1].split(":")
        dateServer.setHours(times[0], times[1]);
      })
      .catch(function (error) {
        console.log(error);
      });
  setInterval(() => {
    dateServer.setSeconds(dateServer.getSeconds()+1)
    console.log("date: "+ dateServer )
  }, 1000);
}

function statusTime() {
  setInterval(async () => {
    adjustment = [];
    servers.forEach(ss => {
      axios
      .post(`http://${ip}:${ss.port}/currentTime`, {
        date: dateServer,
      })
      .then(function (response) {
        let aux = response.data.difference;
        adjustment.push(aux);
        console.log(aux);
      })
      .catch(function (error) {
        // handle error
        console.log("Fallo aca"+error);
      });
    });
    setTimeout(() => {
      berkeley();
    }, 1000);
  }, 30000);
}

function berkeley(){
  let aux = 0;
  for (let index = 0; index < adjustment.length; index++) {
    aux = aux + adjustment[index];
  }
  console.log("suma "+ aux)
  aux = aux/(adjustment.length+1)
  console.log("divisor "+(adjustment.length+1))
  console.log("ajuste "+ aux)
  hourAdjust(aux, dateServer)
  console.log("date update "+ dateServer)
  servers.forEach(ss => {
    axios
    .post(`http://${ip}:${ss.port}/adjust`, {
      data: aux,
    })
    .then(function (response) {
      console.log(response.data.message);
    })
    .catch(function (error) {
      console.log(error);
    });  
  });
  adjustment.length = 0;
}

function hourAdjust(ajust, date){
  let hour = parseInt(ajust/3600000)
  let minutes = parseInt((ajust%3600000)/60000)
  let seconds = parseInt(((ajust%3600000)%60000)/1000)
  date.setHours(date.getHours()+hour,date.getMinutes()+minutes,date.getSeconds()+seconds)
}    

function addServer(){
  let port = currentPort++
  console.log(`sh add-server.sh ${port}`);
  exec(`sh add-server.sh ${port}`, (error, stout, stderr) => {
        if (error !== null) {
          if(`${error}`.includes("port is already allocated")){
              servers.push({port, monitor:{ time:null, status:false }})
              console.log(`Connected to server ${ip}:${port}`);
          }else{
            console.log(`No se pudo conectar a ${ip}:${port}`);
          }
        }else{
            servers.push({port, monitor:{ time:null, status:false }})
            console.log(`Connected to server ${port}`);
        }
    })
} 

function monitor(){
  setInterval(()=>{
  servers.forEach(ss=>{
    exec(`sh watch.sh ${ip} ${ss.port}`, (error, stout, stderr) => {
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    })
  });
  readLastLines.read('log.txt', servers.length).then((text) => {
      let lines = text.split('\n');
      lines.splice(lines.length - 1)
      let data;
      let serverIndex;
      
      for (var i = 0; i < lines.length; i++) {
         data = lines[i].split(' ');
         serverIndex = servers.findIndex(ss => ss.port == data[1])
         console.log(data)
          if(serverIndex != undefined){
              servers[serverIndex].monitor.time = data[0];
                  if (data[2]=="server"){
                      servers[serverIndex].monitor.status = true
                  }
                  else {
                      servers[serverIndex].monitor.status = false
                  }  
          }
          //console.log(servers[serverIndex])
      }
    });
  },1000);
}
app.get("/add_server", (req, res) => {
  addServer();
  res.send("ok")
});  
app.post("/", (req, res) => {
  res.send(servers)
});
