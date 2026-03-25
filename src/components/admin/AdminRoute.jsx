import React, {useState, useEffect} from 'react';
import { useAuth } from '../../context/auth';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import {Spinner} from "../"
import { BASE_URL } from '../../utils/fetchData';

const AdminRoute = () => {
    const [ok, setOk] = useState(false);
    const {auth, setAuth} = useAuth();
    useEffect(() => {
        const authCheck = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/auth/admin-auth`);
                if (res.data.ok) {
                    setOk(true);
                }
                else{
                    setOk(false);
                }
            } catch (error) {
                setOk(false);
                setAuth({ user: null, token: "" });
                localStorage.removeItem("auth");
            }
        }
        if (auth?.token) {
            authCheck();
        } else {
            setOk(false);
        }
    } ,[auth?.token, setAuth]);

  return ( 
    ok ? <Outlet/> : <Spinner path='login'/>
  ) 
}

export default AdminRoute;
