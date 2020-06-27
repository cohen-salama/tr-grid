# TR-GRID

## description

TR-GRID is an interactive rhythm composer based on the functionality of vintage Roland drum machines. TR-GRID generates its user interface by putting together 4 grids of 16 slots, each of them representing an 16th note inside a cyclic 4/4 measure. Each grid allows the user to design a pattern that corresponds to the instrument that's indicated next to it. The sounds on this first version of TR-GRID are basic samples from a Roland TR-909.

The drum beat generated by TR-GRID loops constantly until stopped and is responsive to live changes in the user's pattern design. It also responds to tempo changes and, in both cases, it does so with two musical measures of delay. 

After pressing play, the user can stop TR-GRID from looping, then press play again or decide to clear the grid to begin with the design of a new pattern.

The functionality of this app is achieved by utilizing a Web Audio Api context to create audio buffers. These buffers are to be played by a loop function that loops over a 16 element array (16 beats) and sets a timeout interval related to each sound's position for playing either the sound or silence according to what's in the beat array that has been generated by the user's interaction with the slots. The app uses the componentDidUpdate lifecycle to decide whether to continue or stop playing this sequence in an eternal loop.

## features

* visual rhythm composer
* play, stop and clear grid controls
* infinite loop playback of the drum beat
* live response to pattern changes
* live tempo control

## technologies

* React
* Javascript
* CSS & HTML
* Web Audio Api

## live version

[TR-GRID](https://tr-grid.netlify.app)
