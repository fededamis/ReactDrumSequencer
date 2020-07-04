import React from 'react';
import PlayBack from './Playback'
import SequencerBody from './SequencerBody';

class Sequencer extends React.Component {
    render() {
        return (
            <div>            
                <PlayBack/>                
                <SequencerBody/>            
            </div>        
        );
    }    
}

export default Sequencer;