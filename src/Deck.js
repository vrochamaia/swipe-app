import React, { Component } from 'react'
import { View, Animated } from 'react-native'

class Deck extends Component {

    renderCards() {
        return this.props.data.map(item => (
            this.props.renderCard(item)
        ))
    }

    render() {
        return (
            <View>
                {this.renderCards()}
            </View>
        )
    }
}

const styles = {
    deck: {
        height: 60,
        width: 60,
        borderRadius: 30,
        borderWidth: 30,
        borderColor: 'black'
    }
}

export default Deck