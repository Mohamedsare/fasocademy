// CinetPay - Paiement Mobile Money Burkina Faso
// Orange Money, Moov Money, Wave, Coris Money

export const initCinetPayPayment = ({
  amount,
  courseId,
  courseTitle,
  userEmail,
  userName,
  onSuccess,
  onError,
}) => {
  const transactionId = `FL_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`

  const apiBaseUrl = import.meta.env.VITE_API_URL

  if (!apiBaseUrl) {
    console.error('VITE_API_URL is not defined for CinetPay notify_url')
  }

  const script = document.createElement('script')
  script.src = 'https://cdn.cinetpay.com/seamless/main.js'
  document.head.appendChild(script)

  script.onload = () => {
    window.CinetPay.setConfig({
      apikey: import.meta.env.VITE_CINETPAY_API_KEY,
      site_id: import.meta.env.VITE_CINETPAY_SITE_ID,
      notify_url: apiBaseUrl
        ? `${apiBaseUrl}/api/payment-webhook`
        : undefined,
      mode: 'PRODUCTION', // or 'TEST' for sandbox
    })

    window.CinetPay.getCheckout({
      transaction_id: transactionId,
      amount,
      currency: 'XOF',
      channels: 'MOBILE_MONEY',
      description: `Formation: ${courseTitle}`,
      customer_name: userName,
      customer_email: userEmail,
      customer_phone_number: '',
      customer_address: 'Ouagadougou',
      customer_city: 'Ouagadougou',
      customer_country: 'BF',
      customer_state: 'BF',
      customer_zip_code: '00000',
      metadata: JSON.stringify({ courseId, userEmail }),
    })

    window.CinetPay.waitResponse(async (data) => {
      if (data.status === 'ACCEPTED') {
        onSuccess?.({ transactionId, data })
      } else {
        onError?.(data)
      }
    })

    window.CinetPay.onError((error) => {
      onError?.(error)
    })
  }
}

