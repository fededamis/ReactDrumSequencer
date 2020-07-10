import React from 'react';
import { connect } from "react-redux";
import cx from 'classnames'
import SampleName from './SampleName';

class Pads extends React.Component {

    render() {
        return (
            <div className="PadsGroup">                 
            {this.props.pads.map((padGroup, padGroupIndex) => (
                <div key={padGroupIndex} className='Pads'> 
                    <SampleName sampleId={padGroupIndex}/> 
                    {padGroup.map( (pad, padIndex) => (  
                        <div key={padIndex} className='Pad-container'>
                            <div 
                            className={cx('Pad',{
                                active: padIndex == this.props.activeStep,
                                on: pad == 1
                            })}
                            onClick={() => {
                                this.props.togglePad(padGroupIndex, padIndex)                            
                            }}>                                           
                            </div>                             
                            <span className={cx({                                
                                visible: [3,7,11].includes(padIndex),
                                hidden: ![3,7,11].includes(padIndex)
                            })}>|</span>   
                        </div>                       
                    ))}                
                </div>          
            ))}
            </div>
        );
    }    
}

const mapStateToProps = state => ({
    pads: state.pads, 
    activeStep: state.activeStep
}); 

const mapDispatchToProps = dispatch => ({
    togglePad: (padGroupIndex, padIndex) => dispatch({ type: 'TOGGLE_PAD', padGroup: padGroupIndex, pad: padIndex }),
}); 

export default connect(mapStateToProps, mapDispatchToProps)(Pads);