import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Dimensions } from 'react-native';
import colors from '../../utils/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    image: require('../../../assets/images/onboarding_doctor.jpg'),
    title: 'Talk to real\ndoctors anytime',
    description: 'Connect with certified medical professionals via text, call, or video for non-emergency issues.'
  },
  {
    image: require('../../../assets/images/onboarding_ai.jpg'),
    title: 'Get instant\nemergency guidance',
    description: 'Our intelligent assistant provides immediate advice during urgent health situations.'
  },
  {
    image: require('../../../assets/images/onboarding_articles.jpg'),
    title: 'Stay informed with\ntrusted health content',
    description: 'Explore our library of expert-reviewed health articles and tips for a healthier life.'
  }
];

const OnboardingScreen = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('RoleSelection');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Header with Skip inside Card */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.replace('RoleSelection')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Image source={slide.image} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Footer with Indicators and Next Button */}
        <View style={styles.footer}>
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  {
                    backgroundColor: index === currentSlide ? colors.primary : '#D1D5DB',
                  }
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentSlide === SLIDES.length - 1 ? 'Next' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardContainer: {
    backgroundColor: colors.white,
    width: width * 0.85,
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    elevation: 8,
    boxShadow: '0px 10px 20px rgba(0,0,0,0.05)',
    minHeight: 550,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 20
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary
  },
  content: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: 32
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'left',
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 40
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  indicatorContainer: {
    flexDirection: 'row',
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginRight: 6
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700'
  }
});

export default OnboardingScreen;
