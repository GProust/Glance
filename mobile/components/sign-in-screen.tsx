import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';

function clerkError(e: unknown): string {
  const err = e as { errors?: { message?: string }[]; message?: string };
  return err.errors?.[0]?.message ?? err.message ?? 'Something went wrong';
}

/**
 * Email-code sign-in (Clerk). The consumer signs in with an existing account; a one-time
 * code is emailed, then verified. Rendered when signed out.
 */
export default function SignInScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    if (!signIn) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email });
      const factor = attempt.supportedFirstFactors?.find((f) => f.strategy === 'email_code');
      if (!factor || !('emailAddressId' in factor)) {
        throw new Error('Email-code sign-in is not available for this account.');
      }
      await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: factor.emailAddressId });
      setPending(true);
    } catch (e) {
      setError(clerkError(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!signIn || !setActive) return;
    setBusy(true);
    setError(null);
    try {
      const result = await signIn.attemptFirstFactor({ strategy: 'email_code', code });
      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Could not complete sign-in.');
      }
    } catch (e) {
      setError(clerkError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to Glance</Text>

      {!pending ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.button} onPress={sendCode} disabled={busy || !isLoaded || !email}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send code</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.hint}>Enter the code sent to {email}</Text>
          <TextInput
            style={styles.input}
            placeholder="123456"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.button} onPress={verify} disabled={busy || !code}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & sign in</Text>}
          </TouchableOpacity>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 8, color: '#111827' },
  hint: { textAlign: 'center', color: '#6b7280' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#111827' },
  button: { backgroundColor: '#111827', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#b91c1c', textAlign: 'center' },
});
