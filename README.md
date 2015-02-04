soundbank-granular
===

Sample based granular sythesis and timestretch.

Intended for use as a source in [soundbank](https://github.com/mmckegg/soundbank), but it is compatible with any [Web Audio API](https://developer.mozilla.org/en-US/docs/Web_Audio_API) AudioNode set up.

## Install via [npm](https://npmjs.org/package/soundbank-granular)

```bash
$ npm install soundbank-granular
```

## API

```js
var Granular = require('soundbank-granular')
```

### `var granular = Granular(audioContext, options)`

Pass an instance of [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) to the constructor to create an AudioNode.

**`options`:**
  - **scheduler**: (required) pass in an instance of [Bopper](https://github.com/mmckegg/bopper) to provide scheduling for grain playback and `sync` if enabled.

### granular.transpose (get/set)

Due to a bug in Chrome, this is not currently an AudioParam, but will be in the future.
See https://code.google.com/p/chromium/issues/detail?id=311284

### granular.tune (get/set)

Due to a bug in Chrome, this is not currently an AudioParam, but will be in the future.

### granular.length (get/set)

The desired length in seconds (or if `sync` in beats). The audio data between the `startOffset` and `endOffset` will be timestretched to fit exactly. Defaults to `1`.

### granular.rate (get/set)

The amount of grains per second/beat to create.

### granular.attack (get/set)

Ratio of grain length to attack. Defaults to `0`.

### granular.release (get/set)

Ratio of grain length to apply as release after each grain.

### granular.sync (get/set)

`true` or `false`. Sync the `rate` and `length` to the scheduler tempo. Defaults to `false`.

### granular.mode (get/set)

Set the trigger mode of the audio node: 'oneshot', 'loop'

### source.buffer (get/set)

Specify an instance of [AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer) for playback.

### granular.startOffset (get/set)

Choose the fraction of duration (between `0` and `1`) to use as audio in point. 

### granular.endOffset (get/set)

Choose the fraction of duration (between `0` and `1`) to use as audio out or loop point. 

### granular.offset (get/set)

Specify the `startOffset` and `endOffset` as an array `[start, end]`.

### granular.start(at)

Schedule note start. Can only be called once. For each event, you need to create a new instance.

### granular.stop(at)

Schedule note stop.