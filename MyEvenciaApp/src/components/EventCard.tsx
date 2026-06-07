import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

interface Props {
  event: any;
  onPress: () => void;
}

export default function EventCard({ event, onPress }: Props) {
  const isFree = parseFloat(event.price) === 0;
  const spotsLeft = event.remainingSpots ?? (event.capacity - (event.currentParticipants || 0));
  const isFull = spotsLeft <= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Gradient placeholder for image */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="calendar-outline" size={36} color="rgba(255,255,255,0.2)" />
        {/* Price badge */}
        <View style={[styles.badge, isFree ? styles.badgeFree : styles.badgePaid]}>
          <Text style={styles.badgeText}>{isFree ? 'Gratuit' : `${event.price} ${event.currency}`}</Text>
        </View>
        {isFull && (
          <View style={[styles.badge, styles.badgeFull, { left: isFree ? 90 : 90 }]}>
            <Text style={styles.badgeText}>Complet</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* Date */}
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={13} color={Colors.primaryLight} />
          <Text style={styles.date}>{formatDate(event.startDatetime || event.start_datetime)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>

        {/* Location */}
        {event.location && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={13} color={Colors.textDim} />
            <Text style={styles.location} numberOfLines={1}>{event.location}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.row}>
            <Ionicons name="people-outline" size={13} color={Colors.textDim} />
            <Text style={styles.spots}>
              {isFull ? 'Aucune place restante' : `${spotsLeft} places restantes`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textDim} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeFree: { backgroundColor: 'rgba(74,222,128,0.9)' },
  badgePaid: { backgroundColor: 'rgba(255,255,255,0.9)' },
  badgeFull: { backgroundColor: 'rgba(248,113,113,0.9)', left: 80 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#111' },

  body: { padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  date: { fontSize: 12, color: Colors.primaryLight, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text, marginVertical: 6, lineHeight: 22 },
  location: { fontSize: 12, color: Colors.textMuted, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  spots: { fontSize: 12, color: Colors.textDim },
});
