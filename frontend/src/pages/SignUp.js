import { Container, TextField } from '@mui/material'
import React, { useState } from 'react'
import { BackPaper } from '../common/Styles'
import { NavLink, useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'
import API from '../apis/API'

const SignUp = () => {
    const nav = useNavigate()
    const [data, setData] = useState({ full_name: '', email: '', password: '', otp: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [otp, setOtp] = useState(false)


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
    

    const handleInput = (e) => {
        let { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    const submitForm = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const result = await postRequest(`${API.GENERATE_OTP}`, data)
            if (!result.status) {
                toast.error(result.message)
                setLoading(false)
            } else {
                toast.success(result.message, { duration: 2000 })
                setLoading(false)
                setOtp(true)
            }
        } catch (error) {
            console.log(error.message)
            setLoading(false)
            toast.error(error.message)
        }
    }

    const submitOtp = async (e) => {
        e.preventDefault()
        try {
            let otp = {
                otp :parseInt(data.otp),
                email: data.email
            }
            setLoading(true)
            const result = await postRequest(`${API.VERIFY_OTP}`, otp)
            if (!result.status) {
                toast.error(result.message)
                setLoading(false)
            } else {
                toast.success(result.message)
                setLoading(false)
                submitRegister()
                nav('/login')
            }
        } catch (error) {
            console.log(error.message)
            setLoading(false)
            toast.error(error.message)
        }
    }

    const submitRegister = async () => {
        try {
            setLoading(true)
            const result = await postRequest(`${API.REGISTER_USER}`, data)
            if (!result.status) {
                toast.error(result.message)
                setLoading(false)
            } else {

            }
        } catch (error) {
            console.log(error.message)
            setLoading(false)
            toast.error(error.message)
        }
    }

    return (
        <div>
            <Container maxWidth="xs">
                <div className='login-page'>
                    <BackPaper style={{ width: "100%" }}>
                        {otp ?
                            <form className='w-100' onSubmit={submitOtp}>
                                <div className='w-100 text-center'>
                                    <img src="./images/logo.png" alt="logo" className='form-logo' />
                                </div>
                                <h6 className='w-100 text-center'>Verify your email</h6>
                                <TextField name="otp" label="OTP" type="text" variant="outlined" className='w-100' onChange={handleInput} error={error} helperText={error ? "OTP is required." : null} required value={data.otp}/>
                                <button className='buttonSet w-100'>{loading?'Verifying...':'Verify'}</button>
                            </form>
                            :

                            <form className='w-100' onSubmit={submitForm}>
                                <div className='w-100 text-center'>
                                    <img src="./images/logo.png" alt="logo" className='form-logo' />
                                </div>
                                <h6 className='w-100 text-center'>Create Account</h6>
                                <TextField name="full_name" label="Full Name" type="text" variant="outlined" className='w-100' onChange={handleInput} error={error} helperText={error ? "FullName is required." : null} required value={data.full_name}/>
                                <TextField name="email" label="Email" type="email" variant="outlined" className='w-100' onChange={handleInput} error={error} helperText={error ? "Email is required." : null} required  value={data.email}/>
                                <TextField name="password" label="Password" type="password" variant="outlined" className='w-100' onChange={handleInput} error={error} helperText={error ? "Password is required." : null} required value={data.password}/>
                                <button className='buttonSet w-100' style={{width:"100%"}}>{loading?'Registering...':'Register'}</button>
                                <p className='w-100 text-center'>Already have an account? <NavLink to="/login"><span>Login.</span></NavLink></p>
                            </form>
                        }
                    </BackPaper>
                </div>
            </Container>
        </div>
    )
}

export default SignUp
