'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/dashboard/sidebar'

const CSS = `
  .account-wrap {
    min-height: calc(100vh - 64px);
    background: white;
    padding: 40px 16px 80px;
  }
  .account-container {
    max-width: 600px;
    margin: 0 auto;
  }
  .account-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.875rem;
    font-weight: 700;
    color: #a09890;
    text-decoration: none;
    margin-bottom: 28px;
    transition: color 0.15s;
  }
  .account-back:hover { color: #5c5c5c; }
  .account-title {
    font-size: 1.75rem;
    font-weight: 900;
    color: #1c1c1c;
    margin: 0 0 8px;
    font-family: var(--font-sans);
  }
  .account-subtitle {
    font-size: 0.9375rem;
    color: #7a7068;
    margin: 0 0 36px;
  }
  .account-card {
    background: #f5f1e9;
    border-radius: 16px;
    border: 1px solid #ede9e0;
    padding: 24px;
    margin-bottom: 16px;
  }
  .account-card-title {
    font-size: 0.75rem;
    font-weight: 800;
    color: #a09890;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 16px;
  }
  .account-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  .account-field:last-child { margin-bottom: 0; }
  .account-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: #5c5c5c;
  }
  .account-input {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid #e8e3da;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: var(--font-sans);
    color: #1c1c1c;
    background: white;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .account-input:focus {
    outline: none;
    border-color: #ed7c5a;
  }
  .account-input:disabled {
    background: #f0ece6;
    color: #a09890;
    cursor: not-allowed;
  }
  .account-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .account-row .account-field { flex: 1; margin-bottom: 0; }
  .btn-primary {
    padding: 10px 20px;
    border-radius: 10px;
    background: #ed7c5a;
    color: white;
    font-size: 0.875rem;
    font-weight: 800;
    border: none;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
    font-family: var(--font-sans);
  }
  .btn-primary:hover { background: #d96a48; }
  .btn-primary:disabled { background: #e8c4b8; cursor: not-allowed; }
  .btn-secondary {
    padding: 10px 20px;
    border-radius: 10px;
    background: transparent;
    color: #5c5c5c;
    font-size: 0.875rem;
    font-weight: 700;
    border: 1.5px solid #e8e3da;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    font-family: var(--font-sans);
  }
  .btn-secondary:hover { border-color: #c8c0b8; color: #1c1c1c; }
  .btn-teal {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 10px;
    background: #55b6ca;
    color: white;
    font-size: 0.875rem;
    font-weight: 800;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s;
    font-family: var(--font-sans);
  }
  .btn-teal:hover { background: #3fa3b8; }
  .btn-danger {
    padding: 10px 20px;
    border-radius: 10px;
    background: transparent;
    color: #e05252;
    font-size: 0.875rem;
    font-weight: 700;
    border: 1.5px solid #f0c8c8;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    font-family: var(--font-sans);
  }
  .btn-danger:hover { background: #fff0f0; border-color: #e05252; }
  .account-msg {
    font-size: 0.8125rem;
    font-weight: 700;
    padding: 8px 12px;
    border-radius: 8px;
    margin-top: 10px;
  }
  .account-msg.success { background: #edf7f0; color: #2a7a4a; }
  .account-msg.error { background: #fff0f0; color: #cc4444; }
  .sub-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  .sub-status-info { display: flex; flex-direction: column; gap: 3px; }
  .sub-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .sub-badge.active { background: #e8f7ef; color: #2a7a4a; }
  .sub-badge.trialing { background: #e8f4f7; color: #1a7a94; }
  .sub-badge.expired { background: #fff0f0; color: #cc4444; }
  .sub-badge.none { background: #f0ede8; color: #8a8078; }
  .sub-detail { font-size: 0.8125rem; color: #7a7068; }
  .danger-zone {
    border-color: #f5d5d5;
  }
  .account-divider {
    border: none;
    border-top: 1px solid #f0ece6;
    margin: 16px 0;
  }
  .delete-confirm-box {
    background: #fff5f5;
    border: 1.5px solid #f5d5d5;
    border-radius: 10px;
    padding: 14px;
    margin-top: 12px;
  }
  .delete-confirm-box p {
    font-size: 0.875rem;
    color: #7a3333;
    margin: 0 0 12px;
  }
  @media (max-width: 480px) {
    .account-row { flex-direction: column; }
    .sub-status-row { flex-direction: column; align-items: flex-start; }
  }
`

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Email edit
  const [emailEdit, setEmailEdit] = useState('')
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [emailSaving, setEmailSaving] = useState(false)

  // Password change
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passSaving, setPassSaving] = useState(false)

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Billing portal
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState('')

  useEffect(() => {
    async function load(user: any) {
      if (!user) { router.push('/login'); return }
      setUser(user)
      setEmailEdit(user.email ?? '')

      const { data: prof } = await supabase
        .from('profiles')
        .select('subscription_status, trial_end, stripe_customer_id')
        .eq('id', user.id)
        .single()
      setProfile(prof)
      setLoading(false)
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        load(session?.user ?? null)
        subscription.unsubscribe()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const trialActive = profile?.trial_end && new Date(profile.trial_end) > new Date()
  const trialExpired = profile?.trial_end && new Date(profile.trial_end) <= new Date() && profile?.subscription_status !== 'active'
  const subStatus = profile?.subscription_status === 'active' ? 'active'
    : trialActive ? 'trialing'
    : trialExpired ? 'expired'
    : 'none'

  const subLabel = subStatus === 'active' ? 'Active'
    : subStatus === 'trialing' ? 'Free Trial'
    : subStatus === 'expired' ? 'Trial Ended'
    : 'No Subscription'

  const subDetail = subStatus === 'active' ? 'Games & Lessons subscription'
    : subStatus === 'trialing' ? `Trial ends ${new Date(profile?.trial_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : subStatus === 'expired' ? 'Your free trial has ended'
    : null

  async function handleEmailSave() {
    if (!emailEdit || emailEdit === user?.email) return
    setEmailSaving(true)
    setEmailMsg(null)
    const { error } = await supabase.auth.updateUser({ email: emailEdit })
    setEmailSaving(false)
    if (error) {
      setEmailMsg({ type: 'error', text: error.message })
    } else {
      setEmailMsg({ type: 'success', text: 'Check your new email address for a confirmation link.' })
    }
  }

  async function handlePasswordSave() {
    if (!newPass || newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }
    if (newPass.length < 8) {
      setPassMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setPassSaving(true)
    setPassMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setPassSaving(false)
    if (error) {
      setPassMsg({ type: 'error', text: error.message })
    } else {
      setPassMsg({ type: 'success', text: 'Password updated successfully.' })
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    }
  }

  async function handleBillingPortal() {
    setBillingLoading(true)
    setBillingError('')
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setBillingError(data.error || 'Could not open billing portal. Please contact support.')
        setBillingLoading(false)
      }
    } catch {
      setBillingError('Something went wrong. Please try again.')
      setBillingLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    try {
      await fetch('/api/delete-account', { method: 'POST' })
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      // silently fail — user can contact support
    }
  }

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="account-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#a09890', fontWeight: 700 }}>Loading...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="account-wrap">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '40px' }}>
          <DashboardSidebar />
          <div className="account-container" style={{ maxWidth: '600px', width: '100%', margin: 0 }}>

          <h1 className="account-title">Account Settings</h1>
          <p className="account-subtitle">{user?.email}</p>

          {/* Subscription Status */}
          <div className="account-card">
            <div className="account-card-title">Subscription</div>
            <div className="sub-status-row">
              <div className="sub-status-info">
                <span className={`sub-badge ${subStatus}`}>{subLabel}</span>
                {subDetail && <span className="sub-detail">{subDetail}</span>}
              </div>
              {subStatus === 'active' && (
                <button
                  className="btn-teal"
                  onClick={handleBillingPortal}
                  disabled={billingLoading}
                >
                  {billingLoading ? 'Loading...' : 'Manage Billing →'}
                </button>
              )}
              {(subStatus === 'expired' || subStatus === 'none') && (
                <a href="/pricing" className="btn-primary" style={{ textDecoration: 'none' }}>
                  Subscribe Now →
                </a>
              )}
            </div>
            {billingError && <div className="account-msg error" style={{ marginTop: 10 }}>{billingError}</div>}
          </div>

          {/* Email */}
          <div className="account-card">
            <div className="account-card-title">Email Address</div>
            <div className="account-row">
              <div className="account-field">
                <label className="account-label">Email</label>
                <input
                  type="email"
                  className="account-input"
                  value={emailEdit}
                  onChange={e => setEmailEdit(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                onClick={handleEmailSave}
                disabled={emailSaving || emailEdit === user?.email}
              >
                {emailSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {emailMsg && <div className={`account-msg ${emailMsg.type}`}>{emailMsg.text}</div>}
          </div>

          {/* Password */}
          <div className="account-card">
            <div className="account-card-title">Change Password</div>
            <div className="account-field">
              <label className="account-label">New Password</label>
              <input
                type="password"
                className="account-input"
                placeholder="At least 8 characters"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
              />
            </div>
            <div className="account-field">
              <label className="account-label">Confirm New Password</label>
              <input
                type="password"
                className="account-input"
                placeholder="Repeat new password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handlePasswordSave}
              disabled={passSaving || !newPass || !confirmPass}
              style={{ marginTop: 4 }}
            >
              {passSaving ? 'Updating...' : 'Update Password'}
            </button>
            {passMsg && <div className={`account-msg ${passMsg.type}`}>{passMsg.text}</div>}
          </div>

          {/* Danger Zone */}
          <div className="account-card danger-zone">
            <div className="account-card-title" style={{ color: '#cc6666' }}>Danger Zone</div>

            {subStatus === 'active' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1c1c1c' }}>Cancel Subscription</div>
                    <div style={{ fontSize: '0.8125rem', color: '#7a7068', marginTop: 2 }}>You'll keep access until the end of your billing period.</div>
                  </div>
                  <button className="btn-danger" onClick={handleBillingPortal}>Cancel Plan</button>
                </div>
                <hr className="account-divider" />
              </>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1c1c1c' }}>Delete Account</div>
                <div style={{ fontSize: '0.8125rem', color: '#7a7068', marginTop: 2 }}>Permanently delete your account and all data.</div>
              </div>
              <button className="btn-danger" onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}>
                Delete Account
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="delete-confirm-box">
                <p>This cannot be undone. Type <strong>DELETE</strong> to confirm.</p>
                <div className="account-row" style={{ alignItems: 'center' }}>
                  <div className="account-field">
                    <input
                      type="text"
                      className="account-input"
                      placeholder="Type DELETE"
                      value={deleteConfirmText}
                      onChange={e => setDeleteConfirmText(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE'}
                    style={{ marginBottom: 0 }}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
        </div>
      </div>
    </>
  )
}
