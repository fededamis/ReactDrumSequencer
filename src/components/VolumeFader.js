import React from 'react';
import { connect } from "react-redux";

class VolumeFader extends React.Component {     

    render() {
        return (
            <div className="VolumeFader">
                <span>Volumen</span>                
                <input type="range" min="0.0" max="1.0" step="0.01" 
                value={this.props.gain} onChange={(e) => this.props.changeGain(e.target.value)}/> 
            </div>            
        );
    }       
}

const mapStateToProps = state => ({
    gain: state.gain
}); 

const mapDispatchToProps = dispatch => ({
    changeGain: (newValue) => {              
        newValue = parseFloat(newValue);        
        dispatch({ type: 'CHANGE_GAIN', gain: newValue })
    }
}); 

export default connect(mapStateToProps, mapDispatchToProps)(VolumeFader);   