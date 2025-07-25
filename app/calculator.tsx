import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';

const { width } = Dimensions.get('window');
const buttonSize = (width - 80) / 4;

export default function CalculatorModal() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const Button: React.FC<{
    title: string;
    onPress: () => void;
    style?: any;
    textStyle?: any;
  }> = ({ title, onPress, style, textStyle }) => (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <FontAwesome name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calculator</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <Button
            title="C"
            onPress={clear}
            style={[styles.button, styles.functionButton]}
            textStyle={styles.functionButtonText}
          />
          <Button
            title="±"
            onPress={() => setDisplay(String(parseFloat(display) * -1))}
            style={[styles.button, styles.functionButton]}
            textStyle={styles.functionButtonText}
          />
          <Button
            title="%"
            onPress={() => setDisplay(String(parseFloat(display) / 100))}
            style={[styles.button, styles.functionButton]}
            textStyle={styles.functionButtonText}
          />
          <Button
            title="÷"
            onPress={() => inputOperation('÷')}
            style={[styles.button, styles.operatorButton]}
            textStyle={styles.operatorButtonText}
          />
        </View>

        <View style={styles.row}>
          <Button title="7" onPress={() => inputNumber('7')} />
          <Button title="8" onPress={() => inputNumber('8')} />
          <Button title="9" onPress={() => inputNumber('9')} />
          <Button
            title="×"
            onPress={() => inputOperation('×')}
            style={[styles.button, styles.operatorButton]}
            textStyle={styles.operatorButtonText}
          />
        </View>

        <View style={styles.row}>
          <Button title="4" onPress={() => inputNumber('4')} />
          <Button title="5" onPress={() => inputNumber('5')} />
          <Button title="6" onPress={() => inputNumber('6')} />
          <Button
            title="-"
            onPress={() => inputOperation('-')}
            style={[styles.button, styles.operatorButton]}
            textStyle={styles.operatorButtonText}
          />
        </View>

        <View style={styles.row}>
          <Button title="1" onPress={() => inputNumber('1')} />
          <Button title="2" onPress={() => inputNumber('2')} />
          <Button title="3" onPress={() => inputNumber('3')} />
          <Button
            title="+"
            onPress={() => inputOperation('+')}
            style={[styles.button, styles.operatorButton]}
            textStyle={styles.operatorButtonText}
          />
        </View>

        <View style={styles.row}>
          <Button
            title="0"
            onPress={() => inputNumber('0')}
            style={[styles.button, styles.zeroButton]}
          />
          <Button title="." onPress={inputDecimal} />
          <Button
            title="="
            onPress={performCalculation}
            style={[styles.button, styles.operatorButton]}
            textStyle={styles.operatorButtonText}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 16, // Reduced since global status bar is now present
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  displayText: {
    fontSize: 64,
    fontWeight: '200',
    color: '#fff',
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    width: buttonSize,
    height: buttonSize,
    borderRadius: buttonSize / 2,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '400',
  },
  functionButton: {
    backgroundColor: '#A6A6A6',
  },
  functionButtonText: {
    color: '#000',
  },
  operatorButton: {
    backgroundColor: '#FF9500',
  },
  operatorButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  zeroButton: {
    width: buttonSize * 2 + 10,
    borderRadius: buttonSize / 2,
  },
});
