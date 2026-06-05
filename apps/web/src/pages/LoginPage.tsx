import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../api";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const login = useLogin();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate("/") });
  }

  return (
    <div className="stack form-page">
      <h1 className="page-title">Prijava</h1>
      <form className="card form" onSubmit={onSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="field">
          <span>Lozinka</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {login.isError && <p className="error">{(login.error as Error).message}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={login.isPending}>
            {login.isPending ? "Prijava…" : "Prijavi se"}
          </button>
        </div>
      </form>
      <p className="muted">
        Nemaš račun? <Link to="/register">Registriraj se</Link>
      </p>
    </div>
  );
}
