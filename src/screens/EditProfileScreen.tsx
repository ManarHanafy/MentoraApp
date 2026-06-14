import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Modal, FlatList, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography } from '../theme';
import { ArrowLeftIcon, UserCircleIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function EditProfileScreen(): React.ReactElement {
  const navigation = useNavigation();
  const { userName, email: contextEmail, dob: contextDob, gender: contextGender, updateProfile } = useAuth();
  const { t, isRTL, language } = useLanguage();

  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState(contextEmail || '');
  const [dob, setDob] = useState(contextDob || '');
  const [gender, setGender] = useState(contextGender || '');



  // Date Picker States
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDay, setTempDay] = useState(1);
  const [tempMonth, setTempMonth] = useState(1);
  const [tempYear, setTempYear] = useState(2000);

  // Month lists
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const englishMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const handleOpenDatePicker = () => {
    if (dob) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
          setTempDay(d);
          setTempMonth(m);
          setTempYear(y);
        }
      }
    } else {
      setTempDay(1);
      setTempMonth(1);
      setTempYear(2000);
    }
    setDatePickerVisible(true);
  };

  const handleConfirmDate = () => {
    const formattedDay = tempDay.toString().padStart(2, '0');
    const formattedMonth = tempMonth.toString().padStart(2, '0');
    setDob(`${formattedDay}/${formattedMonth}/${tempYear}`);
    setDatePickerVisible(false);
  };



  const handleSave = async () => {
     if (!name || !email) {
        Alert.alert(
           language === 'ar' ? 'حقول مطلوبة' : 'Missing Fields',
           language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.'
        );
        return;
     }

     await updateProfile({ userName: name, email, phone: '', dob, gender });
     navigation.goBack();
  };

  const textDir = isRTL ? 'right' as const : 'left' as const;
  const defaultName = language === 'ar' ? 'منار محمد حنفي' : 'Manar Mohamed Hanafy';

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.darkHeader}>
        <View style={[s.headerTopRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <TouchableOpacity style={s.backButton} onPress={() => navigation.goBack()}>
             <ArrowLeftIcon size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={s.headerContent}>
          <View style={s.avatarContainer}>
             <UserCircleIcon size={48} color={colors.primary} />
          </View>
          <Text style={s.headerName}>{name || defaultName}</Text>
          <Text style={s.headerSub}>{t.profile.mentoraWelcomes}</Text>
        </View>
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.name}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.email}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>



         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.dob}</Text>
            <TouchableOpacity style={s.inputWrapper} onPress={handleOpenDatePicker}>
               <Text style={[s.input, { textAlign: textDir, textAlignVertical: 'center', paddingTop: 12, color: dob ? colors.textPrimary : colors.textMuted }]}>
                  {dob || "DD/MM/YYYY"}
               </Text>
            </TouchableOpacity>
         </View>

         <View style={s.inputGroup}>
            <Text style={[s.label, { textAlign: textDir }]}>{t.editProfile.gender}</Text>
            <View style={s.inputWrapper}>
               <TextInput 
                  style={[s.input, { textAlign: textDir }]} 
                  value={gender}
                  onChangeText={setGender}
                  placeholderTextColor={colors.textMuted}
               />
            </View>
         </View>

          <TouchableOpacity style={s.saveButton} onPress={handleSave}>
             <Text style={s.saveButtonText}>{t.editProfile.saveChanges}</Text>
          </TouchableOpacity>
       </ScrollView>

       {/* Date of Birth Picker Modal */}
       <Modal visible={datePickerVisible} transparent animationType="slide">
         <TouchableOpacity style={s.pickerOverlay} activeOpacity={1} onPress={() => setDatePickerVisible(false)}>
           <TouchableOpacity style={s.pickerContent} activeOpacity={1}>
             <View style={s.pickerHeader}>
               <Text style={s.pickerTitle}>{language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}</Text>
               <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                 <Text style={s.pickerCloseButton}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
               </TouchableOpacity>
             </View>

             <View style={s.pickerRow}>
               {/* Day Column */}
               <View style={s.pickerColumn}>
                 <Text style={s.columnHeader}>{language === 'ar' ? 'اليوم' : 'Day'}</Text>
                 <FlatList
                   data={Array.from({ length: getDaysInMonth(tempMonth, tempYear) }, (_, i) => i + 1)}
                   keyExtractor={(item) => item.toString()}
                   renderItem={({ item }) => (
                     <TouchableOpacity 
                       style={[s.pickerItem, tempDay === item && s.pickerItemActive]}
                       onPress={() => setTempDay(item)}
                     >
                       <Text style={[s.pickerItemText, tempDay === item && s.pickerItemTextActive]}>{item}</Text>
                     </TouchableOpacity>
                   )}
                   showsVerticalScrollIndicator={false}
                 />
               </View>

               {/* Month Column */}
               <View style={s.pickerColumn}>
                 <Text style={s.columnHeader}>{language === 'ar' ? 'الشهر' : 'Month'}</Text>
                 <FlatList
                   data={Array.from({ length: 12 }, (_, i) => i + 1)}
                   keyExtractor={(item) => item.toString()}
                   renderItem={({ item }) => (
                     <TouchableOpacity 
                       style={[s.pickerItem, tempMonth === item && s.pickerItemActive]}
                       onPress={() => {
                         setTempMonth(item);
                         const maxDays = getDaysInMonth(item, tempYear);
                         if (tempDay > maxDays) {
                           setTempDay(maxDays);
                         }
                       }}
                     >
                       <Text style={[s.pickerItemText, tempMonth === item && s.pickerItemTextActive]}>
                         {language === 'ar' ? arabicMonths[item - 1] : englishMonths[item - 1]}
                       </Text>
                     </TouchableOpacity>
                   )}
                   showsVerticalScrollIndicator={false}
                 />
               </View>

               {/* Year Column */}
               <View style={s.pickerColumn}>
                 <Text style={s.columnHeader}>{language === 'ar' ? 'السنة' : 'Year'}</Text>
                 <FlatList
                   data={Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)}
                   keyExtractor={(item) => item.toString()}
                   renderItem={({ item }) => (
                     <TouchableOpacity 
                       style={[s.pickerItem, tempYear === item && s.pickerItemActive]}
                       onPress={() => {
                         setTempYear(item);
                         const maxDays = getDaysInMonth(tempMonth, item);
                         if (tempDay > maxDays) {
                           setTempDay(maxDays);
                         }
                       }}
                     >
                       <Text style={[s.pickerItemText, tempYear === item && s.pickerItemTextActive]}>{item}</Text>
                     </TouchableOpacity>
                   )}
                   showsVerticalScrollIndicator={false}
                 />
               </View>
             </View>

             <TouchableOpacity style={s.pickerConfirmButton} onPress={handleConfirmDate}>
               <Text style={s.pickerConfirmText}>{language === 'ar' ? 'تأكيد' : 'Confirm'}</Text>
             </TouchableOpacity>
           </TouchableOpacity>
         </TouchableOpacity>
       </Modal>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 35,
    paddingBottom: 40,
  },
  headerTopRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: -16, 
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerName: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSub: {
    ...typography.caption,
    color: '#A0AEC0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
     ...typography.bodySmall,
     color: colors.textPrimary,
     fontWeight: '500',
     marginBottom: 8,
  },
  inputWrapper: {
     backgroundColor: '#F3F4F6',
     borderRadius: 12,
     paddingHorizontal: 16,
     height: 48,
     justifyContent: 'center',
  },
  input: {
     ...typography.bodySmall,
     color: colors.textPrimary,
     flex: 1,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  // Date Picker Modal Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '60%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161B22',
  },
  pickerCloseButton: {
    fontSize: 16,
    color: '#161B22',
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 220,
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#E2E8F0',
    width: '100%',
    textAlign: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerItem: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#161B22',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pickerConfirmButton: {
    backgroundColor: '#161B22',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;
