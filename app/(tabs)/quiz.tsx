import React, { useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { ScreenShell } from '@/components/screen-shell'
import { ARCH } from '@/components/arch-theme'

const QUESTIONS = [
  { q: 'What happens to the Menger sponge volume as iterations increase?', options: ['Goes to infinity', 'Approaches zero', 'Stays constant', 'Oscillates'], answer: 1 },
  { q: 'Which fractal has dimension about 2.73?', options: ['Sierpinski triangle', 'Mandelbrot set', 'Menger sponge', 'Dragon curve'], answer: 2 },
  { q: 'Self-similarity means?', options: ['Random structure', 'Identical parts at many scales', 'Only 2D', 'Only in physics'], answer: 1 },
  { q: 'The Sierpinski triangle is built by?', options: ['Removing the center triangle repeatedly', 'Adding random noise', 'Slicing a cube', 'Projecting a sphere'], answer: 0 },
  { q: 'Mandelbrot set is defined in?', options: ['Real numbers only', 'Complex plane', '3D space', 'Vectors'], answer: 1 },
  { q: 'Fractal dimension can be non-integer because?', options: ['It is random', 'It fills space partially', 'It is always 2D', 'It is undefined'], answer: 1 },
  { q: 'A classic fractal in nature is?', options: ['Perfect circle', 'Romanesco broccoli', 'Square grid', 'Flat plane'], answer: 1 },
  { q: 'In a Menger sponge, each cube is divided into?', options: ['4 parts', '8 parts', '27 parts', '64 parts'], answer: 2 },
  { q: 'How many cubes remain after one Menger iteration?', options: ['7', '20', '27', '18'], answer: 1 },
  { q: 'The coastline paradox refers to?', options: ['Coasts are straight lines', 'Length increases with smaller ruler', 'They have fixed length', 'They are smooth'], answer: 1 },
  { q: 'A Julia set is associated with?', options: ['Random matrices', 'Complex dynamics', 'Fibonacci numbers', 'Prime gaps'], answer: 1 },
  { q: 'Which is a 3D fractal?', options: ['Cantor set', 'Koch snowflake', 'Menger sponge', 'Sierpinski triangle'], answer: 2 },
  { q: 'Fractals are useful in antennas because?', options: ['They are heavy', 'They are smooth', 'They pack long paths in small area', 'They are invisible'], answer: 2 },
  { q: 'The Koch snowflake has?', options: ['Finite perimeter', 'Infinite perimeter', 'No area', 'No edges'], answer: 1 },
  { q: 'Which method generates fractals by repeated function application?', options: ['Iterated Function Systems', 'Linear regression', 'Fourier series', 'Newton method'], answer: 0 },
  { q: 'A fractal is scale-invariant when?', options: ['It changes with scale', 'It looks similar at many scales', 'It is flat', 'It is random'], answer: 1 },
  { q: 'Menger sponge surface area tends to?', options: ['Zero', 'Infinity', 'Constant', 'Negative'], answer: 1 },
  { q: 'A common fractal in clouds is due to?', options: ['Turbulence', 'Gravity only', 'Metallic reflection', 'Perfect symmetry'], answer: 0 },
  { q: 'The term fractal was coined by?', options: ['Newton', 'Mandelbrot', 'Gauss', 'Euler'], answer: 1 },
  { q: 'In fractal rendering, zooming reveals?', options: ['Nothing', 'Repeating complexity', 'A blank area', 'Only noise'], answer: 1 }
]

export default function Quiz() {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [completed, setCompleted] = useState(false)

  const current = QUESTIONS[index]

  const handleAnswer = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === current.answer) {
      setScore((s) => s + 1)
    }
  }

  const nextQuestion = () => {
    if (index === QUESTIONS.length - 1) {
      setCompleted(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  return (
    <ScreenShell
      title="Quiz"
      subtitle="Answer the Menger sponge questions."
    >
      <View style={styles.progress}>
        <Text style={styles.progressText}>Level {Math.min(20, index + 1)}</Text>
        <Text style={styles.progressSub}>Question {Math.min(index + 1, QUESTIONS.length)} / {QUESTIONS.length}</Text>
      </View>

      {!completed ? (
        <View style={styles.card}>
          <Text style={styles.question}>{current.q}</Text>
          <View style={styles.options}>
            {current.options.map((opt, idx) => {
              const isSelected = selected === idx
              const isCorrect = selected !== null && idx === current.answer
              const isWrong = selected !== null && isSelected && idx !== current.answer
              return (
                <Pressable
                  key={opt}
                  onPress={() => handleAnswer(idx)}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    isCorrect && styles.optionCorrect,
                    isWrong && styles.optionWrong
                  ]}
                >
                  <Text style={styles.optionText}>{opt}</Text>
                </Pressable>
              )
            })}
          </View>
          <Pressable onPress={nextQuestion} style={styles.nextBtn}>
            <Text style={styles.nextText}>{index === QUESTIONS.length - 1 ? 'Finish' : 'Next'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.question}>Quiz complete!</Text>
          <Text style={styles.score}>Score: {score} / {QUESTIONS.length}</Text>
          <Pressable onPress={() => {
            setIndex(0)
            setScore(0)
            setSelected(null)
            setCompleted(false)
          }} style={styles.nextBtn}>
            <Text style={styles.nextText}>Retry</Text>
          </Pressable>
        </View>
      )}
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  progress: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: ARCH.PANEL,
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  progressText: {
    color: ARCH.TEXT,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.6
  },
  progressSub: {
    color: ARCH.SUB,
    marginTop: 4
  },
  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  question: {
    color: ARCH.TEXT,
    fontSize: 18,
    fontWeight: '800'
  },
  score: {
    color: ARCH.SUB,
    marginTop: 8
  },
  options: {
    marginTop: 14,
    gap: 10
  },
  option: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: ARCH.BORDER_SOFT
  },
  optionSelected: {
    borderColor: 'rgba(147,197,253,0.8)'
  },
  optionCorrect: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderColor: 'rgba(34,197,94,0.6)'
  },
  optionWrong: {
    backgroundColor: 'rgba(248,113,113,0.2)',
    borderColor: 'rgba(248,113,113,0.6)'
  },
  optionText: {
    color: ARCH.TEXT,
    fontWeight: '600'
  },
  nextBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: ARCH.ACCENT,
    alignItems: 'center'
  },
  nextText: {
    color: '#120A16',
    fontWeight: '800'
  },
  badges: {
    marginTop: 12,
    gap: 6
  },
  badge: {
    color: ARCH.TEXT,
    fontWeight: '700'
  }
})
