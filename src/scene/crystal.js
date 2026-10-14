import * as THREE from 'three';

export const COLORS = {
  ink: new THREE.Color('#070b1f'),
  deep: new THREE.Color('#101a4a'),
  probe: new THREE.Color('#4df3e0'),
  defect: new THREE.Color('#ff3d8b'),
  violet: new THREE.Color('#8e7cff'),
  bone: new THREE.Color('#e8ecff'),
};

// Ruido simplex 3D (Ashima Arts, dominio público).
export const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
uniform float uTime;
uniform float uPulse;
uniform float uAmp;
varying vec3 vObj;
varying vec3 vView;
varying vec3 vDir;
${NOISE_GLSL}
void main() {
  vec3 p = position;
  float n = snoise(p * 1.1 + uTime * 0.22);
  float n2 = snoise(p * 2.6 - uTime * 0.35);
  float d = (n * 0.7 + n2 * 0.3) * uAmp * (1.0 + uPulse * 0.8);
  vec3 displaced = p + normal * d;
  vDir = normalize(p);
  vObj = displaced;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vView = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uPulse;
uniform float uUseDefects;
uniform vec4 uDefects[5];
uniform vec3 uProbe;
uniform vec3 uDefect;
uniform vec3 uViolet;
uniform vec3 uDeep;
varying vec3 vObj;
varying vec3 vView;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  // Normal plana por faceta, calculada con derivadas de pantalla.
  vec3 N = normalize(cross(dFdx(vView), dFdy(vView)));
  vec3 V = normalize(-vView);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 2.6);

  vec3 fo = normalize(cross(dFdx(vObj), dFdy(vObj)));
  float fh = hash(floor(fo * 12.0) + 7.0);
  float shimmer = 0.5 + 0.5 * sin(uTime * 1.2 + fh * 40.0);

  vec3 film = 0.5 + 0.5 * cos(6.2831 * (ndv * 1.15 + vec3(0.0, 0.33, 0.67)) + uTime * 0.15 + fh * 2.0);
  vec3 col = mix(uDeep, uProbe, fres);
  col += film * 0.22 * (0.4 + fres);
  col = mix(col, uViolet, smoothstep(0.55, 1.0, fh) * 0.35);
  col += uProbe * shimmer * 0.06 * fh;
  float alpha = 0.34 + fres * 0.6 + fh * 0.08;

  float defMask = 0.0;
  vec3 defCol = vec3(0.0);
  if (uUseDefects > 0.5) {
    for (int i = 0; i < 5; i++) {
      vec3 dd = uDefects[i].xyz;
      float fx = uDefects[i].w;
      float dist = 1.0 - dot(vDir, dd);
      float r = 0.05;
      float m = smoothstep(r, r * 0.15, dist);
      float ring = smoothstep(r * 1.3, r, dist) - smoothstep(r, r * 0.75, dist);
      float stripes = step(0.5, fract(vObj.y * 14.0 + uTime * 2.5));
      float glitch = (1.0 - fx) * m;
      vec3 bad = mix(uDefect, vec3(1.0, 0.75, 0.9), stripes * 0.5) * (1.2 + 0.6 * sin(uTime * 9.0 + float(i)));
      defCol += bad * glitch;
      defMask += glitch;
      float flash = sin(3.14159 * fx);
      defCol += vec3(1.0) * flash * m * 1.4;
      float ok = fx * (ring * 0.9 + m * 0.22);
      defCol += uProbe * 1.3 * ok;
      defMask += ok * 0.7 + flash * m;
    }
  }
  col = mix(col, defCol, clamp(defMask, 0.0, 1.0) * 0.92);
  col += uProbe * uPulse * 0.5 * fres;
  alpha = clamp(alpha + defMask * 0.7, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}`;

export function createCrystalMaterial({ defects = false, amp = 0.2 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 0 },
      uAmp: { value: amp },
      uUseDefects: { value: defects ? 1 : 0 },
      uDefects: { value: Array.from({ length: 5 }, () => new THREE.Vector4(0, 1, 0, 1)) },
      uProbe: { value: COLORS.probe },
      uDefect: { value: COLORS.defect },
      uViolet: { value: COLORS.violet },
      uDeep: { value: COLORS.deep },
    },
  });
}

// Direcciones (sobre la esfera) de los defectos escondidos.
export const DEFECT_DIRS = [
  new THREE.Vector3(0.72, 0.5, 0.48),
  new THREE.Vector3(-0.82, 0.2, 0.53),
  new THREE.Vector3(0.12, -0.9, 0.42),
  new THREE.Vector3(-0.3, 0.72, -0.62),
  new THREE.Vector3(0.85, -0.25, -0.46),
].map((v) => v.normalize());

export function createCrystal() {
  const group = new THREE.Group();

  const geometry = new THREE.IcosahedronGeometry(1.7, 4);
  const material = createCrystalMaterial({ defects: true, amp: 0.2 });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);

  // Estado de cada defecto: 0 abierto, 1 corregido.
  const fixed = DEFECT_DIRS.map(() => 0);
  const target = DEFECT_DIRS.map(() => 0);
  DEFECT_DIRS.forEach((d, i) => material.uniforms.uDefects.value[i].set(d.x, d.y, d.z, 0));

  // Nucleo luminoso que se ve a traves del cristal.
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.85, 1),
    new THREE.MeshBasicMaterial({ color: COLORS.probe, wireframe: true, transparent: true, opacity: 0.55 })
  );
  group.add(core);

  // Carcasa de aristas, gira en sentido contrario.
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.45, 1)),
    new THREE.LineBasicMaterial({
      color: COLORS.violet,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(shell);

  // Esquirlas que orbitan.
  const SHARDS = 48;
  const shardMesh = new THREE.InstancedMesh(
    new THREE.TetrahedronGeometry(0.045, 0),
    new THREE.MeshBasicMaterial({ color: COLORS.bone }),
    SHARDS
  );
  const shardData = Array.from({ length: SHARDS }, (_, i) => ({
    r: 2.9 + Math.random() * 1.6,
    a: Math.random() * Math.PI * 2,
    y: (Math.random() - 0.5) * 3.4,
    s: 0.15 + Math.random() * 0.35,
    sc: 0.6 + Math.random() * 1.6,
    tilt: Math.random() * Math.PI,
  }));
  group.add(shardMesh);
  const dummy = new THREE.Object3D();

  // Onda expansiva cuando se corrigen todos los defectos.
  const wave = new THREE.Mesh(
    new THREE.RingGeometry(0.98, 1.0, 96),
    new THREE.MeshBasicMaterial({
      color: COLORS.probe,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  group.add(wave);
  let waveT = -1;

  let pulse = 0;
  const api = {
    group,
    mesh,
    fixed,
    count: DEFECT_DIRS.length,
    get fixedCount() {
      return target.filter(Boolean).length;
    },
    isFixed: (i) => target[i] === 1,
    // Devuelve el indice del defecto abierto mas cercano a una direccion local.
    defectAt(localDir, threshold = 0.93) {
      let best = -1;
      let bestDot = threshold;
      DEFECT_DIRS.forEach((d, i) => {
        if (target[i] === 1) return;
        const dot = d.dot(localDir);
        if (dot > bestDot) {
          bestDot = dot;
          best = i;
        }
      });
      return best;
    },
    fix(i) {
      if (target[i] === 1) return false;
      target[i] = 1;
      pulse = Math.min(1, pulse + 0.5);
      return true;
    },
    burst() {
      waveT = 0;
      pulse = 1.2;
    },
    update(t, dt, camera, reduced) {
      material.uniforms.uTime.value = t;
      pulse = Math.max(0, pulse - dt * 0.9);
      material.uniforms.uPulse.value = pulse;

      DEFECT_DIRS.forEach((d, i) => {
        fixed[i] += (target[i] - fixed[i]) * (1 - Math.exp(-dt * 2.2));
        material.uniforms.uDefects.value[i].w = fixed[i];
      });

      const spin = reduced ? 0 : 1;
      core.rotation.y = t * 0.5 * spin;
      core.rotation.x = t * 0.3 * spin;
      shell.rotation.y = -t * 0.12 * spin;
      shell.rotation.z = t * 0.07 * spin;

      for (let i = 0; i < SHARDS; i++) {
        const s = shardData[i];
        const a = s.a + t * s.s * spin;
        dummy.position.set(Math.cos(a) * s.r, s.y + Math.sin(t * 0.4 + i) * 0.15 * spin, Math.sin(a) * s.r);
        dummy.rotation.set(t * s.sc * spin + s.tilt, t * 0.8 * spin, 0);
        dummy.updateMatrix();
        shardMesh.setMatrixAt(i, dummy.matrix);
      }
      shardMesh.instanceMatrix.needsUpdate = true;

      if (waveT >= 0) {
        waveT += dt;
        const k = waveT / 1.6;
        if (k >= 1) {
          waveT = -1;
          wave.material.opacity = 0;
        } else {
          wave.scale.setScalar(1.5 + k * 9);
          wave.material.opacity = (1 - k) * 0.9;
          // El anillo mira siempre a la camara, aunque el grupo este girado.
          wave.quaternion.copy(group.quaternion).invert().multiply(camera.quaternion);
        }
      }
    },
  };
  return api;
}
