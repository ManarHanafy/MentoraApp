import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon } from '../components/Icons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

const FAQS_EN = [
  { q: 'How does Mentora AI work?', a: 'Mentora uses advanced AI to analyze your journal entries and chat messages, then recommends personalized wellness exercises tailored to your emotional state and needs.' },
  { q: 'Is my data private and secure?', a: 'Yes. All your data is encrypted and stored securely. We never share your personal information with third parties. See our Privacy Policy for full details.' },
  { q: 'How do I get AI exercise recommendations?', a: 'Write a journal entry or chat with Mentora AI. After your session, the AI will automatically suggest exercises based on your mood and triggers.' },
  { q: 'Can I use Mentora offline?', a: 'Some features like journals and saved exercises are available offline. AI chat and analysis requires an internet connection.' },
  { q: 'How do I delete my account?', a: 'Go to Profile → Delete Account. This action is permanent and will remove all your data from our servers.' },
  { q: 'How is my streak calculated?', a: 'Your streak counts consecutive days where you completed at least one exercise or logged a journal entry.' },
];

const FAQS_AR = [
  { q: 'كيف يعمل تطبيق منتورا بالذكاء الاصطناعي؟', a: 'تستخدم منتورا تقنية ذكاء اصطناعي متقدمة لتحليل مذكراتك ورسائلك في المحادثة، ومن ثم توصي بتمارين صحية مخصصة ومناسبة لحالتك المزاجية واحتياجاتك.' },
  { q: 'هل بياناتي خصوصية وآمنة؟', a: 'نعم. جميع بياناتك مشفرة ومخزنة بأمان. نحن لا نشارك معلوماتك الشخصية مطلقاً مع أطراف ثالثة. يرجى مراجعة سياسة الخصوصية لمزيد من التفاصيل.' },
  { q: 'كيف أحصل على توصيات التمارين بالذكاء الاصطناعي؟', a: 'اكتب يومياتك أو تحدث مع منتورا AI. بعد الجلسة، سيقوم الذكاء الاصطناعي تلقائياً باقتراح التمارين المناسبة بناءً على مزاجك ومحفزاتك.' },
  { q: 'هل يمكنني استخدام منتورا بدون إنترنت؟', a: 'بعض الميزات مثل اليوميات والتمارين المحفوظة متاحة بدون اتصال بالإنترنت. أما المحادثة وتحليل الذكاء الاصطناعي فيتطلبان اتصالاً بالإنترنت.' },
  { q: 'كيف يمكنني حذف حسابه؟', a: 'انتقل إلى حسابي ← حذف الحساب. هذا الإجراء دائم وسيقوم بحذف جميع بياناتك من خوادمنا تماماً.' },
  { q: 'كيف يتم حساب سلسلة أيام الإنجاز؟', a: 'تحسب السلسلة عدد الأيام المتتالية التي أكملت فيها تمريناً واحداً على الأقل أو قمت بكتابة يومية جديدة.' },
];

export function HelpCenterScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { t, isRTL, language } = useLanguage();
  const faqs = language === 'ar' ? FAQS_AR : FAQS_EN;
  const textDir = isRTL ? 'right' as const : 'left' as const;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={[s.darkHeader, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.helpCenter.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🤝</Text>
          <Text style={s.heroTitle}>
            {language === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help?'}
          </Text>
          <Text style={s.heroSub}>
            {language === 'ar' ? 'تصفح الأسئلة الشائعة أو تواصل مع فريق الدعم لدينا.' : 'Browse frequently asked questions or contact our support team.'}
          </Text>
        </View>

        <Text style={[s.sectionTitle, { textAlign: textDir }]}>
          {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </Text>

        {faqs.map((item, idx) => (
          <View key={idx} style={s.faqCard}>
            <Text style={[s.faqQ, { textAlign: textDir }]}>❓ {item.q}</Text>
            <Text style={[s.faqA, { textAlign: textDir }]}>{item.a}</Text>
          </View>
        ))}

        {/* Contact */}
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>
            {language === 'ar' ? 'هل ما زلت بحاجة للمساعدة؟' : 'Still need help?'}
          </Text>
          <Text style={s.contactSub}>
            {language === 'ar' ? 'فريق الدعم لدينا متاح على مدار الساعة.' : 'Our support team is available 24/7.'}
          </Text>
          <TouchableOpacity style={s.contactBtn} onPress={() => Linking.openURL('mailto:support@mentora.app')}>
            <Text style={s.contactBtnText}>
              {language === 'ar' ? '📧 راسلنا عبر البريد' : '📧 Email Support'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkHeader: {
    backgroundColor: '#161B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161B22',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '700',
    color: '#161B22',
    marginBottom: 8,
    lineHeight: 20,
  },
  faqA: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  contactCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  contactSub: {
    fontSize: 13,
    color: '#A0AEC0',
    marginBottom: 18,
  },
  contactBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  contactBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161B22',
  },
});

export default HelpCenterScreen;
