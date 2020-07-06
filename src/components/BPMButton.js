import React from 'react';
import { connect } from "react-redux";

class BPMButton extends React.Component {     

    render() {
        return (
            <div className="BPMButton">
                <span>BPM</span> 
                <input type="number" min="0" max="260" step="1" 
                value={this.props.bpm} onChange={(e) => this.props.changeBPM(e.target.value)}/>
                <input type="range" min="30.0" max="260.0" step="1" 
                value={this.props.bpm} onChange={(e) => this.props.changeBPM(e.target.value)}/> 
            </div>            
        );
    }       
}

const mapStateToProps = state => ({
    bpm: state.bpm
}); 

const mapDispatchToProps = dispatch => ({
    changeBPM: (newValue) => {              
        newValue = parseFloat(newValue);        
        dispatch({ type: 'CHANGE_BPM', bpm: newValue })
    },
    play: () => dispatch({ type: 'PLAY' })
}); 

export default connect(mapStateToProps, mapDispatchToProps)(BPMButton);   