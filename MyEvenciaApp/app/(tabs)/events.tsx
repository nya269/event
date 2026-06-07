import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import eventsService from '@/src/services/events';
import EventCard from '@/src/components/EventCard';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('start_datetime');
  const [total, setTotal] = useState(0);
  const [showSort, setShowSort] = useState(false);

  const fetchEvents = useCallback(async (q = search, sort = sortBy) => {
    try {
      const params: any = { limit: 20, sortBy: sort, sortOrder: 'asc' };
      if (q) params.search = q;
      const data = await eventsService.getEvents(params);
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, []);

  const handleSearch = () => fetchEvents(search, sortBy);
  const handleSort = (s: string) => { setSortBy(s); setShowSort(false); fetchEvents(search, s); };

  const sortOptions = [
    { value: 'start_datetime', label: 'Date' },
    { value: 'price', label: 'Prix' },
    { value: 'created_at', label: 'Récemment ajouté' },
  ];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorer</Text>
        <Text style={styles.subtitle}>Trouvez votre prochaine expérience</Text>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textDim} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un événement..."
              placeholderTextColor={Colors.textDim}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); fetchEvents('', sortBy); }}>
                <Ionicons name="close-circle" size={16} color={Colors.textDim} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
            <Ionicons name="options-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Sort dropdown */}
        {showSort && (
          <View style={styles.sortMenu}>
            <Text style={styles.sortMenuTitle}>Trier par</Text>
            {sortOptions.map((o) => (
              <TouchableOpacity key={o.value} style={styles.sortOption} onPress={() => handleSort(o.value)}>
                <Text style={[styles.sortOptionText, sortBy === o.value && styles.sortOptionActive]}>
                  {o.label}
                </Text>
                {sortBy === o.value && <Ionicons name="checkmark" size={16} color={Colors.primaryLight} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Results count */}
      {!loading && (
        <Text style={styles.count}>{total} événement{total !== 1 ? 's' : ''}</Text>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} tintColor={Colors.primary} />
          }
          renderItem={({ item }: any) => (
            <EventCard event={item} onPress={() => router.push(`/event/${item.id}` as any)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textDim} />
              <Text style={styles.emptyTitle}>Aucun événement trouvé</Text>
              <Text style={styles.emptyText}>Essayez un autre terme de recherche</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4, marginBottom: 16 },

  searchRow: { flexDirection: 'row', gap: 10 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  sortBtn: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center',
  },

  sortMenu: {
    marginTop: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 12,
  },
  sortMenuTitle: { fontSize: 12, color: Colors.textDim, fontWeight: '600', marginBottom: 8, paddingHorizontal: 4 },
  sortOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  sortOptionText: { fontSize: 15, color: Colors.textMuted },
  sortOptionActive: { color: Colors.primaryLight, fontWeight: '600' },

  count: { fontSize: 13, color: Colors.textDim, paddingHorizontal: 20, paddingVertical: 10 },

  list: { paddingHorizontal: 20, paddingBottom: 40 },

  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },
});
