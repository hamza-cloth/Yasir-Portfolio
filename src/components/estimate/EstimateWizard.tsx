"use client";

import { useEffect, useRef, useState } from "react";

import { buttonClassName } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  DEFAULTS,
  PLATFORMS,
  PRICING,
  type DeliveryId,
  type DesignId,
  type FeatureId,
  type PlatformId,
  type ProjectType,
  type ScaleId,
} from "@/config/pricing";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import {
  calculateEstimate,
  estimateInputFromParams,
  estimateInputToParams,
  findProjectType,
  formatInr,
  validateEstimateInput,
  type EstimateInput,
} from "@/lib/estimate";
import { WHATSAPP_NUMBER } from "@/lib/hire";

import { EstimatePrint, ResultCard } from "./ResultCard";
import { StepDesign, StepDevices, StepFeatures, StepHint, StepProjectType } from "./steps";

const STEPS = ["Project Type", "Devices", "Features", "Design & Scale", "Your Estimate"] as const;
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
    return { ...input, step: Math.min(5, Math.max(1, Number(params.get("step")) || 1)) };
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

type EstimateWizardProps = { email: string; location: string; site: string };

export function EstimateWizard({ email, location, site }: EstimateWizardProps) {
  const [state, setState] = useState<State>(INITIAL);
  const [restored, setRestored] = useState(false);
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
  const estimate = input && !problem ? calculateEstimate(input) : null;

  const low = useAnimatedNumber(estimate?.low ?? 0);
  const high = useAnimatedNumber(estimate?.high ?? 0);

  // Which steps are done enough to move past (and to jump back to).
  const stepValid = (step: number) => {
    if (step === 1) return Boolean(type);
    if (step === 2) return Boolean(type) && !problem;
    return Boolean(estimate);
  };
  const hint =
    state.step === 1 && !type
      ? "Choose a project type to continue."
      : state.step === 2 && problem
        ? problem
        : null;

  function go(step: number) {
    setState((current) => ({ ...current, step }));
    // Move focus to the new step's panel, so keyboard and screen-reader users land on it.
    window.requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
      panelRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  function chooseType(next: ProjectType) {
    setState((current) =>
      current.type === next.id
        ? current
        : { ...current, type: next.id, features: [...next.recommended] },
    );
  }

  function startOver() {
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

  const range = estimate ? `${formatInr(low)} – ${formatInr(high)}` : "—";
  const announce = estimate
    ? `Approximate estimate ${formatInr(estimate.low)} to ${formatInr(estimate.high)}, ${estimate.weeksMin} to ${estimate.weeksMax} weeks.`
    : "";
  const whatsappDisplay = WHATSAPP_NUMBER
    ? `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 7)} ${WHATSAPP_NUMBER.slice(7)}`
    : null;

  return (
    <>
      <div className="estimate print:hidden">
        <p aria-live="polite" className="sr-only">
          {announce}
        </p>

        {/* Progress */}
        <nav aria-label="Calculator steps" className="mb-8">
          <div className="est-progress" aria-hidden="true">
            <span style={{ width: `${((state.step - 1) / (STEPS.length - 1)) * 100}%` }} />
          </div>
          <ol className="mt-4 grid grid-cols-5 gap-2">
            {STEPS.map((label, index) => {
              const step = index + 1;
              const reachable = step === 1 || stepValid(step - 1);
              return (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => go(step)}
                    disabled={!reachable || step === state.step}
                    aria-current={step === state.step ? "step" : undefined}
                    className="est-step-link"
                    data-done={step < state.step}
                  >
                    <span className="font-mono">{step}</span>
                    <span className="max-sm:sr-only">{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div
            ref={panelRef}
            tabIndex={-1}
            aria-label={`Step ${state.step} of ${STEPS.length}: ${STEPS[state.step - 1]}`}
            className="scroll-mt-28 outline-none"
          >
            <div key={state.step} className="est-panel">
              {state.step === 1 ? (
                <StepProjectType value={state.type} onChange={chooseType} />
              ) : null}
              {state.step === 2 ? (
                <StepDevices
                  value={state.platforms}
                  onChange={(platforms) => setState((current) => ({ ...current, platforms }))}
                />
              ) : null}
              {state.step === 3 ? (
                <StepFeatures
                  value={state.features}
                  recommended={type?.recommended ?? []}
                  onChange={(features) => setState((current) => ({ ...current, features }))}
                />
              ) : null}
              {state.step === 4 ? (
                <StepDesign
                  design={state.design}
                  scale={state.scale}
                  delivery={state.delivery}
                  onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
                />
              ) : null}
              {state.step === 5 && estimate && type && input ? (
                <ResultCard
                  estimate={estimate}
                  input={input}
                  type={type}
                  onEdit={go}
                  onPrint={print}
                />
              ) : null}
              {state.step === 5 && !estimate ? (
                <StepHint>Choose a project type and at least one device first.</StepHint>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6 max-lg:hidden">
              {state.step > 1 ? (
                <button
                  type="button"
                  onClick={() => go(state.step - 1)}
                  className={buttonClassName("line", "md")}
                >
                  <Icon name="arrow-right" size={16} className="rotate-180" />
                  Back
                </button>
              ) : null}
              {state.step < STEPS.length ? (
                <button
                  type="button"
                  onClick={() => go(state.step + 1)}
                  disabled={!stepValid(state.step)}
                  className={buttonClassName("accent", "md")}
                >
                  {state.step === 4 ? "See my estimate" : "Next"}
                  <Icon name="arrow-right" size={16} />
                </button>
              ) : null}
              {hint ? <StepHint>{hint}</StepHint> : null}
              {state.type ? (
                <button
                  type="button"
                  onClick={startOver}
                  className="ml-auto text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
                >
                  Start over
                </button>
              ) : null}
            </div>
          </div>

          {/* Live summary: a sticky sidebar on desktop */}
          <aside aria-label="Live estimate" className="est-summary max-lg:hidden">
            <p className="label-mono text-faint">Approx. estimate</p>
            <p className="font-display text-[1.6rem] leading-tight font-semibold text-c1-text">
              {range}
            </p>
            <p className="text-sm text-muted">
              {estimate
                ? `Approx. ${estimate.weeksMin} – ${estimate.weeksMax} weeks`
                : "Choose a project type to start."}
            </p>
            <p className="mt-1 inline-flex w-fit items-center gap-2 rounded-pill border border-c1 px-3 py-1 text-xs font-semibold text-c1-text">
              <Icon name="shield" size={13} />
              {PRICING.supportMonths} months support free
            </p>
            {type ? (
              <dl className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-sm">
                <div>
                  <dt className="label-mono text-faint">Project</dt>
                  <dd className="text-fg">{type.label}</dd>
                </div>
                <div>
                  <dt className="label-mono text-faint">Devices</dt>
                  <dd className="text-fg">
                    {PLATFORMS.filter((item) => state.platforms.includes(item.id))
                      .map((item) => item.label)
                      .join(", ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="label-mono text-faint">Features</dt>
                  <dd className="text-fg">{state.features.length} selected</dd>
                </div>
              </dl>
            ) : null}
          </aside>
        </div>

        {/* Live summary and navigation: a sticky bar on phones and tablets */}
        <div className="est-bar lg:hidden">
          <div className="min-w-0">
            <p className="label-mono text-faint">Approx.</p>
            <p className="truncate font-display text-base font-semibold text-c1-text sm:text-lg">
              {range}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {state.step > 1 ? (
              <button
                type="button"
                onClick={() => go(state.step - 1)}
                aria-label="Back"
                className={buttonClassName("line", "sm", "px-3")}
              >
                <Icon name="arrow-right" size={16} className="rotate-180" />
              </button>
            ) : null}
            {state.step < STEPS.length ? (
              <button
                type="button"
                onClick={() => go(state.step + 1)}
                disabled={!stepValid(state.step)}
                className={buttonClassName("accent", "sm")}
              >
                {state.step === 4 ? "Estimate" : "Next"}
                <Icon name="arrow-right" size={16} />
              </button>
            ) : (
              <button type="button" onClick={startOver} className={buttonClassName("line", "sm")}>
                Start over
              </button>
            )}
          </div>
          {hint ? <StepHint className="basis-full text-xs">{hint}</StepHint> : null}
        </div>
      </div>

      {estimate && type && input ? (
        <EstimatePrint
          estimate={estimate}
          input={input}
          type={type}
          meta={printMeta}
          contact={{ email, location, whatsapp: whatsappDisplay, site }}
        />
      ) : null}
    </>
  );
}
