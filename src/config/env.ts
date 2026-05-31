// API Base URL — hardcoded to ensure it works in both dev and production APK builds.
// EXPO_PUBLIC_* vars are only injected by Expo CLI dev server, NOT by react-native bundle.
const HARDCODED_API_URL = 'https://6fd9a10a-fd4a-4a17-999c-11468fb61085-00-2ca7kle36q6rj.janeway.replit.dev:8080/api';
// @ts-ignore
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL) || HARDCODED_API_URL;
