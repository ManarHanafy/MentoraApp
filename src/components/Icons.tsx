import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme';

interface IconProps {
    color?: string;
    size?: number;
    focused?: boolean;
}

export const HomeIcon = ({ color = colors.textMuted, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 9.5L12 2.5L21 9.5V20.5C21 21.0523 20.5523 21.5 20 21.5H4C3.44772 21.5 3 21.0523 3 20.5V9.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
        />
        <Path
            d="M9 21.5V12.5H15V21.5"
            stroke={focused ? colors.white : color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ChatIcon = ({ color = colors.textMuted, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M21 11.5C21 16.1944 16.9706 20 12 20C9.65685 20 7.54578 19.155 6 17.7667L2.5 19L3.5 15.6667C2.56238 14.475 2 13.0478 2 11.5C2 6.80558 6.47715 3 12 3C17.5228 3 21 6.80558 21 11.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
        />
        <Path
            d="M8 11.5H16"
            stroke={focused ? colors.white : color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M8 8.5H16"
            stroke={focused ? colors.white : color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={focused ? 0 : 1}
        />
    </Svg>
);

export const JournalIcon = ({ color = colors.textMuted, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M4 19.5V4.5C4 4.5 4 2.5 9 2.5H20V21.5H9C4 21.5 4 19.5 4 19.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
        />
        <Path
            d="M9 2.5V21.5"
            stroke={focused ? colors.white : color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Rect x="13" y="6" width="4" height="8" rx="1" fill={focused ? colors.white : 'none'} />
    </Svg>
);

export const InsightsIcon = ({ color = colors.textMuted, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M3 21.5H21"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M3 13.5L9 7.5L13 11.5L21 3.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M21 3.5V8"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M21 3.5H16.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ProfileIcon = ({ color = colors.textMuted, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M20 21.5V19.5C20 17.2909 18.2091 15.5 16 15.5H8C5.79086 15.5 4 17.2909 4 19.5V21.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
        />
        <Circle
            cx="12"
            cy="7.5"
            r="4"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={focused ? color : 'none'}
        />
    </Svg>
);

export const BellIcon = ({ color = colors.textPrimary, size = 24 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M13.73 21a2 2 0 01-3.46 0"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const StarIcon = ({ color = colors.white, size = 18 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const ArrowRightIcon = ({ color = colors.textMuted, size = 20 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M5 12h14M12 5l7 7-7 7"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const FilterIcon = ({ color = colors.textPrimary, size = 20 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M4 21V14"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M4 10V3"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 21V12"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 8V3"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M20 21V16"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M20 12V3"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M1 14H7"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M9 8H15"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M17 16H23"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const CloudIcon = ({ color = colors.white, size = 32 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M5.5 16.5C8.5 16.5 5.5 10.5 8.5 10.5C5.5 6.5 12.5 4.5 15.5 8.5C18.5 6.5 21.5 8.5 20.5 12.5C23.5 12.5 23.5 16.5 20.5 16.5H5.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={color}
            fillOpacity={0.2}
        />
    </Svg>
);

export const CloudOutlineIcon = ({ color = colors.textPrimary, size = 20 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M5.5 16.5C8.5 16.5 5.5 10.5 8.5 10.5C5.5 6.5 12.5 4.5 15.5 8.5C18.5 6.5 21.5 8.5 20.5 12.5C23.5 12.5 23.5 16.5 20.5 16.5H5.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const DocumentIcon = ({ color = colors.textPrimary, size = 20 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M14 2V8H20"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 13H8"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M16 17H8"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M10 9H8"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const MicrophoneIcon = ({ color = colors.textPrimary, size = 20 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M19 10v2a7 7 0 0 1-14 0v-2"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 19v4"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M8 23h8"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export const LockIcon = ({ color = colors.textPrimary, size = 20 }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);
