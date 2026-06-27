export default function Avatar({ src, alt, size = 40 }) {
  return src
    ? <img src={src} alt={alt} width={size} height={size} className="rounded-full object-cover" />
    : <div style={{ width: size, height: size }} className="grid place-items-center rounded-full bg-slate-700 text-xs font-semibold">{(alt ?? 'U').slice(0, 1).toUpperCase()}</div>
}
