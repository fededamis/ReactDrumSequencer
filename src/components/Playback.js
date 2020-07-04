import React from 'react';
import { connect } from "react-redux";

class PlayBack extends React.Component { 

    playbackInterval = null;
    playbackBPM = null;

    render() {

        //VER POR QUE EL RENDER SE EJECUTA DOS VECES       
        var isPlaying = this.props.playing;        
        
        if (isPlaying && this.playbackInterval == null)
            this.playSetInterval();
            
        if (!isPlaying && this.playbackInterval != null)
            this.pause();  
            
        if (this.playbackBPM != null) {
            if (this.playbackBPM != this.props.bpm) {
                clearInterval(this.playbackInterval);
                this.playbackInterval = null;
                this.playSetInterval();
            }
        }

        return (<div></div>);
    }
    
    playSetInterval() {
        this.playbackBPM = this.props.bpm;                 
        this.playbackInterval = setInterval( ()=> this.play(), 0.25 * 60 / this.playbackBPM * 1000);
        /*
        120 beats 			    _______ 60 seg
        4 beats  			    _______ 2 seg
        1 beat    			    _______ 0.5 seg
        0.25 beat (1 cuadrado)  _______ (0.25 * 60 / BPM) * 1000 (milisegundos)			
        */        
    }     

    play() {       
        
        /*
        EJECUTAR EL AUDIO DE FORMA DISTINTA PARA QUE SEA MAS PRECISO
        https://www.html5rocks.com/en/tutorials/webaudio/intro/
        https://stackoverflow.com/questions/54509959/how-do-i-play-audio-files-synchronously-in-javascript
        */

        var activeStep = this.props.activeStep;
        var pads = this.props.pads;
        var samples = this.props.samples; 
        //this.playActiveStep(activeStep, pads, samples).then(() => this.props.incrementStep());

        for (var i = 0; i < pads.length; i++) {		
        	var group = pads[i];
        	var sampleBox = group[activeStep];
        	if (sampleBox == 1) {
        		var samplePath = samples[i].path;			
        		var audio = new Audio(samplePath);			
        		audio.play();  
        	}		
        } 
        this.props.incrementStep();         
    }

    playActiveStep(activeStep, pads, samples) { 
        return new Promise(async function(resolve, reject) {            

            var audioArray = [];

            for (var i = 0; i < pads.length; i++) {		
                var group = pads[i];
                var sampleBox = group[activeStep];
                if (sampleBox == 1) {
                    var samplePath = samples[i].path;			
                    var audio = new Audio(samplePath);			
                    audioArray.push(audio);                    
                }		
            } 

            if (audioArray.length == 0)
                resolve();

            for (var i = 0; i < audioArray.length; i++) {	

                audioArray[i].play();

                if (i == audioArray.length -1) {
                    debugger;
                    //audioArray[i].play().then(resolve());
                    await audioArray[i].play();
                }
            }
            resolve();            
        });
    }

    pause() {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null; 
        this.props.resetStep();        
    }
}

const mapStateToProps = state => ({
    playing: state.playing,
    activeStep: state.activeStep,
    pads: state.pads,
    samples: state.samples,
    bpm: state.bpm
}); 

const mapDispatchToProps = dispatch => ({
    incrementStep: () => dispatch({ type: 'INCREMENT_STEP' }),
    resetStep: () => dispatch({ type: 'RESET_STEP' }),
}); 

export default connect(mapStateToProps, mapDispatchToProps)(PlayBack);