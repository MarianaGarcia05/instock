import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../Backend/config/api';

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');

    const handleReset = async () => {
        try {
            await api.post('/reset-password', { token, newPassword });
            alert('Contraseña restablecida correctamente.');
        } catch (error) {
            alert('Error al restablecer la contraseña.');
        }
    };

    return (
        <div>
            <h2>Restablecer contraseña</h2>
            <input type="password" placeholder="Nueva contraseña" onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={handleReset}>Guardar</button>
        </div>
    );
};

export default ResetPassword;