"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, School, Phone, GraduationCap, Shuffle, ChevronRight, MapPin, Lock, Delete } from "lucide-react";
import { useStudent, DEMO_PRESETS, Language } from "@/lib/student-context";
import Image from "next/image";

const LANGUAGES: Language[] = ["English", "Hindi", "Marathi", "Punjabi", "Kannada"];

const CITY_LOGOS = [
  { city: "Mumbai", src: "/logo/Mumbai.png" },
  { city: "Delhi", src: "/logo/Delhi.png" },
  { city: "Bangalore", src: "/logo/Banglore.png" },
  { city: "Chennai", src: "/logo/Chennai.png" },
  { city: "Kolkata", src: "/logo/Kolkata.png" },
  { city: "Pune", src: "/logo/Pune.png" },
  { city: "Jaipur", src: "/logo/Jaipur.png" },
  { city: "Ahmedabad", src: "/logo/Ahemdabad.png" },
];

const DEMO_PIN = process.env.NEXT_PUBLIC_DEMO_PIN ?? "1302";

type Screen = "lock" | "logo" | "profile" | "welcome";

export default function DemoPage() {
  const { updateStudent } = useStudent();
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("lock");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = DEMO_PRESETS[presetIndex];
  const [name, setName] = useState(preset.name);
  const [school, setSchool] = useState(preset.school);
  const [studentClass, setStudentClass] = useState(preset.class);
  const [phone, setPhone] = useState(preset.phone);
  const [language, setLanguage] = useState<Language>(preset.language);

  const shuffle = () => {
    const next = (presetIndex + 1) % DEMO_PRESETS.length;
    setPresetIndex(next);
    const p = DEMO_PRESETS[next];
    setName(p.name);
    setSchool(p.school);
    setStudentClass(p.class);
    setPhone(p.phone);
    setLanguage(p.language);
  };

  const canStart = name.trim().length > 0 && school.trim().length > 0 && phone.trim().length > 0;

  const submitPin = (value: string) => {
    if (value === DEMO_PIN) {
      setPinError(false);
      setScreen("logo");
    } else {
      setPinError(true);
      setPin("");
    }
  };

  const pushDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setPinError(false);
    if (next.length === 4) submitPin(next);
  };

  const popDigit = () => {
    setPin(p => p.slice(0, -1));
    setPinError(false);
  };

  const startDemo = () => {
    updateStudent({
      name: name.trim(),
      school: school.trim(),
      class: studentClass.trim(),
      phone: phone.trim(),
      language,
      demoFilled: true,
      cityLogo: selectedLogo ?? undefined,
      city: selectedCity ?? undefined,
    });
    router.push("/onboarding");
  };

  if (screen === "lock") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--bg)" }}>
        <div className="card-float p-6 w-full max-w-xs flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
            <Lock size={22} strokeWidth={2.4} />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="font-display font-extrabold text-xl" style={{ color: "var(--text-main)" }}>Enter PIN</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>This demo is locked. Enter the 4-digit PIN to continue.</p>
          </div>

          <input
            value={pin}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(digits);
              setPinError(false);
              if (digits.length === 4) submitPin(digits);
            }}
            type="tel"
            inputMode="numeric"
            autoFocus
            maxLength={4}
            className="field-input text-center tracking-[0.6em] text-lg font-bold w-full"
            placeholder="••••"
            style={{ borderColor: pinError ? "#E0524C" : undefined }}
          />
          {pinError && (
            <p className="text-xs font-semibold -mt-3" style={{ color: "#E0524C" }}>Incorrect PIN, try again.</p>
          )}

          <div className="grid grid-cols-3 gap-2 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => (
              <button
                key={d}
                onClick={() => pushDigit(d)}
                className="btn-secondary py-3 text-base font-bold"
                type="button"
              >
                {d}
              </button>
            ))}
            <button onClick={popDigit} className="btn-secondary py-3 flex items-center justify-center" type="button" aria-label="Delete">
              <Delete size={16} strokeWidth={2.4} />
            </button>
            <button onClick={() => pushDigit("0")} className="btn-secondary py-3 text-base font-bold" type="button">
              0
            </button>
            <button onClick={() => submitPin(pin)} className="btn-primary py-3 flex items-center justify-center" type="button" aria-label="Submit">
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "logo") {
    return (
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <div
          className="hidden lg:flex flex-col justify-between p-12 shrink-0 relative overflow-hidden"
          style={{ width: "420px", background: "var(--lavender)", borderRight: "1px solid var(--border-soft)" }}
        >
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: "var(--lavender-strong)" }}>
              <span className="font-display font-extrabold text-base tracking-tight text-white">TAP</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl leading-tight" style={{ color: "var(--lavender-strong)" }}>
              Choose your<br />city
            </h1>
            <p className="text-base mt-4 leading-relaxed" style={{ color: "var(--lavender-strong)", opacity: 0.75 }}>
              Each city has its own TAP chapter. Pick the one that's yours.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 z-0 pointer-events-none select-none" style={{ width: "260px" }}>
            <img src="/assets/welcome.png" alt="" className="w-full object-contain object-bottom" draggable={false} />
          </div>
        </div>
        <div className="flex flex-col flex-1 px-6 lg:px-16 py-10 overflow-y-auto">
          <div className="flex flex-col gap-1 mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
                <span className="font-display font-extrabold text-sm tracking-tight">TAP</span>
              </div>
            </div>
            <h2 className="font-display font-extrabold text-2xl" style={{ color: "var(--text-main)" }}>Choose your city</h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select the logo that represents your TAP chapter.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 max-w-2xl">
            {CITY_LOGOS.map(({ city, src }) => {
              const isSelected = selectedLogo === src;
              return (
                <button
                  key={city}
                  onClick={() => { setSelectedLogo(src); setSelectedCity(city); }}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all"
                  style={{
                    background: isSelected ? "var(--lavender)" : "var(--white)",
                    border: `2px solid ${isSelected ? "var(--lavender-strong)" : "var(--border-soft)"}`,
                    boxShadow: isSelected ? "0 0 0 3px var(--lavender)" : undefined,
                    aspectRatio: "1 / 1",
                    justifyContent: "center",
                  }}
                >
                  <img src={src} alt={`${city} logo`} className="w-12 h-12 object-contain" />
                  <span className="text-xs font-bold font-display flex items-center gap-1" style={{ color: isSelected ? "var(--lavender-strong)" : "var(--text-muted)" }}>
                    <MapPin size={11} strokeWidth={2.4} />{city}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-6 max-w-2xl">
            <button className="btn-secondary flex-1 py-3 text-sm" onClick={() => setScreen("lock")}>Back</button>
            <button className="btn-primary flex-1 py-3 text-sm flex items-center justify-center gap-1.5" onClick={() => setScreen("profile")}>
              Continue <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "profile") {
    return (
      <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
        <div
          className="hidden lg:flex flex-col justify-between p-12 shrink-0 relative overflow-hidden"
          style={{ width: "420px", background: "var(--lavender)", borderRight: "1px solid var(--border-soft)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              {selectedLogo ? (
                <img src={selectedLogo} alt={selectedCity ?? "logo"} className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--lavender-strong)" }}>
                  <span className="font-display font-extrabold text-base tracking-tight text-white">TAP</span>
                </div>
              )}
            </div>
            <h1 className="font-display font-extrabold text-4xl leading-tight" style={{ color: "var(--lavender-strong)" }}>
              {selectedCity ? `${selectedCity} chapter` : "Your profile"}
            </h1>
            <p className="text-base mt-4 leading-relaxed" style={{ color: "var(--lavender-strong)", opacity: 0.75 }}>
              Tell us a little about yourself so we can personalise your experience.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 z-0 pointer-events-none select-none" style={{ width: "260px" }}>
            <img src="/assets/welcome.png" alt="" className="w-full object-contain object-bottom" draggable={false} />
          </div>
        </div>
        <div className="flex flex-col flex-1 px-6 lg:px-16 py-10 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            {selectedLogo ? (
              <img src={selectedLogo} alt={selectedCity ?? "logo"} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
                <span className="font-display font-extrabold text-sm tracking-tight">TAP</span>
              </div>
            )}
            <div className="flex flex-col">
              <h2 className="font-display font-extrabold text-2xl" style={{ color: "var(--text-main)" }}>Your profile</h2>
              {selectedCity && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selectedCity} chapter</p>}
            </div>
          </div>
          <div className="card-float p-5 flex flex-col gap-4 max-w-xl">
            <button onClick={shuffle} className="btn-secondary self-end px-4 py-2 text-xs flex items-center gap-1.5">
              <Shuffle size={14} strokeWidth={2.4} /> Shuffle student
            </button>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <User size={13} strokeWidth={2.4} /> Full name
              </span>
              <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Student name" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <School size={13} strokeWidth={2.4} /> School
              </span>
              <input className="field-input" value={school} onChange={e => setSchool(e.target.value)} placeholder="School name" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <GraduationCap size={13} strokeWidth={2.4} /> Class
                </span>
                <input className="field-input" value={studentClass} onChange={e => setStudentClass(e.target.value)} placeholder="Grade 7" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  <Phone size={13} strokeWidth={2.4} /> Phone
                </span>
                <input className="field-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 43210" />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Preferred language</span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(l => (
                  <button key={l} className="option-pill text-xs" data-selected={language === l} onClick={() => setLanguage(l)}>{l}</button>
                ))}
              </div>
            </label>
          </div>
          <div className="flex gap-3 mt-6 max-w-xl">
            <button className="btn-secondary py-3 px-5 text-sm" onClick={() => setScreen("logo")}>Back</button>
            <button className="btn-primary flex-1 py-3.5 text-base" disabled={!canStart} onClick={() => setScreen("welcome")}>
              Continue as {name.trim() || "student"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <div
        className="hidden lg:flex flex-col justify-between p-12 shrink-0 relative overflow-hidden"
        style={{ width: "420px", background: "var(--lavender)", borderRight: "1px solid var(--border-soft)" }}
      >
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8" style={{ background: "var(--lavender-strong)" }}>
            <span className="font-display font-extrabold text-base tracking-tight text-white">TAP</span>
          </div>
          <h1 className="font-display font-extrabold text-4xl leading-tight" style={{ color: "var(--lavender-strong)" }}>
            The Apprentice<br />Project
          </h1>
          <p className="text-base mt-4 leading-relaxed" style={{ color: "var(--lavender-strong)", opacity: 0.75 }}>
            A personalised learning platform built for students across India's cities.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 z-0 pointer-events-none select-none" style={{ width: "260px" }}>
          <img src="/assets/welcome.png" alt="" className="w-full object-contain object-bottom" draggable={false} />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {["Personalised lessons", "Audio-guided learning", "Earn points & badges"].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--lavender-strong)" }}>
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--lavender-strong)" }}>{f}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col flex-1 items-center justify-between px-6 lg:px-16 py-12">
        <div className="flex flex-col items-center lg:items-start gap-6 flex-1 justify-center w-full max-w-sm">
          <div className="lg:hidden w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "var(--lavender)", color: "var(--lavender-strong)" }}>
            <span className="font-display font-extrabold text-3xl tracking-tight">TAP</span>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
            <h1 className="font-display font-extrabold text-3xl leading-tight" style={{ color: "var(--text-main)" }}>
              Welcome, {name.trim() || "student"}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Your personalised learning buddy is ready. Let's begin your {selectedCity ? `${selectedCity} ` : ""}journey.
            </p>
          </div>
        </div>
        <button
          className="btn-primary w-full max-w-sm py-3.5 text-base flex items-center justify-center gap-2"
          onClick={startDemo}
        >
          Get started <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}