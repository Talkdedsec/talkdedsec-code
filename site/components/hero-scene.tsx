"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EYE, EYE_SHAPE } from "@/lib/eye-dots";
import type { EyeStage } from "./eye-layer";

const SPREAD = 3.4;
const EYE_X = EYE_SHAPE.iris.x * SPREAD;
const EYE_Y = EYE_SHAPE.iris.y * SPREAD;
const IRIS_R = EYE_SHAPE.iris.r * SPREAD;
const PUPIL_F = EYE_SHAPE.pupil.r / EYE_SHAPE.iris.r;
const BALL_R = 0.6 * SPREAD;
const JITTER = (0.34 / 58) * SPREAD;
const DOME = 1.25;
const CORNEA = 0.42;

const EYE_FRAC = 0.69;
const DOCK_PX = 152;
const DOCK_X = 106;
const DOCK_Y = 82;
const DOCK_FROM = 32;

function buildGeometry() {
	const { count, x, y, rad, ink, edge, open, fiber, phase } = EYE;

	let bits = 0x9e3779b1;
	const rnd = () => {
		bits = (Math.imul(bits, 1664525) + 1013904223) >>> 0;
		return bits / 4294967296;
	};

	const positions = new Float32Array(count * 3);

	for (let i = 0; i < count; i++) {
		const px = x[i] * SPREAD - EYE_X + (rnd() - 0.5) * JITTER;
		const py = y[i] * SPREAD - EYE_Y + (rnd() - 0.5) * JITTER;
		const rBall = Math.hypot(px, py) / BALL_R;
		const rIris = rad[i] / 1.3;

		positions[i * 3] = px;
		positions[i * 3 + 1] = py;
		positions[i * 3 + 2] =
			DOME * Math.max(0, 1 - rBall * rBall) ** 0.65 +
			CORNEA * Math.max(0, 1 - rIris * rIris) ** 0.8 +
			(rnd() - 0.5) * 0.07;
	}

	const g = new THREE.BufferGeometry();
	g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	g.setAttribute("aRad", new THREE.BufferAttribute(rad, 1));
	g.setAttribute("aInk", new THREE.BufferAttribute(ink, 1));
	g.setAttribute("aEdge", new THREE.BufferAttribute(edge, 1));
	g.setAttribute("aOpen", new THREE.BufferAttribute(open, 1));
	g.setAttribute("aFiber", new THREE.BufferAttribute(fiber, 1));
	g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
	return g;
}

const VERTEX = `
	attribute float aRad;
	attribute float aInk;
	attribute float aEdge;
	attribute float aOpen;
	attribute float aFiber;
	attribute float aPhase;

	uniform float uTime;
	uniform float uDock;
	uniform float uFit;
	uniform float uBlink;
	uniform float uPupil;
	uniform float uWake;
	uniform float uScale;
	uniform vec2 uLook;
	uniform vec3 uColor;

	varying float vAlpha;
	varying vec3 vColor;

	const float IRIS_R = ${IRIS_R.toFixed(5)};

	void main() {
		vec2 q = position.xy;
		float ri = aRad;

		// halkalar geniş geçişli: dar smoothstep rasterin organik dokusunda geometrik çember gibi okunuyor
		float pupil = 1.0 - smoothstep(uPupil - 0.22, uPupil + 0.30, ri);
		float iris = (1.0 - smoothstep(0.70, 1.08, ri)) * (1.0 - pupil);
		float rim = aEdge * aEdge;
		float inside = smoothstep(-0.85, -0.12, aOpen);

		vec3 p = position;
		p.z += sin(uTime * 0.5 + aPhase * 8.0) * 0.045;
		p.xy += vec2(sin(uTime * 0.31 + aPhase * 5.0), cos(uTime * 0.27 + aPhase * 6.3)) * 0.014;

		// yalnız küre döner, kapak/ten sabit kalır; tüm bulut dönerse göz dönen bir kart gibi okunuyor
		vec2 sw = vec2(uLook.x, -uLook.y) * 0.2 * inside * (1.0 - smoothstep(1.4, 3.0, ri));
		vec3 r = p - vec3(0.0, 0.0, -1.2);
		float cy = cos(sw.x), sy = sin(sw.x);
		r = vec3(r.x * cy + r.z * sy, r.y, r.z * cy - r.x * sy);
		float cx = cos(sw.y), sx = sin(sw.y);
		r = vec3(r.x, r.y * cx - r.z * sx, r.z * cx + r.y * sx);
		p = r + vec3(0.0, 0.0, -1.2);

		p.y *= 1.0 - 0.9 * uBlink;
		p.z *= (1.0 - 0.55 * uBlink) * (1.0 + uDock * 0.3);

		vec4 mv = modelViewMatrix * vec4(p, 1.0);
		gl_Position = projectionMatrix * mv;

		float fiber = 0.70 + 0.62 * (aFiber - 0.5);
		vec2 glint = vec2(-0.34, 0.40) * IRIS_R + uLook * IRIS_R * 0.42;
		float spec = (1.0 - smoothstep(0.0, 1.0, length(q - glint) / (IRIS_R * 0.34))) * smoothstep(1.3, 0.85, ri);

		// logoda sklera parlak, iris koyu: iris terimi parlatmaz, dokuyu modüle eder
		float lum = pow(aInk, 0.62) * (0.28 + 0.5 * inside);
		lum *= 1.0 + iris * (0.75 * fiber - 0.15);
		lum += rim * (0.5 + 0.7 * inside);
		lum *= 1.0 - pupil * 0.92;
		lum += spec * 1.3;
		lum *= 1.0 - 0.45 * uBlink;
		// köşede göz sayfa metninin üstünde duruyor: dinlenirken kısılır, imleç yaklaşınca uyanır
		lum *= mix(1.0, 1.45, clamp(1.0 - uFit, 0.0, 1.0)) * mix(1.0, mix(0.38, 0.9, uWake), uDock);
		// park halinde dış ten saçağı söner: ayak izi daralınca altında kalan metin okunur kalıyor
		lum *= mix(1.0, 0.12 + 0.88 * inside, uDock);

		float size = 0.0105 + aInk * 0.0175 + rim * 0.0131;
		size *= (0.78 + 0.32 * inside) * (1.0 - pupil * 0.55);
		// üs 0.74: nokta çapı ölçekle birlikte büyüsün, yoksa hero boyunda kafes seyrelip toz gibi görünüyor
		gl_PointSize = clamp(size * uScale * pow(uFit, 0.74) / -mv.z, 1.0, 18.0);

		vColor = mix(uColor, vec3(1.0), clamp(max(lum - 1.0, 0.0) * 0.8 + spec * 0.55 + rim * 0.2, 0.0, 1.0));
		vAlpha = clamp(lum, 0.0, 1.0);
	}
`;

const FRAGMENT = `
	varying float vAlpha;
	varying vec3 vColor;

	void main() {
		vec2 c = gl_PointCoord - 0.5;
		float d = dot(c, c);
		if (d > 0.25) discard;
		gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.25, 0.09, d));
	}
`;

function Eye({
	box,
	stage,
	onScreen,
}: {
	box: RefObject<HTMLDivElement | null>;
	stage: RefObject<EyeStage>;
	onScreen: (visible: boolean) => void;
}) {
	const ref = useRef<THREE.Points>(null);
	const gl = useThree((s) => s.gl);
	const invalidate = useThree((s) => s.invalidate);

	const geometry = useMemo(buildGeometry, []);
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uDock: { value: 0 },
			uFit: { value: 1 },
			uBlink: { value: 0 },
			uPupil: { value: PUPIL_F },
			uWake: { value: 0 },
			uScale: { value: 600 },
			uLook: { value: new THREE.Vector2() },
			uColor: { value: new THREE.Color("#c9cdd4") },
		}),
		[],
	);

	const look = useRef(new THREE.Vector2());
	const ptr = useRef({ x: 0, y: 0, at: -99, live: false });
	const cue = useRef({ x: 0, y: 0, until: -1 });
	const hue = useRef(new THREE.Color("#c9cdd4"));
	const spot = useRef({ x: 0, y: 0, k: 0, set: false });
	const sent = useRef({ x: -1e9, y: -1e9, d: -1e9, at: -1e9 });
	const scroll = useRef({ y: 0, v: 0 });
	const clock = useRef(0);
	const blink = useRef({ next: 2.4, until: 0 });

	useEffect(() => () => geometry.dispose(), [geometry]);

	useEffect(() => {
		const read = () => {
			const raw = getComputedStyle(document.documentElement).getPropertyValue("--hue").trim();
			if (raw) hue.current.set(raw);
			invalidate();
		};
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
		return () => observer.disconnect();
	}, [invalidate]);

	useEffect(() => {
		const onMove = (e: PointerEvent) => {
			const p = ptr.current;
			p.x = e.clientX;
			p.y = e.clientY;
			p.at = clock.current;
			p.live = true;
		};
		window.addEventListener("pointermove", onMove, { passive: true });

		const gaze = (e: Event) => {
			const g = (e as CustomEvent<{ x: number; y: number; px?: number; py?: number; hold?: number; blink?: boolean }>)
				.detail;
			if (!g) return;
			const c = cue.current;
			c.x = g.px ?? ((g.x + 1) / 2) * window.innerWidth;
			c.y = g.py ?? ((1 - g.y) / 2) * window.innerHeight;
			c.until = clock.current + (g.hold ?? 4);
			if (g.blink) {
				blink.current.until = clock.current + 0.28;
				blink.current.next = clock.current + 3.4 + Math.random() * 4;
			}
		};
		window.addEventListener("tlk-gaze", gaze);

		const io = new IntersectionObserver(([entry]) => onScreen(entry.isIntersecting), { rootMargin: "96px" });
		io.observe(gl.domElement);

		return () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("tlk-gaze", gaze);
			io.disconnect();
		};
	}, [gl, onScreen]);

	useFrame((state, delta) => {
		const points = ref.current;
		if (!points) return;

		// R3F uniforms nesnesini sığ kopyalar; sayısal uniform'lar materyalin kendi kopyasından yazılmalı
		const u = (points.material as THREE.ShaderMaterial).uniforms;

		// setFrameloop clock.elapsedTime'ı sıfırlıyor; kendi saatimizi tutuyoruz
		const step = Math.min(delta, 0.1);
		clock.current += step;
		const t = clock.current;
		const ease = 1 - Math.exp(-6 * step);

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const sy = window.scrollY;
		const bw = state.size.width;
		const bh = state.size.height;

		const sc = scroll.current;
		sc.v += ((sy - sc.y) / Math.max(step, 0.004) - sc.v) * (1 - Math.exp(-7 * step));
		sc.y = sy;

		const st = stage.current;
		const parked = DOCK_PX / (EYE_FRAC * bh);
		let dock = 1;
		let tx = vw - DOCK_X;
		let ty = vh - DOCK_Y;
		let fit = parked;

		if (st.has) {
			const raw = Math.min(1, Math.max(0, (sy - DOCK_FROM) / Math.max(1, st.span - DOCK_FROM)));
			dock = raw * raw * (3 - 2 * raw);
			const hx = st.x;
			const hy = st.top - sy + st.h / 2;
			const full = st.h / bh;
			tx = hx + (vw - DOCK_X - hx) * dock;
			ty = hy + (vh - DOCK_Y - hy) * dock;
			fit = full + (parked - full) * dock;
		}

		const s = spot.current;
		if (s.set) {
			const glide = 1 - Math.exp(-11 * step);
			s.x += (tx - s.x) * glide;
			s.y += (ty - s.y) * glide;
			s.k += (fit - s.k) * glide;
		} else {
			s.x = tx;
			s.y = ty;
			s.k = fit;
			s.set = true;
		}

		const el = box.current;
		if (el) el.style.transform = `translate3d(${(s.x - bw / 2).toFixed(1)}px, ${(s.y - bh / 2).toFixed(1)}px, 0)`;

		const d = EYE_FRAC * bh * s.k * 0.52;
		const q = sent.current;
		// göz durunca olay kesilirse geç mount olan rehber konumu hiç öğrenemez: yarım saniyelik nabız şart
		if (Math.abs(q.x - s.x) > 0.5 || Math.abs(q.y - s.y) > 0.5 || Math.abs(q.d - d) > 0.5 || t - q.at > 0.5) {
			q.x = s.x;
			q.y = s.y;
			q.d = d;
			q.at = t;
			window.dispatchEvent(new CustomEvent("tlk-eye-box", { detail: { x: s.x, y: s.y, d } }));
		}

		points.scale.setScalar(s.k);
		u.uFit.value = s.k;
		u.uDock.value += (dock - u.uDock.value) * ease;
		u.uScale.value = 0.5 * bh * state.viewport.dpr * state.camera.projectionMatrix.elements[5];
		u.uTime.value = t;

		const gazing = t < cue.current.until;
		const p = ptr.current;

		const woke = gazing || (p.live && Math.hypot(p.x - s.x, p.y - s.y) < d * 1.9) ? 1 : 0;
		u.uWake.value += (woke - u.uWake.value) * (1 - Math.exp(-5 * step));

		let ax: number;
		let ay: number;

		if (!gazing && (!p.live || t - p.at > 2.6)) {
			ax = Math.sin(t * 0.23) * 0.44 + Math.sin(t * 0.09) * 0.2;
			ay = Math.cos(t * 0.17) * 0.24 + Math.sin(t * 0.13) * 0.1;
		} else {
			const g = gazing ? cue.current : p;
			const reach = Math.min(vw, vh) * 0.55;
			ax = (g.x - s.x) / reach;
			ay = (s.y - g.y) / reach;
			const m = Math.hypot(ax, ay);
			if (m > 1) {
				ax /= m;
				ay /= m;
			}
		}

		// göz kafadan önce varmalı: bakış lerp'i gövde dönüşünden hızlı kalacak
		const dart = 1 - Math.exp(-(gazing ? 5.4 : 4.6) * step);
		look.current.x += (ax - look.current.x) * dart;
		look.current.y += (ay - look.current.y) * dart;
		u.uLook.value.copy(look.current);

		const b = blink.current;
		if (t > b.next) {
			b.until = t + 0.28;
			b.next = t + 3.2 + Math.random() * 5;
		}
		const shut = 1 - (b.until - t) / 0.28;
		const lid = shut > 0 && shut < 1 ? (shut < 0.35 ? shut / 0.35 : (1 - shut) / 0.65) : 0;
		u.uBlink.value = lid * lid * (3 - 2 * lid);

		const rush = Math.min(0.05, Math.abs(sc.v) * 0.00003);
		const pupil = PUPIL_F + (gazing ? 0.14 : 0) + rush + Math.sin(t * 0.21) * 0.04 - u.uDock.value * 0.04;
		u.uPupil.value += (pupil - u.uPupil.value) * ease;

		const c = u.uColor.value;
		const h = hue.current;
		if (Math.abs(c.r - h.r) + Math.abs(c.g - h.g) + Math.abs(c.b - h.b) > 0.003) {
			c.lerp(h, 1 - Math.exp(-4 * step));
		}

		const turn = 1 - Math.exp(-3.6 * step);
		const lean = Math.max(-0.09, Math.min(0.09, sc.v * 0.00006));
		points.rotation.y += (look.current.x * 0.12 - u.uDock.value * 0.14 - points.rotation.y) * turn;
		points.rotation.x += (-look.current.y * 0.08 + lean - points.rotation.x) * turn;
		points.rotation.z = Math.sin(t * 0.11) * 0.03;
		points.position.y = Math.sin(t * 0.19) * 0.06 * s.k;
	});

	return (
		<points ref={ref} geometry={geometry} frustumCulled={false}>
			<shaderMaterial
				transparent
				depthWrite={false}
				depthTest={false}
				blending={THREE.AdditiveBlending}
				uniforms={uniforms}
				vertexShader={VERTEX}
				fragmentShader={FRAGMENT}
			/>
		</points>
	);
}

export default function EyeScene({
	box,
	stage,
	paused,
}: {
	box: RefObject<HTMLDivElement | null>;
	stage: RefObject<EyeStage>;
	paused: boolean;
}) {
	const [visible, setVisible] = useState(true);
	const [awake, setAwake] = useState(true);
	const [dead, setDead] = useState(false);

	useEffect(() => {
		const sync = () => setAwake(!document.hidden);
		sync();
		document.addEventListener("visibilitychange", sync);
		return () => document.removeEventListener("visibilitychange", sync);
	}, []);

	// WebGL yoksa (sürücü engelli, --disable-gpu) three.js yakalanmayan hata fırlatıyor; sahne dekoratif, sessizce çekilsin
	useEffect(() => {
		if (dead) return;
		const el = document.createElement("canvas");
		const ok = !!(el.getContext("webgl2") || el.getContext("webgl"));
		if (!ok) setDead(true);
	}, [dead]);

	if (dead) return null;

	// Canvas her scroll'da yeniden render olup frameloop prop'unu geri uyguluyor; kapı prop'ta durmalı, setFrameloop'ta değil
	return (
		<Canvas
			camera={{ position: [0, 0, 7], fov: 40 }}
			dpr={[1, 1.75]}
			frameloop={!paused && awake && visible ? "always" : "never"}
			gl={{ antialias: false, alpha: true }}
			style={{ pointerEvents: "none" }}
			onCreated={({ gl }) => {
				gl.domElement.addEventListener("webglcontextlost", () => setDead(true), { once: true });
			}}
			fallback={null}
		>
			<Eye box={box} stage={stage} onScreen={setVisible} />
		</Canvas>
	);
}
