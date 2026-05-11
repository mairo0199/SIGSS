import React, { useState } from 'react';
import { Building2, User, Lock } from 'lucide-react';
import axios from 'axios'; // Importamos axios para la conexión real

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '', // Este será el correo en tu DB
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Debes ingresar tu correo registrado';
    }
    if (formData.password.length < 4) {
      newErrors.password = 'La contraseña es demasiado corta';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({}); // Limpiar errores previos

    try {
      // CONEXIÓN REAL AL BACKEND
      const response = await axios.post('http://localhost:3000/api/login', {
        correo: formData.username,
        password: formData.password
      });

      // Si el login es exitoso, recibimos los datos del usuario de la DB
      const userData = {
        id: response.data.usuario.id,
        username: response.data.usuario.correo,
        role: response.data.usuario.rol, // 'estudiante', 'supervisor' o 'admin'
        name: response.data.usuario.nombre
      };

      // Guardamos en el estado global de la App
      onLogin(userData);
      
    } catch (err) {
      // Manejo de errores (Correo no registrado o contraseña mal)
      const serverError = err.response?.data?.error || 'Error de conexión con el servidor';
      setErrors({ server: serverError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="custom-card max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-800 to-primary-600 rounded-full mb-4">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
            Servicio Social Inteligente
          </h1>
          <p className="text-gray-600 mt-2">Sistema Integral de Gestión de Servicio Social</p>
        </div>

        {/* Mensaje de error del servidor */}
        {errors.server && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
            {errors.server}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Usuario/Correo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className={`pl-10 w-full ${errors.username ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="······"
                className={`pl-10 w-full ${errors.password ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Recordar sesión</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Validando en base de datos...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© 2026 Servicio Social Inteligente v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;