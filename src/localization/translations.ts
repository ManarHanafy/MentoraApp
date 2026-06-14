// ─── translations.ts ─────────────────────────────────────────────────────────
// All UI strings for English and Arabic.
// RTL is handled automatically via LanguageContext (writingDirection + I18nManager).

export type TranslationKeys = typeof en;

export const en = {
  // ── App / Navigation tabs ────────────────────────────────────────────────
  tabs: {
    home: 'Home',
    chat: 'Chat',
    journal: 'Journal',
    insights: 'Insights',
    profile: 'Profile',
  },

  // ── Common ───────────────────────────────────────────────────────────────
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    done: 'Done',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next »',
    previous: '« Previous',
    error: 'Error',
    success: 'Success',
    retry: 'Try Again',
  },

  // ── Home ─────────────────────────────────────────────────────────────────
  home: {
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    howAreYou: 'How are you feeling today?',
    moodLevel: 'Mood Level',
    low: 'Low',
    high: 'High',
    needToSay: 'Need to say something?',
    recommendedForYou: 'Recommended for you',
    exploreLibrary: 'Explore our exercise library and track your daily progress.',
    moreWaiting: 'more waiting for you',
    startExercise: 'Start',
    seeCompleted: 'See completed exercises',
    recentInsights: 'Recent Insights',
    moodAnalysis: 'Mood Analysis',
    moodAvgScore: 'Average Score',
    trendingUp: 'Trending Up',
    exerciseActivity: 'Exercise Activity',
    totalCompleted: 'Total Exercises Completed',
    personalStreak: 'Personal Streak',
    dayRecord: 'Day Record',
    keepGoing: 'Keep going!',
    whatMadeYouFeel: 'What made you feel this way?',
    message: 'Message',
    trackMyMood: 'Track My Mood',
    moodTracked: 'Mood Tracked',
    moodTrackedMsg: "We've analyzed your message and added %d new exercises for you.",
    moodTrackedSuccess: 'Your mood has been tracked successfully.',
    moodFailed: 'Failed to track mood. Please try again.',
    pendingExercises: 'Pending Exercises',
    noPending: "No pending exercises. You're all caught up!",
    sessionComplete: 'Session Complete 🌿',
    sessionSuggested: "Mentora has suggested new exercises based on your conversation.",
    viewExercises: 'View Exercises',
    later: 'Later',
    sessionEnded: 'Session Ended 🌿',
    sessionEndedMsg: 'Your conversation session has been completed and summarized.',
    moodCooldown: 'Next check-in in: ',
    moodLoggedSuccessfully: 'Mood Logged Successfully',
  },

  // ── Chat ─────────────────────────────────────────────────────────────────
  chat: {
    title: 'Chat with Mentora',
    placeholder: 'Share what\'s on your mind…',
    send: 'Send',
    thinking: 'Thinking…',
    sessionComplete: 'Session Complete 🌿',
    sessionSuggested: 'Mentora has suggested some exercises based on our conversation.',
    sessionEnded: 'Session Ended 🌿',
    sessionEndedMsg: 'Your conversation session has been completed and summarized.',
    viewExercises: 'View Exercises',
    later: 'Later',
    crisis: 'Crisis Support',
    crisisMsg: 'It seems you may be in distress. Please reach out to emergency services or a crisis helpline.',
    cannotConnect: 'Could not start a new session. Please check your connection and try again.',
    troubleConnecting: "I'm having a little trouble connecting right now, but I'm still here for you. Please try again.",
    endedTitle: 'Session Ended',
    endedDesc: 'exercises suggested based on our conversation. You can find them on your Home screen.',
  },

  // ── Journal ──────────────────────────────────────────────────────────────
  journal: {
    title: 'Journal',
    newEntry: 'New Entry',
    searchPlaceholder: 'Search entries…',
    allFilter: 'All',
    noEntries: 'No journal entries yet.',
    startJournal: 'Write your first entry to get started.',
    writeEntry: 'Write your journal entry…',
    addEntry: 'Save Entry',
    analyzingAI: 'Analyzing with AI…',
    saveSuccess: 'Journal entry saved successfully.',
    saveFailed: 'Failed to save journal entry. Please try again.',
    aiUnavailable: 'AI analysis is currently unavailable.',
    setPinTitle: 'Set Journal PIN',
    setPinDesc: 'Please create a 4-digit PIN to protect your locked entries.',
    enterPinTitle: 'Unlock Entry',
    enterPinDesc: 'Enter your 4-digit PIN to read this locked journal entry.',
    incorrectPin: 'Incorrect PIN',
    forgotPin: 'Forgot PIN?',
    pinMismatch: 'PINs do not match',
    savePin: 'Save PIN',
    enterPin: 'Enter PIN',
  },

  // ── Insights / Dashboard ─────────────────────────────────────────────────
  insights: {
    title: 'Insights',
    overview: 'Overview',
    activity: 'Activity',
    triggers: 'Triggers',
    avgMood: 'Avg Mood',
    totalExercises: 'Exercises',
    streak: 'Streak',
    checkIns: 'Check-ins',
    days: 'days',
    copingMechanisms: 'Top Coping Mechanisms',
    activityChart: 'Weekly Activity',
    moodTrend: 'Mood Trend',
    topTriggers: 'Top Triggers',
    noData: 'No data available yet.',
  },

  // ── Profile ──────────────────────────────────────────────────────────────
  profile: {
    mentoraWelcomes: 'Mentora welcomes you',
    yourProfile: 'Your Profile',
    helpCenter: 'Help Center',
    privacyPolicy: 'Privacy Policy',
    settings: 'Settings',
    logOut: 'Log Out',
    logOutConfirmTitle: 'Log Out',
    logOutConfirmMsg: 'Are you sure you want to log out?',
    yesLogOut: 'Yes, Log out',
  },

  // ── Settings ─────────────────────────────────────────────────────────────
  settings: {
    title: 'Settings',
    language: 'Language',
    notifications: 'Notification Settings',
    changePassword: 'Change Password',
    deleteAccount: 'Delete Account',
    lockedInMentora: 'Locked in Mentora AI',
    changeJournalPin: 'Change Journal PIN',
    verifyTitle: 'Verify Credentials',
    verifyDesc: 'Enter your email and password to change or reset your PIN.',
    invalidCredentials: 'Invalid email or password.',
    pinChangedSuccess: 'Journal PIN updated successfully.',
  },

  // ── Language Screen ──────────────────────────────────────────────────────
  languageScreen: {
    title: 'Language',
    subtitle: 'Choose your preferred language for the app',
    restartNote: 'ℹ️  Changes take effect immediately.',
  },

  // ── Onboarding ───────────────────────────────────────────────────────────
  onboarding: {
    welcome: 'Welcome',
    letsKnowYou: "Let's get to know you",
    stepOf: 'out of',
    selectBest: 'Select the option that best describes you',
    questions: [
      {
        title: 'What brings you here today?',
        options: [
          { icon: '😔', text: 'Feeling down or depressed' },
          { icon: '😰', text: 'Feeling anxious or worried' },
          { icon: '😴', text: 'Having trouble sleeping' },
          { icon: '⭐', text: 'Just checking my wellbeing' },
        ],
      },
      {
        title: 'How often do you feel stressed?',
        options: [
          { icon: '🕰️', text: 'Rarely' },
          { icon: '⏳', text: 'Sometimes' },
          { icon: '⏰', text: 'Often' },
          { icon: '🚨', text: 'Always' },
        ],
      },
      {
        title: 'How do you usually cope with stress?',
        options: [
          { icon: '🗣️', text: 'Talking to someone' },
          { icon: '🏃‍♂️', text: 'Exercising' },
          { icon: '🧘‍♀️', text: 'Meditating' },
          { icon: '📺', text: 'Watching TV / Distractions' },
        ],
      },
      {
        title: "What's your main goal with Mentora?",
        options: [
          { icon: '📊', text: 'Track my mental health' },
          { icon: '🎯', text: 'Understand my symptoms' },
          { icon: '💪', text: 'Improve my wellbeing' },
          { icon: '🆘', text: 'Get help and support' },
        ],
      },
    ],
  },

  // ── Login / SignUp ───────────────────────────────────────────────────────
  auth: {
    login: 'Login',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signIn: 'Sign In',
    orContinueWith: 'Or continue with',
    google: 'Continue with Google',
    facebook: 'Continue with Facebook',
    name: 'Full Name',
    phone: 'Phone Number',
    dob: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    createAccount: 'Create Account',
    loginFailed: 'Login failed',
    registerFailed: 'Registration failed',
  },

  // ── Edit Profile ─────────────────────────────────────────────────────────
  editProfile: {
    title: 'Edit Profile',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    dob: 'Date of Birth',
    gender: 'Gender',
    saveChanges: 'Save Changes',
  },

  // ── Help Center ──────────────────────────────────────────────────────────
  helpCenter: {
    title: 'Help Center',
    subtitle: 'How can we help you?',
  },

  // ── Privacy Policy ───────────────────────────────────────────────────────
  privacyPolicy: {
    title: 'Privacy Policy',
  },

  // ── Notifications ────────────────────────────────────────────────────────
  notifications: {
    title: 'Notification Settings',
  },

  // ── Change Password ──────────────────────────────────────────────────────
  changePassword: {
    title: 'Change Password',
    current: 'Current Password',
    newPass: 'New Password',
    confirm: 'Confirm Password',
    update: 'Update Password',
  },

  // ── Delete Account ───────────────────────────────────────────────────────
  deleteAccount: {
    title: 'Delete Account',
    warning: 'This action is irreversible. All your data will be permanently deleted.',
    confirm: 'Delete My Account',
  },

  // ── Exercises ────────────────────────────────────────────────────────────
  exercises: {
    title: 'Exercises',
    suggested: 'Suggested for You',
    library: 'Exercise Library',
    duration: 'Duration',
    difficulty: 'Difficulty',
    doneDirect: 'Done Directly',
    startTimer: 'Start Timer',
    doneBtn: 'Done ✨',
    repeat: 'Repeat 🔄',
    howToPerform: 'How to Perform:',
    pause: 'Pause',
    resume: 'Resume',
    noExercises: 'No exercises available.',
  },
};

// ── Arabic ───────────────────────────────────────────────────────────────────
export const ar: TranslationKeys = {
  tabs: {
    home: 'الرئيسية',
    chat: 'محادثة',
    journal: 'يوميات',
    insights: 'إحصائيات',
    profile: 'حسابي',
  },

  common: {
    loading: 'جارٍ التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    done: 'تم',
    yes: 'نعم',
    no: 'لا',
    ok: 'حسناً',
    back: 'رجوع',
    next: 'التالي »',
    previous: '« السابق',
    error: 'خطأ',
    success: 'نجح',
    retry: 'حاول مجدداً',
  },

  home: {
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء النور',
    howAreYou: 'كيف حالك اليوم؟',
    moodLevel: 'مستوى المزاج',
    low: 'منخفض',
    high: 'مرتفع',
    needToSay: 'تريد أن تقول شيئاً؟',
    recommendedForYou: 'موصى به لك',
    exploreLibrary: 'استكشف مكتبة التمارين وتابع تقدمك اليومي.',
    moreWaiting: 'أخرى في الانتظار',
    startExercise: 'ابدأ',
    seeCompleted: 'عرض التمارين المكتملة',
    recentInsights: 'أحدث الإحصائيات',
    moodAnalysis: 'تحليل المزاج',
    moodAvgScore: 'متوسط الدرجة',
    trendingUp: 'في ازدياد',
    exerciseActivity: 'نشاط التمارين',
    totalCompleted: 'إجمالي التمارين المكتملة',
    personalStreak: 'سلسلة الإنجازات',
    dayRecord: 'يوم متواصل',
    keepGoing: 'استمر!',
    whatMadeYouFeel: 'ما الذي جعلك تشعر هكذا؟',
    message: 'رسالة',
    trackMyMood: 'سجّل مزاجي',
    moodTracked: 'تم تسجيل المزاج',
    moodTrackedMsg: 'حللنا رسالتك وأضفنا %d تمارين جديدة لك.',
    moodTrackedSuccess: 'تم تسجيل مزاجك بنجاح.',
    moodFailed: 'فشل تسجيل المزاج. يرجى المحاولة مجدداً.',
    pendingExercises: 'التمارين المعلقة',
    noPending: 'لا توجد تمارين معلقة. أنت على ما يرام!',
    sessionComplete: 'اكتملت الجلسة 🌿',
    sessionSuggested: 'اقترحت عليك منتورا تمارين جديدة بناءً على محادثتك.',
    viewExercises: 'عرض التمارين',
    later: 'لاحقاً',
    sessionEnded: 'انتهت الجلسة 🌿',
    sessionEndedMsg: 'تم إنهاء جلستك وتلخيصها.',
    moodCooldown: 'التسجيل التالي خلال: ',
    moodLoggedSuccessfully: 'تم تسجيل مزاجك بنجاح',
  },

  chat: {
    title: 'المحادثة مع منتورا',
    placeholder: 'شاركنا ما يدور في ذهنك…',
    send: 'إرسال',
    thinking: 'يفكر…',
    sessionComplete: 'اكتملت الجلسة 🌿',
    sessionSuggested: 'اقترحت منتورا بعض التمارين بناءً على محادثتنا.',
    sessionEnded: 'انتهت الجلسة 🌿',
    sessionEndedMsg: 'تم إنهاء جلسة محادثتك وتلخيصها.',
    viewExercises: 'عرض التمارين',
    later: 'لاحقاً',
    crisis: 'دعم الأزمات',
    crisisMsg: 'يبدو أنك قد تمر بضائقة. يرجى التواصل مع خدمات الطوارئ أو خط مساعدة الأزمات.',
    cannotConnect: 'تعذّر بدء جلسة جديدة. يرجى التحقق من اتصالك والمحاولة مجدداً.',
    troubleConnecting: 'أواجه بعض الصعوبات في الاتصال الآن، لكنني لا أزال هنا من أجلك. يرجى المحاولة مجدداً.',
    endedTitle: 'انتهت الجلسة',
    endedDesc: 'تمارين مقترحة بناءً على محادثتنا. يمكنك إيجادها في الشاشة الرئيسية.',
  },

  journal: {
    title: 'اليوميات',
    newEntry: 'إضافة يومية',
    searchPlaceholder: 'ابحث في اليوميات…',
    allFilter: 'الكل',
    noEntries: 'لا توجد يوميات بعد.',
    startJournal: 'اكتب أول يومية للبدء.',
    writeEntry: 'اكتب يوميتك هنا…',
    addEntry: 'حفظ اليومية',
    analyzingAI: 'جارٍ التحليل بالذكاء الاصطناعي…',
    saveSuccess: 'تم حفظ اليومية بنجاح.',
    saveFailed: 'فشل حفظ اليومية. يرجى المحاولة مجدداً.',
    aiUnavailable: 'تحليل الذكاء الاصطناعي غير متاح حالياً.',
    setPinTitle: 'إعداد رمز PIN لليوميات',
    setPinDesc: 'يرجى إنشاء رمز PIN من 4 أرقام لحماية تدويناتك المغلقة.',
    enterPinTitle: 'إلغاء قفل التدوينة',
    enterPinDesc: 'أدخل رمز PIN المكون من 4 أرقام لقراءة هذه التدوينة المغلقة.',
    incorrectPin: 'رمز PIN غير صحيح',
    forgotPin: 'نسيت رمز PIN؟',
    pinMismatch: 'رموز PIN غير متطابقة',
    savePin: 'حفظ رمز PIN',
    enterPin: 'أدخل رمز PIN',
  },

  insights: {
    title: 'الإحصائيات',
    overview: 'نظرة عامة',
    activity: 'النشاط',
    triggers: 'المحفزات',
    avgMood: 'متوسط المزاج',
    totalExercises: 'التمارين',
    streak: 'الاستمرارية',
    checkIns: 'تسجيلات الدخول',
    days: 'أيام',
    copingMechanisms: 'أبرز آليات التعامل',
    activityChart: 'النشاط الأسبوعي',
    moodTrend: 'اتجاه المزاج',
    topTriggers: 'أبرز المحفزات',
    noData: 'لا توجد بيانات بعد.',
  },

  profile: {
    mentoraWelcomes: 'منتورا ترحب بك',
    yourProfile: 'ملفك الشخصي',
    helpCenter: 'مركز المساعدة',
    privacyPolicy: 'سياسة الخصوصية',
    settings: 'الإعدادات',
    logOut: 'تسجيل الخروج',
    logOutConfirmTitle: 'تسجيل الخروج',
    logOutConfirmMsg: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
    yesLogOut: 'نعم، اخرج',
  },

  settings: {
    title: 'الإعدادات',
    language: 'اللغة',
    notifications: 'إعدادات الإشعارات',
    changePassword: 'تغيير كلمة المرور',
    deleteAccount: 'حذف الحساب',
    lockedInMentora: 'مقيّد بمنتورا AI',
    changeJournalPin: 'تغيير رمز PIN لليوميات',
    verifyTitle: 'التحقق من البيانات',
    verifyDesc: 'أدخل بريدك الإلكتروني وكلمة المرور لتغيير أو إعادة تعيين رمز PIN.',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    pinChangedSuccess: 'تم تحديث رمز PIN لليوميات بنجاح.',
  },

  languageScreen: {
    title: 'اللغة',
    subtitle: 'اختر اللغة المفضلة للتطبيق',
    restartNote: 'ℹ️  تسري التغييرات فوراً.',
  },

  onboarding: {
    welcome: 'أهلاً',
    letsKnowYou: 'دعنا نتعرف عليك',
    stepOf: 'من',
    selectBest: 'اختر الخيار الذي يصفك بشكل أفضل',
    questions: [
      {
        title: 'ما الذي جاء بك إلى هنا اليوم؟',
        options: [
          { icon: '😔', text: 'أشعر بالحزن أو الاكتئاب' },
          { icon: '😰', text: 'أشعر بالقلق أو التوتر' },
          { icon: '😴', text: 'أعاني من اضطراب في النوم' },
          { icon: '⭐', text: 'فقط أتحقق من صحتي النفسية' },
        ],
      },
      {
        title: 'كم مرة تشعر بالضغط والتوتر؟',
        options: [
          { icon: '🕰️', text: 'نادراً' },
          { icon: '⏳', text: 'أحياناً' },
          { icon: '⏰', text: 'كثيراً' },
          { icon: '🚨', text: 'دائماً' },
        ],
      },
      {
        title: 'كيف تتعامل عادةً مع الضغط؟',
        options: [
          { icon: '🗣️', text: 'الحديث مع شخص ما' },
          { icon: '🏃‍♂️', text: 'ممارسة الرياضة' },
          { icon: '🧘‍♀️', text: 'التأمل' },
          { icon: '📺', text: 'مشاهدة التلفاز / الترفيه' },
        ],
      },
      {
        title: 'ما هدفك الرئيسي مع منتورا؟',
        options: [
          { icon: '📊', text: 'متابعة صحتي النفسية' },
          { icon: '🎯', text: 'فهم أعراضي' },
          { icon: '💪', text: 'تحسين حالتي' },
          { icon: '🆘', text: 'الحصول على المساعدة والدعم' },
        ],
      },
    ],
  },

  auth: {
    login: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    signIn: 'الدخول',
    orContinueWith: 'أو المتابعة بواسطة',
    google: 'المتابعة بجوجل',
    facebook: 'المتابعة بفيسبوك',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    dob: 'تاريخ الميلاد',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    createAccount: 'إنشاء حساب',
    loginFailed: 'فشل تسجيل الدخول',
    registerFailed: 'فشل التسجيل',
  },

  editProfile: {
    title: 'تعديل الملف الشخصي',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    dob: 'تاريخ الميلاد',
    gender: 'الجنس',
    saveChanges: 'حفظ التغييرات',
  },

  helpCenter: {
    title: 'مركز المساعدة',
    subtitle: 'كيف يمكننا مساعدتك؟',
  },

  privacyPolicy: {
    title: 'سياسة الخصوصية',
  },

  notifications: {
    title: 'إعدادات الإشعارات',
  },

  changePassword: {
    title: 'تغيير كلمة المرور',
    current: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة',
    confirm: 'تأكيد كلمة المرور',
    update: 'تحديث كلمة المرور',
  },

  deleteAccount: {
    title: 'حذف الحساب',
    warning: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.',
    confirm: 'حذف حسابي',
  },

  exercises: {
    title: 'التمارين',
    suggested: 'مقترحة لك',
    library: 'مكتبة التمارين',
    duration: 'المدة',
    difficulty: 'الصعوبة',
    doneDirect: 'ينتهي مباشرة',
    startTimer: 'ابدأ المؤقت',
    doneBtn: 'تم ✨',
    repeat: 'كرر 🔄',
    howToPerform: 'كيفية الأداء:',
    pause: 'إيقاف مؤقت',
    resume: 'استئناف',
    noExercises: 'لا توجد تمارين متاحة.',
  },
};

export const translations = { en, ar };
