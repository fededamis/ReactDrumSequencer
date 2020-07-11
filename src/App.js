import React from 'react';
import { Provider } from "react-redux";
import { createStore } from "redux";
import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import Popper from 'popper.js';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Header from './components/Header';
import Sequencer from './components/Sequencer';
import Footer from './components/Footer';
import {Helmet} from "react-helmet";

const defaultPads = [
	[1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]  
]

const samples = [
	{
		id: 0,
		name:'Hi-Hat',
		path:'samples/hi-hat.wav'
	},
	{
		id: 1,
		name:'Snare',
		path:'samples/snare.wav'
	},
	{
		id: 2,
		name:'Kick',
		path:'samples/kick.wav'
	},
	{
		id: 3,
		name:'Open Hi-Hat',
		path:'samples/open-hi-hat.wav'
	},
];

const initialState = {
	pads: defaultPads,
	bpm: 90.0,     
	activeStep: 0,
	maxSteps: 15,
	playing: false,   
	samples: samples,
	gain: 1.0
  };

function reducer(state = initialState, action) {	
	switch (action.type) {
		case 'TOGGLE_PAD':			
			var padGroupIndex = action.padGroup;
			var padIndex = action.pad;	
			//Se debe hacer deep-copy de los argumentos del reducer,
			//deben ser inmutables
			var clonedState = JSON.parse(JSON.stringify(state));
			var newPadsArray = clonedState.pads;			
			var targetPadState = newPadsArray[padGroupIndex][padIndex];
			newPadsArray[padGroupIndex][padIndex] = targetPadState == 1 ? 0 : 1;
			clonedState.pads = newPadsArray; 			
			return clonedState;
		case 'INCREMENT_STEP':			
			var clonedState = JSON.parse(JSON.stringify(state));
			var maxSteps = clonedState.maxSteps;

			if (clonedState.activeStep == maxSteps)
				clonedState.activeStep = 0;
			else 
				clonedState.activeStep++;

			return clonedState;
		case 'RESET_STEP':
			var clonedState = JSON.parse(JSON.stringify(state));
			clonedState.activeStep = 0;
			return clonedState;
		case 'PLAY':		
			var clonedState = JSON.parse(JSON.stringify(state));
			var isPlaying = clonedState.playing;
			var isPlayingNew = isPlaying == true ? false : true;
			clonedState.playing = isPlayingNew;
			return clonedState;	
		case 'CHANGE_BPM':
			var clonedState = JSON.parse(JSON.stringify(state));
			var newBPM = action.bpm;
			clonedState.bpm = newBPM;
			return clonedState;	
		case 'CHANGE_GAIN':
			var clonedState = JSON.parse(JSON.stringify(state));
			var newGain = action.gain;
			clonedState.gain = newGain;
			return clonedState;	
		default:
			return state;
	}
}

const store = createStore(reducer);

class App extends React.Component {
	render() {
		return (
			<div className="App">	
				<Helmet>
					<meta name="viewport" content="width=device-width, initial-scale=1.0"></meta> 
				</Helmet>
				<Provider store={store}>				
					<Header/>
					<Sequencer className="Sequencer"/> 
					<Footer/>     				
				</Provider>		
			</div>
		);
	}  
}
 
export default App;