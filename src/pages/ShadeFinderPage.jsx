import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Palette, Sparkles } from 'lucide-react'
import { fetchShadeFinderQuestions, fetchShadeFinderResults } from '../services/shadeApi.js'
import styles from './ShadeFinderPage.module.css'

const skinToneFallback = [
  { label: 'Fair', swatch: '#f8e8dc' },
  { label: 'Light', swatch: '#e6cbb4' },
  { label: 'Medium', swatch: '#c99469' },
  { label: 'Tan', swatch: '#9a5f35' },
  { label: 'Deep', swatch: '#5f341f' },
]

const undertoneFallback = [
  { label: 'Cool', swatch: '#f3dbe8', accent: 'Cool pink' },
  { label: 'Neutral', swatch: '#f3e0c7', accent: 'Balanced' },
  { label: 'Warm', swatch: '#e7bd75', accent: 'Golden' },
  { label: 'Olive', swatch: '#8c7b45', accent: 'Muted green' },
]

const productTypeFallback = ['Foundation', 'Concealer', 'Lipstick']
const finishFallback = ['Natural', 'Matte', 'Dewy', 'Full Coverage']

function normalizeStepOptions(step) {
  if (!step.options || !Array.isArray(step.options)) return []
  if (step.type === 'swatch') {
    return step.options.map((opt) => ({
      label: opt.label,
      swatch: opt.swatch || '#ccc',
      accent: opt.accent || ''
    }))
  }
  if (step.type === 'card') {
    return step.options.map((opt) => opt.label)
  }
  return step.options.map((opt) => opt.label)
}

function buildStepsFromQuestions(questions) {
  return questions.map((q) => ({
    key: q.key,
    title: q.title,
    description: q.description || '',
    options: normalizeStepOptions(q)
  }))
}

function ShadeFinderPage() {
  const [answers, setAnswers] = useState({
    skinTone: '',
    undertone: '',
    productType: '',
    finish: '',
  })
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [shades, setShades] = useState([])
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    const loadQuestionsAndResults = async () => {
      setLoading(true)
      try {
        const [qItems, rItems] = await Promise.all([
          fetchShadeFinderQuestions().catch(() => []),
          fetchShadeFinderResults().catch(() => [])
        ])

        const qList = Array.isArray(qItems) ? qItems : []
        const activeQ = qList.filter((item) => !item.status || ['active', 'ACTIVE'].includes(String(item.status).toUpperCase()))
        if (activeQ.length) setQuestions(activeQ)

        const rList = Array.isArray(rItems) ? rItems : []
        const activeR = rList.filter((item) => !item.status || ['active', 'ACTIVE'].includes(String(item.status).toUpperCase()))
        if (activeR.length) setShades(activeR)
      } catch (e) {
        console.error('Failed to load shade finder data', e)
      }
      setLoading(false)
    }

    loadQuestionsAndResults()
  }, [])

  const steps = useMemo(() => {
    if (questions.length) {
      return buildStepsFromQuestions(questions)
    }
    return [
      { key: 'skinTone', title: 'Select Skin Tone', description: 'Pick the undertone range that best matches your complexion.', options: skinToneFallback },
      { key: 'undertone', title: 'Select Undertone', description: 'Your undertone helps narrow the match.', options: undertoneFallback },
      { key: 'productType', title: 'Select Product Type', description: 'Choose the type of product you want to shop.', options: productTypeFallback },
      { key: 'finish', title: 'Preferred Finish', description: 'This helps us refine your ideal look.', options: finishFallback },
    ]
  }, [questions])

  const currentStep = steps[step]
  const progress = ((step + 1) / steps.length) * 100
  const selectedValue = answers[currentStep.key]

  const recommendation = useMemo(() => {
    const skinTone = answers.skinTone || 'Medium'
    const undertone = answers.undertone || 'Neutral'
    const productType = answers.productType || 'Foundation'
    const finish = answers.finish || 'Natural'

    // Try finding exact match from MongoDB results
    const matched = shades.find((s) => {
      const matchTone = !s.skinTone || s.skinTone.toLowerCase() === skinTone.toLowerCase() || s.skinTone.toLowerCase() === 'any'
      const matchUndertone = !s.undertone || s.undertone.toLowerCase() === undertone.toLowerCase() || s.undertone.toLowerCase() === 'any'
      return matchTone && matchUndertone
    })

    const shadeMap = {
      Fair: { Cool: 'Porcelain Rose', Neutral: 'Ivory Velvet', Warm: 'Soft Nude', Olive: 'Golden Sand' },
      Light: { Cool: 'Rose Petal', Neutral: 'Warm Ivory', Warm: 'Honey Beige', Olive: 'Olive Nude' },
      Medium: { Cool: 'Soft Tan', Neutral: 'Golden Beige', Warm: 'Amber Glow', Olive: 'Terracotta Nude' },
      Tan: { Cool: 'Caramel Rose', Neutral: 'Toasted Sand', Warm: 'Cocoa Hint', Olive: 'Mossed Bronze' },
      Deep: { Cool: 'Espresso Rose', Neutral: 'Rich Chestnut', Warm: 'Molten Cocoa', Olive: 'Deep Olive' },
    }

    const shadeName = matched?.shadeName || matched?.title || shadeMap[skinTone]?.[undertone] || 'Golden Beige'
    const toneHex = matched?.toneHex || skinToneFallback.find((option) => option.label === skinTone)?.swatch || '#c99469'
    const undertoneHex = matched?.undertoneHex || undertoneFallback.find((option) => option.label === undertone)?.swatch || '#f3e0c7'
    const blendHex = matched?.blendHex || `${toneHex}`

    const productLabel = productType === 'Lipstick' ? 'Lip Colour' : productType

    return {
      shadeName,
      blendHex,
      toneHex,
      undertoneHex,
      explanation: matched?.explanation || `${productType} in ${shadeName} gives a balanced ${finish.toLowerCase()} finish with a natural transition from ${skinTone.toLowerCase()} skin to ${undertone.toLowerCase()} undertones.`,
      suggestedProductType: productLabel,
      finish,
    }
  }, [answers, shades])

  const selectOption = (value) => {
    setAnswers((current) => ({ ...current, [currentStep.key]: value }))
  }

  const goNext = () => {
    if (!selectedValue) return

    if (step === steps.length - 1) {
      setFinished(true)
      return
    }

    setStep((current) => current + 1)
  }

  const goBack = () => {
    if (step === 0) return
    setStep((current) => current - 1)
  }

  const restart = () => {
    setAnswers({ skinTone: '', undertone: '', productType: '', finish: '' })
    setStep(0)
    setFinished(false)
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <div className={styles.heroCard}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Shade matching made effortless</span>
            <h1>Find Your Perfect Shade</h1>
            <p>Use a simple guided selector to discover a polished match for foundation, concealer or lipstick.</p>
          </div>

          <div className={styles.heroBadge}>
            <Palette size={20} />
            <span>Everyday elegance, expertly matched</span>
          </div>
        </div>

        {loading ? (
        <div className={styles.quizCard}>
          <div className={styles.progressWrap}>
            <div className={styles.progressMeta}>
              <span>Loading shade options...</span>
            </div>
          </div>
        </div>
      ) : !finished ? (
          <div className={styles.quizCard}>
            <div className={styles.progressWrap}>
              <div className={styles.progressMeta}>
                <span>{step + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className={styles.questionBlock}>
              <h2>{currentStep.title}</h2>
              <p>{currentStep.description}</p>

              {currentStep.key === 'skinTone' && (
                <div className={styles.optionGrid}>
                  {(currentStep.options || []).map((option) => {
                    const isSelected = selectedValue === option.label
                    return (
                      <button key={option.label} type="button" className={`${styles.optionButton} ${isSelected ? styles.optionButtonActive : ''}`} onClick={() => selectOption(option.label)}>
                        <span className={styles.swatch} style={{ background: option.swatch }} />
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {currentStep.key === 'undertone' && (
                <div className={styles.optionGrid}>
                  {(currentStep.options || []).map((option) => {
                    const isSelected = selectedValue === option.label
                    return (
                      <button key={option.label} type="button" className={`${styles.optionButton} ${isSelected ? styles.optionButtonActive : ''}`} onClick={() => selectOption(option.label)}>
                        <span className={styles.swatch} style={{ background: option.swatch }} />
                        <span>{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {currentStep.key === 'productType' && (
                <div className={styles.cardGrid}>
                  {(currentStep.options || []).map((option) => {
                    const isSelected = selectedValue === option
                    return (
                      <button key={option} type="button" className={`${styles.typeCard} ${isSelected ? styles.optionButtonActive : ''}`} onClick={() => selectOption(option)}>
                        <Sparkles size={20} />
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {currentStep.key === 'finish' && (
                <div className={styles.cardGrid}>
                  {(currentStep.options || []).map((option) => {
                    const isSelected = selectedValue === option
                    return (
                      <button key={option} type="button" className={`${styles.typeCard} ${isSelected ? styles.optionButtonActive : ''}`} onClick={() => selectOption(option)}>
                        <span>{option}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={goBack} disabled={step === 0}>
                <ArrowLeft size={18} />
                Back
              </button>

              <button type="button" className={styles.primaryButton} onClick={goNext} disabled={!selectedValue}>
                {step === steps.length - 1 ? 'Show My Match' : 'Continue'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <span className={styles.eyebrow}>Recommended match</span>
              <h2>{recommendation.shadeName}</h2>
              <p>{recommendation.explanation}</p>
            </div>

            <div className={styles.resultPanel}>
              <div className={styles.colorPreview}>
                <div className={styles.colorSwatch} style={{ background: recommendation.blendHex }} />
                <div className={styles.colorDetails}>
                  <h3>Shade color preview</h3>
                  <p>{recommendation.shadeName}</p>
                  <span>Suggested product type: {recommendation.suggestedProductType}</span>
                </div>
              </div>

              <div className={styles.matchInfo}>
                <div>
                  <strong>Skin tone</strong>
                  <p>{answers.skinTone}</p>
                </div>
                <div>
                  <strong>Undertone</strong>
                  <p>{answers.undertone}</p>
                </div>
                <div>
                  <strong>Finish</strong>
                  <p>{recommendation.finish}</p>
                </div>
              </div>
            </div>

            <div className={styles.resultActions}>
              <Link to="/shop" className={styles.primaryButton}>
                Shop This Shade
                <ArrowRight size={18} />
              </Link>
              <button type="button" className={styles.secondaryButton} onClick={restart}>
                Start Again
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ShadeFinderPage
