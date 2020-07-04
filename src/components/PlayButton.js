import React from 'react';
import { connect } from "react-redux";

class PlayButton extends React.Component {
    render() {
        return (
            <button className="PlayButton"
            onClick={() => {this.props.play()}}>Play</button>
        );
    }    
}

const mapDispatchToProps = dispatch => ({
    play: () => dispatch({ type: 'PLAY' }),
}); 

export default connect(null, mapDispatchToProps)(PlayButton);   