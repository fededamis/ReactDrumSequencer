import React from 'react';
import PlayButton from './PlayButton';
import Pads from './Pads';
import BPMButton from './BPMButton';

class SequencerBody extends React.Component {
    render() {
        return (
            <div className='SequencerBody'>
               <PlayButton/>  
               <BPMButton/>
               <Pads/>
            </div> 
        );
    }    
}

export default SequencerBody; 