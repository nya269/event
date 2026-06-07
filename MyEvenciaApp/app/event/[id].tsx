import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import eventsService from '@/src/services/events';
import paymentsService from '@/src/services/payments';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    eventsService.getEvent(id)
      .then((data) => setEvent(data.event))
      .catch(() => Alert.alert('Erreur', 'Impossible de charger cet événement.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      Alert.alert('Connexion requise', 'Connectez-vous pour vous inscrire.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se connecter', onPress: () => router.push('/login') },
      ]);
      return;
    }
    const isFree = parseFloat(event.price) === 0;
    if (isFree) {
      setRegistering(true);
      try {
        await eventsService.registerForEvent(id);
        Alert.alert('Inscrit !', 'Vous êtes bien inscrit à cet événement.');
        const data = await eventsService.getEvent(id);
        setEvent(data.event);
      } catch (e: any) {
        Alert.alert('Erreur', e.response?.data?.error || 'Inscription impossible.');
      } finally {
        setRegistering(false);
      }
    } else {
      setRegistering(true);
      try {
        const data = await eventsService.initializePayment(id);
        setPaymentData(data);
        setPaymentModal(true);
      } catch (e: any) {
        Alert.alert('Erreur', e.response?.data?.error || 'Paiement impossible.');
      } finally {
        setRegistering(false);
      }
    }
  };

  const handleMockPayment = async () => {
    setPaying(true);
    try {
      await paymentsService.processMockPayment(paymentData.paymentId);
      setPaymentModal(false);
      Alert.alert('Paiement réussi !', 'Vous êtes inscrit à cet événement.');
      const data = await eventsService.getEvent(id);
      setEvent(data.event);
    } catch (e: any) {
      Alert.alert('Erreur', e.response?.data?.error || 'Paiement échoué.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.red} />
        <Text style={styles.errorText}>Événement introuvable</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFree = parseFloat(event.price) === 0;
  const spotsLeft = event.remainingSpots ?? (event.capacity - (event.currentParticipants || 0));
  const isFull = spotsLeft <= 0;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textMuted} />
          <Text style={styles.backText}>Événements</Text>
        </TouchableOpacity>

        {/* Image placeholder */}
        <View style={styles.imagePlaceholder}>
          <Ionicons name="calendar" size={56} color="rgba(255,255,255,0.15)" />
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.title}</Text>
          {event.organizer && (
            <Text style={styles.organizer}>
              Organisé par <Text style={styles.organizerName}>{event.organizer.fullName}</Text>
            </Text>
          )}
        </View>

        {/* Details card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primaryLight} />
            </View>
            <View>
              <Text style={styles.detailMain}>{formatDate(event.startDatetime || event.start_datetime)}</Text>
              <Text style={styles.detailSub}>
                {formatTime(event.startDatetime || event.start_datetime)}
                {(event.endDatetime || event.end_datetime) && ` - ${formatTime(event.endDatetime || event.end_datetime)}`}
              </Text>
            </View>
          </View>
          {event.location && (
            <View style={[styles.detailRow, styles.detailBorder]}>
              <View style={styles.detailIconWrap}>
                <Ionicons name="location-outline" size={18} color={Colors.primaryLight} />
              </View>
              <Text style={styles.detailMain}>{event.location}</Text>
            </View>
          )}
          <View style={[styles.detailRow, styles.detailBorder]}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="people-outline" size={18} color={Colors.primaryLight} />
            </View>
            <Text style={styles.detailMain}>
              {event.currentParticipants || 0} / {event.capacity} participants
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{event.description || 'Aucune description.'}</Text>
        </View>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {event.tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky registration card */}
      <View style={styles.stickyCard}>
        <View style={styles.priceRow}>
          {isFree ? (
            <Text style={styles.priceFree}>Gratuit</Text>
          ) : (
            <Text style={styles.pricePaid}>{event.price} {event.currency}</Text>
          )}
          {!isFull && (
            <View style={styles.spotsBadge}>
              <Text style={styles.spotsText}>{spotsLeft} places</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.registerBtn, (isFull || registering) && styles.registerBtnDisabled]}
          onPress={handleRegister}
          disabled={isFull || registering}
        >
          {registering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerBtnText}>
              {isFull ? 'Complet' : isFree ? 'S\'inscrire gratuitement' : `Obtenir les billets — ${event.price} ${event.currency}`}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal visible={paymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Finaliser le paiement</Text>
            {paymentData && (
              <>
                <View style={styles.modalSummary}>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Événement</Text>
                    <Text style={styles.modalValue} numberOfLines={1}>{event.title}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Montant</Text>
                    <Text style={styles.modalAmount}>{paymentData.amount} {paymentData.currency}</Text>
                  </View>
                </View>
                <Text style={styles.modalNote}>Ceci est un paiement de démonstration.</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPaymentModal(false)}>
                    <Text style={styles.modalCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalPayBtn, paying && { opacity: 0.6 }]}
                    onPress={handleMockPayment}
                    disabled={paying}
                  >
                    {paying ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalPayText}>Payer maintenant</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  loadingContainer: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 17, color: Colors.textMuted, marginTop: 12 },
  backBtn: { marginTop: 16, backgroundColor: Colors.card, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: Colors.text, fontWeight: '600' },

  content: { paddingHorizontal: 20 },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 60, marginBottom: 20 },
  backText: { fontSize: 15, color: Colors.textMuted },

  imagePlaceholder: {
    height: 200, backgroundColor: 'rgba(99,102,241,0.12)',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },

  titleRow: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, lineHeight: 33, letterSpacing: -0.3 },
  organizer: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },
  organizerName: { color: Colors.text, fontWeight: '600' },

  detailsCard: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  detailBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  detailIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center',
  },
  detailMain: { fontSize: 15, fontWeight: '600', color: Colors.text },
  detailSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 10 },
  description: { fontSize: 15, color: Colors.textMuted, lineHeight: 23 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontSize: 13, color: Colors.textMuted },

  stickyCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: 20, paddingBottom: 36,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  priceFree: { fontSize: 22, fontWeight: '800', color: Colors.green },
  pricePaid: { fontSize: 22, fontWeight: '800', color: Colors.text },
  spotsBadge: { backgroundColor: Colors.greenBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  spotsText: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  registerBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  registerBtnDisabled: { opacity: 0.5 },
  registerBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 20 },
  modalSummary: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalLabel: { fontSize: 14, color: Colors.textMuted },
  modalValue: { fontSize: 14, color: Colors.text, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  modalAmount: { fontSize: 20, fontWeight: '800', color: Colors.text },
  modalNote: { fontSize: 13, color: Colors.textDim, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, backgroundColor: Colors.cardHover, borderWidth: 1, borderColor: Colors.border,
    padding: 14, borderRadius: 12, alignItems: 'center',
  },
  modalCancelText: { color: Colors.textMuted, fontWeight: '600' },
  modalPayBtn: { flex: 1, backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalPayText: { color: '#fff', fontWeight: '700' },
});
