module.exports = Granular

function Granular(audioContext){
  var node = audioContext.createGain()
  node._context = audioContext

  node.start = start
  node.stop = stop
  node.offset = [0,1]
  node.sync = false
  node.length = 1
  node.attack = 0
  node.release = 1
  node.rate = 8
  node.transpose = 0
  node.tune = 0
  node.url = null
  node.hold = 1
  node.mode = 'loop'

  node._resolvedLength = 1
  node._resolvedRate = 4
  node._next = 0
  node._nextOffset = 0

  Object.defineProperties(node, properties)

  node._onSchedule = onSchedule.bind(node)
  return node
}

Granular.prime = function(context, desc){
  if (desc.url && context.sampleCache && !context.sampleCache[desc.url] && context.loadSample){
    context.loadSample(desc.url)
  }
}

function start(at){


  if (!at || at < this.context.currentTime){
    at = this.context.currentTime
  }

  this._startAt = at



  var scheduler = this._scheduler = this._context.scheduler
  scheduler.on('data', this._onSchedule)

  var nextSchedule = scheduler.getNextScheduleTime()
  var beatDuration = scheduler.getBeatDuration()

  if (at < nextSchedule){
    schedule(this, 0, nextSchedule - at, beatDuration)
  }

  if (this.mode === 'oneshot'){
    this._resolvedLength = this.length * beatDuration
    return this._resolvedLength + this._startAt
  }

}

function stop(at){
  if (!this._stopAt){
    this._stopAt = at
  }
}

function onSchedule(data){
  var from = data.time - this._startAt
  var to = from + data.duration
  schedule(this, from, to, data.beatDuration)
}

function schedule(output, from, to, beatDuration){

  var fromTime = from + output._startAt

  if (output.sync){
    output._resolvedLength = output.length * beatDuration
    output._resolvedRate = output.rate / beatDuration
  } else {
    output._resolvedLength = output.length
    output._resolvedRate = output.rate
  }

  output._slices = output._resolvedRate * output._resolvedLength
  output._duration = output._resolvedLength / output._slices

  if (output.mode === 'oneshot'){
    output._stopAt = output._resolvedLength + output._startAt
  }

  if (output._stopAt != null && fromTime >= output._stopAt){
    // remove scheduler
    output._scheduler.removeListener('data', output._onSchedule)
    output._scheduler = null
  } else if (output._next < to) {
    do {
      var playAt = output._next + output._startAt
      playGrain(playAt, output, output._nextOffset)
      output._next += output._duration

      if (output.mode === 'oneshot'){
        output._nextOffset = (output._nextOffset + 1 / output._slices)
      } else {
        output._nextOffset = (output._nextOffset + 1 / output._slices) % 1
      }
      
    } while (output._next < to)
  }
}

function playGrain(at, output, startOffset){

  var context = output.context
  var source = context.createBufferSource()

  var buffer = output._context.sampleCache && output._context.sampleCache[output.url]
  if (buffer instanceof AudioBuffer){

    source.buffer = buffer

    var offset = Array.isArray(output.offset) ? output.offset : [0,1]
    var start = (offset[0] || 0) * source.buffer.duration
    var end = (offset[1] || 1) * source.buffer.duration
    var duration = end - start

    var release = output._duration * output.release
    var attack = output._duration * output.release

    // make sure it doesn't exceed the stop time
    var maxTime = (output._stopAt || Infinity) - release
    var releaseAt = Math.min(at + output._duration * output.hold, maxTime)

    source.playbackRate.value = multiplyTranspose(output.transpose + (output.tune / 100))

    source.start(at, startOffset * duration + start)
    source.stop(releaseAt + release)

    var gain = context.createGain()
    source.connect(gain)

    // envelope
    if (attack){
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(1, Math.min(attack, output._duration) + at)
    }
    gain.gain.setValueAtTime(1, releaseAt)
    gain.gain.linearRampToValueAtTime(0, releaseAt + release)

    gain.connect(output)

  }

}

function multiplyTranspose(value){
  return Math.pow(2, value / 12)
}

var properties = {
  startOffset: {
    get: function(){
      return this.offset[0]
    }, 
    set: function(value){
      this.offset = [value || 0, this.offset[1]]
    }
  },
  endOffset: {
    get: function(){
      return this.offset[1]
    }, 
    set: function(value){
      this.offset = [this.offset[0], value || 0]
    }
  },
}