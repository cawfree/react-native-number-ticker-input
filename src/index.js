import React, { useState, useEffect } from "react";
import {
  Platform,
  View,
  StyleSheet,
  TextInput,
  Text,
  Animated,
  Easing,
} from "react-native";
import PropTypes from "prop-types";

const styles = StyleSheet.create({
  invisible: { opacity: 0 },
  flex: { flex: 1, flexDirection: "row" },
  centerChildren: { alignItems: "center", justifyContent: "center" },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "black",
  },
  overflowHidden: { overflow: "hidden" },
});

const DecimalPoint = ({ ...extraProps }) => (
  <View style={[styles.flex, styles.centerChildren]}>
    <View style={[styles.dot, styles.overflowHidden]} />
  </View>
);

const Ticker = ({ value, height, containerStyle, style, ...extraProps }) => {
  const [animOffset] = useState(
    new Animated.Value(-Number.parseInt(9) * height)
  );
  useEffect(
    () =>
      Animated.timing(animOffset, {
        easing: Easing.inOut(Easing.quad),
        toValue: -Number.parseInt(value) * height,
        duration: 200,
        useNativeDriver: Platform.OS !== "web",
      }).start() && undefined,
    [animOffset, value]
  );
  return (
    <View style={[styles.flex, containerStyle]}>
      <Animated.View
        style={[
          {
            transform: [{ translateY: animOffset }],
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
          },
        ]}
      >
        <View>
          {[...Array(10)].map((_, i) => (
            <View style={[styles.centerChildren, { height }]}>
              <Text style={style} children={`${i}`} />
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

// https://stackoverflow.com/a/25198989/1701465
const applyZeroPadding = (input, length) =>
  (Array(length + 1).join("0") + input).slice(-length);

const NumberTickerInput = React.forwardRef(({
  style,
  height,
  value,
  onChange,
  significantDigits,
  significantContainerStyle,
  significantTickerStyle,
  decimalContainerStyle,
  decimalTickerStyle,
  decimalDigits,
  DecimalPoint,
  ...extraProps
}, ref) => {
  const digits = applyZeroPadding(
    value,
    significantDigits + decimalDigits
  ).split("");
  return (
    <View style={[{ height }, styles.overflowHidden]} pointerEvents="box-none">
      <TextInput
        {...extraProps}
        ref={ref}
        selectTextOnFocus
        keyboardType="numeric"
        style={[StyleSheet.absoluteFill, styles.invisible]}
        value={value}
        onChangeText={(e) =>
          onChange(
            Number.parseInt(
              applyZeroPadding(e, significantDigits + decimalDigits).substring(
                0,
                significantDigits + decimalDigits
              )
            )
          )
        }
        maxLength={significantDigits + decimalDigits}
        selectionColor="transparent"
      />
      <View pointerEvents="none" style={styles.flex}>
        {digits.slice(0, significantDigits).map((value, i) => (
          <Ticker
            containerStyle={significantContainerStyle}
            style={significantTickerStyle}
            key={i}
            height={height}
            value={value}
          />
        ))}
        {decimalDigits > 0 && (
          <>
            <DecimalPoint />
            {digits.slice(significantDigits).map((value, i) => (
              <Ticker
                containerStyle={decimalContainerStyle}
                style={decimalTickerStyle}
                key={i}
                height={height}
                value={value}
              />
            ))}
          </>
        )}
      </View>
    </View>
  );
});

NumberTickerInput.propTypes = {
  ...View.propTypes,
  height: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func,
  significantDigits: PropTypes.number,
  significantContainerStyle: PropTypes.any,
  significantTickerStyle: PropTypes.any,
  decimalContainerStyle: PropTypes.any,
  decimalTickerStyle: PropTypes.any,
  decimalDigits: PropTypes.number,
  DecimalPoint: PropTypes.elementType,
};

NumberTickerInput.defaultProps = {
  style: styles.flex,
  height: 100,
  value: 0,
  significantDigits: 4,
  decimalDigits: 2,
  DecimalPoint,
};

export default NumberTickerInput;
