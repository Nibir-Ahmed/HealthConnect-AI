import React, { useState } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import colors from '../../utils/colors';
const BMICalculatorScreen = ({ navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const [height, setHeight] = useState('170'); // cm
  const [weight, setWeight] = useState('65');  // kg
  const [result, setResult] = useState(null);
  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      alert('Please enter valid height and weight values.');
      return;
    }
    const bmi = w / (h * h);
    const bmiScore = parseFloat(bmi.toFixed(1));
    let category = '';
    let categoryColor = '';
    let recommendation = '';
    if (bmiScore < 18.5) {
      category = 'Underweight';
      categoryColor = colors.warning;
      recommendation = 'Consider speaking with a nutritionist to design a healthy, high-calorie meal plan.';
    } else if (bmiScore < 24.9) {
      category = 'Normal';
      categoryColor = colors.success;
      recommendation = 'Great job! Keep maintaining your balanced diet and active daily routine.';
    } else if (bmiScore < 29.9) {
      category = 'Overweight';
      categoryColor = colors.warning;
      recommendation = 'Increasing daily cardiovascular exercise and reducing carbohydrate intake can help.';
    } else {
      category = 'Obese';
      categoryColor = colors.emergency;
      recommendation = 'We recommend consulting a General Physician or dietician for clinical support.';
    }
    setResult({
      score: bmiScore,
      category,
      color: categoryColor,
      recommendation
    });
  };
  const resetCalculator = () => {
    setHeight('170');
    setWeight('65');
    setResult(null);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BMI Calculator</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
        {!result ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enter Body Metrics</Text>
            <Text style={styles.formSubtitle}>Calculate your Body Mass Index instantly</Text>
            <Input
              label="Height (cm)"
              placeholder="e.g. 170"
              icon="resize-outline"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
            <Input
              label="Weight (kg)"
              placeholder="e.g. 65"
              icon="scale-outline"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <Button title="Calculate BMI" onPress={calculateBMI} style={styles.calcBtn} />
          </View>
        ) : (
          <Card style={styles.resultCard}>
            <Text style={styles.resultLabel}>YOUR BMI SCORE</Text>
            <Text style={[styles.resultScore, { color: result.color }]}>{result.score}</Text>
            <View style={[styles.badge, { backgroundColor: result.color + '15' }]}>
              <Text style={[styles.badgeText, { color: result.color }]}>{result.category.toUpperCase()}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.recTitle}>Recommendation</Text>
            <Text style={styles.recText}>{result.recommendation}</Text>
            <View style={styles.scaleContainer}>
              <View style={styles.scaleRow}>
                <Text style={styles.scaleLabel}>Underweight</Text>
                <Text style={styles.scaleVal}>&lt; 18.5</Text>
              </View>
              <View style={styles.scaleRow}>
                <Text style={styles.scaleLabel}>Normal</Text>
                <Text style={styles.scaleVal}>18.5 - 24.9</Text>
              </View>
              <View style={styles.scaleRow}>
                <Text style={styles.scaleLabel}>Overweight</Text>
                <Text style={styles.scaleVal}>25.0 - 29.9</Text>
              </View>
              <View style={styles.scaleRow}>
                <Text style={styles.scaleLabel}>Obese</Text>
                <Text style={styles.scaleVal}>&ge; 30.0</Text>
              </View>
            </View>
            <Button title="Calculate Again" variant="outline" onPress={resetCalculator} />
          </Card>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center'
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    elevation: 2
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24
  },
  calcBtn: {
    marginTop: 8
  },
  resultCard: {
    alignItems: 'center',
    padding: 24
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1
  },
  resultScore: {
    fontSize: 54,
    fontWeight: '800',
    marginVertical: 12
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700'
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 20
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  recText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
    alignSelf: 'flex-start'
  },
  scaleContainer: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginBottom: 24
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  scaleLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary
  },
  scaleVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  }
});
export default BMICalculatorScreen;