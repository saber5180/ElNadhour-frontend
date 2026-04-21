import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success('Connexion réussie !');
        navigate('/admin');
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-100 via-cafe-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 p-2">
            <img src="/icon.png" alt="El Nadhour" className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-display font-bold text-cafe-900 mb-2">
            El Nadhour Admin
          </h1>
          <p className="text-cafe-600">
            Connectez-vous pour gérer votre restaurant
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="form-label">
                <Mail className="inline h-4 w-4 mr-2" />
                Adresse email
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="admin@elnadhour.com"
                {...register('email', {
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Format d\'email invalide'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="form-label">
                <Lock className="inline h-4 w-4 mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Le mot de passe doit contenir au moins 6 caractères'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cafe-500 hover:text-cafe-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-cafe-50 rounded-lg">
            <h4 className="font-semibold text-cafe-900 mb-2">Compte de démonstration:</h4>
            <p className="text-sm text-cafe-600">
              Email: <code className="bg-white px-1 rounded">admin@elnadhour.com</code><br />
              Mot de passe: <code className="bg-white px-1 rounded">admin123</code>
            </p>
          </div>
        </div>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-cafe-600 hover:text-cafe-900 transition-colors"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;