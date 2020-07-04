import React from 'react';
import { connect } from "react-redux";

class BPMButton extends React.Component {  
    render() {
        return (
            <div className="BPMButton">
                <span>BPM</span> 
                <input type="number" defaultValue={this.props.bpm} 
                onBlur={(e) => this.props.changeBPM(e.target.value)}/>
            </div>            
        );
    }       
}

const mapStateToProps = state => ({
    bpm: state.bpm
}); 

const mapDispatchToProps = dispatch => ({
    changeBPM: (newValue) => dispatch({ type: 'CHANGE_BPM', bpm: newValue }),
    play: () => dispatch({ type: 'PLAY' })
}); 

export default connect(mapStateToProps, mapDispatchToProps)(BPMButton);   