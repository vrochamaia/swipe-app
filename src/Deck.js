import React, { Component } from 'react'
import { View, Animated, PanResponder, Dimensions, LayoutAnimation, UIManager } from 'react-native'
import { Card, Text, Button } from 'react-native-elements'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH
const SWIPE_OUT_DURATION = 250

class Deck extends Component {

    static defaultProps = {
        onSwipeRight: () => { },
        onSwipeLeft: () => { },
    }

    constructor(props) {
        super(props)

        this.resetIndex = this.resetIndex.bind(this)

        const position = new Animated.ValueXY()
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (e, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy })
            },
            onPanResponderRelease: (e, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD)
                    this.forceSwipe('right')
                else if (gesture.dx < -SWIPE_THRESHOLD)
                    this.forceSwipe('left')
                else
                    this.resetPosition()

            }
        })

        this.position = position
        this.state = { panResponder, index: 0 }
    }

    componentDidUpdate(prevProps) {
        // Necessary for Android
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
        LayoutAnimation.spring()

        if (prevProps.data !== this.props.data)
            this.setState({ index: 0 })

    }

    forceSwipe(direction) {
        const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH
        Animated.timing(this.position, {
            toValue: { x, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction))
    }

    onSwipeComplete(direction) {
        const { onSwipeRight, onSwipeLeft, data } = this.props
        const item = data[this.state.index]

        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item)
        this.position.setValue({ x: 0, y: 0 })
        this.setState({ index: this.state.index + 1 })
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: { x: 0, y: 0 }
        }).start()
    }

    getCardStyle() {

        const rotate = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
            outputRange: ['-120deg', '0deg', '120deg']
        })

        return {
            ...this.position.getLayout(),
            transform: [{ rotate }]
        }
    }

    resetIndex() {
        this.setState({ index: 0})
    }

    renderNoMoreCards() {
        return (
            <Card title='All Done'>
                <Text style={{ marginBottom: 10 }}>There is no more content here!</Text>
                <Button onPress={this.resetIndex} title='Get More' backgroundColor='#03A9F4' />
            </Card>
        )
    }

    renderCards() {
        const { index } = this.state

        if (index >= this.props.data.length)
            return this.renderNoMoreCards()

        return this.props.data.map((item, i) => {

            if (i < index)
                return null
            else if (i === index) {
                return (
                    <Animated.View key={item.id}
                        style={[this.getCardStyle(), styles.cardStyle]}
                        {...this.state.panResponder.panHandlers}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            } else {
                return (
                    <Animated.View
                        key={item.id}
                        style={[styles.cardStyle, { top: 10 * (i - index) }]}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }

        }).reverse()
    }

    render() {
        return (
            <Animated.View>
                {this.renderCards()}
            </Animated.View>
        )
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        width: SCREEN_WIDTH
    }
}

export default Deck