import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { matchingAPI } from '../services/api';

const { width, height } = Dimensions.get('window');

const DEFAULT_IMAGE = require('../../assets/Pet Pictures/alvan-nee-eoqnr8ikwFE-unsplash.jpg');

const PERSONALITY_COLORS = {
  calm: '#C7E7DB',
  playful: '#FFE1B5',
  curious: '#F7D6E0',
  gentle: '#E0E0E0',
  energetic: '#FFD3D3',
};

export default function DiscoveryScreen({ pets, selectedPetId, t, onBack }) {
  const [discoveryPets, setDiscoveryPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState(null);
  const swiperRef = useRef(null);

  const activePet = pets.find(p => p.id === selectedPetId) || pets[0];

  useEffect(() => {
    if (activePet) {
      loadDiscoveryFeed();
    }
  }, [activePet?.id]);

  const loadDiscoveryFeed = async () => {
    if (!activePet) return;

    try {
      setIsLoading(true);
      const data = await matchingAPI.getDiscoveryFeed(activePet.id);
      setDiscoveryPets(data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading discovery feed:', error);
      Alert.alert('Error', 'Failed to load pets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (cardIndex, action) => {
    const swipedPet = discoveryPets[cardIndex];
    if (!swipedPet || !activePet) return;

    try {
      const result = await matchingAPI.swipe(activePet.id, swipedPet.id, action);

      if (result.is_match) {
        setMatchedPet(swipedPet);
        setShowMatchModal(true);
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const onSwipedLeft = (cardIndex) => {
    handleSwipe(cardIndex, 'dislike');
    setCurrentIndex(cardIndex + 1);
  };

  const onSwipedRight = (cardIndex) => {
    handleSwipe(cardIndex, 'like');
    setCurrentIndex(cardIndex + 1);
  };

  const onSwipedTop = (cardIndex) => {
    handleSwipe(cardIndex, 'super_like');
    setCurrentIndex(cardIndex + 1);
  };

  const getImageSource = (pet) => {
    if (pet.photos && pet.photos.length > 0) {
      const mainPhoto = pet.photos.find(p => p.is_main) || pet.photos[0];
      return { uri: mainPhoto.image };
    }
    return DEFAULT_IMAGE;
  };

  const renderCard = (pet) => {
    if (!pet) return null;

    return (
      <View style={[styles.card, { backgroundColor: t.cardBg }]}>
        <Image source={getImageSource(pet)} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.petName, { color: t.textPrimary }]}>{pet.name}</Text>
            {pet.compatibility_score && (
              <View style={styles.compatibilityBadge}>
                <Text style={styles.compatibilityText}>{pet.compatibility_score}%</Text>
              </View>
            )}
          </View>

          <Text style={[styles.petBreed, { color: t.textSecondary }]}>
            {pet.breed || 'Unknown breed'} {pet.age ? `• ${pet.age}` : ''}
          </Text>

          <View style={[styles.personalityBadge, { backgroundColor: PERSONALITY_COLORS[pet.personality] || '#E0E0E0' }]}>
            <Text style={styles.personalityText}>
              {pet.personality?.charAt(0).toUpperCase() + pet.personality?.slice(1)}
            </Text>
          </View>

          {pet.description && (
            <Text style={[styles.description, { color: t.textSecondary }]} numberOfLines={2}>
              {pet.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🐾</Text>
      <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>No More Pets</Text>
      <Text style={[styles.emptyText, { color: t.textSecondary }]}>
        You've seen all available pets! Check back later for new matches.
      </Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: t.accent }]}
        onPress={loadDiscoveryFeed}
      >
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (!activePet) {
    return (
      <View style={[styles.container, { backgroundColor: t.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🐶</Text>
          <Text style={[styles.emptyTitle, { color: t.textPrimary }]}>No Pet Selected</Text>
          <Text style={[styles.emptyText, { color: t.textSecondary }]}>
            Add a pet first to start discovering matches!
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: t.background }]}>
        <ActivityIndicator size="large" color={t.accent} />
        <Text style={[styles.loadingText, { color: t.textSecondary }]}>
          Finding matches for {activePet.name}...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: t.textPrimary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: t.titleText }]}>Discover</Text>
          <Text style={[styles.headerSubtitle, { color: t.textSecondary }]}>
            Finding matches for {activePet.name}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Swiper */}
      {discoveryPets.length > 0 && currentIndex < discoveryPets.length ? (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={discoveryPets}
            cardIndex={currentIndex}
            renderCard={renderCard}
            onSwipedLeft={onSwipedLeft}
            onSwipedRight={onSwipedRight}
            onSwipedTop={onSwipedTop}
            stackSize={3}
            stackSeparation={15}
            backgroundColor="transparent"
            cardVerticalMargin={20}
            cardHorizontalMargin={20}
            animateOverlayLabelsOpacity
            animateCardOpacity
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: {
                  label: styles.overlayLabel,
                  wrapper: styles.overlayWrapperLeft,
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: styles.overlayLabel,
                  wrapper: styles.overlayWrapperRight,
                },
              },
              top: {
                title: 'SUPER LIKE',
                style: {
                  label: styles.overlayLabelTop,
                  wrapper: styles.overlayWrapperTop,
                },
              },
            }}
          />

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.nopeButton]}
              onPress={() => swiperRef.current?.swipeLeft()}
            >
              <Text style={styles.buttonText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.superLikeButton]}
              onPress={() => swiperRef.current?.swipeTop()}
            >
              <Text style={styles.buttonText}>⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => swiperRef.current?.swipeRight()}
            >
              <Text style={styles.buttonText}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        renderEmptyState()
      )}

      {/* Match Modal */}
      <Modal visible={showMatchModal} transparent animationType="fade">
        <View style={styles.matchModalOverlay}>
          <View style={[styles.matchModalContent, { backgroundColor: t.cardBg }]}>
            <Text style={styles.matchEmoji}>🎉</Text>
            <Text style={[styles.matchTitle, { color: t.textPrimary }]}>It's a Match!</Text>
            <Text style={[styles.matchText, { color: t.textSecondary }]}>
              {activePet.name} and {matchedPet?.name} liked each other!
            </Text>

            <View style={styles.matchPetsRow}>
              <Image source={activePet.image || DEFAULT_IMAGE} style={styles.matchPetImage} />
              <Text style={styles.matchHeart}>❤️</Text>
              <Image source={getImageSource(matchedPet || {})} style={styles.matchPetImage} />
            </View>

            <TouchableOpacity
              style={[styles.matchButton, { backgroundColor: t.accent }]}
              onPress={() => setShowMatchModal(false)}
            >
              <Text style={styles.matchButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    height: height * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: '700',
  },
  compatibilityBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  petBreed: {
    fontSize: 16,
    marginTop: 4,
  },
  personalityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  personalityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A3E36',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nopeButton: {
    backgroundColor: '#FF6B6B',
  },
  superLikeButton: {
    backgroundColor: '#4FC3F7',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
  },
  overlayLabel: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    padding: 10,
  },
  overlayLabelTop: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 10,
  },
  overlayWrapperLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: 30,
    marginLeft: -30,
  },
  overlayWrapperRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 30,
    marginLeft: 30,
  },
  overlayWrapperTop: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  matchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchModalContent: {
    width: width * 0.85,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  matchEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  matchPetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  matchPetImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  matchHeart: {
    fontSize: 32,
  },
  matchButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  matchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
