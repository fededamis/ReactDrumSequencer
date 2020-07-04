import React from 'react';
import { connect } from "react-redux";

class SampleName extends React.Component {
    render() {

        var sampleId = this.props.sampleId;
        var samples = this.props.samples;

        return (
            <span className='SampleName'>{samples[sampleId].name}</span>            
        );
    }    
}

const mapStateToProps = state => ({
    samples: state.samples
}); 

export default connect(mapStateToProps)(SampleName);