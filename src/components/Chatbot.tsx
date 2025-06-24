'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

type ChatbotProps = {
  isOpen?: boolean
  setIsOpen?: (open: boolean) => void
  mode?: 'default' | 'manager'
  setMode?: (mode: 'default' | 'manager') => void
}

const Chatbot = ({ isOpen: externalIsOpen, setIsOpen: externalSetIsOpen, mode, setMode }: ChatbotProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalSetIsOpen || setInternalIsOpen

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm here to not only help you understand how Launch That Song works, but also how to strategically approach the platform, with your current fans and audience. Ask me anything about why this platform is valuable to you (the artist), how voting will work with future audiences who visit the site, strategies for bringing fans and followers into the site to vote up your music, or just how to get started!",
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null)
  const [hasShownSpecialMessage, setHasShownSpecialMessage] = useState(false)
  const [hasShownEquityMessage, setHasShownEquityMessage] = useState(false)
  const [shouldWiggle, setShouldWiggle] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Wiggle animation after 30 seconds on homepage
  useEffect(() => {
    if (!isOpen) {
      const wiggleTimer = setTimeout(() => {
        setShouldWiggle(true)
        // Stop wiggling after 3 seconds
        setTimeout(() => setShouldWiggle(false), 3000)
      }, 30000) // 30 seconds

      return () => clearTimeout(wiggleTimer)
    }
  }, [isOpen])

  // Track chat engagement and show special messages
  useEffect(() => {
    if (isOpen && !chatStartTime) {
      setChatStartTime(new Date())
    }

    if (isOpen && chatStartTime && !hasShownSpecialMessage) {
      const timer = setTimeout(() => {
        const specialMessage: Message = {
          id: 'special-engagement',
          text: "🎉 SPECIAL OPPORTUNITY ALERT! 🎉\n\nIn about 1 week, you'll be able to earn \"1 month featured spots\" on LaunchThatSong.com when you invite and successfully register more than 10 fans/audiences on the platform!\n\nYou can cash in these \"1 month features\" any time in the first two years of the platform's growth and promote your artist profile to all of the audiences we gather.\n\nThis is your chance to get massive exposure as we scale! Start thinking about which 10+ fans you want to bring to the platform. 🚀",
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, specialMessage])
        setHasShownSpecialMessage(true)
      }, 60000) // 60 seconds

      return () => clearTimeout(timer)
    }
  }, [isOpen, chatStartTime, hasShownSpecialMessage])

  // Show equity message after 3 minutes
  useEffect(() => {
    if (isOpen && chatStartTime && !hasShownEquityMessage) {
      const timer = setTimeout(() => {
        const equityMessage: Message = {
          id: 'equity-opportunity',
          text: "🏆 ULTIMATE OPPORTUNITY ALERT! 🏆\n\nIf you are able to invite more than 50 audiences into the platform, you will have the chance to earn EQUITY in the company prior to launch!\n\nThat means you can become a CO-OWNER of the business. This is the heart of this platform: It is a community-based platform that is designed to get the artist paid.\n\nYou're not just building your career - you're building ownership in the future of music distribution. Start thinking BIG about your network! 💎",
          isUser: false,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, equityMessage])
        setHasShownEquityMessage(true)
      }, 180000) // 3 minutes

      return () => clearTimeout(timer)
    }
  }, [isOpen, chatStartTime, hasShownEquityMessage])

  // Reset engagement tracking when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setChatStartTime(null)
      setHasShownSpecialMessage(false)
      setHasShownEquityMessage(false)
    }
  }, [isOpen])

  const knowledgeBase = {
    'voting': "Voting is simple! Browse artists on the homepage, click 'Vote Now' on any artist card, and cast your vote. Each vote helps artists reach their launch goals. You can track progress in real-time!",
    'artist': "Artists can submit their songs through our signup process. Once approved, their songs appear on the platform for voting. Artists get exclusive NFTs and real perks like backstage passes and house concerts!",
    'nft': "When you vote for songs, you earn exclusive limited-edition NFTs with real artist perks! These include backstage passes, house concerts, private showcases, and more unique experiences.",
    'launch': "Songs need to reach their target vote count to launch. Once a song hits its goal, it gets launched to the world! You can track progress on each artist's page.",
    'submit': "To submit your song, click 'Submit Your Song' on the homepage. You'll need to provide your artist info, song details, and upload your track. Our team will review and approve submissions.",
    'how it works': "Launch That Song works in 3 simple steps: 1) Vote for your favorite unreleased songs, 2) Earn exclusive NFTs with real artist perks, 3) Watch as your votes help launch songs to the world!",
    'perks': "NFT perks include backstage passes, house concerts, private showcases, meet & greets, exclusive merchandise, and more! Each artist offers unique experiences to their supporters.",
    'target': "Each song has a target vote count that needs to be reached before it can launch. You can see the progress bar on each artist card showing how close they are to their goal.",
    'signup': "Artists can sign up by clicking 'Submit Your Song' on the homepage. You'll need to provide your name, email, bio, and upload your song file. We'll review and get back to you quickly!",
    'approval': "After submitting, our team reviews each song for quality and fit. Once approved, your song goes live on the platform for voting. We'll notify you via email when you're approved!",
    'dashboard': "Artists get access to a dashboard where they can track votes, view analytics, manage their profile, and see their earnings. Login with your artist account to access these features.",
    'earnings': "Artists earn from NFT sales and platform revenue sharing. The more votes you get, the more you can earn! Check your dashboard for detailed analytics and earnings.",
    'voice comments': "Fans can purchase voice comments to leave audio messages for artists. These are special ways to show support and connect directly with your favorite musicians!",
    'cart': "Add voice comments and other items to your cart, then checkout securely. We use Stripe for safe payment processing.",
    'soundcloud': "🔥 PERFECT USE CASE ALERT! 🔥 If you have songs on SoundCloud or ReverbNation that aren't making you money and aren't on Spotify yet, THIS IS YOUR MOMENT! Take that song from free streaming, put it on LaunchThatSong.com, and invite your audience to pay to vote it up so you can truly release it through Spotify! Your friends and fans will finally be able to stream it properly and you'll get paid. This is the bridge from free to paid distribution!",
    'reverbnation': "🔥 PERFECT USE CASE ALERT! 🔥 If you have songs on ReverbNation or SoundCloud that aren't making you money and aren't on Spotify yet, THIS IS YOUR MOMENT! Take that song from free streaming, put it on LaunchThatSong.com, and invite your audience to pay to vote it up so you can truly release it through Spotify! Your friends and fans will finally be able to stream it properly and you'll get paid. This is the bridge from free to paid distribution!",
    'free streaming': "🔥 PERFECT USE CASE ALERT! 🔥 If you have songs on free platforms like SoundCloud or ReverbNation that aren't making you money and aren't on Spotify yet, THIS IS YOUR MOMENT! Take that song from free streaming, put it on LaunchThatSong.com, and invite your audience to pay to vote it up so you can truly release it through Spotify! Your friends and fans will finally be able to stream it properly and you'll get paid. This is the bridge from free to paid distribution!",
    'marketing': "Here's your multi-channel marketing strategy to promote your LaunchThatSong profile:\n\n📱 SOCIAL MEDIA:\n• Instagram Stories: 'My new song needs YOUR vote to get on Spotify! Link in bio'\n• TikTok: Create a 15-second snippet with 'Vote for this to hit Spotify'\n• Twitter: 'Help me launch this track to the world! Every vote counts'\n• Facebook: Share your artist page with a personal story\n\n📧 EMAIL CAMPAIGN:\n• Subject: 'I need your help to get my song on Spotify!'\n• Personal message about why this song matters to you\n• Clear call-to-action to vote\n• Share your LaunchThatSong profile link\n\n🎯 FAN ENGAGEMENT:\n• DM your superfans directly\n• Create a voting challenge with rewards\n• Host a live stream explaining the process\n• Offer exclusive behind-the-scenes content for voters\n\nI can help you generate specific posts and email templates for any of these channels!",
    'strategy': "Here's your multi-channel marketing strategy to promote your LaunchThatSong profile:\n\n📱 SOCIAL MEDIA:\n• Instagram Stories: 'My new song needs YOUR vote to get on Spotify! Link in bio'\n• TikTok: Create a 15-second snippet with 'Vote for this to hit Spotify'\n• Twitter: 'Help me launch this track to the world! Every vote counts'\n• Facebook: Share your artist page with a personal story\n\n📧 EMAIL CAMPAIGN:\n• Subject: 'I need your help to get my song on Spotify!'\n• Personal message about why this song matters to you\n• Clear call-to-action to vote\n• Share your LaunchThatSong profile link\n\n🎯 FAN ENGAGEMENT:\n• DM your superfans directly\n• Create a voting challenge with rewards\n• Host a live stream explaining the process\n• Offer exclusive behind-the-scenes content for voters\n\nI can help you generate specific posts and email templates for any of these channels!",
    'promote': "Here's your multi-channel marketing strategy to promote your LaunchThatSong profile:\n\n📱 SOCIAL MEDIA:\n• Instagram Stories: 'My new song needs YOUR vote to get on Spotify! Link in bio'\n• TikTok: Create a 15-second snippet with 'Vote for this to hit Spotify'\n• Twitter: 'Help me launch this track to the world! Every vote counts'\n• Facebook: Share your artist page with a personal story\n\n📧 EMAIL CAMPAIGN:\n• Subject: 'I need your help to get my song on Spotify!'\n• Personal message about why this song matters to you\n• Clear call-to-action to vote\n• Share your LaunchThatSong profile link\n\n🎯 FAN ENGAGEMENT:\n• DM your superfans directly\n• Create a voting challenge with rewards\n• Host a live stream explaining the process\n• Offer exclusive behind-the-scenes content for voters\n\nI can help you generate specific posts and email templates for any of these channels!",
    'featured': "🎉 That's right! In about 1 week, you'll be able to earn \"1 month featured spots\" on LaunchThatSong.com when you invite and successfully register more than 10 fans/audiences on the platform!\n\nYou can cash in these \"1 month features\" any time in the first two years of the platform's growth and promote your artist profile to all of the audiences we gather.\n\nThis is your chance to get massive exposure as we scale! Start thinking about which 10+ fans you want to bring to the platform. 🚀",
    'equity': "🏆 That's the ULTIMATE opportunity! If you are able to invite more than 50 audiences into the platform, you will have the chance to earn EQUITY in the company prior to launch!\n\nThat means you can become a CO-OWNER of the business. This is the heart of this platform: It is a community-based platform that is designed to get the artist paid.\n\nYou're not just building your career - you're building ownership in the future of music distribution. Start thinking BIG about your network! 💎",
    'ownership': "🏆 That's the ULTIMATE opportunity! If you are able to invite more than 50 audiences into the platform, you will have the chance to earn EQUITY in the company prior to launch!\n\nThat means you can become a CO-OWNER of the business. This is the heart of this platform: It is a community-based platform that is designed to get the artist paid.\n\nYou're not just building your career - you're building ownership in the future of music distribution. Start thinking BIG about your network! 💎",
    'audience': "Not yet! We are still in the test phase. Right now we're building the platform and getting artists set up. Once we launch, audiences will be able to pay to vote on your songs and help you get to Spotify!",
    'audiences': "Not yet! We are still in the test phase. Right now we're building the platform and getting artists set up. Once we launch, audiences will be able to pay to vote on your songs and help you get to Spotify!",
    'paying': "Not yet! We are still in the test phase. Right now we're building the platform and getting artists set up. Once we launch, audiences will be able to pay to vote on your songs and help you get to Spotify!",
    'test phase': "We are currently in the test phase, building the platform and getting artists set up. This is the perfect time to get your songs uploaded and ready for when audiences start voting!",
    'what do audiences get': "Great question! When audiences vote, they get:\n\n🎵 A download of your song\n🎫 Exclusive NFTs with real benefits like:\n• Early arrival to your shows\n• Backstage passes\n• Meet & greets\n• Private digital concerts\n• Exclusive merchandise\n• VIP access to your events\n\nIt's a win-win - they support you and get amazing experiences in return!",
    'audience rewards': "When audiences vote, they get:\n\n🎵 A download of your song\n🎫 Exclusive NFTs with real benefits like:\n• Early arrival to your shows\n• Backstage passes\n• Meet & greets\n• Private digital concerts\n• Exclusive merchandise\n• VIP access to your events\n\nIt's a win-win - they support you and get amazing experiences in return!",
    'rewards': "When audiences vote, they get:\n\n🎵 A download of your song\n🎫 Exclusive NFTs with real benefits like:\n• Early arrival to your shows\n• Backstage passes\n• Meet & greets\n• Private digital concerts\n• Exclusive merchandise\n• VIP access to your events\n\nIt's a win-win - they support you and get amazing experiences in return!",
    'get paid': "You get paid through Stripe! Here's how it works:\n\n💳 STRIPE CONNECTION:\n• Connect your Stripe account to receive payments\n• All voting revenue goes directly to your Stripe account\n• Secure, fast, and reliable payment processing\n• You can track all earnings in your dashboard\n\n💰 EARNING STREAMS:\n• Direct voting revenue from fans\n• NFT sales with your custom perks\n• Platform revenue sharing\n• Voice comment purchases\n\nStripe makes it easy and secure to get paid for your music!",
    'payment': "You get paid through Stripe! Here's how it works:\n\n💳 STRIPE CONNECTION:\n• Connect your Stripe account to receive payments\n• All voting revenue goes directly to your Stripe account\n• Secure, fast, and reliable payment processing\n• You can track all earnings in your dashboard\n\n💰 EARNING STREAMS:\n• Direct voting revenue from fans\n• NFT sales with your custom perks\n• Platform revenue sharing\n• Voice comment purchases\n\nStripe makes it easy and secure to get paid for your music!",
    'stripe': "You get paid through Stripe! Here's how it works:\n\n💳 STRIPE CONNECTION:\n• Connect your Stripe account to receive payments\n• All voting revenue goes directly to your Stripe account\n• Secure, fast, and reliable payment processing\n• You can track all earnings in your dashboard\n\n💰 EARNING STREAMS:\n• Direct voting revenue from fans\n• NFT sales with your custom perks\n• Platform revenue sharing\n• Voice comment purchases\n\nStripe makes it easy and secure to get paid for your music!",
    'voice comment': "🎤 VOICE COMMENTS FEATURE:\n\nFans can purchase voice comments to leave audio feedback on your songs! This is a game-changer because:\n\n• Real audio feedback from listeners\n• Direct connection with your audience\n• Valuable insights for your music\n• Additional revenue stream for you\n• Fans feel more connected to your process\n\nIt's like having a personal focus group for every song!",
    'social media': "🚀 ADVANCED SOCIAL MEDIA STRATEGIES:\n\n📱 INFLUENCER PARTNERSHIPS:\n• Partner with music influencers to promote your LaunchThatSong profile\n• Offer them exclusive NFTs or backstage access\n• Cross-promote on their platforms\n• Create collaborative content\n\n🎙️ PODCAST PROMOTION:\n• Mention LaunchThatSong.com on upcoming podcast appearances\n• Share your unique story and platform benefits\n• Offer exclusive content for podcast listeners\n• Create podcast-specific voting campaigns\n\n👥 ARTIST REFERRAL BENEFITS:\n• Refer other artists to the platform\n• Earn special rewards and recognition\n• Build your network and influence\n• Get early access to new features\n\nThis is about building a community, not just promoting yourself!",
    'influencer': "🚀 ADVANCED SOCIAL MEDIA STRATEGIES:\n\n📱 INFLUENCER PARTNERSHIPS:\n• Partner with music influencers to promote your LaunchThatSong profile\n• Offer them exclusive NFTs or backstage access\n• Cross-promote on their platforms\n• Create collaborative content\n\n🎙️ PODCAST PROMOTION:\n• Mention LaunchThatSong.com on upcoming podcast appearances\n• Share your unique story and platform benefits\n• Offer exclusive content for podcast listeners\n• Create podcast-specific voting campaigns\n\n👥 ARTIST REFERRAL BENEFITS:\n• Refer other artists to the platform\n• Earn special rewards and recognition\n• Build your network and influence\n• Get early access to new features\n\nThis is about building a community, not just promoting yourself!",
    'podcast': "🚀 ADVANCED SOCIAL MEDIA STRATEGIES:\n\n📱 INFLUENCER PARTNERSHIPS:\n• Partner with music influencers to promote your LaunchThatSong profile\n• Offer them exclusive NFTs or backstage access\n• Cross-promote on their platforms\n• Create collaborative content\n\n🎙️ PODCAST PROMOTION:\n• Mention LaunchThatSong.com on upcoming podcast appearances\n• Share your unique story and platform benefits\n• Offer exclusive content for podcast listeners\n• Create podcast-specific voting campaigns\n\n👥 ARTIST REFERRAL BENEFITS:\n• Refer other artists to the platform\n• Earn special rewards and recognition\n• Build your network and influence\n• Get early access to new features\n\nThis is about building a community, not just promoting yourself!",
    'referral': "🚀 ADVANCED SOCIAL MEDIA STRATEGIES:\n\n📱 INFLUENCER PARTNERSHIPS:\n• Partner with music influencers to promote your LaunchThatSong profile\n• Offer them exclusive NFTs or backstage access\n• Cross-promote on their platforms\n• Create collaborative content\n\n🎙️ PODCAST PROMOTION:\n• Mention LaunchThatSong.com on upcoming podcast appearances\n• Share your unique story and platform benefits\n• Offer exclusive content for podcast listeners\n• Create podcast-specific voting campaigns\n\n👥 ARTIST REFERRAL BENEFITS:\n• Refer other artists to the platform\n• Earn special rewards and recognition\n• Build your network and influence\n• Get early access to new features\n\nThis is about building a community, not just promoting yourself!",
    'help': "I'm here to help! You can ask me about voting, artist features, NFTs, how to submit songs, marketing strategies, payment through Stripe, voice comments, or anything else about Launch That Song. What would you like to know?"
  }

  // Helper to call OpenAI API
  async function fetchOpenAIResponse(messages: { role: string, content: string }[]) {
    const res = await fetch('/api/openai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    })
    if (!res.ok) throw new Error('OpenAI API error')
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Use OpenAI API for dynamic response
    try {
      const openaiMessages = [
        { role: 'system', content: "You are an expert music platform assistant for LaunchThatSong.com. Give strategic, actionable, and motivational advice to artists about moving their music from SoundCloud to LaunchThatSong, growing their audience, and monetizing unreleased songs. Use the platform's rocket fuel, NFT, and voice comment features in your answers." },
        ...messages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }))
      ]
      const aiText = await fetchOpenAIResponse(openaiMessages)
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } catch (err) {
      // fallback to static response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to the AI assistant right now. Please try again later.",
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  // Determine if opened externally (AI Music Manager button) or by chat icon
  const isExternallyControlled = externalIsOpen !== undefined && externalSetIsOpen !== undefined

  return (
    <div className={`fixed z-50 ${isOpen ? 'bottom-4 left-1/2 transform -translate-x-1/2' : 'bottom-4 left-4'}`}>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`bg-[#E55A2B] hover:bg-[#D14A1B] text-white rounded-full p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
            shouldWiggle ? 'animate-wiggle' : ''
          }`}
          aria-label="Open chat"
        >
          {/* LaunchThatSong rocket logo */}
          <svg className="w-12 h-12" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.894 2.553a1 1 0 00-1.789 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 w-[40rem] h-[48rem]`}>
          {/* Header */}
          <div className="bg-[#E55A2B] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Music Manager</h3>
              <p className="text-sm opacity-90">Let's get you paid!</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-[#E55A2B] text-white'
                      : message.id === 'special-engagement'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-yellow-300'
                      : message.id === 'equity-opportunity'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-red-400 shadow-lg'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 border border-gray-200 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E55A2B] focus:border-transparent text-gray-800"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="bg-[#E55A2B] hover:bg-[#D14A1B] disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Chatbot 