import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export const useNavbarActions = () => {
    const { LogOut, LoginSuccess } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [modal, setModal] = React.useState(false);
    const handleMenuAction = (key) => {
        switch (key) {
            case 'profile':
                navigate('/profile');
                break;
            case 'settings':
                navigate('/settings');
                break;
            case 'favorite':
                navigate('/favorites');
                break;
            case 'logout':
                LogOut(() => {
                    if (id) {
                        navigate(`/Movie/${id}`);
                    } else {
                        navigate('/');
                    }
                });
                break;
            default:
                break;
        }
    };
    const handleGroupOption = (key) => {
        switch (key) {
            case 'Login':
                if (!modal) {
                    setModal(true);
                } else {
                    setModal(false);
                }
                break;
            case 'Movies':
                navigate('/movies');
                break;
            case 'TV Shows':
                navigate('/tvshows');
                break;
            case 'People':
                navigate('/people');
                break;
            case 'More':
                navigate('/more');
                break;
            default:
                break;
        }
    }
    const closeModal = () => {
        setModal(false);
        setLoginLoading(false);
    };

    return { handleMenuAction, handleGroupOption, modal, closeModal };
};