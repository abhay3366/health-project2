export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md relative animate-fadeIn">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-admin via-user to-coach rounded-t-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-extrabold text-lg text-[#dde3f0]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 border border-border text-muted hover:text-[#dde3f0] transition-colors flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
