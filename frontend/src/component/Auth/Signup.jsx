import React, { useState, useEffect } from 'react';
import process from "process";
import { Mail, Lock, User, Phone, Twitter, Loader2 } from 'lucide-react';
import Navbar from '../Navbar';
import { loginSchema, signUpSchema } from '../../validation/userSchema';
import { useNavigate } from 'react-router-dom';
import { useDebounceCallback } from 'usehooks-ts'
import '../../App.css';
import { toast } from 'react-hot-toast';
import { z } from "zod";
const Signup = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [userName, setuserName] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // For redirection
  const debounced = useDebounceCallback(setuserName, 300);

  const styles = {
    
    container: {
      minHeight: '5vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    },
    
    card: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '28rem',
      padding: '2rem',
      marginTop: '4rem'
    },
    title: {
      backgroundImage: 'linear-gradient(to right, rgb(147, 51, 234), rgb(59, 130, 246))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontSize: '1.875rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: 'rgb(75, 85, 99)',
      marginTop: '0.5rem'
    },
    input: {
      width: '100%',
      paddingLeft: '1rem',
      paddingRight: '1rem',
      paddingTop: '0.5rem',
      paddingBottom: '0.5rem',
      borderWidth: '1px',
      marginBottom:'5px',
      borderColor: 'rgb(209, 213, 219)',
      borderRadius: '0.5rem',
      outline: 'none',
      transition: 'all 0.2s'
    },
    submitButton: {
      width: '100%',
      backgroundImage: 'linear-gradient(to right, rgb(147, 51, 234), rgb(59, 130, 246))',
      color: 'white',
      fontWeight: '600',
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      transition: 'opacity 0.2s',
      border: 'none',
      cursor: 'pointer'
    },
    switchText: {
      textAlign: 'center',
      marginTop: '1.5rem'
    },
    toggleButton: {
      color: 'rgb(147, 51, 234)',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    }
  };
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      if (decodedToken?.role === 'admin') navigate('/dashboard');
      else navigate('/account');
    }
  }, [navigate]);
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const checkUsernameUnique = async () => {
    if (userName.trim()){
      try {
        setIsCheckingUsername(true)
        setUsernameMessage('');
        const validationResult = signUpSchema.safeParse({ fullName: userName });
        
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/user/checkUsername`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName }) 
        });
        const data = await response.json();
        if (validationResult.error.format().fullName) {
          setUsernameMessage(validationResult.error.format().fullName._errors);
        }else{
          setUsernameMessage(data.message);
        }
      } catch (error) {
        console.log("Error while fetching username avaibility",error)
      }finally{
        setIsCheckingUsername(false)
      }
    }
  }
  useEffect(() => {
    checkUsernameUnique();
    setUsernameMessage('')
  }, [userName])

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isSignup ? '/auth/register' : '/auth/login';
    const payload = isSignup
      ? { fullName: userName, email: formData.email, mobile: formData.phone, password: formData.password } // Change phone to mobile
      : { email: formData.email, password: formData.password };
    const formDataToValidate = isSignup
      ? {
        fullName: userName,
        email: formData.email,
        mobile: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }
      : {
        email: formData.email,
        password: formData.password,
      };
    // Validate with Zod
    const validationResult = isSignup ? signUpSchema.safeParse(formDataToValidate) : loginSchema.safeParse(formDataToValidate);
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      if (errors.fullName) {setUsernameMessage(errors.fullName._errors[0]); toast.error(errors.fullName._errors[0]);}
      else if (errors.email) {  toast.error(errors.email._errors[0]);}
      else if (errors.mobile) toast.error(errors.mobile._errors[0]);
      else if (errors.password) toast.error(errors.password._errors[0]);
      else if (errors.confirmPassword) toast.error(errors.confirmPassword._errors[0]);
      setLoading(false);
      return;
    }
    
    

    try {
      const API_URL = import.meta.env.VITE_API_URL; // || "http://localhost:5000"; // Fallback if env fails
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        if (!isSignup) {
          localStorage.setItem('token', data.token);
          const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
          setTimeout(() => {
            navigate(decodedToken.role === 'admin' ? '/dashboard' : '/account');
          }, 1000);
        } else {
          // navigate('/account/logindetail')
          setIsSignup(false); // Switch to login page after signup
        }
        // toast.success("Signup successful!");
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Virus rovers</h1>
          <p style={styles.subtitle}>{isSignup ? 'Create your account' : 'Welcome back'}</p>
          {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isSignup && (
              <><div>
                <input type="text" name="fullName" placeholder="UserName" style={styles.input} onChange={(e) => {
                  debounced(e.target.value.trim());
                }} required />
                <p style={{
                  margin:'auto',
                  paddingTop:'4px',
                  marginBottom:'-5px',
                  paddingLeft:'4px',
                   color: usernameMessage === "Username is available" ? "#008000" : "red", fontSize: '12px' }}>
                  {isCheckingUsername ? (
                    <Loader2 className="animate-spin" style={{ height: '16px',  width: '1rem', color: 'black' }} />
                  ) : (
                      usernameMessage 
                  )}
                </p>
              </div>
                <input type="text" name="phone" placeholder="Mobile Number" style={styles.input} onChange={handleChange} required />
              </>
            )}
            <input type="email" name="email" placeholder="Email" style={styles.input} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" style={styles.input} onChange={handleChange} required />
            {isSignup && (
              <input type="password" name="confirmPassword" placeholder="Confirm Password" style={styles.input} onChange={handleChange} required />
            )}
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Processing...' : isSignup ? 'Sign up' : 'Log in'}
            </button>
          </form>
          <p style={styles.switchText}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignup(!isSignup)} style={styles.toggleButton}>
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Signup;