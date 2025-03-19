'use client';

// import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginForm from './login/LoginForm';


export default function Home() {
  return (
    <main className="container mx-auto ">
      <LoginForm />
      
    </main>
  );
}