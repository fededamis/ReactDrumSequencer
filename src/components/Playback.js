import React from 'react';
import { connect } from "react-redux";

class PlayBack extends React.Component { 

    playbackInterval = null;
    playbackBPM = null;
    audioContext = null;

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

    loadAudioContext() {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        this.audioContext = new AudioContext();
    }    
    
    playSetInterval() {

        if (this.audioContext == null)
            this.loadAudioContext();

        this.playbackBPM = this.props.bpm;                 
        this.playbackInterval = setInterval( ()=> this.play(), 0.25 * 60 / this.playbackBPM * 1000);
        /*
        120 beats 			    _______ 60 seg
        4 beats  			    _______ 2 seg
        1 beat    			    _______ 0.5 seg
        0.25 beat (1 cuadrado)  _______ (0.25 * 60 / BPM) * 1000 (milisegundos)			
        */         
    }     

    async play() {                    
        
        var activeStep = this.props.activeStep;
        var pads = this.props.pads;
        var samples = this.props.samples;         

        var samplesToBePlayedArray = [];  

        for (var i = 0; i < pads.length; i++) {		
        	var group = pads[i];
        	var sampleBox = group[activeStep];
        	if (sampleBox == 1) {
                var samplePath = samples[i].path;                
                var buffer = await this.loadSample(samplePath);  
                samplesToBePlayedArray.push(buffer);			        		
        	}		
        }       
        
        var mixBuffer = this.mix(samplesToBePlayedArray);
        this.playSample(mixBuffer); 
        this.props.incrementStep();             
    }    

    loadSample(path) {
        return new Promise((resolve, reject)=> {            
            var request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'arraybuffer';     
            request.onload = () => {
                this.audioContext.decodeAudioData(request.response, 
                    (buffer) => {resolve(buffer);},
                    null);
            };
            request.send();            
        });              
    }
    
    mix(buffers) {

        if (buffers == null || buffers.length == 0)
            return;

        //Obtengo la cantidad maxima de canales y duracion entre todas las muestras a mezclar 
        var maxChannels = 0;
        var maxDuration = 0; 
    
        for (var i = 0; i < buffers.length; i++) {
            if (buffers[i].numberOfChannels > maxChannels) {
                maxChannels = buffers[i].numberOfChannels;
            }
            if (buffers[i].duration > maxDuration) {
                maxDuration = buffers[i].duration;
            }
        }   
        
        var mixed = this.audioContext.createBuffer(
            maxChannels, 
            this.audioContext.sampleRate * maxDuration, 
            this.audioContext.sampleRate);        
    
        //Recorro cada mustra
        for (var j=0; j<buffers.length; j++){    
            //Recorro cada canal
            for (var srcChannel = 0; srcChannel < buffers[j].numberOfChannels; srcChannel++) {                
                //Obtengo el canal en donde vamos a hacer la mezcla
                var _out = mixed.getChannelData(srcChannel);
                //Obtengo el canal a mezclar
                var _in = buffers[j].getChannelData(srcChannel);    
                //Recorro cada muestra de audio para sumar y hacer la mezcla
                for (var i = 0; i < _in.length; i++) {
                    _out[i] += _in[i];
                }
            }
        }    
        return mixed;
    }

    playSample(buffer) {

        if (buffer == null || buffer.length == 0)
            return;

        var source = this.audioContext.createBufferSource(); 
        source.buffer = buffer;                    
        source.connect(this.audioContext.destination);
        //source.onended = () => this.props.incrementStep();
        source.start(0); 
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