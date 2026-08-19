import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { apiClient } from "../../services/apiClient";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Admin email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const trimmedEmail = email.trim();

      try {
        const response = await fetch(`${apiClient.getApiBaseUrl()}/admin/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password })
        });

        const data = await response.json();

        if (response.ok && data.accessToken) {
          localStorage.setItem("adminToken", data.accessToken);
          if (data.refreshToken) localStorage.setItem("adminRefreshToken", data.refreshToken);
          localStorage.setItem(
            "adminUser",
            JSON.stringify(data.admin || { name: "Super Admin", email: trimmedEmail })
          );
          navigate("/dashboard");
          return;
        } else {
          setErrors((current) => ({
            ...current,
            form: data.message || "Invalid email or password.",
          }));
          return;
        }
      } catch (apiError) {
        setErrors((current) => ({
          ...current,
          form: "Invalid email or password or backend server unavailable.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundCircleOne} />
      <div className={styles.backgroundCircleTwo} />

      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logoMark}>
            <span>N</span>
            <span>C</span>
          </div>

          <div className={styles.brandName}>
            <strong>NEXT CELL</strong>
            <span>BEAUTY</span>
          </div>

          <h1>
            Manage Your
            <span> Beauty Business</span>
          </h1>

          <p>
            Control products, orders, customers, promotions, reviews,
            content and store settings from one secure admin workspace.
          </p>

          <div className={styles.features}>
            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>Secure Access</strong>
                Protected admin environment
              </span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>Complete Control</strong>
                Manage the full ecommerce workflow
              </span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>Real-Time Management</strong>
                Products, orders and customer activity
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.loginPanel}>
        <div className={styles.loginCard}>
          <div className={styles.mobileBrand}>
            <div className={styles.mobileLogoMark}>
              <span>N</span>
              <span>C</span>
            </div>

            <div>
              <strong>NEXT CELL</strong>
              <span>BEAUTY ADMIN</span>
            </div>
          </div>

          <div className={styles.heading}>
            <span>ADMINISTRATION</span>

            <h2>Welcome Back</h2>

            <p>
              Sign in to manage the NEXT CELL BEAUTY ecommerce platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="adminEmail">Email Address</label>

              <div
                className={`${styles.inputWrapper} ${
                  errors.email ? styles.inputError : ""
                }`}
              >
                <Mail size={19} />

                <input
                  id="adminEmail"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (errors.email) {
                      setErrors((current) => ({
                        ...current,
                        email: "",
                      }));
                    }
                  }}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>

              {errors.email && (
                <small className={styles.errorText}>
                  {errors.email}
                </small>
              )}
            </div>

            <div className={styles.formGroup}>
              <div className={styles.passwordLabel}>
                <label htmlFor="adminPassword">Password</label>

                <button type="button">
                  Forgot Password?
                </button>
              </div>

              <div
                className={`${styles.inputWrapper} ${
                  errors.password ? styles.inputError : ""
                }`}
              >
                <LockKeyhole size={19} />

                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (errors.password) {
                      setErrors((current) => ({
                        ...current,
                        password: "",
                      }));
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errors.password && (
                <small className={styles.errorText}>
                  {errors.password}
                </small>
              )}
            </div>

            <label className={styles.rememberRow}>
              <input type="checkbox" />

              <span />

              Keep me signed in
            </label>

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In to Admin"}
            </button>

            {errors.form && (
              <small className={styles.errorText} role="alert">
                {errors.form}
              </small>
            )}
          </form>

          <div className={styles.demoCredentials}>
            <p>Temporary login for testing</p>

            <p>
              Email: admin@nextcall.com
              <br />
              Password: admin123
            </p>
          </div>

          <div className={styles.securityNote}>
            <ShieldCheck size={17} />

            <span>
              Secure administrative access for authorised users only.
            </span>
          </div>

          <p className={styles.footerText}>
            © {new Date().getFullYear()} NEXT CELL BEAUTY
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;