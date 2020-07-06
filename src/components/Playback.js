import React from 'react';
import { connect } from "react-redux";

class PlayBack extends React.Component { 

    playbackInterval = null; //Objeto setInterval de reproduccion
    playbackBPM = null; //BPM de reproduccion de playback
    audioContext = null; //Audio Context de Web Audio API
    nextPlaybackTime = 0.0; //Tiempo de proxima reproduccion de sample
    loadedSamples = null; //Audio samples precargados, para tenerlos cargados antes de reproducirlos.  
    scheduleFreq = 25.0; //Frecuencia del scheduler de audio (en milisegundos)
    scheduleAheadTime = 0.1; //Capacidad del sheduler, en segundos. 
    //Por ej si == 0.1, el sheduler agendará audios de los próximos 100 milisegundos desde 
    //que comenzó. Luego se ejecutará el siguiente scheduler y agendará los 100 ms siguientes y así. 

    render() {

        //VER POR QUE EL RENDER SE EJECUTA DOS VECES  
        this.loadAudioContext();
        this.preLoadSamples();     
        var isPlaying = this.props.playing;        
        
        if (isPlaying && this.playbackInterval == null)
            this.playSetInterval();
            
        if (!isPlaying && this.playbackInterval != null)
            this.pause();  
            
        if (this.playbackBPM != null) {
            if (this.playbackBPM != this.props.bpm) {                
                if (this.props.bpm >= 30.0 && this.props.bpm <= 260.0) {
                    clearInterval(this.playbackInterval);
                    this.playbackInterval = null;
                    this.playSetInterval();
                }                             
            }
        } 
        return (<div></div>);
    }

    loadAudioContext() {

        if (this.audioContext != null)
            return;

        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        // Se reproduce un buffer de silencio para "despertar" el audio        
        var buffer = this.audioContext.createBuffer(1, 1, 22050);
        var node = this.audioContext.createBufferSource();
        node.buffer = buffer;
        node.start(0);            
    }    

    preLoadSamples() {       
        if (this.loadedSamples != null)
            return;
        this.loadedSamples = this.props.samples;       
        this.loadedSamples.forEach(async sample => {
            var path = sample.path;            
            sample.buffer = await this.loadSample(path);   
        });  
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
    
    playSetInterval() {         
        this.playbackBPM = this.props.bpm; 
        this.playbackInterval = setInterval( ()=> this.scheduler(), this.scheduleFreq);        
    }   
    
    scheduler() {       

        //Se utiliza una estrategia de "Audio Scheduling" para agendar  
        //los audios a reproducir segun el clock de Web Audio API y no segun
        //el clock que utiliza internamente el navagador para setTimeout. 
        //https://www.html5rocks.com/en/tutorials/audio/scheduling/

        //Evito acumular samples agendados anteriores al tiempo actual,
        //que luego se ejecutan todos juntos y causan glitches
        if (this.nextPlaybackTime < this.audioContext.currentTime)
            this.nextPlaybackTime = this.audioContext.currentTime; 

        while (this.nextPlaybackTime < this.audioContext.currentTime + this.scheduleAheadTime ) {          
            this.play(); 
            this.nextPlaybackTime += 0.25 * 60 / this.playbackBPM; 
            /*
            120 beats per minute    _______ 60 seg
            4 beats  			    _______ 2 seg
            1 beat    			    _______ 0.5 seg
            0.25 beat (1 cuadrado)  _______ (0.25 * 60 / BPM)
            */           
        }  
    }    

    play() {           
        
        var activeStep = this.props.activeStep; 
        var maxSteps = this.props.maxSteps; 
        
        //Idealmente se deberia ejecutar el audio y luego avanzar el step, pero no es conveniente
        //ejecutar callbacks luego de la reproduccion del audio, por razones de performance y sincronía
        //del audio. Por lo tanto, se invierta la logica:
        //Primero se adelanta visualmente el step y luego se ejecuta el sample de la posicion n+1
        //para mentener en sincronía el audio con el indicador visual de step activo        

        this.props.incrementStep();                       

        if (activeStep == maxSteps) 
            activeStep = 0;
        else 
            activeStep++;         

        var pads = this.props.pads;
        var samples = this.loadedSamples;          

        var samplesToBePlayedArray = [];   

        for (var i = 0; i < pads.length; i++) {		
        	var group = pads[i];
            var sampleBox = group[activeStep];                                 
        	if (sampleBox == 1) {                
                var buffer = samples[i].buffer;
                samplesToBePlayedArray.push(buffer);  			        		
        	}  		
        }       
        
        //Se deben obtener todos los samples a reproducir en un momento dado y mixearlos en un único sample,
        //para luego reproducirlo y que se escuchen en simultáneo.
        var mixBuffer = this.mix(samplesToBePlayedArray);
        this.playSample(mixBuffer);           
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

        //Evito acumular samples agendados anteriores al tiempo actual,
        //que luego se ejecutan todos juntos y causan glitches
        if (this.nextPlaybackTime >= this.audioContext.currentTime)
            source.start(this.nextPlaybackTime);                   
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
    bpm: state.bpm,
    maxSteps: state.maxSteps
}); 

const mapDispatchToProps = dispatch => ({
    incrementStep: () => dispatch({ type: 'INCREMENT_STEP' }),
    resetStep: () => dispatch({ type: 'RESET_STEP' }),
}); 

export default connect(mapStateToProps, mapDispatchToProps)(PlayBack);