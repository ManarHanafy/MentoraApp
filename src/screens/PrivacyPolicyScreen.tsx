import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeftIcon } from '../components/Icons';
import { Lock } from 'lucide-react-native';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECTIONS_EN = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email address, and profile details. We also collect usage data including journal entries, chat messages, and exercise history to provide personalized recommendations.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'Your data is used exclusively to power the Mentora AI engine, generate personalized wellness recommendations, and improve your experience. We do not sell or share your personal information with advertisers.',
  },
  {
    title: '3. Data Storage & Security',
    body: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We employ industry-standard security measures and conduct regular security audits to protect your information.',
  },
  {
    title: '4. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. You can request a copy of your data or account deletion from within the app settings or by contacting our support team.',
  },
  {
    title: '5. AI & Automated Processing',
    body: 'Mentora uses AI to analyze your journal entries and chat messages. This processing is done to provide personalized recommendations. You can opt out of AI analysis in your account settings.',
  },
  {
    title: '6. Children\'s Privacy',
    body: 'Mentora is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or in-app notification. Continued use of the app after changes constitutes acceptance of the new policy.',
  },
  {
    title: '8. Contact Us',
    body: 'If you have questions about this Privacy Policy or your data, please contact our Privacy team at privacy@mentora.app.',
  },
];

const SECTIONS_AR = [
  {
    title: '١. المعلومات التي نجمعها',
    body: 'نحن نجمع المعلومات التي تزودنا بها مباشرة، مثل اسمك، وبريدك الإلكتروني، وتفاصيل ملفك الشخصي. نجمع أيضاً بيانات الاستخدام بما في ذلك مذكرات اليوميات، ورسائل الدردشة، وتاريخ التمارين لتقديم توصيات مخصصة.',
  },
  {
    title: '٢. كيف نستخدم معلوماتك',
    body: 'تُستخدم بياناتك حصرياً لتشغيل محرك ذكاء اصطناعي منتورا، وإنتاج توصيات صحية مخصصة، وتحسين تجربتك. نحن لا نبيع أو نشارك معلوماتك الشخصية مع المعلنين.',
  },
  {
    title: '٣. تخزين البيانات وحمايتها',
    body: 'يتم تشفير جميع البيانات أثناء النقل باستخدام TLS 1.3 وعند الخمول باستخدام تشفير AES-256. نحن نطبق معايير أمان قياسية ونجري عمليات تدقيق أمني منتظمة لحماية معلوماتك.',
  },
  {
    title: '٤. حقوقك',
    body: 'لديك الحق في الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها في أي وقت. يمكنك طلب نسخة من بياناتك أو طلب حذف حسابك من إعدادات التطبيق أو من خلال التواصل مع فريق الدعم لدينا.',
  },
  {
    title: '٥. الذكاء الاصطناعي والمعالجة الآلية',
    body: 'تستخدم منتورا الذكاء الاصطناعي لتحليل مذكرات اليوميات ورسائل الدردشة. تتم هذه المعالجة لتقديم توصيات مخصصة. يمكنك إلغاء الاشتراك في التحليل بالذكاء الاصطناعي من إعدادات حسابك.',
  },
  {
    title: '٦. خصوصية الأطفال',
    body: 'تطبيق منتورا غير موجه للمستخدمين الذين تقل أعمارهم عن ١٣ عاماً. نحن لا نجمع معلومات شخصية عن علم من الأطفال دون سن ١٣ عاماً.',
  },
  {
    title: '٧. التغييرات في هذه السياسة',
    body: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. وسنقوم بإشعارك بأي تغييرات هامة عبر البريد الإلكتروني أو من خلال إشعارات التطبيق. استمرارك في استخدام التطبيق بعد التحديثات يعتبر قبولاً للسياسة الجديدة.',
  },
  {
    title: '٨. اتصل بنا',
    body: 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه أو بياناتك، يرجى التواصل مع فريق الخصوصية لدينا عبر البريد الإلكتروني privacy@mentora.app.',
  },
];

export function PrivacyPolicyScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { t, isRTL, language } = useLanguage();
  const sections = language === 'ar' ? SECTIONS_AR : SECTIONS_EN;
  const textDir = isRTL ? 'right' as const : 'left' as const;
  const insets = useSafeAreaInsets();

  return (
    <View style={s.safeArea}>
      <View style={[s.darkHeader, { paddingTop: insets.top + 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.privacyPolicy.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <Lock size={40} color="#38BDF8" style={{ marginBottom: 8 }} />
          <Text style={s.heroTitle}>
            {language === 'ar' ? 'خصوصيتك تهمنا' : 'Your Privacy Matters'}
          </Text>
          <Text style={s.heroSub}>
            {language === 'ar' ? 'آخر تحديث: مايو ٢٠٢٦' : 'Last updated: May 2026'}
          </Text>
          <Text style={s.heroDesc}>
            {language === 'ar' 
              ? 'تلتزم منتورا بحماية خصوصيتك. توضح هذه السياسة كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها.'
              : 'Mentora is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.'
            }
          </Text>
        </View>

        <View style={s.sectionsList}>
          {sections.map((section, idx) => (
            <View key={idx} style={s.card}>
              <Text style={[s.cardTitle, { textAlign: textDir }]}>{section.title}</Text>
              <Text style={[s.cardBody, { textAlign: textDir }]}>{section.body}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    backgroundColor: '#161B22',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  sectionsList: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#161B22',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 21,
  },
});

export default PrivacyPolicyScreen;
