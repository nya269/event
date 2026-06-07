import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import eventsService from '@/src/services/events';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProfileScreen() {
  const { user: _user, logout, isOrganizer, isAdmin } = useAuth() as any;
  const user = _user as any;
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsService.getMyInscriptions()
      .then((data: any) => setInscriptions(data.inscriptions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  const roleBadge = isAdmin ? { label: 'Admin', color: '#f59e0b' } :
    isOrganizer ? { label: 'Organisateur', color: Colors.accent } :
    { label: 'Utilisateur', color: Colors.primary };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || user?.full_name || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20', borderColor: roleBadge.color + '40' }]}>
          <Text style={[styles.roleText, { color: roleBadge.color }]}>{roleBadge.label}</Text>
        </View>
      </View>

      {/* My Inscriptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes inscriptions</Text>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
        ) : inscriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="ticket-outline" size={32} color={Colors.textDim} />
            <Text style={styles.emptyText}>Aucune inscription pour l'instant</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events' as any)}>
              <Text style={styles.emptyLink}>Explorer les événements →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          inscriptions.map((ins: any) => (
            <TouchableOpacity
              key={ins.id}
              style={styles.inscriptionCard}
              onPress={() => router.push(`/event/${ins.eventId || ins.event_id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.inscriptionLeft}>
                <View style={styles.inscriptionIcon}>
                  <Ionicons name="calendar" size={20} color={Colors.primaryLight} />
                </View>
                <View style={styles.inscriptionInfo}>
                  <Text style={styles.inscriptionTitle} numberOfLines={1}>
                    {ins.event?.title || 'Événement'}
                  </Text>
                  {ins.event?.startDatetime && (
                    <Text style={styles.inscriptionDate}>{formatDate(ins.event.startDatetime)}</Text>
                  )}
                </View>
              </View>
              <View style={[styles.statusBadge,
                ins.status === 'CONFIRMED' ? styles.statusConfirmed :
                ins.status === 'PENDING' ? styles.statusPending : styles.statusCancelled
              ]}>
                <Text style={[styles.statusText,
                  ins.status === 'CONFIRMED' ? { color: Colors.green } :
                  ins.status === 'PENDING' ? { color: '#f59e0b' } : { color: Colors.red }
                ]}>
                  {ins.status === 'CONFIRMED' ? 'Confirmé' : ins.status === 'PENDING' ? 'En attente' : 'Annulé'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingsRow} onPress={handleLogout}>
            <View style={styles.settingsLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: Colors.redBg }]}>
                <Ionicons name="log-out-outline" size={20} color={Colors.red} />
              </View>
              <Text style={[styles.settingsLabel, { color: Colors.red }]}>Se déconnecter</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textDim} />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 40 },

  profileHeader: {
    alignItems: 'center', paddingTop: 70, paddingBottom: 30,
    paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: Colors.text },
  email: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  roleBadge: {
    marginTop: 10, paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 999, borderWidth: 1,
  },
  roleText: { fontSize: 12, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 14 },

  emptyCard: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 30, alignItems: 'center',
  },
  emptyText: { color: Colors.textMuted, marginTop: 10, fontSize: 14 },
  emptyLink: { color: Colors.primaryLight, marginTop: 10, fontSize: 14, fontWeight: '600' },

  inscriptionCard: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  inscriptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  inscriptionIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center',
  },
  inscriptionInfo: { flex: 1 },
  inscriptionTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  inscriptionDate: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  statusConfirmed: { backgroundColor: Colors.greenBg, borderColor: Colors.green + '40' },
  statusPending: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
  statusCancelled: { backgroundColor: Colors.redBg, borderColor: Colors.red + '40' },
  statusText: { fontSize: 11, fontWeight: '700' },

  settingsCard: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { fontSize: 15, fontWeight: '500', color: Colors.text },
});
