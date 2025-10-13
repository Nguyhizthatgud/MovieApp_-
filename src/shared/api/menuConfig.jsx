//business logic for menu items
import { UserOutlined, SettingOutlined, HeartOutlined, LogoutOutlined, VideoCameraOutlined, LoginOutlined } from '@ant-design/icons';
import { FaTv } from "react-icons/fa6";
import { GoPeople } from "react-icons/go";
import { CiSquareMore } from "react-icons/ci";
export const getAvatarMenuItems = (onMenuClick) => [
    {
        key: 'profile',
        icon: (<UserOutlined />),
        label: 'Profile',
        action: () => onMenuClick('profile')
    },
    {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        action: () => onMenuClick('settings')
    },
    {
        key: 'favorite',
        icon: <HeartOutlined />,
        label: 'Favorite Movies',
        action: () => onMenuClick('favorite')
    },
    {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        action: () => onMenuClick('logout')
    }
];

export const groupMenuOptions = (onOptionClick) => [
    {
        key: 'Login',
        icon: <LoginOutlined />,
        label: 'Login',
        action: () => onOptionClick('Login')
    },
    {
        key: 'Movies',
        icon: <VideoCameraOutlined />,
        label: 'Movies',
        action: () => onOptionClick('Movies')
    },
    {
        key: 'TV Shows',
        icon: <FaTv />,
        label: 'TV Shows',
        action: () => onOptionClick('TV Shows')
    },
    {
        key: 'People',
        icon: <GoPeople />,
        label: 'People',
        action: () => onOptionClick('People')
    },
    {
        key: 'More',
        icon: <CiSquareMore />,
        label: 'More',
        action: () => onOptionClick('More')
    }
];

export const searchMenuOptions = (onSearchClick) => [
    {
        key: 'All',     
        label: 'All',
        action: () => onSearchClick('All')
    }
];