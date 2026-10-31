"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";

import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  DEFAULTS,
  FEATURES,
  PRICING,
  type DeliveryId,
  type DesignId,
  type FeatureId,
  type PlatformId,
  type ProjectType,
  type ScaleId,
} from "@/config/pricing";
import {
  analyseEstimate,
  calculateEstimate,
  estimateInputFromParams,
  estimateInputToParams,
  findProjectType,
  formatInr,
  validateEstimateInput,
  type EstimateInput,
  type PriceTable,
} from "@/lib/estimate";
import { WHATSAPP_NUMBER } from "@/lib/hire";

import { Analysing } from "./Analysing";
import { EstimatePrint, labelsFor, ProjectReport } from "./ResultCard";
import {
  StepDesign,
  StepDevices,
  StepExtras,
  StepFeatures,
  StepHint,
  StepProjectType,
  StepReview,
  type ReviewRow,
} from "./steps";

// Six requirement steps, then the report. No price is shown before the report.
const STEPS = ["Project", "Platforms", "Features", "Design & scale", "Extras", "Review"] as const;
const REPORT = STEPS.length + 1;
const STORAGE_KEY = "ya-estimate";

type State = {
  step: number;
  type: string | null;
  platforms: PlatformId[];
  features: FeatureId[];
  design: DesignId;
  scale: ScaleId;
  delivery: DeliveryId;
};

const INITIAL: State = {
  step: 1,
  type: null,
  platforms: DEFAULTS.platforms,
  features: [],
  design: DEFAULTS.design,
  scale: DEFAULTS.scale,
  delivery: DEFAULTS.delivery,
};

// Reads a selection from query params (a shared link wins) or, failing that, from storage.
function readSaved(): State | null {
  const fromParams = (params: URLSearchParams): State | null => {
    const input = estimateInputFromParams(params);
    if (!input) return null;
    return { ...input, step: Math.min(REPORT, Math.max(1, Number(params.get("step")) || 1)) };
  };

  const shared = fromParams(new URLSearchParams(window.location.search));
  if (shared) return shared;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? fromParams(new URLSearchParams(stored)) : null;
  } catch {
    return null;
  }
}

function toParams(state: State): string {
  if (!state.type) return "";
  const params = estimateInputToParams({ ...state, type: state.type });
  params.set("step", String(state.step));
  return params.toString();
}

type EstimateWizardProps = { email: string; location: string; site: string; prices: PriceTable };

export function EstimateWizard({ email, location, site, prices }: EstimateWizardProps) {
  const [state, setState] = useState<State>(INITIAL);
  const [restored, setRestored] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [printMeta, setPrintMeta] = useState<{ id: string; date: string } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Restore after mount (the server renders the empty wizard, so hydration always matches).
  useEffect(() => {
    const saved = readSaved();
    const frame = window.requestAnimationFrame(() => {
      if (saved) setState(saved);
      setRestored(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Keep the URL shareable and remember the selection on this device.
  useEffect(() => {
    if (!restored) return;
    const query = toParams(state);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
    try {
      if (query) window.localStorage.setItem(STORAGE_KEY, query);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be blocked; the URL still carries the selection.
    }
  }, [state, restored]);

  const type = state.type ? findProjectType(state.type) : undefined;
  const input: EstimateInput | null = state.type
    ? {
        type: state.type,
        platforms: state.platforms,
        features: state.features,
        design: state.design,
        scale: state.scale,
        delivery: state.delivery,
      }
    : null;
  const problem = validateEstimateInput(input ?? {});
  const estimate = input && !problem ? calculateEstimate(input, prices) : null;
  const analysis = input && estimate ? analyseEstimate(input, estimate) : null;
  const labels = input ? labelsFor(input) : null;

  // Which steps are done enough to move past (and to jump back to).
  const stepValid = (step: number) => {
    if (step === 1) return Boolean(type);
    return Boolean(estimate);
  };
  const hint =
    state.step === 1 && !type
      ? "Choose a project type to continue."
      : state.step === 2 && problem
        ? problem
        : null;

  const scrollToPanel = useCallback(() => {
    window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }, []);

  function go(step: number) {
    setAnalysing(false);
    setState((current) => ({ ...current, step }));
    // Move focus to the new step's panel, so keyboard and screen-reader users land on it.
    scrollToPanel();
  }

  const finishAnalysis = useCallback(() => {
    setAnalysing(false);
    setState((current) => ({ ...current, step: REPORT }));
    scrollToPanel();
  }, [scrollToPanel]);

  function analyse() {
    setAnalysing(true);
    scrollToPanel();
  }

  function chooseType(next: ProjectType) {
    setState((current) => {
      if (current.type === next.id) return current;
      // Keep the extra services already chosen; the features start from the new recommendation.
      const services = current.features.filter(
        (id) => FEATURES.find((feature) => feature.id === id)?.group === "services",
      );
      return { ...current, type: next.id, features: [...next.recommended, ...services] };
    });
  }

  function startOver() {
    setAnalysing(false);
    setState(INITIAL);
    window.requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }

  function print() {
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    setPrintMeta({
      id: `EST-${stamp}-${suffix}`,
      date: now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    });
    window.setTimeout(() => window.print(), 50);
  }

  const reviewRows: ReviewRow[] =
    type && labels
      ? [
          { label: "Project", value: type.label, step: 1 },
          { label: "Platforms", value: labels.devices.join(", ") || "—", step: 2 },
          { label: "Features", value: labels.features.join(", ") || "None selected", step: 3 },
          { label: "Design", value: labels.design, step: 4 },
          { label: "Expected users", value: labels.scale, step: 4 },
          { label: "Delivery", value: labels.delivery, step: 4 },
          { label: "Extra services", value: labels.services.join(", ") || "None", step: 5 },
        ]
      : [];

  const onReport = state.step === REPORT && !analysing;
  const announce =
    onReport && estimate
      ? `Approximate estimate ${formatInr(estimate.low)} to ${formatInr(estimate.high)}, ${estimate.weeksMin} to ${estimate.weeksMax} weeks.`
      : "";
  const whatsappDisplay = WHATSAPP_NUMBER
    ? `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}`
    : null;
  const progressStep = onReport ? STEPS.length : Math.min(state.step - 1, STEPS.length);
  const checklist = [
    { label: "Project", value: type?.label, step: 1 },
    { label: "Platforms", value: labels?.devices.join(", "), step: 2 },
    {
      label: "Features",
      value: labels ? `${labels.features.length} selected` : undefined,
      step: 3,
    },
    {
      label: "Design & scale",
      value: labels ? `${labels.design} · ${labels.delivery}` : undefined,
      step: 4,
    },
    {
      label: "Extras",
      value: labels
        ? labels.services.length
          ? `${labels.services.length} added`
          : "None"
        : undefined,
      step: 5,
    },
  ];

  // Share of the requirement steps completed, for the rail, the ring and the phone bar.
  const progress = progressStep / STEPS.length;
  const ringLength = 2 * Math.PI * 22;
  const scope = [
    { label: "Platforms", value: input ? input.platforms.length : 0 },
    { label: "Features", value: labels ? labels.features.length : 0 },
    { label: "Extras", value: labels ? labels.services.length : 0 },
  ];

  // The cards' soft light follows the pointer.
  function spotlight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const card = (event.target as HTMLElement).closest<HTMLElement>(".est-card, .est-chip");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  const backButton = (size: "md" | "sm") =>
    state.step > 1 ? (
      <button
        type="button"
        onClick={() => go(state.step - 1)}
        aria-label={size === "sm" ? "Back" : undefined}
        className={buttonClassName("line", size, size === "sm" ? "px-3" : undefined)}
      >
        <Icon name="arrow-right" size={16} className="rotate-180" />
        {size === "md" ? "Back" : null}
      </button>
    ) : null;

  return (
    <>
      <div className="estimate print:hidden" onPointerMove={spotlight}>
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>

        {/* Progress */}
        <nav aria-label="Calculator steps" className="est-stepper mb-6">
          <div className="relative" style={{ "--progress": progress } as CSSProperties}>
            <span aria-hidden="true" className="est-rail" />
            <span aria-hidden="true" className="est-rail-fill" />
            <ol>
              {[...STEPS, "Report"].map((label, index) => {
                const step = index + 1;
                const reachable =
                  step === 1 || (step === REPORT ? stepValid(REPORT) : stepValid(step - 1));
                const done = step < state.step || (onReport && step < REPORT);
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => (step === REPORT ? analyse() : go(step))}
                      disabled={!reachable || (step === state.step && !analysing)}
                      aria-current={step === state.step ? "step" : undefined}
                      className="est-step-link"
                      data-done={done}
                    >
                      <span className="est-node">
                        {done ? (
                          <Icon name="check" size={13} />
                        ) : step === REPORT ? (
                          <Icon name="sparkle" size={13} />
                        ) : (
                          step
                        )}
                      </span>
                      <span className="max-md:sr-only">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>

        <div
          className={
            onReport || analysing
              ? "flex flex-col"
              : "grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
          }
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            aria-label={
              onReport
                ? "Your project report"
                : `Step ${Math.min(state.step, STEPS.length)} of ${STEPS.length}: ${STEPS[Math.min(state.step, STEPS.length) - 1]}`
            }
            className={`min-w-0 scroll-mt-28 outline-none ${onReport || analysing ? "" : "est-stage"}`}
          >
            <div key={analysing ? "analysing" : state.step} className="est-panel">
              {analysing ? <Analysing onDone={finishAnalysis} /> : null}
              {!analysing && state.step === 1 ? (
                <StepProjectType value={state.type} onChange={chooseType} />
              ) : null}
              {!analysing && state.step === 2 ? (
                <StepDevices
                  value={state.platforms}
                  onChange={(platforms) => setState((current) => ({ ...current, platforms }))}
                />
              ) : null}
              {!analysing && state.step === 3 ? (
                <StepFeatures
                  value={state.features}
                  recommended={type?.recommended ?? []}
                  onChange={(features) => setState((current) => ({ ...current, features }))}
                />
              ) : null}
              {!analysing && state.step === 4 ? (
                <StepDesign
                  design={state.design}
                  scale={state.scale}
                  delivery={state.delivery}
                  onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
                />
              ) : null}
              {!analysing && state.step === 5 ? (
                <StepExtras
                  value={state.features}
                  onChange={(features) => setState((current) => ({ ...current, features }))}
                />
              ) : null}
              {!analysing && state.step === 6 && estimate ? (
                <StepReview rows={reviewRows} onEdit={go} onAnalyse={analyse} />
              ) : null}
              {onReport && estimate && analysis && type && input ? (
                <ProjectReport
                  estimate={estimate}
                  analysis={analysis}
                  input={input}
                  type={type}
                  onEdit={() => go(6)}
                  onPrint={print}
                />
              ) : null}
              {!analysing && state.step >= 6 && !estimate ? (
                <StepHint>Choose a project type and at least one platform first.</StepHint>
              ) : null}
            </div>

            {!onReport && !analysing ? (
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6 max-lg:hidden">
                {backButton("md")}
                {state.step < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => go(state.step + 1)}
                    disabled={!stepValid(state.step)}
                    className={buttonClassName("accent", "md")}
                  >
                    {state.step === 5 ? "Review" : "Continue"}
                    <Icon name="arrow-right" size={16} />
                  </button>
                ) : null}
                {hint ? <StepHint>{hint}</StepHint> : null}
                {state.type ? (
                  <button
                    type="button"
                    onClick={startOver}
                    className="ml-auto min-h-11 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    Start over
                  </button>
                ) : null}
              </div>
            ) : null}
            {onReport ? (
              <button
                type="button"
                onClick={startOver}
                className="mt-6 min-h-11 self-start text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
              >
                Start a new estimate
              </button>
            ) : null}
          </div>

          {/* Requirements so far: a sticky "live blueprint" on desktop. No price until the report. */}
          {!onReport && !analysing ? (
            <aside aria-label="Your requirements" className="est-summary max-lg:hidden">
              <div className="flex items-center gap-4">
                <span className="est-ring" aria-hidden="true">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle className="est-ring-track" cx="28" cy="28" r="22" strokeWidth="4" />
                    <circle
                      className="est-ring-value"
                      cx="28"
                      cy="28"
                      r="22"
                      strokeWidth="4"
                      strokeDasharray={ringLength}
                      strokeDashoffset={ringLength * (1 - progress)}
                    />
                  </svg>
                  <span className="est-ring-label text-sm">{Math.round(progress * 100)}%</span>
                </span>
                <span className="flex flex-col">
                  <span className="label-mono text-c1-text">Live blueprint</span>
                  <span className="font-display text-lg font-semibold text-fg">
                    {type?.label ?? "Your project"}
                  </span>
                </span>
              </div>

              <ol className="est-timeline">
                {checklist.map((item) => {
                  const done = state.step > item.step && Boolean(item.value);
                  const active = state.step === item.step;
                  return (
                    <li key={item.label} className="relative flex gap-3">
                      <span className="est-stage-dot mt-0.5" data-done={done} data-active={active}>
                        {done ? <Icon name="check" size={11} /> : null}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span
                          className={`text-sm font-semibold ${done || active ? "text-fg" : "text-faint"}`}
                        >
                          {item.label}
                        </span>
                        <span className="truncate text-sm text-muted">
                          {done ? item.value : active ? "In progress…" : "—"}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div className="est-scope">
                {scope.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span className="label-mono text-faint">{item.label}</span>
                  </div>
                ))}
              </div>

              {prices.cap > 0 ? (
                <div className="est-offer">
                  <Icon name="sparkle" size={18} className="mt-0.5 flex-none" />
                  <span className="flex flex-col gap-0.5 text-sm">
                    <span className="font-semibold">Launch pricing</span>
                    <span className="opacity-85">
                      No build goes above {formatInr(prices.cap)}, whatever the scope.
                    </span>
                  </span>
                </div>
              ) : null}
              <p className="inline-flex w-fit items-center gap-2 text-xs text-muted">
                <Icon name="shield" size={13} />
                Cost, timeline and stack appear after the analysis · {PRICING.supportMonths} months
                support free
              </p>
            </aside>
          ) : null}
        </div>

        {/* Navigation: a sticky bar on phones and tablets */}
        {!onReport && !analysing ? (
          <div className="est-bar lg:hidden">
            <span
              aria-hidden="true"
              className="est-bar-progress"
              style={{ width: `${progress * 100}%` }}
            />
            <div className="min-w-0">
              <p className="label-mono text-faint">
                Step {Math.min(state.step, STEPS.length)} of {STEPS.length}
              </p>
              <p className="truncate font-display text-base font-semibold text-fg">
                {STEPS[Math.min(state.step, STEPS.length) - 1]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {backButton("sm")}
              {state.step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => go(state.step + 1)}
                  disabled={!stepValid(state.step)}
                  className={buttonClassName("accent", "sm")}
                >
                  {state.step === 5 ? "Review" : "Next"}
                  <Icon name="arrow-right" size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={analyse}
                  disabled={!estimate}
                  className={buttonClassName("accent", "sm")}
                >
                  <Icon name="sparkle" size={16} />
                  Analyse
                </button>
              )}
            </div>
            {hint ? <StepHint className="basis-full text-xs">{hint}</StepHint> : null}
          </div>
        ) : null}
      </div>

      {estimate && analysis && type && input ? (
        <EstimatePrint
          estimate={estimate}
          analysis={analysis}
          input={input}
          type={type}
          meta={printMeta}
          contact={{ email, location, whatsapp: whatsappDisplay, site }}
        />
      ) : null}
    </>
  );
}
