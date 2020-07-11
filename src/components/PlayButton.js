import React from 'react';
import { connect } from "react-redux";
import cx from 'classnames'

class PlayButton extends React.Component {
    render() {
        return (
            <button className={cx('PlayButton',{
                started: this.props.playing,
                paused: !this.props.playing
            })}
            onClick={() => {this.props.play()}}>Play</button>
        );
    }    
}
 
const mapStateToProps = state => ({
    playing: state.playing    
}); 

const mapDispatchToProps = dispatch => ({
    play: () => dispatch({ type: 'PLAY' }),
}); 

export default connect(mapStateToProps, mapDispatchToProps)(PlayButton);   