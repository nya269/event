import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import eventsService from '@/src/services/events';
import EventCard from '@/src/components/EventCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await eventsService.getEvents({ limit: 6, sortBy: 'start_datetime', sortOrder: 'asc' });
      setEvents(data.events || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const features = [
    { icon: 'calendar-outline', title: 'Création facile', desc: 'Créez votre événement en quelques minutes', color: Colors.primary },
    { icon: 'people-outline', title: 'Communauté', desc: 'Connectez-vous avec des passionnés', color: Colors.accent },
    { icon: 'sparkles-outline', title: 'Découverte', desc: 'Trouvez les événements près de chez vous', color: '#4ade80' },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} tintColor={Colors.primary} />}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="sparkles" size={14} color={Colors.primaryLight} />
          <Text style={styles.badgeText}>Découvrez des événements près de chez vous</Text>
        </View>
        <Text style={styles.heroTitle}>
          Créez des souvenirs{'\n'}
          <Text style={styles.heroGradient}>inoubliables</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Trouvez des événements, créez des expériences et faites de chaque moment un souvenir.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(tabs)/events' as any)}>
            <Text style={styles.btnPrimaryText}>Explorer les événements</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
        {/* Stats */}
        <View style={styles.stats}>
          {[['500+', 'Événements'], ['10k+', 'Utilisateurs'], ['50+', 'Villes']].map(([val, label]) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statValue}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tout ce qu'il vous faut</Text>
        <Text style={styles.sectionSubtitle}>De l'atelier intime au grand festival</Text>
        {features.map((f) => (
          <View key={f.title} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: f.color + '20' }]}>
              <Ionicons name={f.icon as any} size={24} color={f.color} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Événements à venir</Text>
            <Text style={styles.sectionSubtitle}>Ne manquez pas ces expériences</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/events' as any)}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : events.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textDim} />
            <Text style={styles.emptyText}>Aucun événement disponible</Text>
          </View>
        ) : (
          events.map((event: any) => (
            <EventCard key={event.id} event={event} onPress={() => router.push(`/event/${event.id}` as any)} />
          ))
        )}
      </View>

      {/* CTA Banner */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Prêt à créer votre événement ?</Text>
        <Text style={styles.ctaSubtitle}>Rejoignez des milliers d'organisateurs qui font confiance à Evencia.</Text>
        {user ? (
          <TouchableOpacity style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Créer un événement</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/login')}>
            <Text style={styles.ctaBtnText}>Commencer gratuitement</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 40 },

  // Hero
  hero: { padding: 24, paddingTop: 60, alignItems: 'center' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 20,
  },
  badgeText: { fontSize: 12, color: Colors.textMuted },
  heroTitle: { fontSize: 34, fontWeight: '800', color: Colors.text, textAlign: 'center', lineHeight: 42, letterSpacing: -0.5 },
  heroGradient: { color: Colors.primaryLight },
  heroSubtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: 12, paddingHorizontal: 10 },
  heroButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 14,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  stats: { flexDirection: 'row', gap: 32, marginTop: 32 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  // Section
  section: { paddingHorizontal: 20, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  sectionSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  seeAll: { fontSize: 14, color: Colors.primaryLight, fontWeight: '600' },

  // Feature cards
  featureCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  featureDesc: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.textMuted, marginTop: 10 },

  // CTA
  cta: {
    margin: 20, marginTop: 32, padding: 28, borderRadius: 24,
    backgroundColor: Colors.primaryDark,
    borderWidth: 1, borderColor: Colors.primary + '40',
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  ctaSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  ctaBtn: {
    marginTop: 20, backgroundColor: '#fff',
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  ctaBtnText: { color: Colors.primaryDark, fontWeight: '700', fontSize: 15 },
});
