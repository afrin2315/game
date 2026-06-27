import { supabase } from './supabase'

export async function loadRazorpayScript() {
  if (window.Razorpay) return true
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function createOrder(payload) {
  const { data, error } = await supabase.functions.invoke('create-razorpay-order', { body: payload })
  if (error) throw error
  return data
}

export async function verifyPayment(payload) {
  const { data, error } = await supabase.functions.invoke('verify-payment', { body: payload })
  if (error) throw error
  return data
}
