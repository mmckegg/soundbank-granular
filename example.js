var Granular = require('./')
var Bopper = require('bopper')

var audioContext = new AudioContext()
var scheduler = Bopper(audioContext)


loadSample('/sounds/test.wav', function(err, buffer){
  scheduler.start()
  scheduler.setTempo(60)

  var node = Granular(audioContext, {scheduler: scheduler})
  node.url = 'test.wav'
  node.offset = [0,1]
  node.length = 2
  node.transpose = 5
  node.attack = 0
  node.rate = 32
  node.sync = true
  node.release = 0.6
  node.buffer = buffer
  node.start()
  
  node.connect(audioContext.destination)
})


function loadSample(url, cb){
  requestArrayBuffer(url, function(err, data){  if(err)return cb&&cb(err)
    audioContext.decodeAudioData(data, function(buffer){
      cb(null, buffer)
    }, function(err){
      cb(err)
    })
  })
}

function requestArrayBuffer(url, cb){
  var request = new window.XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    cb(null, request.response)
  }
  request.onerror = cb
  request.send();
}