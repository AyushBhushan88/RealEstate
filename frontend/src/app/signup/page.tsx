'use client';

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import styles from "../auth.module.css";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    try {
      await register({ 
        email, 
        password, 
        firstName, 
        lastName, 
        role 
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.authCard} animate-fade-in`}>
        <div className={styles.authLogo}>
          <span className={styles.authSpan}>REMS</span> Platform
        </div>
        <p className={styles.authSubtitle}>Create your account to start managing properties.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              className="input-field" 
              placeholder="John Doe" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="input-field" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="input-field" 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="role">I am a...</label>
            <select 
              id="role" 
              className="input-field" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="BUYER">Buyer / Tenant</option>
              <option value="AGENT">Real Estate Agent</option>
              <option value="OWNER">Property Owner</option>
            </select>
          </div>

          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}>OR</div>

        <button className={styles.googleBtn} onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Sign up with Google
        </button>

        <p className={styles.authFooter}>
          Already have an account? <Link href="/login" className={styles.authLink}>Log in</Link>
        </p>
      </div>

      <style jsx>{`
        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          border: 1px solid #fecaca;
        }
      `}</style>
    </div>
  );
}
