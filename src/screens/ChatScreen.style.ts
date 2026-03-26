import { StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#171B2B',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.white,
    fontSize: 17,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: '#8B94A3',
    fontSize: 13,
  },
  keyboardAv: {
    flex: 1,
  },
  messageList: {
    padding: 20,
    paddingTop: 30,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    paddingHorizontal: 20,
  },
  aiBubble: {
    backgroundColor: '#F2F3F5',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#171B2B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  aiText: {
    ...typography.body,
    color: '#333333',
    lineHeight: 24,
  },
  userText: {
    ...typography.body,
    color: colors.white,
    lineHeight: 24,
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F5',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    height: '100%',
  },
  micButton: {
    padding: 4,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#171B2B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
