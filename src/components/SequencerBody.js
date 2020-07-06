import React from 'react';
import PlayButton from './PlayButton';
import Pads from './Pads';
import BPMButton from './BPMButton';
import VolumeFader from './VolumeFader';

class SequencerBody extends React.Component {
    render() {
        return (
            <div className='SequencerBody'>
               <PlayButton/>  
               <BPMButton/>
               <VolumeFader/>
               <Pads/>
            </div> 
        );
    }    
}

export default SequencerBody; 