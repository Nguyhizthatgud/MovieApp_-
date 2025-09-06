import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Card, Button, Typography, Carousel, Space, Form, Input, Flex, Checkbox } from 'antd'
import { PlayCircleOutlined, StarFilled, UserOutlined } from '@ant-design/icons'

import { useForm, Controller } from "react-hook-form";
import { MoviePopular } from './MoviePopular.jsx';
import { MovieUpcoming } from './MovieUpcoming.jsx';
import { MovieGenre } from './MovieGenre.jsx';
import "./Homepage.module.css"
import { MovieHero } from './MovieHero.jsx'
const { Title, Text } = Typography;
const { Meta } = Card;

const Homepage = () => {





    return (
        <div className="min-h-screen bg-gray-500 text-white" >

            {/* Hero Section */}
            <MovieHero />
            {/* popular movies section */}
            <MoviePopular />
            {/* trending movies section */}

            <MovieUpcoming />
            {/* Categories Section */}
            <MovieGenre />
        </div>
    )
}

export default Homepage
