import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BookOpen, Boxes, BrainCircuit, Bug, CheckCircle2, ChevronDown,
  CircleDot, ExternalLink, Github, GitFork, Layers3, Library, Menu, Network,
  Play, Search, ShieldCheck, Sparkles, Waypoints, X, Zap,
} from "lucide-react";
import { routes } from "@/app/routes/routes";

const features = [
  { icon: Waypoints, title: "Journey Explorer", text: "Follow one question from first prompt to grounded answer, stage by stage.", to: routes.journey.path, action: "Start the journey", tone: "cyan" },
  { icon: Boxes, title: "Architecture Explorer", text: "See how modules, files, services, and data flow fit together.", to: routes.architecture.path, action: "Explore the system", tone: "violet" },
  { icon: Library, title: "Function Gallery", text: "Study the purpose, inputs, outputs, and relationships of every key function.", to: routes.functions.path, action: "Browse functions", tone: "amber" },
  { icon: Bug, title: "Execution Debugger", text: "Step through a recorded trace and inspect variables, evidence, and graph state.", to: routes.debugger.path, action: "Open debugger", tone: "rose" },
  { icon: Network, title: "Graph Playground", text: "Experiment with graph expansion and build intuition for multi-hop paths.", to: routes.playground.path, action: "Try the playground", tone: "emerald" },
] as const;

const pipeline = [
  ["Question", "The problem we want to solve"], ["Self Consistency", "Check whether model answers agree"],
  ["Topic Pruning", "Keep useful starting entities"], ["Wikipedia Retrieval", "Collect readable source evidence"],
  ["Graph Expansion", "Follow promising relations"], ["Evidence Ranking", "Surface the strongest passages"],
  ["Reasoning", "Judge whether evidence is sufficient"], ["Answer", "Return a grounded response"],
] as const;

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const year = new Date().getFullYear();
  return (
    <div className="landing min-h-screen bg-[#07111f] text-slate-100">
      <header className="landing-nav">
        <Link to="/" className="flex items-center gap-3 font-bold tracking-tight" aria-label="TOG-2 Visualizer home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 text-[#07111f]"><Network size={20}/></span>
          <span>TOG-2 <span className="text-cyan-300">Visualizer</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex" aria-label="Landing page">
          <a href="#about">What is TOG?</a><a href="#features">Explore</a><a href="#learning">Learning path</a>
          <Link to={routes.journey.path} className="landing-button landing-button-sm">Start learning <ArrowRight size={15}/></Link>
        </nav>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X/> : <Menu/>}</button>
        {menuOpen && <div className="absolute inset-x-4 top-16 rounded-2xl border border-white/10 bg-[#0c192b] p-4 shadow-2xl md:hidden"><a onClick={()=>setMenuOpen(false)} className="block p-3" href="#about">What is TOG?</a><a onClick={()=>setMenuOpen(false)} className="block p-3" href="#features">Explore</a><a onClick={()=>setMenuOpen(false)} className="block p-3" href="#learning">Learning path</a><Link className="mt-2 flex p-3 text-cyan-300" to={routes.journey.path}>Start learning <ArrowRight className="ml-2" size={18}/></Link></div>}
      </header>

      <main>
        <section className="landing-hero landing-section">
          <div className="relative z-10 max-w-3xl">
            <div className="landing-kicker"><Sparkles size={15}/> Learn graph reasoning by seeing it</div>
            <h1>TOG-2 <span>Visualizer</span></h1>
            <p className="mt-5 text-xl font-medium text-slate-200 md:text-2xl">Interactive Learning Platform for Think-on-Graph 2.0</p>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">Explore graph reasoning, retrieval pipelines, and execution flow through interactive visualizations.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={routes.journey.path} className="landing-button"><Play size={17} fill="currentColor"/> Start Learning</Link>
              <Link to={routes.architecture.path} className="landing-button landing-button-secondary"><Boxes size={18}/> Explore Architecture</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400"><span className="flex gap-2"><CheckCircle2 className="text-cyan-400" size={17}/>No setup required</span><span className="flex gap-2"><CheckCircle2 className="text-cyan-400" size={17}/>Explore at your pace</span><span className="flex gap-2"><CheckCircle2 className="text-cyan-400" size={17}/>Built from the source</span></div>
          </div>
          <div className="hero-visual" aria-label="Illustration of a question moving through a knowledge graph">
            <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
            <div className="hero-node hero-node-main"><BrainCircuit size={38}/><small>Reason</small></div>
            <div className="hero-node node-a"><Search/><small>Retrieve</small></div><div className="hero-node node-b"><CircleDot/><small>Question</small></div><div className="hero-node node-c"><CheckCircle2/><small>Answer</small></div>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500"><path d="M95 245 C165 110 260 175 375 105 M95 245 C190 345 285 285 410 375 M250 245 C310 210 340 180 375 105" fill="none" stroke="rgba(34,211,238,.3)" strokeWidth="2" strokeDasharray="7 8"/></svg>
          </div>
        </section>

        <section id="about" className="landing-section landing-light text-slate-900">
          <SectionHeading eyebrow="Start with the idea" title="What is Think-on-Graph?" text="TOG turns a difficult question into a guided journey through connected knowledge. Instead of relying on memory alone, it searches, gathers evidence, and reasons over what it finds." />
          <div className="concept-flow">
            {[[CircleDot,"Question","Begin with a question that may need several facts."],[Network,"Knowledge Graph","Find entities and the relationships between them."],[BrainCircuit,"Reasoning","Compare paths and evidence to connect the clues."],[CheckCircle2,"Answer","Produce an answer grounded in retrieved knowledge."]].map(([Icon,title,text],i)=><div className="contents" key={String(title)}><article className="concept-card"><span className="concept-number">0{i+1}</span><Icon className="text-cyan-600" size={28}/><h3>{String(title)}</h3><p>{String(text)}</p></article>{i<3&&<ArrowRight className="concept-arrow"/>}</div>)}
          </div>
          <div className="mt-10 rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-sm leading-7 text-slate-700 md:flex md:items-center md:gap-4"><span className="mb-3 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-600 text-white md:mb-0"><BookOpen size={20}/></span><p><strong className="text-slate-900">Think of it like research with a map.</strong> The graph suggests where to look next; retrieved passages provide evidence; reasoning decides when there is enough to answer.</p></div>
        </section>

        <section id="features" className="landing-section">
          <SectionHeading eyebrow="Five ways to explore" title="A learning lab, not a slide deck" text="Move from the big picture to individual functions, then inspect execution and experiment with graph behavior yourself." dark />
          <div className="feature-grid">{features.map(({icon:Icon,title,text,to,action,tone})=><article key={title} className={`feature-card feature-${tone}`}><div className="feature-icon"><Icon/></div><h3>{title}</h3><p>{text}</p><Link to={to}>{action}<ArrowRight size={16}/></Link></article>)}</div>
        </section>

        <section className="landing-section landing-light text-slate-900">
          <SectionHeading eyebrow="The complete pipeline" title="How TOG-2 works" text="Select a stage to see the role it plays. Each step narrows uncertainty until the system can form an evidence-backed answer." />
          <div className="pipeline-layout">
            <div className="pipeline-list">{pipeline.map(([name,desc],i)=><button key={name} onClick={()=>setActiveStage(i)} className={activeStage===i?"active":""}><span>{i+1}</span><span><strong>{name}</strong><small>{desc}</small></span><ChevronDown size={17}/></button>)}</div>
            <div className="pipeline-detail"><div className="pipeline-pulse"><span>{activeStage+1}</span></div><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700">Stage {activeStage+1} of {pipeline.length}</p><h3>{pipeline[activeStage][0]}</h3><p>{pipeline[activeStage][1]}. This stage connects <strong>{activeStage===0?"the learner's intent":pipeline[activeStage-1][0]}</strong> to <strong>{activeStage===pipeline.length-1?"a verifiable result":pipeline[activeStage+1][0]}</strong>.</p><Link to={routes.journey.path}>See it in the Journey Explorer <ArrowRight size={16}/></Link></div>
          </div>
        </section>

        <section className="landing-section why-section">
          <SectionHeading eyebrow="Why graphs?" title="Reasoning that can show its work" text="Graph structure gives retrieval a direction and gives learners a visible trail from question to evidence." dark />
          <div className="why-grid">{[[GitFork,"Multi-hop reasoning","Connect facts across multiple entities instead of searching for one matching sentence."],[ShieldCheck,"Hallucination reduction","Use retrieved evidence to constrain what the model can confidently claim."],[CircleDot,"Knowledge grounding","Anchor abstract language to explicit entities, relations, and source passages."],[Search,"Evidence retrieval","Rank useful documents and sentences before they enter the reasoning context."]].map(([Icon,title,text])=><article key={String(title)}><Icon/><h3>{String(title)}</h3><p>{String(text)}</p></article>)}</div>
        </section>

        <section id="learning" className="landing-section landing-light text-slate-900">
          <SectionHeading eyebrow="Recommended learning path" title="From orientation to experimentation" text="New to TOG-2? Follow this sequence. Each stop builds the mental model needed for the next." />
          <div className="roadmap">{features.map(({icon:Icon,title,text,to},i)=><Link to={to} key={title} className="roadmap-step"><span className="roadmap-index">{i+1}</span><span className="roadmap-icon"><Icon/></span><span><small>{i===0?"Begin here":`Then explore`}</small><strong>{title.replace(" Explorer","").replace(" Gallery","").replace("Execution ","").replace("Graph ","")}</strong><em>{text}</em></span><ArrowRight className="roadmap-arrow"/></Link>)}</div>
        </section>

        <section className="landing-section stats-section"><div><p className="landing-eyebrow">Mapped from the TOG-2 codebase</p><h2>One system, made understandable.</h2></div><div className="stats-grid">{[["9","Pipeline stages"],["23","Core functions"],["8","Modules & data"],["4","External services"],["5","Learning pages"]].map(([n,l])=><div key={l}><strong>{n}</strong><span>{l}</span></div>)}</div></section>
        <section className="landing-cta"><div><span><Zap size={16}/> Ready when you are</span><h2>See the reasoning journey unfold.</h2><p>Start with a guided question, then explore every decision behind the answer.</p></div><Link to={routes.journey.path} className="landing-button">Start Learning <ArrowRight size={17}/></Link></section>
      </main>
      <footer className="landing-footer"><div className="footer-brand"><Network/><div><strong>TOG-2 Visualizer</strong><p>An educational interface for understanding graph-based reasoning and retrieval.</p></div></div><div><strong>Project</strong><a href="#about">About the project</a><span>Thesis information — coming soon</span></div><div><strong>Explore</strong><Link to={routes.architecture.path}>Architecture</Link><Link to={routes.functions.path}>Functions</Link><Link to={routes.playground.path}>Playground</Link></div><div><strong>Resources</strong><span className="flex items-center gap-2"><Github size={15}/> GitHub — coming soon</span><span className="flex items-center gap-2"><ExternalLink size={15}/> Future roadmap</span></div><p className="footer-copy">© {year} TOG-2 Visualizer · Built for learning, research, and curiosity.</p></footer>
    </div>
  );
}

function SectionHeading({eyebrow,title,text,dark=false}:{eyebrow:string;title:string;text:string;dark?:boolean}) { return <div className="section-heading"><p className="landing-eyebrow">{eyebrow}</p><h2 className={dark?"text-white":"text-slate-950"}>{title}</h2><p className={dark?"text-slate-400":"text-slate-600"}>{text}</p></div> }
