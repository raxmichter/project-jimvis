import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { toast } from "@ui-sdk/react/toast";
import { Jim, type JimMood } from "@/components/Jim";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const IDLE_QUIPS = [
  "Hi, I’m Jim. Bring me a messy business question.",
  "ARR, churn, market entry — I’ll find the plot.",
  "Five full briefs on the house. Zero setup.",
  "Less dashboard archaeology. More clarity.",
];

function getSafeOAuthUrl(): string | null {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appId = import.meta.env.VITE_APP_ID;
  if (!kimiAuthUrl || !appId || typeof window === "undefined") return null;
  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const url = new URL("/api/oauth/authorize", kimiAuthUrl);
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile");
    url.searchParams.set("state", btoa(redirectUri));
    return url.toString();
  } catch {
    return null;
  }
}

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const reduceMotion = useReducedMotion();

  const [tab, setTab] = useState("trial");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signInEmail, setSignInEmail] = useState("");
  const [preloadSamples, setPreloadSamples] = useState(true);
  const [quipIndex, setQuipIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const oauthUrl = getSafeOAuthUrl();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (reduceMotion || focusedField) return;
    const timer = window.setInterval(() => {
      setQuipIndex((current) => (current + 1) % IDLE_QUIPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reduceMotion, focusedField]);

  const onAuthSuccess = async (welcomeMsg?: string) => {
    await utils.invalidate();
    if (welcomeMsg) toast.success(welcomeMsg);
    navigate("/app", { replace: true });
  };

  const startTrial = trpc.auth.startTrial.useMutation({
    onSuccess: (user) => onAuthSuccess(`Welcome to Jim’s desk, ${user.name?.split(" ")[0] ?? "friend"}`),
    onError: (err) => toast.error(err.message || "Couldn’t start your trial. Try again."),
  });

  const signIn = trpc.auth.signIn.useMutation({
    onSuccess: (user) => onAuthSuccess(`Welcome back, ${user.name?.split(" ")[0] ?? "friend"}`),
    onError: (err) => toast.error(err.message || "Couldn’t sign in. Try again."),
  });

  const demo = trpc.auth.demo.useMutation({
    onSuccess: () => onAuthSuccess(),
    onError: () => toast.error("Demo workspace couldn’t open. Please try again."),
  });

  const isBusy = startTrial.isPending || signIn.isPending || demo.isPending;
  const activeTyping = Boolean(focusedField || name.trim() || email.trim() || signInEmail.trim());
  const jimMood: JimMood = isBusy ? "thinking" : activeTyping ? "listening" : "idle";

  const firstName = name.trim().split(/\s+/)[0];
  const liveQuip = isBusy
    ? "Warming up your workspace…"
    : firstName && tab === "trial"
      ? `Nice to meet you, ${firstName}. Let’s figure things out.`
      : focusedField === "signin-email" || (tab === "signin" && signInEmail.trim())
        ? "Pulling up your saved thinking…"
        : IDLE_QUIPS[quipIndex];

  return (
    <main className="auth-page">
      <div className="auth-grid-bg" aria-hidden="true" />

      <header className="auth-topbar">
        <div className="auth-brand">
          <Jim size="tiny" />
          <span>jimvis</span>
          <span className="beta-tag">BETA</span>
        </div>
        <div className="auth-topbar__actions">
          <div className="auth-trial-pill">
            <span className="status-pulse" />
            <span>7-day free trial<span className="auth-trial-pill__extra"> · 5 reports</span></span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="auth-stage">
        <motion.div
          className="auth-hero"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-character">
            <Jim
              size="large"
              mood={jimMood}
              interactive
              onPoke={() => setQuipIndex((current) => (current + 1) % IDLE_QUIPS.length)}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={liveQuip}
                className="auth-bubble"
                initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -5, scale: 0.97 }}
                transition={{ duration: 0.22 }}
              >
                {liveQuip}
              </motion.div>
            </AnimatePresence>
          </div>

          <span className="section-label">AI BUSINESS REPORT CHATBOT</span>
          <h1>Meet Jim, your sharp<br /><em>pocket strategist.</em></h1>
          <p>Ask messy business questions in plain English. Get structured, decision-ready briefs you can explore, save, and act on.</p>
        </motion.div>

        <motion.div
          className="auth-card"
          initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Tabs value={tab} onValueChange={(value) => value && setTab(value)} className="auth-tabs">
            <TabsList aria-label="Authentication mode" className="auth-tabs__list">
              <TabsTab value="trial">Start 7-day trial</TabsTab>
              <TabsTab value="signin">Sign in</TabsTab>
              <TabsIndicator className="auth-tabs__indicator" />
            </TabsList>

            <TabsPanel value="trial" className="auth-panel">
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (isBusy) return;
                  startTrial.mutate({ name: name.trim(), email: email.trim(), preloadSamples });
                }}
              >
                <div className="auth-field">
                  <label className="field-label" htmlFor="trial-name">Your name</label>
                  <input
                    id="trial-name"
                    className="text-input"
                    type="text"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    minLength={2}
                    maxLength={60}
                    required
                    disabled={isBusy}
                  />
                </div>

                <div className="auth-field">
                  <label className="field-label" htmlFor="trial-email">Work email</label>
                  <input
                    id="trial-email"
                    className="text-input"
                    type="email"
                    placeholder="alex@northstar.co"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={160}
                    required
                    disabled={isBusy}
                  />
                </div>

                <label className="auth-switch-row">
                  <span>
                    <strong>Preload 2 sample reports</strong>
                    <small>Include example revenue &amp; retention briefs to click through</small>
                  </span>
                  <Switch
                    className="jim-switch"
                    checked={preloadSamples}
                    onCheckedChange={setPreloadSamples}
                    disabled={isBusy}
                    aria-label="Preload 2 sample reports"
                  >
                    <SwitchThumb className="jim-switch__thumb" />
                  </Switch>
                </label>

                <button
                  type="submit"
                  className="primary-cta auth-submit"
                  disabled={isBusy || name.trim().length < 2 || !email.includes("@")}
                >
                  <span>{startTrial.isPending ? "Creating your workspace…" : "Start 7-day free trial"}</span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>

                <ul className="auth-perks" aria-label="Trial benefits">
                  <li><Check size={13} aria-hidden="true" />5 full reports</li>
                  <li><Check size={13} aria-hidden="true" />No card required</li>
                  <li><Check size={13} aria-hidden="true" />$24/mo after trial</li>
                </ul>
              </form>
            </TabsPanel>

            <TabsPanel value="signin" className="auth-panel">
              <form
                className="auth-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (isBusy) return;
                  signIn.mutate({ email: signInEmail.trim() });
                }}
              >
                <div className="auth-field">
                  <label className="field-label" htmlFor="signin-email">Workspace email</label>
                  <input
                    id="signin-email"
                    className="text-input"
                    type="email"
                    placeholder="alex@northstar.co"
                    value={signInEmail}
                    onChange={(event) => setSignInEmail(event.target.value)}
                    onFocus={() => setFocusedField("signin-email")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={160}
                    required
                    disabled={isBusy}
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button auth-signin-btn"
                  disabled={isBusy || !signInEmail.includes("@")}
                >
                  <span>{signIn.isPending ? "Opening workspace…" : "Continue to workspace"}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </button>

                {oauthUrl && (
                  <button
                    type="button"
                    className="secondary-action auth-oauth-btn"
                    disabled={isBusy}
                    onClick={() => {
                      window.location.href = oauthUrl;
                    }}
                  >
                    <Sparkles size={15} aria-hidden="true" />
                    <span>Continue with Kimi</span>
                  </button>
                )}

                <p className="auth-note">Prototype sessions persist locally in your browser.</p>
              </form>
            </TabsPanel>
          </Tabs>

          <div className="auth-demo-bar">
            <span>Just testing the prototype?</span>
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => demo.mutate()}
              disabled={isBusy}
            >
              <Play size={13} fill="currentColor" aria-hidden="true" />
              <span>{demo.isPending ? "Opening Jim’s desk…" : "Instant demo workspace"}</span>
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
