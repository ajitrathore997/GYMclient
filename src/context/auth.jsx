import {useState, useEffect, useContext, createContext} from "react";
import axios from "axios";
const AuthContext = createContext();

const AuthProvider = ({children}) => {

    const [auth, setAuth] = useState({
        user:null,
        token:""
    });

    // default axios
    axios.defaults.headers.common['Authorization'] = auth?.token;

    useEffect(() => {
     const data = localStorage.getItem("auth");
     if (data) {
        const parsedData = JSON.parse(data);
    
        setAuth( (prevState) => ( {...prevState, user:parsedData.user,token:parsedData.token}));
     }
    },[]);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error?.response?.status === 401) {
                    setAuth({ user: null, token: "" });
                    localStorage.removeItem("auth");
                    delete axios.defaults.headers.common["Authorization"];

                    if (window.location.pathname !== "/login") {
                        window.location.href = "/login";
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

return (
    <AuthContext.Provider value={{auth, setAuth}}>
        {children}
    </AuthContext.Provider>
)

}

// custom hooks

const useAuth = () => {
   return useContext(AuthContext);
}

export {AuthProvider, useAuth};
