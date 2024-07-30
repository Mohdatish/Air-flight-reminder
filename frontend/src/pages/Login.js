import { Container, TextField } from '@mui/material'
import React, { useState } from 'react'
import { BackPaper } from '../common/Styles'
import { NavLink, useNavigate } from 'react-router-dom'
import useFcmToken from '../notification/useFcmHooks'
import { postRequest, setToken } from '../apis/APIFunction'
import API from '../apis/API'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/slice/infoSlice'

const Login = () => {
    const { fcmToken } = useFcmToken();
    const nav = useNavigate()
    const [data, setData] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const dispatch = useDispatch()

    const handleInput = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    const postRequest = async (url, data) => {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An unexpected error occurred');
        }
    
        return response.json();
    };
    
    const submitForm = async (e) => {
        e.preventDefault();
        try {
            let auth = {
                device_token: fcmToken,
                ...data,
            };
            setLoading(true);
            const result = await postRequest(`${API.LOGIN}`, auth);
    
            if (!result.status) {
                toast.error(result.message);
            } else {
                toast.success(result.message)
                setLoading(false)
                setToken(result.token)
                dispatch(setUser(result.user))
                localStorage.setItem('user',JSON.stringify(result.user))
                localStorage.setItem('token',result.token)
                nav('/')
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div>
            <Container maxWidth="xs">
                <div className='login-page'>
                    <BackPaper style={{ width: "100%" }}>

                        <form className='w-100' onSubmit={submitForm}>
                            <div className='w-100 text-center'>
                                <img src="./images/logo.png" alt="logo" className='form-logo' />
                            </div>            <h6 className='w-100 text-center'>Login</h6>
                            <TextField name="email" label="Email" type="email" variant="outlined" className='w-100' onChange={handleInput} error={error} helperText={error ? "Email is required." : null} required />
                            <TextField name="password" label="Password" type="password" variant="outlined" className='w-100' onChange={handleInput} error={error} helperText={error ? "Password is required." : null} required />
                            <button className='buttonSet w-100' style={{width:"100%"}}>{!loading ? 'Submit' : 'Authorizing...'}</button>
                            <p className='w-100 text-center'>Create new account? <NavLink to="/signup"><span>SignUp.</span></NavLink></p>
                        </form>

                    </BackPaper>
                </div>
            </Container>
        </div>
    )
}

export default Login
