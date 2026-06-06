import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function AccountScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.heading}>Account</Text>
      <View style={styles.body}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress ?? user?.id ?? '—'}</Text>

        <TouchableOpacity style={styles.button} onPress={() => signOut()}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  heading: { fontSize: 24, fontWeight: '800', paddingHorizontal: 16, paddingVertical: 12, color: '#111827' },
  body: { padding: 16, gap: 8 },
  label: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  email: { fontSize: 16, color: '#111827', marginBottom: 24 },
  button: { borderWidth: 1, borderColor: '#dc2626', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#dc2626', fontSize: 16, fontWeight: '600' },
});
