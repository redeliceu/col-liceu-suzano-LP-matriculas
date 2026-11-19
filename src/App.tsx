import { useEffect, useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import './styles/landing.css'
import './styles/success.css'
import Footer from './components/Footer'
import SuccessScreen from './components/SuccessScreen'
import { trackLead } from './lib/tracking'
import { whatsappLink } from './lib/contact'
import Logo from './assets/images/liceu-logo.svg'
import Badge from './assets/images/badge-matriculas-2027.svg'

const apiUrl = import.meta.env.VITE_API_URL as string | undefined

const webhookUrl = import.meta.env.VITE_WEBHOOK_URL as string | undefined

const formatWhatsApp = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const normalizeWhatsapp = (value: string) => value.replace(/\D/g, '').slice(0, 11)

const getUtmData = () => {
  if (typeof window === 'undefined') {
    return {}
  }

  const currentUrl = new URL(window.location.href)
  const currentPage = currentUrl.origin
  const params = new URLSearchParams(currentUrl.search)
  const fields = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    'utm_name',
    'utm_placement',
    'gclid',
  ] as const

  const utmData: Record<string, string> = {}

  for (const field of fields) {
    const value = params.get(field)

    if (value && value.trim()) {
      utmData[field] = value.trim()
    }
  }

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer)
      utmData.referrer = referrerUrl.origin
    } catch {
      utmData.referrer = document.referrer
    }
  }

  utmData.landing_page = currentPage

  return utmData
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [formData, setFormData] = useState({
    responsibleName: '',
    whatsapp: '',
    interestSeries: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname)

    window.addEventListener('popstate', handleLocationChange)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [])

  if (currentPath === '/sucesso') {
    return <SuccessScreen />
  }

  const fields = [
    {
      key: 'responsibleName',
      label: 'Nome do responsável',
      placeholder: 'Como podemos te chamar',
      type: 'text',
      autoComplete: 'name',
      value: formData.responsibleName,
      maxLength: undefined,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      placeholder: '(DDD) 99999-9999',
      type: 'tel',
      autoComplete: 'tel-national',
      value: formData.whatsapp,
      maxLength: 15,
    },
    {
      key: 'interestSeries',
      label: 'Série de interesse',
      placeholder: 'Ex: 1° ano do ensino fundamental',
      type: 'text',
      autoComplete: 'off',
      value: formData.interestSeries,
      maxLength: undefined,
    },
  ] as const

  const isFormValid = () => (
    formData.responsibleName.trim().length >= 2
    && normalizeWhatsapp(formData.whatsapp).length >= 10
    && formData.interestSeries.trim().length >= 2
  )

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setSubmitMessage('')
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'whatsapp' ? formatWhatsApp(value) : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isFormValid()) {
      setSubmitMessage('Confira o nome, o WhatsApp e a série de interesse antes de enviar.')
      return
    }

    if (!apiUrl) {
      setSubmitMessage('Não foi possível enviar os dados neste momento. Tente novamente.')
      return
    }

    const payload = {
      responsible_name: formData.responsibleName.trim(),
      mobile_phone: normalizeWhatsapp(formData.whatsapp),
      interest: formData.interestSeries.trim(),
      ...getUtmData(),
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: formData.responsibleName.trim(),
            phone: normalizeWhatsapp(formData.whatsapp),
            tags: ['landing-page'],
          }),
        }).catch((error) => console.error('Erro ao enviar lead para o webhook:', error))
      }

      const result = await response.json().catch(() => null) as {
        success?: boolean
        message?: string
        errors?: Record<string, string[]>
      } | null

      if (!response.ok || result?.success === false) {
        const fieldErrors = result?.errors
        const errorMessage = fieldErrors
          ? Object.values(fieldErrors)
              .flat()
              .join(' ')
          : result?.message || 'Não foi possível enviar os dados neste momento.'

        throw new Error(errorMessage)
      }

      setFormData({
        responsibleName: '',
        whatsapp: '',
        interestSeries: '',
      })
      // Conversão (Meta Lead + lead_matricula) só depois do envio confirmado pela API
      trackLead(payload.interest)
      window.history.pushState({}, '', '/sucesso')
      window.scrollTo(0, 0)
      setCurrentPath('/sucesso')
    } catch (error) {
      console.error('Erro ao enviar lead:', error)
      setSubmitMessage(error instanceof Error ? error.message : 'Não foi possível enviar os dados neste momento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="lp-shell" id="inicio">
      <section className="hero">
        <div className="hero-inner">
          <a className="hero-brand" href="#inicio" aria-label="Rede Liceu — Unidade Suzano">
            <img src={Logo} alt="Rede Liceu — Unidade Suzano" width={154} height={52} />
          </a>

          <h1 className="hero-title">
            A <span className="hero-title-accent">escola certa</span>
            <br />
            para sua família.
          </h1>

          <div className="lead-wrap">
            <img
              className="enrollment-badge"
              src={Badge}
              alt="Matrículas 2027 abertas"
              width={111}
              height={111}
            />

            <div className="lead-card" id="agendar">
              <h2>
                Preencha e <strong>agende uma visita</strong>
              </h2>

              <form className="lead-form" onSubmit={handleSubmit} noValidate>
                {fields.map((field) => (
                  <div className="form-field" key={field.key}>
                    <label htmlFor={field.key}>{field.label}</label>
                    <input
                      id={field.key}
                      name={field.key}
                      type={field.type}
                      value={field.value}
                      maxLength={field.maxLength}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      inputMode={field.type === 'tel' ? 'tel' : undefined}
                      required
                      onChange={(event) => handleInputChange(field.key, event.target.value)}
                    />
                  </div>
                ))}

                <button className="form-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar →'}
                </button>

                {submitMessage && <p className="form-message" role="alert">{submitMessage}</p>}
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <a className="whatsapp-float" href={whatsappLink} aria-label="Falar no WhatsApp" target="_blank" rel="noreferrer">
        <FaWhatsapp aria-hidden="true" />
      </a>
    </main>
  )
}

export default App
