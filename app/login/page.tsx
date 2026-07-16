"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { setEntryFirmId, setEntryRole, useRole } from "@/lib/store";
import { authenticate, setSessionEmail, useUsers } from "@/lib/users";
import { Badge, Button, Card, SectionTitle } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const role = useRole();
  const users = useUsers();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const user = authenticate(email, password);
    if (!user) {
      setError("Invalid email or password.");
      return;
    }
    setEntryFirmId(user.firm_id);
    setEntryRole(user.role);
    setSessionEmail(user.email);
    router.push(user.role === "Admin" ? "/admin/access" : "/my-company");
  }

  function continuePublic() {
    setEntryFirmId(null);
    setSessionEmail(null);
    setEntryRole("Public");
    router.push("/");
  }

  return (
    <div className="account-page">
      <header className="account-page__header">
        <div>
          <h1>Sign in</h1>
          <p>Editing requires an account. Company employees edit their own company; administrators manage the whole database. Accounts are created by the administrator.</p>
        </div>
        <Badge tone={role === "Admin" ? "success" : role === "Analyst" ? "accent" : "neutral"}>
          Current: {role}
        </Badge>
      </header>

      <div style={{ maxWidth: 440, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <SectionTitle hint="Use the email and password provided by the database administrator.">
            Account sign in
          </SectionTitle>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setError(null); }}
                placeholder="name@company.co.th"
                required
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(null); }}
                required
              />
            </div>
            {error && (
              <div role="alert" style={{ color: "var(--danger, #c0392b)", fontSize: 13 }}>{error}</div>
            )}
            <Button type="submit">
              Sign in
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </form>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span aria-hidden="true" style={{ color: "var(--muted)" }}><UserRound size={19} /></span>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 14 }}>Just browsing?</strong>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted)" }}>
                No account needed to view companies, components, and analysis.
              </p>
            </div>
            <Button variant="secondary" onClick={continuePublic}>Continue</Button>
          </div>
        </Card>

        <div className="account-security-note">
          <LockKeyhole size={16} aria-hidden="true" />
          <span>Frontend design pass: sign-in is checked in the browser only. Real authentication moves server-side with the backend update.</span>
        </div>

        {/* ponytail: demo credentials panel — delete when backend auth lands. */}
        <details>
          <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <KeyRound size={14} aria-hidden="true" />
            Demo accounts (design preview)
          </summary>
          <Card style={{ marginTop: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {users.filter((user) => user.active).map((user) => (
                <div key={user.user_id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span aria-hidden="true" style={{ color: "var(--muted)" }}>
                    {user.role === "Admin" ? <ShieldCheck size={15} /> : <UserRound size={15} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>{user.name}</strong>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      {user.email} / {user.password}
                    </div>
                  </div>
                  <Badge tone={user.role === "Admin" ? "success" : "accent"}>
                    {user.role === "Admin" ? "Admin" : "Company editor"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </details>
      </div>
    </div>
  );
}
