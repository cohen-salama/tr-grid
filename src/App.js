import React from 'react';
import './App.css';
import clap from './assets/clap.mp3'
import kick from './assets/kick.mp3'
import snare from './assets/snare.mp3'
import hihat from './assets/hihat.mp3'

class App extends React.Component {
  constructor() {
    super()
    this.bufferList = []
    this.state = {
      context: new (window.AudioContext || window.webkitAudioContext)(),
      resolution: 16,
      resolutionInput: 16,
      tempo: 120,
      sixteenth: 125,
      offset: 0,
      steps: [],
      play: false,
      stop: false,
      pressedPlay: false,
      kickVolume: 99,
      kickVolInput: 99,
      snareVolume: 99,
      snareVolInput: 99,
      clapVolume: 99,
      clapVolInput: 99,
      hihatVolume: 99,
      hihatVolInput: 99
    }
  }

  componentDidMount() {
    const { context, resolution } = this.state

    this.setGains()

    this.setGrids(resolution)

    let sounds = [[kick, 'kick'], [snare, 'snare'], [clap, 'clap'], [hihat, 'hihat']]

    this.getBufferSources(context, sounds)
  }

  setGains = () => {
    this.setState ({
      kickGain: this.createGainNode(),
      snareGain: this.createGainNode(),
      clapGain: this.createGainNode(),
      hihatGain: this.createGainNode()
    })
  }

  setGrids = (resolution) => {
    this.setState ({
      beats: this.createBeats(resolution),
      kickGrid: this.createGrid(resolution),
      snareGrid: this.createGrid(resolution),
      clapGrid: this.createGrid(resolution),
      hihatGrid: this.createGrid(resolution),
      steps: this.createSteps(resolution)
    })
  }

  createBeats = (num) => {
    let beatsArray = []

    for (let i = 0; i < num; i++) {
      beatsArray.push({})
    }

    return beatsArray
  }

  createGrid = (size) => {
    let grid = {}

    for (let i = 0; i < size; i++) {
      grid[i] = 'gray'
    }
    
    return grid
  }

  createSteps= (num) => {
    let steps = []

    for (let i = 0; i < num; i++) {
      steps.push({
        index: i,
      })
    }
    return steps
  }

  createGainNode = () => {
    const { context } = this.state
    const gainNode = context.createGain()
    return gainNode
  }

  getBufferSources = async (context, sounds) => {
    sounds.forEach((sound) => {
      var request = new XMLHttpRequest()

      request.open('GET', sound[0], true)
      request.responseType = 'arraybuffer'
      
      var self = this

      request.onload = function() {
          context.decodeAudioData(request.response, function(buffer) {

            self.setState({
              [sound[1]]: buffer
            })

          }, function(e) {
            console.log('error decoding audio data:' + e)
          })
      }
      request.send()
    })
  }

  componentDidUpdate() {
    if (this.state.play === true && this.state.stop === false) {
      this.playSequence(this.state.sixteenth)

      this.setState({
        play: false
      })

    }  else if (this.state.play === true && this.state.stop === true) {
      setTimeout(() => this.setState({play: false, stop: false})
      , 1.1 * this.state.resolution * this.state.sixteenth)
    }
  }

  pressPlay = (sixteenth) => {
    const {pressedPlay} = this.state

    if (!pressedPlay) {
      this.playSequence(sixteenth)
      this.setState({
        pressedPlay: true
      })
    }
  }

  playSequence = (sixteenth, bar = 0) => {
    const { resolution } = this.state

    let time = bar * resolution * sixteenth

    this.playLoop(sixteenth, time)

    setTimeout(() => this.setState({play: true})
    , time + resolution * sixteenth)
  }

  playLoop = (sixteenth, time) => {;
    this.state.beats.forEach((beat, index) => {
      for (let sound in beat) {
        this.playTrack(sound, time + index * sixteenth)
      }
    })
  }

  playTrack = (name, time) => {
    const { context, offset } = this.state
    let sound = this.state[name]
    let gainName = name + 'Gain'
    let gainNode = this.state[gainName]
    
    setTimeout(() => {
      let source = context.createBufferSource()
      source.buffer = sound
      source.connect(gainNode).connect(context.destination)
      source.start(offset)
    }, time
    )
  }

  stopLoop = () => {
    this.setState({
      stop: true,
      pressedPlay: false
    })
  }

  changeStep = (id, name) => {
    const grid = this.state[name]

    if (grid[id] === 'gray') {
      this.changeToBlack(id, name, grid)
    } else {
      this.changeToGray(id, name, grid)
    }

    let instrument = name.slice(0, -4)
    this.changeStatus(id, instrument)
  }
  

  changeToBlack = (id, gridName, gridContent) => {
    let newGrid = gridContent

    newGrid[id] = 'black'

    this.setState({
      [gridName]: newGrid
    })
  }

  changeToGray = (id, gridName, gridContent) => {
    let newGrid = gridContent

    newGrid[id] = 'gray'

    this.setState({
      [gridName]: newGrid
    })
  }

  changeStatus = (id, keyName) => {
    const { beats } = this.state

    if (beats[id][keyName]) {
      let newBeats = this.state.beats

      delete newBeats[id][keyName]

      this.setState({
        beats: newBeats
      })
    } else {    
      let newBeats = this.state.beats

      newBeats[id][keyName] = true

      this.setState({
        beats: newBeats
      })
    }
  }

  handleTempo = (event) => {
    this.setState({
      tempo: event.target.value,
      sixteenth: 60000 / event.target.value / 4
    })
  }

  handleSteps = (event) => {
    if (event.target.value > 1
     && event.target.value < 33) {
      this.setState({
        resolutionInput: event.target.value,
        resolution: event.target.value
      })
      this.setGrids(event.target.value)
     } else if (event.target.value < 2) {
       this.setState({
         resolutionInput: null,
         resolution: 2
       })
       this.setGrids(4)
     } else if (event.target.value > 32) {
       this.setState({
         resolutionInput: null,
         resolution: 32
       })
     }
  }

  handleVolume = (name, event) => {
    if (event.target.value < 100 && event.target.value !== '') {
      console.log(event.target.value)
      let volumeName = name + 'Volume'
      let volInputName = name + 'VolInput'
      let gainName = name + 'Gain'

      let newVolume = parseInt(event.target.value)
      let newGain = newVolume / 100
      
      let gainNode = this.state[gainName]
      gainNode.gain.value = newGain

      this.setState({
        [volumeName]: parseInt(event.target.value),
        [volInputName]: parseInt(event.target.value),
        [gainName]: gainNode
      })
    } else if (event.target.value === '') {
      let volumeName = name + 'Volume'
      let volInputName = name + 'VolInput'
      let gainName = name + 'Gain'

      let newGain = 0.5
      let gainNode = this.state[gainName]
      gainNode.gain.value = newGain

      this.setState({
        [volumeName]: parseInt(event.target.value),
        [volInputName]: parseInt(event.target.value),
        [gainName]: gainNode
      })
    } else {
      let volumeName = name + 'Volume'
      let volInputName = name + 'VolInput'
      let gainName = name + 'Gain'

      let newGain = 0.99
      let gainNode = this.state[gainName]
      gainNode.gain.value = newGain

      this.setState({
        [volumeName]: parseInt(event.target.value),
        [volInputName]: 99,
        [gainName]: gainNode
      })
    }
  }

  clearGrid = () => {
    const { resolution } = this.state

    this.setState({
      beats: this.createBeats(resolution),
      kickGrid: this.createGrid(resolution),
      snareGrid: this.createGrid(resolution),
      clapGrid: this.createGrid(resolution),
      hihatGrid: this.createGrid(resolution)
    })
  }

  saveBeat = () => {
    let json_string = JSON.stringify(this.state.beats)
    let link = document.createElement('a')
    link.download = 'beat.json'
    const blob = new Blob([json_string], {type: 'text/plain'})
    link.href = window.URL.createObjectURL(blob)
    link.click()
  }

  loadBeat = (event) => {
    const { beats, kickGrid, snareGrid, clapGrid, hihatGrid} = this.state

    let reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
   
    var self = this 

    function onReaderLoad(event) {
      let newBeats = JSON.parse(event.target.result)

      newBeats.forEach((step, index) => {
        if (step.kick === true) {
          self.changeToBlack(index, 'kickGrid', kickGrid)
          if (beats[index].kick !== true) {
            beats[index].kick = true
          }
        } else if (step.snare === true) {
          self.changeToBlack(index, 'snareGrid', snareGrid)
          if (beats[index].snare !== true)
            beats[index].snare = true
        } else if (step.clap === true) {
          self.changeToBlack(index, 'clapGrid', clapGrid)
          if (beats[index].clap !== true) {
            beats[index].clap = true
          }
        } else if (step.hihat === true) {
          self.changeToBlack(index, 'hihatGrid', hihatGrid)
          if (beats[index].hihat !== true) {
            beats[index].hihat = true
          } 
        }
      })

      self.setState({
        beats: beats
      })
    }
  }

  render() {
    const { steps, kickGrid, snareGrid, clapGrid, hihatGrid } = this.state

    return (
      <div style={{width: '100%'}}>
        <div id='app-header'>
          <h1 id='app-title'>TR-GRID</h1>
          <div id='steps'>
            <h3 id='steps-title'>STEPS</h3>
            <input id='steps-input' type='number' min={2} max={32} value={this.state.resolutionInput} onChange={this.handleSteps}></input>
          </div>
          <div id='tempo'>
            <h3 id='tempo-title'>TEMPO</h3>
            <input id='tempo-input' type='number' min={0} max={400} value={this.state.tempo} onChange={this.handleTempo}></input>
          </div>
        </div>
        <div className='steps-row'>
          <h3 className='sound-name'>KICK</h3>
          {steps.map((step) => {
            return (
              <button className='square' style={{gridColumn: `${step.index + 2} / ${step.index + 3}`, backgroundColor:`${kickGrid[step.index]}`}} onClick={() => this.changeStep(step.index, 'kickGrid')}/>
            )
          })}
          <input className='volume' type='number' min={0} max={99} value={this.state.kickVolInput} onChange={(event) => this.handleVolume('kick', event)}></input>
        </div>
        <div className='steps-row'>
          <h3 className='sound-name'>SNARE</h3>
          {steps.map((step) => {
            return (
              <button className='square' style={{gridColumn: `${step.index + 2} / ${step.index + 3}`, backgroundColor:`${snareGrid[step.index]}`}} onClick={() => this.changeStep(step.index, 'snareGrid')}/>
            )
          })}
          <input className='volume' type='number' min={0} max={1} value={this.state.snareVolInput} onChange={(event) => this.handleVolume('snare', event)}></input>
        </div>
        <div className='steps-row'>
          <h3 className='sound-name'>CLAP</h3>
          {steps.map((step) => {
            return (
              <button className='square' style={{gridColumn: `${step.index + 2} / ${step.index + 3}`, backgroundColor:`${clapGrid[step.index]}`}} onClick={() => this.changeStep(step.index, 'clapGrid')}/>
            )
          })}
          <input className='volume' type='number' min={0} max={100} value={this.state.clapVolInput} onChange={(event) => this.handleVolume('clap', event)}></input>
        </div>
        <div className='steps-row'>
          <h3 className='sound-name'>HIHAT</h3>
          {steps.map((step) => {
            return (
              <button className='square' style={{gridColumn: `${step.index + 2} / ${step.index + 3}`, backgroundColor:`${hihatGrid[step.index]}`}} onClick={() => this.changeStep(step.index, 'hihatGrid')}/>
            )
          })}
          <input className='volume' type='number' min={0} max={100} value={this.state.hihatVolInput} onChange={(event) => this.handleVolume('hihat', event)}></input>
        </div>
        <br/>
        <button className='control-btn' onClick={() => this.pressPlay(this.state.sixteenth)}>PLAY</button>
        <button className='control-btn' onClick={this.stopLoop}>STOP</button>
        <button className='control-btn' onClick={this.clearGrid}>CLEAR</button>
        <button className='control-btn' onClick={this.saveBeat}>SAVE</button>
        <br/><br/>
        <div className='loader'>
          <h3 id='loader-title'>LOAD BEAT</h3>
          <input type='file' onChange={this.loadBeat}></input>
        </div>
      </div>
    )
  }
}

export default App;
