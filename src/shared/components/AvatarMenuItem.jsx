// components/AvatarMenuItem.jsx - Presentation Logic
import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';

export const AvatarMenuItem = ({ icon, label }) => (
    <span className="flex items-center justify-between w-full group">
        <span className="flex items-center gap-2">
            {icon}
            {label}
        </span>
        <ArrowRightOutlined className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </span>
);