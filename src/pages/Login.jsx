import axios from 'axios'
import '../styles/Login.css'
import Swal from 'sweetalert2'
import React, { useState } from 'react'
import img from '../assets/loginImg.png'
import { useNavigate } from 'react-router-dom'
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { TextField, FormControl, InputLabel, Input, InputAdornment, IconButton } from '@mui/material';

const Login = () => {

    const [documentNumber, setDocumentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            //enviar solicitud de POST al backend
            const response = await axios.post('http://localhost:3000/api/login', {
                documentNumber,
                password
            });

            //Almacenar token y redirigir si es exitoso
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('role', response.data.user.role);

            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Bienvenido',
                confirmButtonColor: '#00891B',
            }).then(() => {
                navigate('/dashboard');
            });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 403) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Cuenta inactiva',
                        text: 'Tu cuenta está inactiva. Contacta al administrador.',
                        confirmButtonColor: '#d33'
                    });
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al iniciar sesión',
                        text: error.response.data.error || 'Las credenciales son incorrectas',
                        confirmButtonColor: '#d33'
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar al servidor',
                });
            }
        }

    };

    return (
        <div className="containerLogin">
            <div className="contentLogin">
                <img src={img} className='leftImg' />
                <div className="form">
                    <div className="text">
                        <h1>Bienvenido</h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            id="documentNumber"
                            label="N° de documento"
                            variant="standard"
                            value={documentNumber}
                            color='success'
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            sx={{ m: 1, width: '100%' }}
                        />

                        <FormControl sx={{ m: 1, mt: 4, width: '100%' }} variant="standard" color='success'>
                            <InputLabel htmlFor="standard-adornment-password">Contraseña</InputLabel>
                            <Input
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                        {/* <div className="remember">
                            <a href="">Recordar contraseña</a>
                        </div> */}
                        <button type='submit' className='btnLogin'>
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
