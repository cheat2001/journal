// Notification Sound Utility
export class NotificationSound {
  private audioContext: AudioContext | null = null
  private isEnabled: boolean = true
  private notificationPermission: NotificationPermission = 'default'

  constructor() {
    // Initialize Audio Context on first user interaction
    this.initializeAudioContext()
    this.checkNotificationPermission()
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  private async checkNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      this.notificationPermission = permission
      return permission === 'granted'
    }
    return false
  }

  private showBrowserNotification(title: string, body: string, icon?: string) {
    if (this.notificationPermission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-message',
        requireInteraction: false,
        silent: false
      })

      // Auto-close after 4 seconds
      setTimeout(() => {
        notification.close()
      }, 4000)

      // Focus window when notification is clicked
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  // Generate a pleasant notification beep
  private createBeepSound(frequency: number = 800, duration: number = 200, volume: number = 0.3) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Configure oscillator
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = 'sine'

    // Configure gain (volume) with smooth fade out
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000)

    // Play sound
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration / 1000)
  }

  // Create a pleasant two-tone notification
  private createNotificationChime() {
    if (!this.audioContext) return

    // First tone - higher pitch
    setTimeout(() => this.createBeepSound(880, 150, 0.2), 0)
    // Second tone - lower pitch
    setTimeout(() => this.createBeepSound(660, 200, 0.2), 100)
  }

  // Create a cool multi-tone message notification
  private createCoolMessageNotification() {
    if (!this.audioContext) return

    // Create a pleasant ascending melody
    const notes = [
      { freq: 523, delay: 0, duration: 120, volume: 0.15 },    // C5
      { freq: 659, delay: 80, duration: 120, volume: 0.18 },   // E5
      { freq: 784, delay: 160, duration: 150, volume: 0.15 },  // G5
    ]

    notes.forEach(note => {
      setTimeout(() => {
        this.createBeepSound(note.freq, note.duration, note.volume)
      }, note.delay)
    })
  }

  // Create an attention-grabbing message received sound
  private createMessageReceivedSound() {
    if (!this.audioContext) return

    // Create a distinctive "ding-dong" doorbell-like sound
    const sounds = [
      { freq: 800, delay: 0, duration: 200, volume: 0.2 },     // High ding
      { freq: 600, delay: 150, duration: 300, volume: 0.25 },  // Lower dong
      { freq: 700, delay: 300, duration: 150, volume: 0.15 },  // Gentle echo
    ]

    sounds.forEach(sound => {
      setTimeout(() => {
        this.createBeepSound(sound.freq, sound.duration, sound.volume)
      }, sound.delay)
    })
  }

  // Create a premium notification sound with reverb effect
  private createPremiumNotification() {
    if (!this.audioContext) return

    const currentTime = this.audioContext.currentTime

    // Create main oscillator
    const mainOsc = this.audioContext.createOscillator()
    const mainGain = this.audioContext.createGain()
    
    // Create echo/delay effect
    const delay = this.audioContext.createDelay(0.3)
    const delayGain = this.audioContext.createGain()
    const feedback = this.audioContext.createGain()

    // Connect main sound
    mainOsc.connect(mainGain)
    mainGain.connect(this.audioContext.destination)
    
    // Connect delay effect
    mainGain.connect(delay)
    delay.connect(delayGain)
    delayGain.connect(this.audioContext.destination)
    delayGain.connect(feedback)
    feedback.connect(delay)

    // Configure main sound
    mainOsc.frequency.setValueAtTime(880, currentTime)
    mainOsc.frequency.exponentialRampToValueAtTime(1100, currentTime + 0.1)
    mainOsc.frequency.exponentialRampToValueAtTime(660, currentTime + 0.4)
    mainOsc.type = 'sine'

    // Configure gain envelope
    mainGain.gain.setValueAtTime(0, currentTime)
    mainGain.gain.linearRampToValueAtTime(0.3, currentTime + 0.05)
    mainGain.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.3)
    mainGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6)

    // Configure delay
    delay.delayTime.setValueAtTime(0.15, currentTime)
    delayGain.gain.setValueAtTime(0.3, currentTime)
    feedback.gain.setValueAtTime(0.4, currentTime)

    // Play
    mainOsc.start(currentTime)
    mainOsc.stop(currentTime + 0.6)
  }

  // Play different sounds for different events
  async playMessageReceived(senderName?: string) {
    if (!this.isEnabled) return

    try {
      // Resume audio context if it's suspended (browser policy)
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Use the premium notification sound for received messages
      this.createPremiumNotification()
      
      // Show browser notification if page is not visible
      if (senderName) {
        this.showBrowserNotification(
          `New message from ${senderName}`,
          'You have received a new message',
          '/icon.svg'
        )
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  async playMessageSent() {
    if (!this.isEnabled) return

    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Subtle sound for sent messages
      this.createBeepSound(600, 100, 0.15)
    } catch (error) {
      console.warn('Failed to play sent message sound:', error)
    }
  }

  async playNewChatNotification(userName?: string) {
    if (!this.isEnabled) return

    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Special sound for new chat started
      this.createCoolMessageNotification()
      
      // Show browser notification for new chat
      if (userName) {
        this.showBrowserNotification(
          `New conversation with ${userName}`,
          'A new chat conversation has started',
          '/icon.svg'
        )
      }
    } catch (error) {
      console.warn('Failed to play new chat notification:', error)
    }
  }

  async playTyping() {
    if (!this.isEnabled) return

    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Very subtle typing sound
      this.createBeepSound(400, 50, 0.05)
    } catch (error) {
      console.warn('Failed to play typing sound:', error)
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    localStorage.setItem('notificationSoundsEnabled', enabled.toString())
  }

  getNotificationPermission(): NotificationPermission {
    return this.notificationPermission
  }

  isNotificationEnabled(): boolean {
    return this.isEnabled
  }

  isAudioEnabled(): boolean {
    return this.isEnabled && this.audioContext !== null
  }

  // Request permission and initialize (call on user interaction)
  async initialize() {
    try {
      if (!this.audioContext) {
        this.initializeAudioContext()
      }

      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      return true
    } catch (error) {
      console.warn('Failed to initialize audio:', error)
      return false
    }
  }
}

// Create a singleton instance
export const notificationSound = new NotificationSound()

// Auto-initialize on first user interaction
let isInitialized = false
const initializeOnInteraction = async () => {
  if (!isInitialized) {
    await notificationSound.initialize()
    isInitialized = true
    // Remove listeners after first initialization
    document.removeEventListener('click', initializeOnInteraction)
    document.removeEventListener('keydown', initializeOnInteraction)
    document.removeEventListener('touchstart', initializeOnInteraction)
  }
}

// Add event listeners for user interaction
document.addEventListener('click', initializeOnInteraction)
document.addEventListener('keydown', initializeOnInteraction)
document.addEventListener('touchstart', initializeOnInteraction)
