import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../api";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const register = useRegister();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate({ email, password }, { onSuccess: () => navigate("/") });
  }

  return (
    <div className="stack form-page">
      <h1 className="page-title">Registracija</h1>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <p className="muted" style={{ fontSize: "0.85em", marginTop: "-0.4rem" }}>
          Najmanje 8 znakova.
        </p>

        {register.isError && <p className="error">{(register.error as Error).message}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary" disabled={register.isPending}>
            {register.isPending ? "Stvaranje računa…" : "Registriraj se"}
          </button>
        </div>
      </form>
      <p className="muted">
        Već imaš račun? <Link to="/login">Prijavi se</Link>
      </p>
    </div>
  );
}
