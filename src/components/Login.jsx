import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import AxiosInstance from './AxiosInstance'
import logo from '../assets/logo.svg'
import backgroundImage from '../assets/background-login.jpg'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Shield,
  Building2,
  LayoutDashboard,
  Users,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const [showMessage, setShowMessage] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageType, setMessageType] = useState('error')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setRememberMe(true)
    }
  }, [])

  const handleLogin = async (data) => {
    setLoading(true)
    setShowMessage(false)

    try {
      const response = await AxiosInstance.post('login/', {
        email: data.email,
        password: data.password,
      })
      
      localStorage.setItem('Token', response.data.token)
      localStorage.setItem('User', JSON.stringify(response.data.user))
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', data.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      setMessageText('Connexion réussie ! Redirection en cours...')
      setMessageType('success')
      setShowMessage(true)
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
      
    } catch (error) {
      let errorMessage = 'Échec de connexion. Veuillez réessayer.'
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect'
        } else if (error.response.status === 403) {
          errorMessage = 'Compte désactivé. Contactez l\'administrateur.'
        } else if (error.response.status === 429) {
          errorMessage = 'Trop de tentatives. Veuillez patienter 5 minutes.'
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error.request) {
        errorMessage = 'Serveur inaccessible. Vérifiez votre connexion internet.'
      }
      
      setMessageText(errorMessage)
      setMessageType('error')
      setShowMessage(true)
      
      setTimeout(() => {
        setShowMessage(false)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Building2, text: 'Gestion multi-agences' },
    { icon: Users, text: 'Rôles et permissions' },
    { icon: LayoutDashboard, text: 'Dashboard personnalisé' },
    { icon: TrendingUp, text: 'Reporting avancé' }
  ]

  const stats = [
    { value: '500+', label: 'Clients', icon: Building2 },
    { value: '24/7', label: 'Support', icon: Clock },
    { value: '15+', label: 'Expertise', icon: Award }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: `url(${backgroundImage})` }}>
      
      <div className="absolute inset-0 bg-gradient-to-br from-base-200/98 via-base-200/95 to-base-300/98"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full filter blur-3xl"></div>
      </div>

      {showMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md animate-slideDown">
          <div className={`alert shadow-xl border-l-4 ${
            messageType === 'error' 
              ? 'alert-error border-l-error' 
              : 'alert-success border-l-success'
          }`}>
            <div className="flex items-center gap-3">
              {messageType === 'error' ? (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{messageText}</span>
            </div>
            <button onClick={() => setShowMessage(false)} className="btn btn-sm btn-ghost btn-circle">✕</button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-base-100">
          
          {/* Colonne gauche - Branding avec logo visible */}
          <div className="hidden lg:flex relative bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-content/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-content/5 rounded-full filter blur-3xl"></div>
            
            <div className="relative z-10 p-8 text-primary-content flex flex-col justify-between h-full">
              
              {/* Logo et nom - Version agrandie */}
              <div>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-24 h-24 bg-primary-content/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <img src={logo} alt="SIMPORE SERVICE" className="w-14 h-14 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">SIMPORE SERVICE</h1>
                    <p className="text-xs opacity-80">Solutions professionnelles intégrées</p>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-3 text-center">
                  Gérez votre activité
                  <span className="text-primary-content/90"> en toute simplicité</span>
                </h2>
                
                <p className="text-sm opacity-90 leading-relaxed mb-6 text-center">
                  Solution complète pour la gestion de votre entreprise.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary-content/10 flex items-center justify-center">
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary-content/10">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <stat.icon className="w-3 h-3" />
                      <span className="text-lg font-bold">{stat.value}</span>
                    </div>
                    <p className="text-xs opacity-70">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-primary-content/10">
                <div className="flex items-start gap-2 justify-center">
                  <Sparkles className="w-3 h-3 mt-0.5" />
                  <p className="text-xs italic opacity-80">
                    "La satisfaction client est notre priorité"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Formulaire avec logo en haut */}
          <div className="flex items-center justify-center p-6 md:p-8 bg-base-100">
            <div className="w-full max-w-md">
              
              <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
                
                {/* Logo et titre - Version agrandie et centrée */}
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <img src={logo} alt="SIMPORE SERVICE" className="w-12 h-12 object-contain" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold">SIMPORE SERVICE</h2>
                    <p className="text-xs text-base-content/60 mt-1">Connectez-vous à votre espace</p>
                  </div>
                </div>

                <div className="divider text-xs text-base-content/40 my-2">ACCÉDER</div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-sm">Email</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Mail className="h-4 w-4 text-base-content/40" />
                    </div>
                    <input
                      type="email"
                      placeholder="contact@simporesenter.com"
                      className={`input input-bordered w-full pl-9 py-2 text-sm ${
                        errors.email ? 'input-error' : ''
                      }`}
                      {...register('email', {
                        required: "Email requis",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email invalide"
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error text-xs">{errors.email.message}</span>
                    </label>
                  )}
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text text-sm">Mot de passe</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Lock className="h-4 w-4 text-base-content/40" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`input input-bordered w-full pl-9 pr-9 py-2 text-sm ${
                        errors.password ? 'input-error' : ''
                      }`}
                      {...register('password', {
                        required: "Mot de passe requis",
                        minLength: { value: 6, message: "Minimum 6 caractères" }
                      })}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error text-xs">{errors.password.message}</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-xs">Se souvenir</span>
                  </label>
                  
                  <Link to="/request/password_reset" className="text-xs text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full bg-primary hover:bg-primary/90 text-primary-content border-none text-sm"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Se connecter</span>
                    </div>
                  )}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-base-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-base-100 text-base-content/40">Nouveau client ?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-primary text-primary text-sm hover:bg-primary hover:text-primary-content transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Créer un compte
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-3 h-3 text-success" />
                  <span className="text-xs text-base-content/40">Connexion sécurisée</span>
                </div>

                <div className="text-center pt-3">
                  <p className="text-xs text-base-content/40">
                    © {currentYear} SIMPORE SERVICE
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login