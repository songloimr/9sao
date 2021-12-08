// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const bodyParser = require('body-parser')
const axios = require('axios').default
// const sharp = require('sharp')
const cors = require("cors");
const delay = require("delay");

const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use( bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
const fs = require('fs');

const rawCookie = fs.readFileSync('cookie.json');
const dataCookie = JSON.parse(rawCookie);
const rawData = fs.readFileSync('data.json');
var myData = JSON.parse(rawData);

// https://expressjs.com/en/starter/basic-routing.html
io.on('connection', socket =>{
  socket.on('newAnswer', res =>{
    fs.writeFileSync(__dirname + '/answer.txt', res.answer)
    socket.broadcast.emit('newAnswer', res)
  })
  socket.on('change', () => {
    socket.broadcast.emit('change')
  })
  socket.on('dat-cuoc', res => {
    dat_cuoc(res.data)
  })
  socket.on('nap-vang', e => {
    nap_vang(e.id)
  })
  socket.on('viewBalance', (res, callback) => {
    (async()=>{
      const data = await getGame(res.id)
      if (!data.user) {
        return callback({
          gold: -1
        })
      }
      callback({
        gold: data.user.vang
      })
    })()
  })
  socket.on('reset', () => {
    for (const userId in myData) {
      myData[userId].napvang = false
      myData[userId].datcuoc = 0
    }
    updateData()
    socket.emit('reset')
  })
})

async function dat_cuoc(list) {
  for (const id in list) {
    for (let i = 1; i < 11; i++) {
      axios.post("https://9sao.me/game/cuoc",{
        type: 0,
        gold: "3,000,000",
        value: list[id],
        server: i,
      },{
        headers: {
          Cookie: dataCookie[id],
        },
      }).then(res => {
        if (res.data.error == 0) {
          myData[id].datcuoc += 1
          io.emit('hoat-dong', {text: `[${i}]=> ${id} - Đặt cược thành công cùng chờ kết quả nào!`})
        } else {
          io.emit('hoat-dong', {text: res.data.message})
        }
      }).catch(err => {
        console.log(err.toString());
      })
      await delay(1000)
    }
    updateData()
  }
}
const onlyNnumber = /\d+/g;
function vongquay(userId) {
  axios.post("https://9sao.me/user/vongquayfree", {
    action : 'submit'
  },{
    headers: {
      Cookie: dataCookie[userId],
    },
  }).then(res => {
    if (res.data.status != 0 ) {
      let diamond = res.data.message.match(onlyNnumber)
      myData[userId].diamond += Number(diamond)
      updateData()
    }
    io.emit('hoat-dong', {text: `${userId} => ${res.data.message}`})
  }).catch(err => {
    console.log(err.toString());
  })
}

async function getGame(userId){
  try {
    let response = await axios.post('https://9sao.me/game/getgame', {
      server: 10,
      record: 10,
      isme: 0,
      getchat: false
    },{
      headers: {
        Cookie: dataCookie[userId],
      },
    })
    return response.data
  } catch (error) {
    return error.toString()
  }
}

function nap_vang(userId) {
  axios.post("https://9sao.me/user/napvang", {
    add: "Bug sml",
    gold: "10,000,000",
    type: 1,
    tnv: "drakedi",
  }, {
    headers: {
      Cookie: dataCookie[userId][0],
    },
  }).then(res => {
    if (res.data.error == 0) {
      myData[userId].napvang = true
      io.emit('hoat-dong', {text: `Thành công: ${userId} vui lòng tới địa điểm giao hàng gặp BOT để giao dịch`})
      updateData()
    } else {
      io.emit('hoat-dong', {text: userId + ": " + res.data.message})
    }
  }).catch(err => {
    console.log(err.toString());
  })
}

function updateData() {
  fs.writeFileSync('data.json', JSON.stringify(myData));
}
/** Process POST request */
app.get('/', function (req, res, next) {
  try {
    var contentTable = ""
    for (const id in dataCookie) {
      contentTable = contentTable + `
      <tr>
        <td>${id}</td>
        <td style="text-align: center">${myData[id].diamond}</td>
        <td style="text-align: center">
          <button class="napvang" onmouseover="this.style.backgroundColor='${ myData[id].napvang ? "#f4511e" : "#3e8e41" }';" onmouseout="this.style.backgroundColor='#04AA6D'" onclick="NapVang(this, '${id}')">Create</button>
        </td>
        <td>
          <button class="btn ${id}">DAT CUOC</button>
          <div class="dropdown ${id}">
            <button class="btn" style="border-left:1px solid #0d8bf2">${myData[id].datcuoc}</button>
            <div class="dropdown-content">
              <a href="#" onclick="addToList('${id}',0)">CHAN</a>
              <a href="#" onclick="addToList('${id}',1)">LE</a>
              <a href="#" onclick="addToList('${id}',2)">TAI</a>
              <a href="#" onclick="addToList('${id}',3)">XIU</a>
              <a href="#" onclick="addToList('${id}',4)">CANCEL</a>
            </div>
          </div>
        </td>
        <td>
          <button class="buttonload" onclick="viewBalance(this, '${id}')">View</button>
        </td>
      </tr>
      `
    }
    res.send(`
    <!DOCTYPE html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Welcome to Glitch!</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="/style.css" />
    <script src="/socket.io/socket.io.js"></script>
    </head><body>
    <table id="customers">
      <tr>
        <th>Username</th>
        <th>Diamond</th>
        <th>Nap Vang</th>
        <th>Dat Cuoc</th>
        <th>Gold</th>
      </tr>
      ${contentTable}
    </table>
    <button type="button" class="block">DAT CUOC</button>
    <button class="reset danger">RESET</button>
    <ul id="myUL"></ul>
    <div id="snackbar"></div>
    </body><script src="/script.js"></script></html>
      `)
  } catch (err) {
    res.send(err.toString())
  }  
});
app.post("/9saome", (req, res) => {
  let imgBASE64 = req.body.data

  truecaptcha = async (imageData) => {
    try {
      let response = await axios.post('https://api.apitruecaptcha.org/one/gettext', JSON.stringify({
        userid: 'ngotuankiet',
        apikey: 'YoqQL5YoxEGnH7Iok4jZ',
        data: imageData
      }))
      return response.data
    } catch (error) {
      return error.toString()
    }
  }
  (async()=>{
    try {
      const data = await truecaptcha(imgBASE64)
      console.log(data);
      if (data.result) {
        fs.writeFileSync(__dirname + '/answer.txt', data.result)
      }
        fs.writeFileSync(__dirname + '/image.txt', imgBASE64)
      //file written successfully
      io.emit('refreshPage')// 9saome => client refreshPage
      res.send(data)
    } catch (err) {
      res.send(err.toString())
    }
  })()

});

// listen for requests :)
const listener = httpServer.listen(process.env.PORT || 3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
