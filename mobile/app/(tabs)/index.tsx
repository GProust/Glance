import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { useApi, type FeedItem } from '@/src/api';

function trustColor(score: number | null): string {
  if (score === null) return '#9ca3af';
  if (score >= 67) return '#16a34a';
  if (score >= 34) return '#ca8a04';
  return '#dc2626';
}

function Card({ item }: { item: FeedItem }) {
  const onPress = () => {
    if (item.origin_url) WebBrowser.openBrowserAsync(item.origin_url);
  };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!item.origin_url}>
      <View style={styles.cardHeader}>
        <Text style={styles.source} numberOfLines={1}>
          {item.sources?.display_name ?? 'Unknown source'}
        </Text>
        <View style={styles.badges}>
          {item.is_ai_generated ? (
            <View style={[styles.badge, styles.aiBadge]}>
              <Text style={styles.badgeText}>Likely AI</Text>
            </View>
          ) : null}
          {item.trust_level !== null ? (
            <View style={[styles.badge, { backgroundColor: trustColor(item.trust_level) }]}>
              <Text style={styles.badgeText}>Trust {item.trust_level}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={styles.title}>{item.title ?? '(untitled)'}</Text>
      {item.summary ? (
        <Text style={styles.summary} numberOfLines={4}>
          {item.summary}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const api = useApi();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await api.getFeed());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>Glance</Text>
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <Card item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {error ?? 'No items yet. Add a source in the web admin and fetch it.'}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  heading: { fontSize: 24, fontWeight: '800', paddingHorizontal: 16, paddingVertical: 12, color: '#111827' },
  center: { marginTop: 40 },
  list: { padding: 16, gap: 12 },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  source: { flex: 1, fontSize: 12, color: '#6b7280', fontWeight: '600' },
  badges: { flexDirection: 'row', gap: 6 },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  aiBadge: { backgroundColor: '#7c3aed' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  summary: { fontSize: 14, color: '#374151', lineHeight: 20 },
});
