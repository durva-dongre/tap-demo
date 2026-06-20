"use client";
import { useState } from "react";
import { Camera, CheckCircle2, Users, X, ChevronLeft, ChevronRight, Upload, Check } from "lucide-react";
import { CourseUnit } from "@/lib/flow-engine";

type Props = {
  content: CourseUnit["submission"];
  courseId: string;
  submitted?: boolean;
  onSubmit: () => void;
};

type GalleryImage = {
  title: string;
  file: string;
  description?: string;
};

function submissionImagePath(courseId: string, file: string) {
  return `/data/submission/${courseId}/${file}`;
}

export function SubmissionRender({ content, courseId, submitted, onSubmit }: Props) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const refs = content.reference_submissions ?? [];

  const exampleImages: GalleryImage[] = refs.map((r, i) => ({
    title: r.title,
    file: `example-${i + 1}.jpg`,
    description: r.description,
  }));

  const pickerImages: GalleryImage[] = [
    { title: "Your submission", file: "submission.jpg" },
    ...exampleImages,
  ];

  const openGallery = (index: number) => setGalleryIndex(index);
  const closeGallery = () => setGalleryIndex(null);
  const showPrev = () =>
    setGalleryIndex(i => (i === null ? null : (i - 1 + exampleImages.length) % exampleImages.length));
  const showNext = () =>
    setGalleryIndex(i => (i === null ? null : (i + 1) % exampleImages.length));

  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const handlePick = (file: string) => {
    setSelectedFile(file);
    setPickerOpen(false);
  };

  return (
    <div className="pl-10">
      <div className="card-float p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--honey-light)", color: "var(--honey-dark)" }}
          >
            <Camera size={17} strokeWidth={2.3} />
          </div>
          <p className="font-display font-bold text-sm leading-snug" style={{ color: "var(--text-main)" }}>
            {content.prompt}
          </p>
        </div>

        {exampleImages.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Users size={13} strokeWidth={2.3} style={{ color: "var(--text-muted)" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                What other learners made
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {exampleImages.map((img, i) => (
                <button
                  key={i}
                  className="relative rounded-xl overflow-hidden"
                  style={{ aspectRatio: "1 / 1" }}
                  onClick={() => openGallery(i)}
                >
                  <img
                    src={submissionImagePath(courseId, img.file)}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {!submitted ? (
          <>
            <p className="text-xs font-semibold mt-1" style={{ color: "var(--text-muted)" }}>
              Add your work
            </p>

            {selectedFile ? (
              <button
                className="relative w-full rounded-2xl overflow-hidden"
                style={{ aspectRatio: "4 / 3" }}
                onClick={openPicker}
              >
                <img
                  src={submissionImagePath(courseId, selectedFile)}
                  alt="Your selected submission"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-display"
                  style={{ background: "var(--green-soft)", color: "var(--green)" }}
                >
                  <Check size={12} strokeWidth={2.6} />
                  Selected
                </div>
                <div
                  className="absolute inset-0 flex items-end justify-end p-2.5"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 50%)" }}
                >
                  <span
                    className="text-xs font-bold font-display px-2.5 py-1 rounded-full"
                    style={{ background: "var(--white)", color: "var(--text-main)" }}
                  >
                    Change photo
                  </span>
                </div>
              </button>
            ) : (
              <button
                className="w-full rounded-2xl flex flex-col items-center justify-center gap-2 py-8"
                style={{ background: "var(--bg-soft)", border: "2px dashed var(--border-soft)" }}
                onClick={openPicker}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "var(--honey-light)", color: "var(--honey-dark)" }}
                >
                  <Upload size={18} strokeWidth={2.4} />
                </div>
                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Tap to upload a photo
                </span>
              </button>
            )}

            <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              How did it feel?
            </p>
            <div className="flex flex-wrap gap-2">
              {(content.emoji_options ?? []).map(o => (
                <button
                  key={o.label}
                  className="option-pill text-xs"
                  data-selected={chosen === o.label}
                  onClick={() => setChosen(o.label)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button
              className="btn-primary px-5 py-2.5 text-sm self-start mt-1"
              disabled={!chosen || !selectedFile}
              onClick={onSubmit}
            >
              Submit my work
            </button>
          </>
        ) : (
          <>
            {selectedFile && (
              <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
                <img
                  src={submissionImagePath(courseId, selectedFile)}
                  alt="Your submission"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div
              className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-full text-xs font-bold font-display"
              style={{ background: "var(--green-soft)", color: "var(--green)" }}
            >
              <CheckCircle2 size={14} strokeWidth={2.4} />
              Submitted
            </div>
          </>
        )}
      </div>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-display font-bold" style={{ color: "var(--white)" }}>
              Choose your photo
            </p>
            <button
              onClick={closePicker}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", color: "var(--white)" }}
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {pickerImages.map((img, i) => (
                <button
                  key={i}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ aspectRatio: "4 / 3" }}
                  onClick={() => handlePick(img.file)}
                >
                  <img
                    src={submissionImagePath(courseId, img.file)}
                    alt={img.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedFile === img.file && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: "var(--green)", color: "var(--white)" }}
                      >
                        <Check size={18} strokeWidth={3} />
                      </div>
                    </div>
                  )}
                  <p
                    className="absolute bottom-0 left-0 right-0 text-xs font-semibold px-2 py-1.5 truncate"
                    style={{ background: "rgba(0,0,0,0.55)", color: "var(--white)" }}
                  >
                    {img.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {galleryIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(0,0,0,0.92)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm font-display font-bold" style={{ color: "var(--white)" }}>
              {exampleImages[galleryIndex].title}
            </p>
            <button
              onClick={closeGallery}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", color: "var(--white)" }}
              aria-label="Close gallery"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 relative">
            <button
              onClick={showPrev}
              className="absolute left-2 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", color: "var(--white)" }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} strokeWidth={2.4} />
            </button>

            <img
              src={submissionImagePath(courseId, exampleImages[galleryIndex].file)}
              alt={exampleImages[galleryIndex].title}
              className="max-h-full max-w-full rounded-2xl object-contain"
            />

            <button
              onClick={showNext}
              className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", color: "var(--white)" }}
              aria-label="Next image"
            >
              <ChevronRight size={20} strokeWidth={2.4} />
            </button>
          </div>

          {exampleImages[galleryIndex].description && (
            <p
              className="text-xs text-center px-8 pb-6"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              {exampleImages[galleryIndex].description}
            </p>
          )}

          <div className="flex justify-center gap-1.5 pb-6">
            {exampleImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className="w-2 h-2 rounded-full"
                style={{ background: i === galleryIndex ? "var(--white)" : "rgba(255,255,255,0.35)" }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}