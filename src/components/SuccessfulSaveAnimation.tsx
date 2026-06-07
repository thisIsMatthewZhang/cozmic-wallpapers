import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withSpring, ReduceMotion } from 'react-native-reanimated';
import { StyleSheet, Text } from 'react-native';
import { typography, colors } from '../constants/theme';
import Svg, { Circle, G, Path, Polygon } from 'react-native-svg';
import { useEffect } from 'react';

export default function SuccessfulSaveAnimation() {
    const fadeIn = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => {
        return { opacity: fadeIn.get() };
    });
    useEffect(() => {
        fadeIn.set(withTiming(1, { duration: 260, easing: Easing.inOut(Easing.ease) }));
    }, []);
    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <AnimatedStar />
            <Text style={styles.successText}>Wallpaper(s) successfully saved to Photos! You will now be sent back to the home screen...</Text>
        </Animated.View>
    );
}

function AnimatedStar() {
    const scale = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => {
        return { 
            transform: [
                {
                    scale: scale.get(),
                },
            ],
        };
    });
    useEffect(() => {
        scale.set(withSpring(1, {
            duration: 1500,
            overshootClamping: true,
            reduceMotion: ReduceMotion.System,
        }));
    }, []);

    return (
        <Animated.View style={[styles.star, animatedStyle]}>
            <Svg height={100} width={100} viewBox="0 0 24 24">
                <Polygon
                    points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
                    fill={colors.success}
                    strokeWidth="1"
                />
                <G transform="translate(0 1)">
                    <Circle cx="9.2" cy="9.6" r="0.75" fill={colors.void} />
                    <Circle cx="14.8" cy="9.6" r="0.75" fill={colors.void} />
                    <Path
                        d="M8.6 13.1 Q12 16 15.4 13.1"
                        fill="none"
                        stroke={colors.void}
                        strokeLinecap="round"
                        strokeWidth="1.2"
                    />
                </G>
            </Svg>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: colors.overlay,
        top: 200,
        borderRadius: 10,
        zIndex: 1000,
        padding: 12,
        margin: 12,
    },
    successText: {
        fontSize: typography.caption, 
        fontWeight: 'bold',
        color: colors.white
    },
    star: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
