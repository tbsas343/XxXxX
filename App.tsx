import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type Message = { id: string; text: string; sender: 'me' | 'them'; time: string };
type Conversation = {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: string;
  preview: string;
  time: string;
  unread: number;
  messages: Message[];
};

const STORAGE_KEY = '@xxxxx-conversations';
const DEMO: Conversation[] = [
  {
    id: 'maya',
    name: 'Maya Thompson',
    initials: 'MT',
    color: '#F1A77A',
    status: 'Active now',
    preview: 'That sounds perfect! See you then.',
    time: '10:42 AM',
    unread: 2,
    messages: [
      { id: 'm1', text: 'Hey! Are we still on for coffee tomorrow?', sender: 'them', time: '10:36 AM' },
      { id: 'm2', text: 'Absolutely. I found a new place downtown.', sender: 'me', time: '10:39 AM' },
      { id: 'm3', text: 'That sounds perfect! See you then.', sender: 'them', time: '10:42 AM' },
    ],
  },
  {
    id: 'noah',
    name: 'Noah Williams',
    initials: 'NW',
    color: '#87B9A6',
    status: 'Away',
    preview: 'The files are in the shared folder.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'n1', text: 'The files are in the shared folder.', sender: 'them', time: 'Yesterday' },
      { id: 'n2', text: 'Got them, thank you!', sender: 'me', time: 'Yesterday' },
    ],
  },
  {
    id: 'sofia',
    name: 'Sofia Chen',
    initials: 'SC',
    color: '#A99AD7',
    status: 'Active 2h ago',
    preview: 'Let’s catch up soon ✨',
    time: 'Tuesday',
    unread: 0,
    messages: [{ id: 's1', text: 'Let’s catch up soon ✨', sender: 'them', time: 'Tuesday' }],
  },
  {
    id: 'team',
    name: 'Weekend plans',
    initials: 'WP',
    color: '#E59BBD',
    status: '4 members',
    preview: 'Leo: I can bring snacks!',
    time: 'Monday',
    unread: 0,
    messages: [{ id: 't1', text: 'Leo: I can bring snacks!', sender: 'them', time: 'Monday' }],
  },
];

function Avatar({ conversation, large = false }: { conversation: Conversation; large?: boolean }) {
  return <View style={[styles.avatar, large && styles.avatarLarge, { backgroundColor: conversation.color }]}><Text style={[styles.avatarText, large && styles.avatarTextLarge]}>{conversation.initials}</Text></View>;
}

export default function App() {
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(wide ? 'maya' : null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      setConversations(saved ? JSON.parse(saved) : DEMO);
      setReady(true);
    }).catch(() => { setConversations(DEMO); setReady(true); });
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)).catch(() => undefined);
  }, [conversations, ready]);

  useEffect(() => {
    if (wide && !selectedId && conversations.length) setSelectedId(conversations[0].id);
  }, [wide, selectedId, conversations]);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const visible = useMemo(() => conversations.filter((conversation) => conversation.name.toLowerCase().includes(query.toLowerCase())), [conversations, query]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !selected) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setConversations((items) => items.map((item) => item.id === selected.id ? {
      ...item, preview: text, time, messages: [...item.messages, { id: `${Date.now()}`, text, sender: 'me', time }],
    } : item));
    setDraft('');
  };

  if (!ready) return <View style={styles.loading}><ActivityIndicator color="#5B5CE2" /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={[styles.sidebar, wide ? styles.sidebarWide : styles.sidebarMobile, !wide && selected && styles.hidden]}>
          <View style={styles.brandRow}><View style={styles.logo}><Text style={styles.logoText}>✦</Text></View><Text style={styles.brand}>XxXxX</Text><Pressable accessibilityLabel="More options" style={styles.more}><Text style={styles.moreText}>•••</Text></Pressable></View>
          <View style={styles.titleRow}><Text style={styles.heading}>Messages</Text><Pressable accessibilityLabel="Start a new conversation" style={styles.compose}><Text style={styles.composeText}>＋</Text></Pressable></View>
          <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput accessibilityLabel="Search conversations" placeholder="Search conversations" placeholderTextColor="#9898A8" value={query} onChangeText={setQuery} style={styles.searchInput} /></View>
          <Text style={styles.sectionLabel}>INBOX <Text style={styles.inboxCount}>{visible.length}</Text></Text>
          {visible.length ? <FlatList data={visible} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <Pressable onPress={() => setSelectedId(item.id)} style={[styles.conversation, selectedId === item.id && styles.conversationActive]}><Avatar conversation={item} /><View style={styles.conversationBody}><View style={styles.conversationTop}><Text style={styles.name} numberOfLines={1}>{item.name}</Text><Text style={styles.time}>{item.time}</Text></View><View style={styles.previewRow}><Text style={[styles.preview, item.unread > 0 && styles.previewUnread]} numberOfLines={1}>{item.preview}</Text>{item.unread > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{item.unread}</Text></View>}</View></View></Pressable>} />} /> : <View style={styles.emptyList}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>No conversations found</Text><Text style={styles.emptyCopy}>Try a different search term.</Text></View>}
          <View style={styles.profile}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>JD</Text></View><View style={styles.profileText}><Text style={styles.profileName}>Jordan Davis</Text><Text style={styles.profileStatus}>Personal account</Text></View><Text style={styles.moreText}>•••</Text></View>
        </View>
        <View style={[styles.chat, !wide && !selected && styles.hidden]}>
          {selected ? <><View style={styles.chatHeader}>{!wide && <Pressable accessibilityLabel="Back to conversations" onPress={() => setSelectedId(null)} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>}<Avatar conversation={selected} /><View style={styles.chatIdentity}><Text style={styles.chatName}>{selected.name}</Text><Text style={styles.chatStatus}><Text style={styles.onlineDot}>●</Text> {selected.status}</Text></View><Pressable accessibilityLabel="Conversation options" style={styles.headerMore}><Text style={styles.moreText}>•••</Text></Pressable></View><FlatList data={selected.messages} keyExtractor={(message) => message.id} contentContainerStyle={styles.messages} renderItem={({ item, index }) => <View style={[styles.messageRow, item.sender === 'me' && styles.messageRowMe]}><View style={[styles.bubble, item.sender === 'me' ? styles.bubbleMe : styles.bubbleThem]}><Text style={[styles.messageText, item.sender === 'me' && styles.messageTextMe]}>{item.text}</Text></View><Text style={[styles.messageTime, item.sender === 'me' && styles.messageTimeMe]}>{item.time}{item.sender === 'me' && index === selected.messages.length - 1 ? '  ·  Sent' : ''}</Text></View>} /><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.composer}><Pressable accessibilityLabel="Add attachment" style={styles.attach}><Text style={styles.attachText}>＋</Text></Pressable><TextInput accessibilityLabel="Message" placeholder="Write a message..." placeholderTextColor="#9898A8" value={draft} onChangeText={setDraft} onSubmitEditing={sendMessage} returnKeyType="send" style={styles.messageInput} /><Pressable accessibilityLabel="Send message" onPress={sendMessage} style={[styles.send, !draft.trim() && styles.sendDisabled]}><Text style={styles.sendText}>↑</Text></Pressable></View></KeyboardAvoidingView></> : <View style={styles.welcome}><View style={styles.welcomeIcon}>✦</View><Text style={styles.welcomeTitle}>Your messages, made simple.</Text><Text style={styles.welcomeCopy}>Select a conversation to pick up where you left off.</Text></View>}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F8FC' },
  shell: { flex: 1, flexDirection: 'row', maxWidth: 1280, width: '100%', alignSelf: 'center', backgroundColor: '#FFF' },
  sidebar: { backgroundColor: '#FBFBFE', borderRightWidth: 1, borderRightColor: '#EBEBF2', paddingTop: 28 },
  sidebarWide: { width: 360 },
  sidebarMobile: { flex: 1, borderRightWidth: 0 },
  hidden: { display: 'none' },
  brandRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 38 },
  logo: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#5B5CE2', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  logoText: { color: '#FFF', fontSize: 19 },
  brand: { color: '#27273A', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  more: { marginLeft: 'auto', padding: 7 },
  moreText: { color: '#858596', letterSpacing: 2, fontWeight: '700' },
  titleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 18 },
  heading: { fontSize: 27, fontWeight: '800', color: '#222232', letterSpacing: -0.8 },
  compose: { marginLeft: 'auto', backgroundColor: '#EBEBFF', borderRadius: 9, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  composeText: { color: '#5B5CE2', fontSize: 24, lineHeight: 27 },
  searchBox: { marginHorizontal: 20, height: 42, borderRadius: 10, backgroundColor: '#F0F0F6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 25 },
  searchIcon: { color: '#7D7D90', fontSize: 25, lineHeight: 25, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#222232', outlineStyle: 'none' } as any,
  sectionLabel: { marginHorizontal: 24, color: '#9A9AAA', fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 10 },
  inboxCount: { color: '#5B5CE2', backgroundColor: '#E8E8FF', paddingHorizontal: 5 },
  list: { paddingHorizontal: 12 },
  conversation: { flexDirection: 'row', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 3 },
  conversationActive: { backgroundColor: '#EEEEFF' },
  avatar: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarLarge: { width: 46, height: 46 },
  avatarText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  avatarTextLarge: { fontSize: 14 },
  conversationBody: { flex: 1, marginLeft: 11, minWidth: 0 },
  conversationTop: { flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1, color: '#292938', fontSize: 14, fontWeight: '700' },
  time: { color: '#9999A9', fontSize: 11, marginLeft: 6 },
  previewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  preview: { flex: 1, color: '#898999', fontSize: 12 },
  previewUnread: { color: '#505062', fontWeight: '600' },
  badge: { backgroundColor: '#5B5CE2', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  emptyList: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 30, color: '#B6B6C7' },
  emptyTitle: { color: '#444455', fontWeight: '700', marginTop: 10 },
  emptyCopy: { color: '#9999A9', fontSize: 12, marginTop: 5, textAlign: 'center' },
  profile: { borderTopWidth: 1, borderTopColor: '#EBEBF2', marginTop: 'auto', padding: 19, flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { backgroundColor: '#5B5CE2', width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  profileText: { marginLeft: 10, flex: 1 },
  profileName: { color: '#30303E', fontSize: 13, fontWeight: '700' },
  profileStatus: { color: '#9999A9', fontSize: 11, marginTop: 2 },
  chat: { flex: 1, backgroundColor: '#FFF' },
  chatHeader: { height: 91, borderBottomWidth: 1, borderBottomColor: '#F0F0F4', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30 },
  back: { paddingRight: 16, marginLeft: -10 },
  backText: { fontSize: 38, lineHeight: 38, color: '#555567', fontWeight: '300' },
  chatIdentity: { marginLeft: 12 },
  chatName: { color: '#292938', fontWeight: '800', fontSize: 16 },
  chatStatus: { color: '#8B8B9A', fontSize: 12, marginTop: 4 },
  onlineDot: { color: '#43B78A', fontSize: 12 },
  headerMore: { marginLeft: 'auto', padding: 10 },
  messages: { paddingHorizontal: 30, paddingVertical: 30, flexGrow: 1, justifyContent: 'flex-end' },
  messageRow: { alignItems: 'flex-start', marginTop: 20, maxWidth: '78%' },
  messageRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  bubbleThem: { backgroundColor: '#F1F1F6', borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: '#5B5CE2', borderBottomRightRadius: 4 },
  messageText: { color: '#3A3A4A', fontSize: 14, lineHeight: 21 },
  messageTextMe: { color: '#FFF' },
  messageTime: { color: '#A0A0AE', fontSize: 10, marginTop: 6, marginLeft: 3 },
  messageTimeMe: { marginRight: 3 },
  composer: { borderTopWidth: 1, borderTopColor: '#F0F0F4', minHeight: 78, paddingHorizontal: 25, paddingVertical: 15, flexDirection: 'row', alignItems: 'center' },
  attach: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  attachText: { color: '#747487', fontSize: 23, lineHeight: 25 },
  messageInput: { flex: 1, color: '#292938', fontSize: 14, minHeight: 42, paddingHorizontal: 13, outlineStyle: 'none' } as any,
  send: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#5B5CE2', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#D0D0DD' },
  sendText: { color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: -3 },
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  welcomeIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#EEEEFF', color: '#5B5CE2', fontSize: 28, textAlign: 'center', paddingTop: 12 },
  welcomeTitle: { color: '#2A2A3A', fontWeight: '800', fontSize: 19, marginTop: 18 },
  welcomeCopy: { color: '#9999A9', fontSize: 14, marginTop: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
