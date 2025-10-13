
import React, { createContext, useReducer, useEffect } from "react";
const initialState = {
    isAuthenticated: false,
    isInitialized: false,
    user: null
};
const LOGIN_START = "LOGIN_START";
const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_FAILURE = "LOGIN_FAILURE";
const LOGOUT = "LOGOUT";

const reducer = (state, action) => {
    switch (action.type) {
        case LOGIN_START: {
            const { isAuthenticated, user } = action.payload;
            return {
                ...state,
                isAuthenticated,
                isInitialized: true,
                user,
                error: null
            };
        }
        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                isInitialized: true,
                loading: false,
                error: null
            };
        case LOGIN_FAILURE:
            return {
                ...state,
                isAuthenticated: false,
                isInitialized: true,
                user: null,
                loading: false,
                error: action.payload
            };
        case LOGOUT:
            return {
                ...state,
                isAuthenticated: false,
                isInitialized: true,
                user: null,
                loading: false,
                error: null
            };
        default:
            return state;
    }
};

const AuthContext = createContext({ ...initialState });

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Restore authentication state from localStorage on mount
    useEffect(() => {
        const username = window.localStorage.getItem("username");
        const isAuthenticated = window.localStorage.getItem("isAuthenticated") === "true";
        if (isAuthenticated && username) {
            dispatch({
                type: LOGIN_START,
                payload: {
                    isAuthenticated: true,
                    user: { username }
                }
            });
        } else {
            dispatch({
                type: LOGIN_START,
                payload: {
                    isAuthenticated: false,
                    user: null
                }
            });
        }
    }, []);

    const LoginSuccess = async (username, callBack) => {
        window.localStorage.setItem("username", username);
        window.localStorage.setItem("isAuthenticated", "true");
        dispatch({ type: LOGIN_SUCCESS, payload: { user: { username } } });
        callBack();
    };
    const LoginFailure = async (error) => {
        dispatch({ type: LOGIN_FAILURE, payload: error });
    };
    const LogOut = async (callBack) => {
        window.localStorage.removeItem("username");
        window.localStorage.setItem("isAuthenticated", "false");
        dispatch({ type: LOGOUT });
        callBack();
    };

    return (
        <AuthContext.Provider value={{ ...state, LoginSuccess, LoginFailure, LogOut }}>{children}</AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };
