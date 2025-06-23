'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface FormData {
  artistName: string
  email: string
  password: string
  confirmPassword: string
  songName: string
  songFile: File | null
  bioImage: File | null
  bio: string
  website: string
  message: string
  agreeToTerms: boolean
  hasViewedTerms: boolean
}

export default function ArtistSignup() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    artistName: '',
    email: '',
    password: '',
    confirmPassword: '',
    songName: '',
    songFile: null,
    bioImage: null,
    bio: '',
    website: '',
    message: '',
    agreeToTerms: false,
    hasViewedTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, [name]: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match')
        setIsSubmitting(false)
        return
      }

      // Validate password length
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters')
        setIsSubmitting(false)
        return
      }

      // Validate terms agreement
      if (!formData.agreeToTerms || !formData.hasViewedTerms) {
        alert('You must view and agree to the Terms of Use')
        setIsSubmitting(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('artistName', formData.artistName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('confirmPassword', formData.confirmPassword)
      formDataToSend.append('songName', formData.songName)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('website', formData.website)
      formDataToSend.append('message', formData.message)
      
      if (formData.songFile) {
        formDataToSend.append('songFile', formData.songFile)
      }
      
      if (formData.bioImage) {
        formDataToSend.append('bioImage', formData.bioImage)
      }

      // Send to artist signup endpoint
      const response = await fetch('/api/artist-signup', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Artist account created successfully! Please check your email to verify your account. You can then login to access your dashboard.')
        router.push('/login')
      } else {
        alert(result.message || 'There was an error creating your account. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error creating your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openTerms = () => {
    setShowTerms(true)
    setFormData(prev => ({ ...prev, hasViewedTerms: true }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Artist Account</h1>
            <p className="text-gray-600 text-lg">
              Join Launch That Song and start your musical journey. Upload your first song and connect with fans worldwide.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Artist Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your artist name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email address"
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll send a verification link to this email
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Song Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Name *
                </label>
                <input
                  type="text"
                  name="songName"
                  value={formData.songName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter the name of your song"
                />
              </div>

              {/* Song Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Song Upload (.mp3) *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="songFile"
                    accept=".mp3"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload your first song (MP3 format, max 50MB)
                </p>
              </div>

              {/* Bio Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Photo *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="bioImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a photo of yourself or your band (JPG, PNG, max 10MB)
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Bio *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Tell us about yourself and your music"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="https://your-website.com"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none"
                  placeholder="Any additional information you'd like to share"
                />
              </div>

              {/* Terms of Use */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <button
                    type="button"
                    onClick={openTerms}
                    className="text-blue-600 hover:text-blue-700 underline text-sm"
                  >
                    View Terms of Use
                  </button>
                </div>
                
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    required
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-gray-50 mt-0.5"
                  />
                  <label className="block text-sm text-gray-700 leading-relaxed">
                    I have read and agree to the Terms of Use *
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 font-semibold text-lg"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Artist Account'}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[80vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Terms and Conditions</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-800">
              <h1 className="text-3xl font-bold text-blue-600 mb-4">Terms and Conditions</h1>
              <p className="text-sm text-gray-600 mb-6">
                <strong>Effective Date:</strong> June 22, 2025<br/>
                <strong>Last Updated:</strong> June 22, 2025
              </p>

              <p className="mb-6">
                Welcome to <strong>LaunchThatSong.com</strong>, a platform operated by <strong>Sudden Impact Labs LLC</strong> ("Company", "we", "us", "our"). These Terms and Conditions ("Terms") govern your access to and use of the LaunchThatSong.com website and its services ("Platform"). By creating an account or uploading content, you ("Artist", "User", or "You") agree to these Terms.
              </p>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">1. Platform Purpose</h2>
              <p className="mb-6">
                LaunchThatSong.com enables artists to upload original, unreleased music and receive votes (monetary support) from fans to unlock distribution to Spotify and other platforms. The platform also offers NFT rewards for fans and artists.
              </p>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">2. Content Ownership & Copyright</h2>
              <ul className="mb-6 pl-6">
                <li>You must own or have full legal rights to all music, lyrics, images, or media you upload.</li>
                <li>Uploading copyrighted content that you do not own is strictly prohibited and will result in:
                  <ul className="mt-2 pl-6">
                    <li>Immediate account suspension or termination</li>
                    <li>Legal action from affected parties</li>
                    <li>Cooperation with copyright enforcement agencies</li>
                  </ul>
                </li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">3. AI-Generated Content</h2>
              <ul className="mb-6 pl-6">
                <li>If you upload music, visuals, or lyrics that were partially or fully generated using artificial intelligence (AI), you must disclose this at the time of submission.</li>
                <li>You retain the right to distribute AI-assisted content only if no third-party rights are violated (e.g., cloned voices, sampled likenesses).</li>
                <li>Sudden Impact Labs assumes no liability for potential misuses of AI and reserves the right to remove or flag AI-generated content.</li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">4. NFT Rewards and Digital Goods</h2>
              <ul className="mb-6 pl-6">
                <li>Artists may optionally create NFTs offered to fans in exchange for votes or engagement.</li>
                <li>By using this feature, you certify you have the legal right to issue the digital content included in the NFT.</li>
                <li>LaunchThatSong.com may auto-generate a default NFT visual, or you may upload one, subject to moderation.</li>
                <li>NFTs do not guarantee future financial value or resale opportunities.</li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">5. Payments & Payouts</h2>
              <ul className="mb-6 pl-6">
                <li>Votes are cast using real money through Stripe. We collect a commission on each transaction.</li>
                <li>Payouts to artists are processed via Stripe Connect. Artists are responsible for tax reporting and compliance in their jurisdiction.</li>
                <li>Fraudulent earnings or impersonation will result in withheld payouts and account bans.</li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">6. Moderation & Account Termination</h2>
              <ul className="mb-6 pl-6">
                <li>We reserve the right to:
                  <ul className="mt-2 pl-6">
                    <li>Remove or restrict any content without notice</li>
                    <li>Approve or deny song publishing based on moderation criteria</li>
                    <li>Ban or restrict users who upload infringing or obscene content, violate these Terms, impersonate artists, or abuse payout systems</li>
                  </ul>
                </li>
                <li>We are not obligated to review every upload, but we will take swift action on discovered violations.</li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">7. Limitation of Liability</h2>
              <p className="mb-6">
                To the fullest extent permitted by law, Sudden Impact Labs shall not be held liable for user-submitted content, fraudulent activity, copyright violations, or NFT misrepresentation. You agree to indemnify and hold harmless Sudden Impact Labs from any claims arising from your use of the Platform.
              </p>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">8. Business Operations</h2>
              <ul className="mb-6 pl-6">
                <li>We do not act as a publisher, label, distributor, or legal agent on behalf of any artist.</li>
                <li>All content and promotional materials are user-submitted and not guaranteed to meet commercial, legal, or ethical standards.</li>
                <li>You acknowledge that funding, voting, or viewing content does not establish any guarantee of success or ownership rights.</li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">9. Account Verification</h2>
              <ul className="mb-6 pl-6">
                <li>You must be 18 years or older or have guardian permission to use LaunchThatSong.com.</li>
                <li>We may implement account verification mechanisms to reduce fraud.</li>
                <li>Failure to verify your identity may result in limited access or payout holds.</li>
              </ul>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">10. Termination</h2>
              <p className="mb-6">
                We may suspend or terminate your access to the Platform for any reason, including violations of these Terms. You may also close your account at any time. Termination does not waive prior obligations.
              </p>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">11. Changes to the Terms</h2>
              <p className="mb-6">
                We reserve the right to update these Terms at any time. Continued use of the Platform after updates constitutes acceptance of the revised Terms.
              </p>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">12. Governing Law</h2>
              <p className="mb-6">
                These Terms are governed by the laws of the State of [Insert State]. Any legal disputes will be handled in courts located in [Insert City, State].
              </p>

              <h2 className="text-xl font-bold text-blue-600 mt-8 mb-4">13. Contact Us</h2>
              <p className="mb-6">
                If you have questions about these Terms, contact:
              </p>
              <p className="mb-6">
                <strong>Email:</strong> support@launchthatsong.com<br/>
                <strong>Legal:</strong> legal@suddenimpactlabs.com
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 