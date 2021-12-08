const socket = io();
const datcuoc = document.querySelector('.block')
const resetData = document.querySelector('.reset')
const myUL = document.getElementById("myUL")
var datcuocList = {}

datcuoc.addEventListener('click', () => {
  if (Object.keys(datcuocList).length === 0 && datcuocList.constructor === Object) {
    thongBao("Chua chon tai khoan de dat cuoc")
  } else {
    socket.emit('dat-cuoc', {data : datcuocList})
  }
})

resetData.addEventListener('click', () => {
  myUL.innerHTML = ""
  socket.emit('reset')
})

socket.on('hoat-dong', res => {
  history(res.text)
})

socket.on('reset', () => {
  thongBao("Reset thanh cong")
})

socket.on('connect', ()=>{
  // socket.emit('getAnswer')
  console.log("i'm connected")
})

const select = ['CHAN', 'LE', 'TAI', 'XIU', 'DAT CUOC']
function addToList(userId, selected) {
  // let dropdowncontent = document.querySelector(`.dropdown.${userId}`)
  let btnDatcuoc = document.querySelector(`.btn.${userId}`)
  btnDatcuoc.innerText = select[selected]
  if (selected != 4) {
    // dropdowncontent.style.display = 'inline-block'
    datcuocList[userId] = selected
  } else {
    delete datcuocList[userId]
  }
  //0 : CHAN
  //1: LE
}
function viewBalance(e, userId) {
  e.innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i>Loading'
  socket.emit("viewBalance", {id : userId}, res => {
    e.parentElement.innerHTML = res.gold
  })
}

function NapVang(e, userId) {
  e.style = "background-color: #f4511e;box-shadow: 0 5px #666;transform: translateY(4px)"
  e.innerText = "Created"
  socket.emit('nap-vang', {id : userId})
}

function history(text) {
  var node = document.createElement("LI");
  var textnode = document.createTextNode(text);
  node.appendChild(textnode);
  myUL.appendChild(node);
}

const snackbar = document.getElementById("snackbar");
function thongBao(text) {
  snackbar.innerText = text;
  snackbar.className = "show";
  setTimeout(() => { 
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}