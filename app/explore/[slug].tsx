import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import * as ReactNative from 'react-native';
import { ArchBackground, ARCH } from '@/components/arch-theme';
import { RuriNav } from '@/components/ruri-nav';

type Section = { heading: string; body: string }
type Bullet = { label: string; description: string }
type Quiz = { question: string; options: string[]; answer: number; explanation: string }

type DetailEntry = {
  title: string
  hero: string
  intro: string
  sections: Section[]
  bullets?: Bullet[]
  highlight?: string
  quiz: Quiz
}

const BG = ARCH.BG
const PANEL = ARCH.PANEL
const PANEL_2 = ARCH.PANEL_2
const BORDER = ARCH.BORDER
const BORDER_SOFT = ARCH.BORDER_SOFT
const TEXT = ARCH.TEXT
const SUB = ARCH.SUB
const MUTED = ARCH.MUTED
const ACCENT = ARCH.ACCENT
const ACCENT_2 = ARCH.ACCENT_2
const ACCENT_3 = ARCH.ACCENT_3

const detailContent: Record<string, DetailEntry> = {
  'proprietati-fizice': {
    title: 'Physical Properties',
    hero: 'https://static.scientificamerican.com/blogs/cache/file/CA6C2B6D-0D7B-4EF7-8C3A24D7959F8E5A_source.jpg?w=1200',
    intro: 'Core physical behaviors of the Menger Sponge across optics, acoustics, heat, electricity, mechanics, and fluid flow - all rooted in its infinite surface and vanishing volume.',
    sections: [
      {
        heading: 'Foundations',
        body: 'Self-similarity at every scale, infinitely many holes, volume tending to 0, surface area tending to infinity, and a fractal dimension of ~2.7268 drive every physical effect.'
      },
      {
        heading: 'Optical properties',
        body: 'Light scatters through countless cavities, producing fractal shadows, partial transparency, and near-infinite reflections. The geometry behaves like an ultra-efficient light diffuser.'
      },
      {
        heading: 'Acoustic properties',
        body: 'Fractal absorbers based on Menger sponges are used in reality: sound dives into the voids, hits countless walls, and dissipates - especially at high frequencies - while certain resonances can appear locally.'
      },
      {
        heading: 'Thermal properties',
        body: 'Infinite surface and porous tunnels yield excellent heat dissipation and chaotic internal transfer - an ideal radiator geometry if materialized.'
      },
      {
        heading: 'Electrical properties',
        body: 'If made of conductive material, paths become long and fragmented (higher resistance), fields distribute in complex ways, and the 3D fractal form can act as a highly efficient antenna.'
      },
      {
        heading: 'Mechanical & structural',
        body: 'Ultra-light (density → 0), rigid along internal networks, fragile at edges, and extreme surface-to-volume ratios make it inspiring for foams, filters, and porous lattices.'
      },
      {
        heading: 'Fluid flow',
        body: 'Turbulent, chaotic mixing with high mass/ gas transfer rates but also high flow resistance - useful for catalysts and filters.'
      },
      {
        heading: 'Energy behavior',
        body: 'Energy dissipates rapidly: sound is absorbed, light scatters, heat spreads, and pressure can fracture - fractal area drives fast energy loss.'
      },
      {
        heading: 'Formula quick sheet',
        body: [
          'Cubes N(n)=20^n | Edge l(n)=1/3^n | Volume V(n)=(20/27)^n | Area A(n)=6*(20/9)^n',
          'Surface/Volume S/V = 6*3^n | Holes H(n)=7*20^(n-1) | Total holes H_tot=7*(20^n-1)/19',
          'Fractal dimension D=log(20)/log(3) ~= 2.7268 | Density rho(n)=(20/27)^n',
          'Optics: I_out = I_in/(1+k*A), T=e^(-mu*L_opt), reflections ~= 3^n',
          'Acoustics: alpha ~ 3^n, L_eff ~= L_0*3^n, f_n = f_0*3^n',
          'Thermal: k_eff = k_0*(20/27)^n, Q ~ A(n), R_th ~ 1/A(n)',
          'Electrical: R_eff ~ (3/20)^n, C ~ A(n), f_res = f_0*3^n',
          'Fluids: phi = 1-(20/27)^n, R_f ~ 3^n, A_wet = A(n)'
        ].join('\n')
      }
    ],
    bullets: [
      { label: 'Light', description: 'Extreme diffusion, fractal shadows, partial transparency, infinite reflections.' },
      { label: 'Sound', description: 'High absorption and scattering; great for acoustic panels and anechoic spaces.' },
      { label: 'Heat', description: 'Excellent cooling potential thanks to vast surface area.' },
      { label: 'Electrical', description: 'Long fragmented paths raise resistance; strong candidate for fractal antennas.' },
      { label: 'Mechanical', description: 'Lightweight yet directionally rigid; brittle edges; huge surface/volume.' },
      { label: 'Fluids', description: 'Chaotic mixing and high transfer rates with significant flow resistance.' }
    ],
    highlight: 'Every physical effect traces back to infinite surface, zero volume, and exact self-similarity; scaling laws like N=20^n and A=6*(20/9)^n govern the rest.',
    quiz: {
      question: 'Why does light diffuse so strongly in a Menger Sponge?',
      options: ['Flat surfaces', 'Few reflections', 'Infinitely many scatter surfaces', 'Uniform material'],
      answer: 2,
      explanation: 'The sponge exposes light to infinitely many tiny surfaces and cavities, causing extreme scattering.'
    }
  },
  'ce-este': {
    title: 'What is the Menger Sponge?',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Menger_sponge_%28Level_0-3%29.jpg',
    intro: 'The Menger Sponge is a 3D fractal famous for its infinite surface area and near-zero volume, first described by Karl Menger in 1926.',
    sections: [
      { heading: 'History and origin', body: 'Karl Menger explored topological dimensions and generalized the idea of removing repeated holes on a cube, similar to the Cantor set and Sierpinski triangle.' },
      { heading: 'How it is built', body: 'Start with a cube, split it into 3x3x3 smaller cubes, remove the center and face centers, then repeat the process infinitely.' }
    ],
    bullets: [
      { label: 'Self-similarity', description: 'Every part looks like the whole fractal.' },
      { label: 'Infinite surface', description: 'Volume shrinks toward zero while surface grows unbounded.' },
      { label: 'Fractal dimension', description: 'Hausdorff dimension is roughly 2.727.' }
    ],
    highlight: 'The Menger Sponge is a classic example in fractal geometry and topology courses.',
    quiz: {
      question: 'What happens to the Menger Sponge volume after repeated iterations?',
      options: ['It grows to infinity', 'It stays constant', 'It shrinks toward zero', 'It oscillates'],
      answer: 2,
      explanation: 'The volume approaches zero while the surface area grows without bound.'
    }
  },
  'constructie-interactiva': {
    title: 'Interactive Construction',
    hero: 'https://mathsmodels.co.uk/images/Menger_Sponge/menger_0123_diagram.jpeg',
    intro: 'Interactive modeling makes fractals easier to grasp. In a digital build you can control the iteration level and watch the characteristic holes appear.',
    sections: [
      { heading: 'Core steps', body: 'Split the cube into 27 parts, remove the center and face centers, then repeat the operation on every remaining cube.' },
      { heading: 'Why interactivity matters', body: '3D viewing reveals symmetry and self-similarity; on mobile you can use gestures or device tilt to explore.' }
    ],
    bullets: [
      { label: 'Iteration control', description: 'Switch levels quickly to see complexity grow.' },
      { label: 'Performance', description: 'Use Low Graphics at high iterations for smoother frames.' },
      { label: 'Mobile friendly', description: 'Tilting the phone can rotate the model in real time.' }
    ],
    highlight: 'Direct interaction lowers the barrier to understanding and makes abstract concepts intuitive.',
    quiz: {
      question: 'What is the key step in building the Menger Sponge?',
      options: ['Scaling the cube', 'Removing the center and face centers', 'Coloring the edges', 'Projecting it to 2D'],
      answer: 1,
      explanation: 'At every subdivision, the center and face centers are removed to obtain the fractal structure.'
    }
  },
  'proprietati-matematice': {
    title: 'Mathematical Properties',
    hero: 'https://www.researchgate.net/publication/334398121/figure/fig6/AS:789632094568452@1565274370400/The-first-three-iterations-of-the-Menger-sponge-cube-with-volume-0-and-surface-area.png',
    intro: 'The Menger Sponge mixes a non-integer fractal dimension with infinite surface and zero volume, offering clear examples for topology and measure theory.',
    sections: [
      { heading: 'Dimension', body: 'Hausdorff dimension is ~2.727 - between a surface and a volume - capturing its fractal nature.' },
      { heading: 'Measure and volume', body: 'The surface grows to infinity while the volume collapses toward zero with each iteration.' }
    ],
    bullets: [
      { label: 'Exact self-similarity', description: 'The structure repeats identically at every zoom level.' },
      { label: 'Hole density', description: 'As iterations increase, the fractal becomes extremely porous.' },
      { label: 'Theoretical uses', description: 'Studies in measure theory, topology, and fractal dynamics.' }
    ],
    highlight: 'The Menger Sponge is a staple example in fractal and topology courses.',
    quiz: {
      question: 'What is the approximate Hausdorff dimension of the Menger Sponge?',
      options: ['2.0', '2.5', '2.727', '3.0'],
      answer: 2,
      explanation: 'The Hausdorff-Besicovitch dimension of the Menger Sponge is about 2.727.'
    }
  },
  galerie: {
    title: 'Gallery & Visuals',
    hero: 'https://www.robertdickau.com/spongeslice-mcube2-all.png',
    intro: 'The gallery gathers images and renders showing color, lighting, and iteration variations. See how materials change the feel of the structure.',
    sections: [
      { heading: 'Colors and materials', body: 'Rough materials highlight porosity, while metallic ones emphasize clean edges.' },
      { heading: 'Angles and light', body: 'Side lighting accentuates cavities; high angles reveal the layering of iterations.' }
    ],
    bullets: [
      { label: 'Comparisons', description: 'Image sets with different iterations to show progression.' },
      { label: 'Animations', description: 'Slow rotations to perceive volume and symmetry.' },
      { label: 'Textures', description: 'Material variations to emphasize the surface.' }
    ],
    highlight: 'A well-curated gallery increases engagement and understanding through varied visuals.',
    quiz: {
      question: 'What best reveals the voids of the Menger Sponge in a render?',
      options: ['Side lighting', 'Flat front lighting', 'No lighting', 'Metallic texture only'],
      answer: 0,
      explanation: 'Side lighting creates strong contrast that reveals the cavities.'
    }
  }
}

function BulletItem({ label, description }: Bullet) {
  return (
    <ReactNative.View style={{ flexDirection: 'row', marginTop: 10 }}>
      <ReactNative.Text style={{ color: ACCENT_3, marginRight: 8 }}>-</ReactNative.Text>
      <ReactNative.View style={{ flex: 1 }}>
        <ReactNative.Text style={{ color: TEXT, fontWeight: '700', marginBottom: 2 }}>{label}</ReactNative.Text>
        <ReactNative.Text style={{ color: SUB }}>{description}</ReactNative.Text>
      </ReactNative.View>
    </ReactNative.View>
  )
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = submitted && selected === quiz.answer

  return (
    <ReactNative.View style={{
      marginTop: 20,
      backgroundColor: PANEL,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: BORDER_SOFT
    }}>
      <ReactNative.Text style={{ color: TEXT, fontWeight: '800', fontSize: 16, marginBottom: 10 }}>Quick quiz</ReactNative.Text>
      <ReactNative.Text style={{ color: SUB, marginBottom: 12 }}>{quiz.question}</ReactNative.Text>
      {quiz.options.map((opt, idx) => {
        const isSelected = selected === idx
        const bg = isSelected ? 'rgba(216,180,254,0.18)' : 'rgba(255,255,255,0.06)'
        const border = isSelected ? 'rgba(216,180,254,0.6)' : BORDER_SOFT
        return (
          <ReactNative.TouchableOpacity
            key={opt}
            activeOpacity={0.9}
            onPress={() => !submitted && setSelected(idx)}
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: bg,
              borderWidth: 1,
              borderColor: border,
              marginBottom: 8
            }}
          >
            <ReactNative.Text style={{ color: TEXT }}>{opt}</ReactNative.Text>
          </ReactNative.TouchableOpacity>
        )
      })}
      <ReactNative.TouchableOpacity
        onPress={() => selected !== null && setSubmitted(true)}
        style={{
          marginTop: 6,
          paddingVertical: 10,
          borderRadius: 10,
          backgroundColor: ACCENT,
          alignItems: 'center'
        }}
      >
        <ReactNative.Text style={{ color: '#120A16', fontWeight: '900' }}>Check answer</ReactNative.Text>
      </ReactNative.TouchableOpacity>

      {submitted ? (
        <ReactNative.View style={{ marginTop: 12 }}>
          <ReactNative.Text style={{ color: isCorrect ? '#6fe29a' : '#fbd38d', fontWeight: '700' }}>
            {isCorrect ? 'Correct!' : 'Try again.'}
          </ReactNative.Text>
          <ReactNative.Text style={{ color: SUB, marginTop: 6 }}>{quiz.explanation}</ReactNative.Text>
        </ReactNative.View>
      ) : null}
    </ReactNative.View>
  )
}

export default function DetailScreen() {
  const router = useRouter()
  const { slug } = useLocalSearchParams<{ slug?: string }>()
  const data = useMemo(() => (slug ? detailContent[slug] : undefined), [slug])

  if (!data) {
    return (
      <ReactNative.View style={{ flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' }}>
        <ArchBackground />
        <ReactNative.Text style={{ color: TEXT, marginBottom: 12 }}>Page not found.</ReactNative.Text>
        <ReactNative.TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: ACCENT, borderRadius: 10 }}>
          <ReactNative.Text style={{ color: '#120A16', fontWeight: '900' }}>Go back</ReactNative.Text>
        </ReactNative.TouchableOpacity>
      </ReactNative.View>
    )
  }

  return (
    <ReactNative.View style={{ flex: 1, backgroundColor: BG }}>
      <ArchBackground />
      <ReactNative.ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <ReactNative.View style={{ paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ReactNative.TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <ReactNative.Text style={{ color: TEXT, fontSize: 18 }}>{'<'}</ReactNative.Text>
          </ReactNative.TouchableOpacity>
          <ReactNative.Text style={{ color: TEXT, fontWeight: '800' }}>Menger Sponge</ReactNative.Text>
          <ReactNative.View style={{ width: 32 }} />
        </ReactNative.View>
        <ReactNative.View style={{ paddingHorizontal: 12, marginTop: 6 }}>
          <RuriNav />
        </ReactNative.View>

        <ReactNative.View style={{ padding: 16 }}>
          <ReactNative.View style={{
            borderRadius: 18,
            overflow: 'hidden',
            backgroundColor: PANEL_2,
            borderWidth: 1,
            borderColor: BORDER_SOFT,
            marginBottom: 16
          }}>
          <ReactNative.Image
            source={{ uri: data.hero }}
            resizeMode="cover"
            style={{ width: '100%', aspectRatio: 16 / 9, minHeight: 190, maxHeight: 260 }}
          />
          <ReactNative.View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.08)' }} />
          </ReactNative.View>

          <ReactNative.Text style={{ color: TEXT, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>{data.title}</ReactNative.Text>
          <ReactNative.Text style={{ color: SUB, lineHeight: 22 }}>{data.intro}</ReactNative.Text>

          {data.sections.map((section) => (
            <ReactNative.View key={section.heading} style={{ marginTop: 18 }}>
              <ReactNative.Text style={{ color: ACCENT_3, fontWeight: '800', marginBottom: 8 }}>{section.heading}</ReactNative.Text>
              <ReactNative.Text style={{ color: SUB, lineHeight: 22 }}>{section.body}</ReactNative.Text>
            </ReactNative.View>
          ))}

          {data.bullets?.map((b) => <BulletItem key={b.label} {...b} />)}

          {data.highlight ? (
            <ReactNative.View style={{
              marginTop: 18,
              backgroundColor: PANEL,
              padding: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: BORDER_SOFT
            }}>
              <ReactNative.Text style={{ color: TEXT, fontWeight: '800', marginBottom: 6 }}>Did you know?</ReactNative.Text>
              <ReactNative.Text style={{ color: SUB }}>{data.highlight}</ReactNative.Text>
            </ReactNative.View>
          ) : null}

          <QuizCard quiz={data.quiz} />
        </ReactNative.View>
      </ReactNative.ScrollView>
    </ReactNative.View>
  )
}
