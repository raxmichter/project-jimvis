import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, BarChart3, Check, FileText, MessageSquareText, MoveUpRight, Play, Sparkles } from "lucide-react";
import { toast } from "@ui-sdk/react/toast";
import { Jim } from "@/components/Jim";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const prompts = ["Why did growth change?", "Where is churn hiding?", "Which market is next?"];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const reduceMotion = useReducedMotion();
  const [activePrompt, setActivePrompt] = useState(0);
  const demo = trpc.auth.demo.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/app");
    },
    onError: () => toast.error("The demo workspace couldn’t open. Please try again."),
  });

  useEffect(() => {
    if (isAuthenticated) navigate("/app", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setActivePrompt((value) => (value + 1) % prompts.length), 2800);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <main className="landing">
      <header className="landing-header">
        <a className="landing-brand" href="/" aria-label="Jimvis home"><Jim size="tiny" /><span>jimvis</span></a>
        <nav aria-label="Main navigation"><a href="#product">Product</a><a href="#method">How Jim thinks</a><a href="#pricing">Pricing</a></nav>
        <Link className="header-cta" to="/login">Start free<ArrowRight size={15} aria-hidden="true" /></Link>
      </header>

      <section className="hero" id="product">
        <div className="hero-grid" aria-hidden="true" />
        <motion.div className="hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
          <div className="live-label"><span />Meet Jim · your business analyst</div>
          <h1>Your business<br />has a story.<br /><em>Jim finds the plot.</em></h1>
          <p>Turn a plain-English question into a decision-ready business report. Less dashboard archaeology. More “oh, now I get it.”</p>
          <div className="hero-actions">
            <Link to="/login" className="primary-cta">Try Jim free for 7 days<ArrowRight size={18} aria-hidden="true" /></Link>
            <button type="button" className="demo-link" onClick={() => demo.mutate()} disabled={demo.isPending}><Play size={16} fill="currentColor" aria-hidden="true" />{demo.isPending ? "Opening Jim’s desk…" : "Open the live demo"}</button>
          </div>
          <div className="trust-line"><Check size={14} />No card required<Check size={14} />Five full reports<Check size={14} />Export anything</div>
        </motion.div>

        <motion.div className="hero-stage" initial={reduceMotion ? false : { opacity: 0, scale: 0.94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="stage-top"><span>JIM / LIVE ANALYSIS</span><div><i /><i /><i /></div></div>
          <div className="stage-question"><span>YOU</span><p>{prompts[activePrompt]}</p><span className="question-caret" /></div>
          <div className="stage-jim"><Jim size="hero" mood={activePrompt === 1 ? "thinking" : "idle"} /><motion.span key={activePrompt} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>I’m on it.</motion.span></div>
          <div className="stage-report">
            <div className="stage-report__head"><span><FileText size={14} />SIGNAL REPORT</span><span>01 / 03</span></div>
            <strong>{activePrompt === 0 ? "Expansion is carrying the quarter" : activePrompt === 1 ? "Week one changes the curve" : "A focused wedge wins"}</strong>
            <div className="mini-bars" aria-hidden="true">
              {[42, 55, 49, 68, 76, 91].map((height, index) => <motion.i key={index} animate={{ scaleY: height / 100 }} transition={{ delay: index * 0.06 }} style={{ height: `${height}%` }} />)}
            </div>
            <div className="stage-report__foot"><span><Sparkles size={13} />3 insights found</span><MoveUpRight size={16} /></div>
          </div>
          <div className="stage-status"><span className="status-pulse" />Signals connected<span>1.8 sec</span></div>
        </motion.div>
        <div className="hero-ticker" aria-hidden="true"><div>REVENUE <i /> RETENTION <i /> MARKET ENTRY <i /> UNIT ECONOMICS <i /> GROWTH <i /> REVENUE <i /> RETENTION <i /> MARKET ENTRY <i /> UNIT ECONOMICS <i /> GROWTH <i /></div></div>
      </section>

      <section className="method-section" id="method">
        <div className="method-heading"><span className="section-label">A report with a pulse</span><h2>Ask like a human.<br />Read like a decision-maker.</h2></div>
        <div className="method-steps">
          <article><span>01</span><div><h3>Say what’s on your mind</h3><p>No dimensions to configure. No dashboard to decode. Give Jim the question keeping you busy.</p></div><MessageSquareText size={22} /></article>
          <article><span>02</span><div><h3>Watch the thinking unfold</h3><p>Jim frames the problem, maps commercial signals, and builds a brief with visible stages and a little personality.</p></div><Sparkles size={22} /></article>
          <article><span>03</span><div><h3>Leave with a next move</h3><p>Explore the evidence, switch views, save the report, export it, or ask Jim to turn an insight into a plan.</p></div><BarChart3 size={22} /></article>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="pricing-copy"><span className="section-label">Simple by design</span><h2>Less than one<br />unproductive meeting.</h2><p>Start with five complete reports during your seven-day trial. Keep Jim on your team when you’re ready.</p></div>
        <div className="price-panel">
          <span className="price-label">JIMVIS / PRO</span>
          <div className="price"><strong>$24</strong><span>/ month<br />per person</span></div>
          <ul><li><Check size={16} />Unlimited business reports</li><li><Check size={16} />Interactive analysis and actions</li><li><Check size={16} />Saved library and Markdown export</li></ul>
          <Link to="/login" className="primary-cta">Start your free trial<ArrowRight size={18} /></Link>
          <small>Seven days free. Billing is not connected in this prototype.</small>
        </div>
      </section>

      <footer className="landing-footer"><a className="landing-brand" href="/"><Jim size="tiny" /><span>jimvis</span></a><p>Business clarity, with a little more character.</p><span>PROJECT JIMVIS · 2026</span></footer>
    </main>
  );
}

