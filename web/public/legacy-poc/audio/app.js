// Brainrot Character Construction Studio - Maximum Chaos JavaScript with SOUND SUPPORT

// Application data - brain rot character components with sound integration
const brainrotData = {
  animals: ["shark", "elephant", "crocodile", "frog", "chimpanzee", "goose", "cat", "shrimp", "pigeon", "dog", "tiger", "dolphin", "penguin", "octopus", "rabbit", "hamster"],
  objects: ["sneakers", "airplane", "tire", "baseball bat", "coffee cup", "cactus", "telephone", "umbrella", "guitar", "bicycle", "computer", "microwave", "scissors", "hammer", "sunglasses", "backpack"],
  food: ["coconut", "banana", "pasta", "pizza", "cappuccino", "spaghetti", "gelato", "prosciutto", "mozzarella", "ravioli", "tiramisu", "espresso", "focaccia", "risotto", "bruschetta", "cannoli"],
  italianSuffixes: ["-ini", "-ello", "-anto", "-ino", "-oni", "-acci", "-otto", "-etto", "-ello", "-ino", "-oni", "-ucci"],
  nonsenseSyllables: ["tra", "la", "tung", "coco", "fanto", "bom", "pim", "skib", "ralla", "toro", "bani", "chuci", "walla", "pata", "fifi", "mama", "papa"],
  onomatopoeia: ["boom", "crash", "bang", "pop", "zip", "whoosh", "splat", "thud", "bing", "ding", "ring", "ping", "clang", "thwack", "kapow", "boing"],
  italianWords: ["bambino", "cappuccino", "spaghetti", "pasta", "pizza", "gelato", "ciao", "bello", "amore", "famiglia", "casa", "vita", "sole", "mare", "montagna", "cielo"],
  phrases: [
    "It's the {X} for me",
    "Not the {X} again!",
    "Only in {place}",
    "That's so {adjective}",
    "When the {X} hits different",
    "POV: You're a {X}",
    "Tell me you're {X} without telling me you're {X}"
  ],
  traits: ["chaotic", "mysterious", "sneaky", "dramatic", "elegant", "clumsy", "powerful", "tiny but fierce", "always hungry", "never sleeps", "speaks in riddles", "obsessed with music", "afraid of water", "loves to dance", "collects shiny objects", "has trust issues"],
  powers: ["time manipulation", "super speed", "invisibility", "mind reading", "shape shifting", "teleportation", "weather control", "gravity defiance", "sound mimicry", "size changing", "dream walking", "emotion sensing", "reality bending", "memory erasing", "future sight", "element control"],
  backstoryElements: [
    "was created in a laboratory accident",
    "escaped from a interdimensional portal",
    "used to be a normal {animal} until",
    "was cursed by an ancient wizard",
    "is the last of their species",
    "comes from a parallel universe where",
    "was raised by a family of",
    "discovered their powers during",
    "is on a secret mission to",
    "was betrayed by their best friend",
    "holds the key to saving the world",
    "is searching for their lost sibling"
  ],
  locations: ["Ohio", "Italy", "the Backrooms", "TikTok", "the Metaverse", "Area 51", "Atlantis", "the Moon", "a Discord server", "your mom's house", "the Shadow Realm", "McDonald's"],
  adjectives: ["sus", "cursed", "based", "cringe", "fire", "mid", "bussin", "slay", "no cap", "periodt", "slaps", "hits different", "lowkey", "highkey", "valid", "iconic"]
};

// Sound data from application_data_json
const soundData = {
  "italianBrainrot": [
    {
      "name": "Tralalero Tralala",
      "category": "classic",
      "description": "The legendary shark chant",
      "duration": 3.5,
      "loops": true
    },
    {
      "name": "Tung Tung Sahur",
      "category": "classic", 
      "description": "Rhythmic wooden bat sound",
      "duration": 2.8,
      "loops": true
    },
    {
      "name": "Bombardino Crocodilo",
      "category": "classic",
      "description": "War machine crocodile",
      "duration": 4.2,
      "loops": false
    },
    {
      "name": "Chimpanzini Bananini",
      "category": "classic",
      "description": "Banana-loving chimp",
      "duration": 3.1,
      "loops": true
    },
    {
      "name": "Cappuccino Assassino",
      "category": "classic",
      "description": "Deadly coffee character",
      "duration": 2.9,
      "loops": false
    }
  ],
  "baseSounds": [
    {
      "name": "Frog Croak Deep",
      "category": "animal",
      "description": "Deep frog ribbit sound",
      "duration": 1.2,
      "loops": false
    },
    {
      "name": "Computer Startup",
      "category": "tech", 
      "description": "Classic computer boot sound",
      "duration": 2.1,
      "loops": false
    },
    {
      "name": "Risotto Bubbling",
      "category": "cooking",
      "description": "Cooking risotto sound",
      "duration": 5.0,
      "loops": true
    },
    {
      "name": "Digital Glitch",
      "category": "tech",
      "description": "Computer error sound", 
      "duration": 0.8,
      "loops": false
    },
    {
      "name": "Elegant Piano",
      "category": "elegant",
      "description": "Classical piano flourish",
      "duration": 3.0,
      "loops": false
    }
  ],
  "syllables": [
    { "text": "tra", "duration": 0.5 },
    { "text": "la", "duration": 0.4 },
    { "text": "tung", "duration": 0.6 },
    { "text": "coco", "duration": 0.7 },
    { "text": "fanto", "duration": 0.8 },
    { "text": "etto", "duration": 0.6 },
    { "text": "ini", "duration": 0.5 },
    { "text": "ello", "duration": 0.6 }
  ]
};

const voiceEffects = [
  "frog_filter",
  "computer_vocoder", 
  "elegant_reverb",
  "chaotic_distortion",
  "robotic_pitch",
  "underwater_echo",
  "digital_stutter",
  "classical_harmony"
];

// Audio System - Web Audio API Integration
class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.currentlyPlaying = new Map();
    this.activeEffects = new Set();
    this.mixer = new AudioMixer();
    this.ttsVoice = null;
    this.isRecording = false;
    this.recorder = null;
    this.recordedChunks = [];
    
    this.initializeAudio();
  }
  
  async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.75;
      
      // Initialize TTS
      this.initializeTTS();
      
      console.log('🔊 Audio System initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
      this.fallbackToBasicAudio();
    }
  }
  
  initializeTTS() {
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', () => {
        const voices = speechSynthesis.getVoices();
        // Prefer Italian or fun voices
        this.ttsVoice = voices.find(voice => 
          voice.lang.includes('it') || 
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('samantha')
        ) || voices[0];
      });
    }
  }
  
  fallbackToBasicAudio() {
    console.log('Using fallback HTML5 Audio API');
    this.audioContext = null;
  }
  
  async playSound(soundName, options = {}) {
    const soundId = `sound_${Date.now()}_${Math.random()}`;
    
    if (this.audioContext) {
      return this.playWebAudioSound(soundName, soundId, options);
    } else {
      return this.playBasicAudioSound(soundName, soundId, options);
    }
  }
  
  async playWebAudioSound(soundName, soundId, options) {
    try {
      // Generate synthetic audio for demo (since we don't have real audio files)
      const audioBuffer = this.generateSyntheticSound(soundName, options.duration || 2);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Apply effects if any are active
      let audioNode = source;
      if (this.activeEffects.size > 0) {
        audioNode = this.applyEffects(source, Array.from(this.activeEffects));
      }
      
      // Connect to master gain
      audioNode.connect(this.masterGain);
      
      // Track the playing sound
      this.currentlyPlaying.set(soundId, { source, soundName });
      
      source.start();
      
      // Auto-cleanup when finished
      source.onended = () => {
        this.currentlyPlaying.delete(soundId);
        this.updatePlayingIndicators();
      };
      
      this.updatePlayingIndicators();
      return soundId;
      
    } catch (error) {
      console.error('Error playing WebAudio sound:', error);
      return null;
    }
  }
  
  generateSyntheticSound(soundName, duration) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      // Generate different waveforms based on sound type
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        let sample = 0;
        
        // Different sound generation based on name
        if (soundName.toLowerCase().includes('tra') || soundName.toLowerCase().includes('tung')) {
          // Rhythmic pattern for chants
          sample = Math.sin(2 * Math.PI * 220 * t) * Math.sin(2 * Math.PI * 4 * t) * 0.3;
        } else if (soundName.toLowerCase().includes('frog')) {
          // Frog-like croak
          sample = Math.sin(2 * Math.PI * 150 * t) * Math.exp(-t * 2) * 0.5;
        } else if (soundName.toLowerCase().includes('computer')) {
          // Digital beep
          sample = Math.sin(2 * Math.PI * 800 * t) * (t < 0.1 ? 1 : 0) * 0.4;
        } else if (soundName.toLowerCase().includes('elegant')) {
          // Piano-like
          sample = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 0.5) * 0.3;
        } else {
          // Default chaotic sound
          sample = (Math.random() - 0.5) * Math.sin(2 * Math.PI * 200 * t) * 0.2;
        }
        
        // Apply envelope
        const envelope = Math.exp(-t * 0.8);
        channelData[i] = sample * envelope;
      }
    }
    
    return buffer;
  }
  
  applyEffects(source, effects) {
    let audioNode = source;
    
    effects.forEach(effect => {
      switch (effect) {
        case 'frog_filter':
          const lowpass = this.audioContext.createBiquadFilter();
          lowpass.type = 'lowpass';
          lowpass.frequency.value = 300;
          audioNode.connect(lowpass);
          audioNode = lowpass;
          break;
          
        case 'computer_vocoder':
          const distortion = this.audioContext.createWaveShaper();
          distortion.curve = this.makeDistortionCurve(20);
          audioNode.connect(distortion);
          audioNode = distortion;
          break;
          
        case 'elegant_reverb':
          const convolver = this.audioContext.createConvolver();
          convolver.buffer = this.createReverbBuffer();
          audioNode.connect(convolver);
          audioNode = convolver;
          break;
          
        case 'chaotic_distortion':
          const chaos = this.audioContext.createWaveShaper();
          chaos.curve = this.makeDistortionCurve(400);
          audioNode.connect(chaos);
          audioNode = chaos;
          break;
      }
    });
    
    return audioNode;
  }
  
  makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * Math.PI / 180) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }
  
  createReverbBuffer() {
    const length = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() - 0.5) * Math.exp(-i / (length * 0.1));
      }
    }
    
    return buffer;
  }
  
  async playBasicAudioSound(soundName, soundId, options) {
    // Fallback to simpler audio announcement
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(soundName);
      utterance.rate = 1.5;
      utterance.pitch = 1.2;
      if (this.ttsVoice) utterance.voice = this.ttsVoice;
      
      speechSynthesis.speak(utterance);
      
      this.currentlyPlaying.set(soundId, { utterance, soundName });
      this.updatePlayingIndicators();
      
      return soundId;
    }
    return null;
  }
  
  stopSound(soundId) {
    const playing = this.currentlyPlaying.get(soundId);
    if (playing) {
      if (playing.source) {
        playing.source.stop();
      } else if (playing.utterance) {
        speechSynthesis.cancel();
      }
      this.currentlyPlaying.delete(soundId);
      this.updatePlayingIndicators();
    }
  }
  
  stopAllSounds() {
    this.currentlyPlaying.forEach((playing, soundId) => {
      this.stopSound(soundId);
    });
    speechSynthesis.cancel();
  }
  
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100;
    }
    document.getElementById('volume-display').textContent = `${volume}%`;
  }
  
  toggleEffect(effectName) {
    if (this.activeEffects.has(effectName)) {
      this.activeEffects.delete(effectName);
    } else {
      this.activeEffects.add(effectName);
    }
    this.updateEffectsDisplay();
  }
  
  updateEffectsDisplay() {
    const effectsList = document.getElementById('active-effects-list');
    if (this.activeEffects.size === 0) {
      effectsList.textContent = 'None';
    } else {
      effectsList.textContent = Array.from(this.activeEffects).map(effect => 
        effect.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      ).join(', ');
    }
    
    // Update button states
    document.querySelectorAll('.effect-btn').forEach(btn => {
      const effect = btn.dataset.effect;
      btn.classList.toggle('active', this.activeEffects.has(effect));
    });
  }
  
  updatePlayingIndicators() {
    // Update sound item indicators
    document.querySelectorAll('.sound-item').forEach(item => {
      item.classList.remove('playing');
    });
    
    // Add playing class to currently playing sounds
    this.currentlyPlaying.forEach(playing => {
      const soundItem = document.querySelector(`[data-sound="${playing.soundName}"]`);
      if (soundItem) {
        soundItem.classList.add('playing');
      }
    });
  }
  
  async speakText(text, options = {}) {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply effects to voice
        if (this.activeEffects.has('frog_filter')) {
          utterance.pitch = 0.6;
          utterance.rate = 0.8;
        } else if (this.activeEffects.has('computer_vocoder')) {
          utterance.pitch = 1.8;
          utterance.rate = 1.2;
        } else if (this.activeEffects.has('elegant_reverb')) {
          utterance.pitch = 1.1;
          utterance.rate = 0.9;
        } else if (this.activeEffects.has('chaotic_distortion')) {
          utterance.pitch = Math.random() * 2;
          utterance.rate = Math.random() * 2 + 0.5;
        }
        
        utterance.pitch = options.pitch || utterance.pitch || 1;
        utterance.rate = options.rate || utterance.rate || 1;
        
        if (this.ttsVoice) utterance.voice = this.ttsVoice;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }
  
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recorder = new MediaRecorder(stream);
      this.recordedChunks = [];
      
      this.recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.handleRecordedAudio(blob);
      };
      
      this.recorder.start();
      this.isRecording = true;
      this.updateRecordingIndicator();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      showMessage('🚫 Recording not available in this browser', 'error');
    }
  }
  
  stopRecording() {
    if (this.recorder && this.isRecording) {
      this.recorder.stop();
      this.isRecording = false;
      this.updateRecordingIndicator();
    }
  }
  
  handleRecordedAudio(blob) {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    // Add to mixer or play
    showMessage('🎙️ Recording captured! Added to mixer.', 'success');
    // Add to mixer here if needed
  }
  
  updateRecordingIndicator() {
    const recordBtn = document.getElementById('record-mix');
    if (this.isRecording) {
      recordBtn.innerHTML = '⏹️ Stop Recording';
      recordBtn.classList.add('recording');
    } else {
      recordBtn.innerHTML = '🎙️ Record Mix';
      recordBtn.classList.remove('recording');
    }
  }
}

// Audio Mixer Class
class AudioMixer {
  constructor() {
    this.tracks = [];
    this.isPlaying = false;
  }
  
  addTrack(soundName, audioBuffer) {
    const track = {
      id: Date.now(),
      name: soundName,
      buffer: audioBuffer,
      volume: 1,
      muted: false
    };
    
    this.tracks.push(track);
    this.updateMixerDisplay();
  }
  
  removeTrack(trackId) {
    this.tracks = this.tracks.filter(track => track.id !== trackId);
    this.updateMixerDisplay();
  }
  
  updateMixerDisplay() {
    const container = document.getElementById('mixer-tracks');
    
    if (this.tracks.length === 0) {
      container.innerHTML = '<div class="track-info">Add sounds to start mixing!</div>';
      return;
    }
    
    container.innerHTML = this.tracks.map(track => `
      <div class="mixer-track" data-track-id="${track.id}">
        <div class="track-name">${track.name}</div>
        <div class="track-controls">
          <input type="range" min="0" max="100" value="${track.volume * 100}" 
                 class="track-volume" data-track-id="${track.id}">
          <button class="sound-btn track-mute" data-track-id="${track.id}">
            ${track.muted ? '🔇' : '🔊'}
          </button>
          <button class="sound-btn track-remove" data-track-id="${track.id}">🗑️</button>
        </div>
      </div>
    `).join('');
    
    // Add event listeners for track controls
    this.setupTrackControls();
  }
  
  setupTrackControls() {
    document.querySelectorAll('.track-volume').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const trackId = parseInt(e.target.dataset.trackId);
        const volume = e.target.value / 100;
        this.setTrackVolume(trackId, volume);
      });
    });
    
    document.querySelectorAll('.track-mute').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackId = parseInt(e.target.dataset.trackId);
        this.toggleTrackMute(trackId);
      });
    });
    
    document.querySelectorAll('.track-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const trackId = parseInt(e.target.dataset.trackId);
        this.removeTrack(trackId);
      });
    });
  }
  
  setTrackVolume(trackId, volume) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.volume = volume;
    }
  }
  
  toggleTrackMute(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.muted = !track.muted;
      this.updateMixerDisplay();
    }
  }
  
  clearAll() {
    this.tracks = [];
    this.updateMixerDisplay();
  }
  
  exportMix() {
    if (this.tracks.length === 0) {
      showMessage('🚫 No tracks to export!', 'error');
      return;
    }
    
    // Simulate export
    showMessage('💾 Mix exported! (Demo: Real export would create downloadable file)', 'success');
  }
}

// Character state
let currentCharacter = {
  animal: '',
  object: '',
  food: '',
  name: '',
  phrase: '',
  trait: '',
  power: '',
  origin: '',
  description: '',
  memeScore: 0,
  soundProfile: {
    voice: null,
    catchphraseAudio: null,
    themeSound: null
  }
};

// Global audio system instance
let audioSystem;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
});

async function initializeApp() {
  // Initialize audio system
  audioSystem = new AudioSystem();
  
  // Initialize existing functionality
  populateSelects();
  createSyllableGrid();
  createBackstoryOptions();
  updateCharacterPreview();
  
  // Initialize sound components
  initializeSoundLibrary();
  initializeSoundControls();
}

function initializeSoundLibrary() {
  // Populate Italian Brain Rot sounds
  const italianContainer = document.getElementById('italian-sounds');
  soundData.italianBrainrot.forEach(sound => {
    const soundElement = createSoundItem(sound);
    italianContainer.appendChild(soundElement);
  });
  
  // Populate Base sounds
  const baseContainer = document.getElementById('base-sounds');
  soundData.baseSounds.forEach(sound => {
    const soundElement = createSoundItem(sound);
    baseContainer.appendChild(soundElement);
  });
  
  // Populate Syllable sounds
  const syllableContainer = document.getElementById('syllable-sounds');
  soundData.syllables.forEach(syllable => {
    const syllableElement = createSyllableSoundButton(syllable);
    syllableContainer.appendChild(syllableElement);
  });
}

function createSoundItem(sound) {
  const div = document.createElement('div');
  div.className = 'sound-item';
  div.dataset.sound = sound.name;
  
  div.innerHTML = `
    <h5>${sound.name}</h5>
    <p>${sound.description}</p>
    <div class="sound-controls">
      <button class="sound-btn play-btn" data-sound="${sound.name}">▶️</button>
      <button class="sound-btn loop-btn" data-sound="${sound.name}">${sound.loops ? '🔄' : '➡️'}</button>
      <button class="sound-btn add-btn" data-sound="${sound.name}">➕</button>
    </div>
  `;
  
  // Add event listeners
  const playBtn = div.querySelector('.play-btn');
  const loopBtn = div.querySelector('.loop-btn');
  const addBtn = div.querySelector('.add-btn');
  
  playBtn.addEventListener('click', () => playSound(sound.name, sound));
  addBtn.addEventListener('click', () => addToMixer(sound.name));
  
  return div;
}

function createSyllableSoundButton(syllable) {
  const button = document.createElement('button');
  button.className = 'syllable-sound-btn';
  button.textContent = syllable.text;
  button.dataset.syllable = syllable.text;
  
  button.addEventListener('click', () => {
    audioSystem.speakText(syllable.text, { rate: 1.2, pitch: 1.1 });
    addToPhrase(syllable.text, button);
  });
  
  return button;
}

function initializeSoundControls() {
  // Master volume control
  const volumeSlider = document.getElementById('master-volume');
  volumeSlider.addEventListener('input', (e) => {
    audioSystem.setMasterVolume(e.target.value);
  });
  
  // Effect buttons
  document.querySelectorAll('.effect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audioSystem.toggleEffect(btn.dataset.effect);
    });
  });
  
  // Master control buttons
  document.getElementById('play-all').addEventListener('click', playAllSounds);
  document.getElementById('stop-all').addEventListener('click', () => audioSystem.stopAllSounds());
  document.getElementById('record-mix').addEventListener('click', toggleRecording);
  
  // Mixer controls
  document.getElementById('add-track').addEventListener('click', () => {
    showMessage('🎵 Select a sound and click ➕ to add it to the mixer!', 'info');
  });
  document.getElementById('clear-mixer').addEventListener('click', () => {
    audioSystem.mixer.clearAll();
    showMessage('🗑️ Mixer cleared!', 'success');
  });
  document.getElementById('export-mix').addEventListener('click', () => audioSystem.mixer.exportMix());
  
  // Character sound assignment
  document.getElementById('auto-assign-voice').addEventListener('click', autoAssignVoice);
  document.getElementById('generate-catchphrase-audio').addEventListener('click', generateCatchphraseAudio);
  document.getElementById('auto-assign-theme').addEventListener('click', autoAssignTheme);
}

async function playSound(soundName, soundData) {
  const soundId = await audioSystem.playSound(soundName, soundData);
  if (soundId) {
    showMessage(`🔊 Playing: ${soundName}`, 'success');
  }
}

function addToMixer(soundName) {
  audioSystem.mixer.addTrack(soundName, null);
  showMessage(`➕ Added "${soundName}" to mixer!`, 'success');
}

async function playAllSounds() {
  const sounds = [...soundData.italianBrainrot, ...soundData.baseSounds];
  let delay = 0;
  
  sounds.forEach((sound, index) => {
    setTimeout(() => {
      playSound(sound.name, sound);
    }, delay);
    delay += sound.duration * 200; // Stagger the sounds
  });
  
  showMessage('🎵 Playing all sounds in sequence!', 'success');
}

async function toggleRecording() {
  if (audioSystem.isRecording) {
    audioSystem.stopRecording();
  } else {
    await audioSystem.startRecording();
  }
}

function autoAssignVoice() {
  const traits = [currentCharacter.trait, currentCharacter.animal, currentCharacter.food].filter(Boolean);
  let assignedVoice = 'Default Voice';
  
  if (traits.some(t => t.includes('frog') || t.includes('croak'))) {
    audioSystem.activeEffects.add('frog_filter');
    assignedVoice = 'Frog Voice Filter';
  } else if (traits.some(t => t.includes('computer') || t.includes('digital') || t.includes('tech'))) {
    audioSystem.activeEffects.add('computer_vocoder');
    assignedVoice = 'Computer Vocoder';
  } else if (traits.some(t => t.includes('elegant') || t.includes('classical'))) {
    audioSystem.activeEffects.add('elegant_reverb');
    assignedVoice = 'Elegant Reverb';
  } else if (traits.some(t => t.includes('chaotic') || t.includes('crazy'))) {
    audioSystem.activeEffects.add('chaotic_distortion');
    assignedVoice = 'Chaotic Distortion';
  }
  
  currentCharacter.soundProfile.voice = assignedVoice;
  document.getElementById('character-voice').textContent = assignedVoice;
  audioSystem.updateEffectsDisplay();
  
  showMessage(`🎭 Voice assigned: ${assignedVoice}`, 'success');
}

async function generateCatchphraseAudio() {
  if (!currentCharacter.phrase) {
    showMessage('💬 Create a catchphrase first!', 'error');
    return;
  }
  
  await audioSystem.speakText(currentCharacter.phrase);
  currentCharacter.soundProfile.catchphraseAudio = 'Generated TTS Audio';
  document.getElementById('catchphrase-audio').textContent = 'Generated TTS Audio';
  
  showMessage('🎯 Catchphrase audio generated!', 'success');
}

function autoAssignTheme() {
  const themeOptions = [
    'Tralalero Tralala',
    'Tung Tung Sahur',
    'Bombardino Crocodilo',
    'Chimpanzini Bananini',
    'Elegant Piano',
    'Digital Glitch'
  ];
  
  let selectedTheme = 'Tralalero Tralala'; // Default
  
  if (currentCharacter.animal === 'shark') {
    selectedTheme = 'Tralalero Tralala';
  } else if (currentCharacter.animal === 'chimpanzee') {
    selectedTheme = 'Chimpanzini Bananini';
  } else if (currentCharacter.animal === 'crocodile') {
    selectedTheme = 'Bombardino Crocodilo';
  } else if (currentCharacter.trait === 'elegant') {
    selectedTheme = 'Elegant Piano';
  } else if (currentCharacter.object === 'computer') {
    selectedTheme = 'Digital Glitch';
  } else {
    selectedTheme = getRandomElement(themeOptions);
  }
  
  currentCharacter.soundProfile.themeSound = selectedTheme;
  document.getElementById('theme-sound').textContent = selectedTheme;
  
  showMessage(`🎵 Theme sound assigned: ${selectedTheme}`, 'success');
}

function setupEventListeners() {
  // Main navigation
  const startBtn = document.getElementById('start-btn');
  startBtn.addEventListener('click', startCreation);
  
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      showTab(this.dataset.tab);
    });
  });
  
  // Character selection with sound suggestions
  document.getElementById('animal-select').addEventListener('change', updateCharacterFromSelectsWithSound);
  document.getElementById('object-select').addEventListener('change', updateCharacterFromSelectsWithSound);
  document.getElementById('food-select').addEventListener('change', updateCharacterFromSelectsWithSound);
  
  // Random buttons
  document.querySelectorAll('[data-random]').forEach(btn => {
    btn.addEventListener('click', function() {
      randomSelect(this.dataset.random);
    });
  });
  
  // Character randomize
  document.getElementById('randomize-character').addEventListener('click', randomizeCharacter);
  
  // Name generation with TTS
  document.querySelectorAll('[data-pattern]').forEach(btn => {
    btn.addEventListener('click', function() {
      generateName(this.dataset.pattern);
    });
  });
  
  document.getElementById('custom-name').addEventListener('input', updateCustomName);
  document.getElementById('randomize-name').addEventListener('click', randomizeName);
  document.getElementById('tts-name').addEventListener('click', speakName);
  
  // Phrase generation with TTS
  document.querySelectorAll('[data-phrase]').forEach(btn => {
    btn.addEventListener('click', function() {
      generatePhrase(this.dataset.phrase);
    });
  });
  
  document.getElementById('clear-phrase').addEventListener('click', clearPhrase);
  document.getElementById('randomize-phrase').addEventListener('click', randomizePhrase);
  document.getElementById('tts-phrase').addEventListener('click', speakPhrase);
  
  // Backstory
  document.getElementById('randomize-backstory').addEventListener('click', randomizeBackstory);
  
  // Character actions with audio
  document.getElementById('export-character').addEventListener('click', exportCharacter);
  document.getElementById('export-audio-package').addEventListener('click', exportAudioPackage);
  document.getElementById('share-character').addEventListener('click', shareCharacter);
  document.getElementById('reset-character').addEventListener('click', resetCharacter);
  
  // Preview sound controls
  document.getElementById('play-catchphrase').addEventListener('click', () => speakPhrase());
  document.getElementById('play-character-voice').addEventListener('click', playCharacterVoice);
  document.getElementById('play-theme-sound').addEventListener('click', playThemeSound);
  document.getElementById('play-full-intro').addEventListener('click', playFullIntro);
  
  // Welcome screen sound previews
  document.querySelectorAll('.sound-preview-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const soundName = this.dataset.sound;
      if (soundName === 'cocofanto') {
        audioSystem.speakText('Coco fanto elefanto, protetto da una noce di cocco', { pitch: 1.2, rate: 1.1 });
      } else if (soundName === 'tralalero') {
        audioSystem.speakText('Tralalero tralala, smerdo pure nell\'aldilà', { pitch: 0.9, rate: 1.3 });
      } else if (soundName === 'bombardino') {
        audioSystem.speakText('Bombardino crocodilo, ready for takeoff', { pitch: 1.1, rate: 1.0 });
      }
    });
  });
  
  // Chaos mode
  document.getElementById('chaos-mode').addEventListener('click', randomizeEverything);
}

// Enhanced character selection with sound suggestions
function updateCharacterFromSelectsWithSound() {
  updateCharacterFromSelects();
  updateSoundSuggestions();
}

function updateSoundSuggestions() {
  const animal = document.getElementById('animal-select').value;
  const object = document.getElementById('object-select').value;
  const food = document.getElementById('food-select').value;
  
  // Update sound suggestions based on selections
  if (animal) {
    const suggestion = getSoundSuggestionForAnimal(animal);
    document.getElementById('animal-sound').textContent = `🔊 Suggested: ${suggestion}`;
  } else {
    document.getElementById('animal-sound').textContent = '';
  }
  
  if (object) {
    const suggestion = getSoundSuggestionForObject(object);
    document.getElementById('object-sound').textContent = `🔊 Suggested: ${suggestion}`;
  } else {
    document.getElementById('object-sound').textContent = '';
  }
  
  if (food) {
    const suggestion = getSoundSuggestionForFood(food);
    document.getElementById('food-sound').textContent = `🔊 Suggested: ${suggestion}`;
  } else {
    document.getElementById('food-sound').textContent = '';
  }
}

function getSoundSuggestionForAnimal(animal) {
  const suggestions = {
    shark: 'Tralalero Tralala',
    frog: 'Frog Croak Deep',
    chimpanzee: 'Chimpanzini Bananini',
    crocodile: 'Bombardino Crocodilo',
    elephant: 'Cocofanto Sound'
  };
  return suggestions[animal] || 'Animal Sound Effects';
}

function getSoundSuggestionForObject(object) {
  const suggestions = {
    computer: 'Computer Startup',
    airplane: 'Bombardino Engine',
    'baseball bat': 'Tung Tung Sahur'
  };
  return suggestions[object] || 'Object Sound Effects';
}

function getSoundSuggestionForFood(food) {
  const suggestions = {
    cappuccino: 'Cappuccino Assassino',
    risotto: 'Risotto Bubbling',
    pasta: 'Italian Cooking Sounds'
  };
  return suggestions[food] || 'Food Sound Effects';
}

// Enhanced TTS functions
async function speakName() {
  const name = document.getElementById('custom-name').value || currentCharacter.name;
  if (!name) {
    showMessage('📛 Enter a name first!', 'error');
    return;
  }
  
  await audioSystem.speakText(name, { pitch: 1.2, rate: 1.0 });
}

async function speakPhrase() {
  if (!currentCharacter.phrase) {
    showMessage('💬 Create a catchphrase first!', 'error');
    return;
  }
  
  await audioSystem.speakText(currentCharacter.phrase);
}

async function playCharacterVoice() {
  if (!currentCharacter.soundProfile.voice) {
    showMessage('🎭 Assign a voice first!', 'error');
    return;
  }
  
  const sampleText = currentCharacter.name || 'Hello, I am your brainrot character!';
  await audioSystem.speakText(sampleText);
}

async function playThemeSound() {
  if (!currentCharacter.soundProfile.themeSound) {
    showMessage('🎵 Assign a theme sound first!', 'error');
    return;
  }
  
  await playSound(currentCharacter.soundProfile.themeSound, { duration: 3 });
}

async function playFullIntro() {
  if (!currentCharacter.name || !currentCharacter.phrase) {
    showMessage('🎪 Complete your character first!', 'error');
    return;
  }
  
  // Play theme sound first
  if (currentCharacter.soundProfile.themeSound) {
    await playSound(currentCharacter.soundProfile.themeSound, { duration: 2 });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Speak name
  await audioSystem.speakText(`Introducing... ${currentCharacter.name}!`, { pitch: 1.1, rate: 0.9 });
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Speak catchphrase
  await audioSystem.speakText(currentCharacter.phrase);
  
  showMessage('🎪 Full character intro complete!', 'success');
}

function exportAudioPackage() {
  if (!currentCharacter.soundProfile.voice && !currentCharacter.soundProfile.themeSound) {
    showMessage('🚫 No audio profile to export!', 'error');
    return;
  }
  
  const audioPackage = {
    characterName: currentCharacter.name,
    voice: currentCharacter.soundProfile.voice,
    catchphrase: currentCharacter.phrase,
    themeSound: currentCharacter.soundProfile.themeSound,
    effects: Array.from(audioSystem.activeEffects),
    mixerTracks: audioSystem.mixer.tracks.map(t => t.name)
  };
  
  // Simulate download
  const audioData = `
🎵 BRAINROT CHARACTER AUDIO PACKAGE 🎵

👑 CHARACTER: ${currentCharacter.name || 'Unnamed'}
🎭 VOICE: ${currentCharacter.soundProfile.voice || 'None'}
💬 CATCHPHRASE: "${currentCharacter.phrase || 'None'}"
🎵 THEME: ${currentCharacter.soundProfile.themeSound || 'None'}
🎚️ EFFECTS: ${Array.from(audioSystem.activeEffects).join(', ') || 'None'}

Generated by Brainrot Character Construction Studio
Audio files would be bundled in real implementation.
  `;
  
  navigator.clipboard.writeText(audioData).then(() => {
    showMessage('🎵 Audio package info copied! (Demo: Real export would create audio files)', 'success');
  }).catch(() => {
    showMessage('🎵 Audio package prepared! (Demo mode)', 'success');
  });
}

// Continue with existing functions (keeping all the original functionality)...
// [Previous functions remain the same: startCreation, showTab, populateSelects, etc.]

function startCreation() {
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('creation-studio').classList.remove('hidden');
}

function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));
  
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(`${tabName}-tab`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  if (tabName === 'preview') {
    updateCharacterPreview();
  }
}

function populateSelects() {
  populateSelect('animal-select', brainrotData.animals);
  populateSelect('object-select', brainrotData.objects);
  populateSelect('food-select', brainrotData.food);
}

function populateSelect(selectId, options) {
  const select = document.getElementById(selectId);
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option;
    optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
    select.appendChild(optionElement);
  });
}

function randomSelect(type) {
  const selectElement = document.getElementById(`${type}-select`);
  const options = brainrotData[type + 's'] || brainrotData[type];
  const randomOption = options[Math.floor(Math.random() * options.length)];
  selectElement.value = randomOption;
  updateCharacterFromSelectsWithSound();
}

function updateCharacterFromSelects() {
  currentCharacter.animal = document.getElementById('animal-select').value;
  currentCharacter.object = document.getElementById('object-select').value;
  currentCharacter.food = document.getElementById('food-select').value;
  
  updateCharacterDescription();
}

function updateCharacterDescription() {
  const description = document.getElementById('character-description');
  
  if (currentCharacter.animal || currentCharacter.object || currentCharacter.food) {
    const parts = [];
    if (currentCharacter.animal) parts.push(`🐾 ${currentCharacter.animal}`);
    if (currentCharacter.object) parts.push(`🎾 ${currentCharacter.object}`);
    if (currentCharacter.food) parts.push(`🍕 ${currentCharacter.food}`);
    
    let desc = "A chaotic hybrid creature that's part ";
    desc += parts.join(', part ') + "! ";
    
    if (currentCharacter.animal && currentCharacter.object) {
      desc += `This ${currentCharacter.animal} has somehow merged with a ${currentCharacter.object}, creating an absolutely unhinged being.`;
    }
    if (currentCharacter.food) {
      desc += ` It's somehow also infused with ${currentCharacter.food} energy, making it even more unpredictable.`;
    }
    
    currentCharacter.description = desc;
    description.innerHTML = desc;
  } else {
    description.innerHTML = "Select components to see your character...";
    currentCharacter.description = '';
  }
}

// [Continue with all other existing functions: randomizeCharacter, generateName, etc.]
// [The rest of the functions remain exactly the same as in the original app.js]

function randomizeCharacter() {
  const button = document.getElementById('randomize-character');
  button.innerHTML = '🌪️ RANDOMIZING... 🌪️';
  button.disabled = true;
  
  randomSelect('animal');
  randomSelect('object');
  randomSelect('food');
  
  setTimeout(() => {
    button.innerHTML = '🌪️ RANDOMIZE EVERYTHING 🌪️';
    button.disabled = false;
    showMessage('🎉 Character randomized! Check it out!', 'success');
  }, 1500);
}

function generateName(pattern) {
  let generatedNames = [];
  
  for (let i = 0; i < 5; i++) {
    let name = '';
    
    switch (pattern) {
      case 'pattern1':
        const sound1 = getRandomElement(brainrotData.nonsenseSyllables);
        const sound2 = getRandomElement(brainrotData.nonsenseSyllables);
        const suffix = getRandomElement(brainrotData.italianSuffixes);
        name = capitalize(sound1) + capitalize(sound2) + suffix;
        break;
        
      case 'pattern2':
        const syllable = getRandomElement(brainrotData.nonsenseSyllables);
        const italianWord = getRandomElement(brainrotData.italianWords);
        name = capitalize(syllable) + capitalize(syllable) + ' ' + capitalize(italianWord);
        break;
        
      case 'pattern3':
        const sound = getRandomElement(brainrotData.onomatopoeia);
        const suffix2 = getRandomElement(brainrotData.italianSuffixes);
        const component = currentCharacter.animal || currentCharacter.object || getRandomElement(brainrotData.animals);
        name = capitalize(sound) + suffix2 + ' ' + capitalize(component);
        break;
    }
    
    generatedNames.push(name);
  }
  
  displayNameSuggestions(generatedNames);
}

function displayNameSuggestions(names) {
  const container = document.getElementById('name-suggestions');
  container.innerHTML = '';
  
  names.forEach(name => {
    const nameElement = document.createElement('div');
    nameElement.className = 'name-suggestion';
    nameElement.textContent = name;
    nameElement.addEventListener('click', function() {
      selectName(name, this);
    });
    container.appendChild(nameElement);
  });
}

function selectName(name, element) {
  currentCharacter.name = name;
  document.getElementById('final-name').textContent = name;
  document.getElementById('custom-name').value = name;
  
  const selected = document.querySelector('.name-suggestion.selected');
  if (selected) selected.classList.remove('selected');
  
  element.classList.add('selected');
  showMessage('🎯 Name selected!', 'success');
}

function updateCustomName() {
  const customName = document.getElementById('custom-name').value;
  currentCharacter.name = customName;
  document.getElementById('final-name').textContent = customName || 'No name selected';
}

function randomizeName() {
  const patterns = ['pattern1', 'pattern2', 'pattern3'];
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
  generateName(randomPattern);
  
  setTimeout(() => {
    const suggestions = document.querySelectorAll('.name-suggestion');
    if (suggestions.length > 0) {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      randomSuggestion.click();
    }
  }, 500);
}

function createSyllableGrid() {
  const grid = document.getElementById('syllable-grid');
  const allSyllables = [...brainrotData.nonsenseSyllables, ...brainrotData.onomatopoeia];
  
  allSyllables.forEach(syllable => {
    const button = document.createElement('button');
    button.className = 'syllable-btn';
    button.textContent = syllable;
    button.addEventListener('click', function() {
      addToPhrase(syllable, this);
    });
    grid.appendChild(button);
  });
}

function addToPhrase(element, buttonElement) {
  const phraseDisplay = document.getElementById('phrase-display');
  let currentPhrase = phraseDisplay.textContent;
  
  if (currentPhrase === 'Click elements to build your phrase...') {
    currentPhrase = '';
  }
  
  currentPhrase += (currentPhrase ? ' ' : '') + element;
  phraseDisplay.textContent = currentPhrase;
  currentCharacter.phrase = currentPhrase;
  
  if (buttonElement) {
    buttonElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
      buttonElement.style.transform = '';
    }, 150);
  }
}

function generatePhrase(type) {
  let phrase = '';
  
  switch (type) {
    case 'chant':
      const chantSyllable = getRandomElement(brainrotData.nonsenseSyllables);
      phrase = `${capitalize(chantSyllable)} ${chantSyllable} ${chantSyllable}, ${chantSyllable} ${chantSyllable} ${getRandomElement(brainrotData.italianSuffixes)}!`;
      break;
      
    case 'onomatopoeia':
      const sound1 = getRandomElement(brainrotData.onomatopoeia);
      const sound2 = getRandomElement(brainrotData.onomatopoeia);
      phrase = `${sound1.toUpperCase()} ${sound1.toUpperCase()} ${sound2.toUpperCase()}! ${capitalize(sound1)} goes the ${currentCharacter.animal || 'creature'}!`;
      break;
      
    case 'gibberish':
      const syllables = [];
      for (let i = 0; i < 6; i++) {
        syllables.push(getRandomElement(brainrotData.nonsenseSyllables));
      }
      phrase = syllables.map((s, i) => i === 0 ? capitalize(s) : s).join('') + getRandomElement(brainrotData.italianSuffixes) + '!';
      break;
      
    case 'template':
      const template = getRandomElement(brainrotData.phrases);
      const replacement = currentCharacter.animal || currentCharacter.object || getRandomElement(brainrotData.animals);
      const place = getRandomElement(brainrotData.locations);
      const adjective = getRandomElement(brainrotData.adjectives);
      phrase = template.replace('{X}', replacement).replace('{place}', place).replace('{adjective}', adjective);
      break;
  }
  
  document.getElementById('phrase-display').textContent = phrase;
  currentCharacter.phrase = phrase;
  showMessage('💬 Phrase generated!', 'success');
}

function clearPhrase() {
  document.getElementById('phrase-display').textContent = 'Click elements to build your phrase...';
  currentCharacter.phrase = '';
}

function randomizePhrase() {
  const types = ['chant', 'onomatopoeia', 'gibberish', 'template'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  generatePhrase(randomType);
}

function createBackstoryOptions() {
  createOptionButtons('trait-options', brainrotData.traits, 'trait');
  createOptionButtons('power-options', brainrotData.powers, 'power');
  createOptionButtons('origin-options', brainrotData.backstoryElements, 'origin');
}

function createOptionButtons(containerId, options, type) {
  const container = document.getElementById(containerId);
  
  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.addEventListener('click', function() {
      selectBackstoryOption(type, option, this);
    });
    container.appendChild(button);
  });
}

function selectBackstoryOption(type, option, buttonElement) {
  currentCharacter[type] = option;
  document.getElementById(`selected-${type}`).textContent = option;
  
  const container = buttonElement.parentElement;
  const buttons = container.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.remove('selected'));
  buttonElement.classList.add('selected');
  
  showMessage(`${capitalize(type)} selected!`, 'success');
}

function randomizeBackstory() {
  const randomTrait = getRandomElement(brainrotData.traits);
  const randomPower = getRandomElement(brainrotData.powers);
  const randomOrigin = getRandomElement(brainrotData.backstoryElements);
  
  currentCharacter.trait = randomTrait;
  currentCharacter.power = randomPower;
  currentCharacter.origin = randomOrigin;
  
  document.getElementById('selected-trait').textContent = randomTrait;
  document.getElementById('selected-power').textContent = randomPower;
  document.getElementById('selected-origin').textContent = randomOrigin;
  
  updateSelectedButtons();
  showMessage('📖 Epic backstory generated!', 'success');
}

function updateSelectedButtons() {
  ['trait', 'power', 'origin'].forEach(type => {
    const buttons = document.querySelectorAll(`#${type}-options .option-btn`);
    buttons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.textContent === currentCharacter[type]) {
        btn.classList.add('selected');
      }
    });
  });
}

function updateCharacterPreview() {
  document.getElementById('preview-name').textContent = currentCharacter.name || 'Unnamed Character';
  document.getElementById('preview-description').textContent = currentCharacter.description || 'No description available';
  document.getElementById('preview-phrase').textContent = `"${currentCharacter.phrase || 'No catchphrase yet'}"`;
  document.getElementById('preview-trait').textContent = currentCharacter.trait || 'Unknown';
  document.getElementById('preview-power').textContent = currentCharacter.power || 'None';
  document.getElementById('preview-origin').textContent = currentCharacter.origin || 'Mystery...';
  
  currentCharacter.memeScore = calculateMemeScore();
  document.getElementById('meme-score').textContent = `🔥 Meme Score: ${currentCharacter.memeScore}/10`;
}

function calculateMemeScore() {
  let score = 0;
  
  if (currentCharacter.name && currentCharacter.name.length > 3) score += 2;
  if (currentCharacter.name && (currentCharacter.name.includes('fanto') || currentCharacter.name.includes('ello'))) score += 1;
  
  if (currentCharacter.animal) score += 1;
  if (currentCharacter.object) score += 1;
  if (currentCharacter.food) score += 1;
  
  if (currentCharacter.phrase) score += 2;
  if (currentCharacter.phrase && currentCharacter.phrase.length > 20) score += 1;
  
  if (currentCharacter.trait && currentCharacter.power && currentCharacter.origin) score += 1;
  
  // Bonus for sound profile
  if (currentCharacter.soundProfile.voice) score += 1;
  if (currentCharacter.soundProfile.themeSound) score += 1;
  
  return Math.min(score, 10);
}

function randomizeEverything() {
  const button = document.getElementById('chaos-mode');
  button.innerHTML = '🌪️💥 CREATING MAXIMUM CHAOS 💥🌪️';
  button.disabled = true;
  
  randomSelect('animal');
  randomSelect('object');
  randomSelect('food');
  
  setTimeout(() => {
    randomizeName();
  }, 500);
  
  setTimeout(() => {
    randomizePhrase();
  }, 1000);
  
  setTimeout(() => {
    randomizeBackstory();
  }, 1500);
  
  setTimeout(() => {
    autoAssignVoice();
    autoAssignTheme();
  }, 2000);
  
  setTimeout(() => {
    updateCharacterPreview();
    button.innerHTML = '🌪️💥 CHAOS MODE: RANDOMIZE EVERYTHING 💥🌪️';
    button.disabled = false;
    showMessage('🎉 COMPLETE CHAOS UNLEASHED! Your character is ready with SOUNDS!', 'success');
    
    showTab('preview');
  }, 2500);
}

function exportCharacter() {
  updateCharacterPreview();
  
  const characterData = `
🧠💥 BRAINROT CHARACTER WITH SOUND 💥🧠

👑 NAME: ${currentCharacter.name || 'Unnamed'}
🎭 DESCRIPTION: ${currentCharacter.description || 'No description'}
💬 CATCHPHRASE: "${currentCharacter.phrase || 'No catchphrase'}"
🎪 PERSONALITY: ${currentCharacter.trait || 'Unknown'}
⚡ SUPERPOWER: ${currentCharacter.power || 'None'}
📚 ORIGIN: ${currentCharacter.origin || 'Mystery'}
🔥 MEME SCORE: ${currentCharacter.memeScore}/10

🔊 SOUND PROFILE:
🎭 Voice: ${currentCharacter.soundProfile.voice || 'None'}
🎵 Theme: ${currentCharacter.soundProfile.themeSound || 'None'}
🎚️ Effects: ${Array.from(audioSystem?.activeEffects || []).join(', ') || 'None'}

Created with Brainrot Character Construction Studio v2.0 (Audio Edition)
  `;
  
  navigator.clipboard.writeText(characterData).then(() => {
    showMessage('📋 Character with sound profile copied to clipboard!', 'success');
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = characterData;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showMessage('📋 Character with sound profile copied to clipboard!', 'success');
  });
}

function shareCharacter() {
  if (navigator.share) {
    navigator.share({
      title: `My Brainrot Character: ${currentCharacter.name || 'Unnamed'}`,
      text: `Check out my chaotic brainrot character with SOUNDS: ${currentCharacter.name || 'Unnamed'} - "${currentCharacter.phrase || 'No catchphrase'}"`,
      url: window.location.href
    });
  } else {
    exportCharacter();
  }
}

function resetCharacter() {
  if (confirm('🔄 Are you sure you want to create a new character? This will reset everything including sounds!')) {
    // Stop all sounds
    if (audioSystem) {
      audioSystem.stopAllSounds();
      audioSystem.activeEffects.clear();
      audioSystem.mixer.clearAll();
      audioSystem.updateEffectsDisplay();
    }
    
    currentCharacter = {
      animal: '',
      object: '',
      food: '',
      name: '',
      phrase: '',
      trait: '',
      power: '',
      origin: '',
      description: '',
      memeScore: 0,
      soundProfile: {
        voice: null,
        catchphraseAudio: null,
        themeSound: null
      }
    };
    
    // Reset all form elements
    document.getElementById('animal-select').value = '';
    document.getElementById('object-select').value = '';
    document.getElementById('food-select').value = '';
    document.getElementById('custom-name').value = '';
    document.getElementById('character-description').innerHTML = 'Select components to see your character...';
    document.getElementById('final-name').textContent = 'No name selected';
    document.getElementById('name-suggestions').innerHTML = '';
    document.getElementById('phrase-display').textContent = 'Click elements to build your phrase...';
    
    // Reset backstory selections
    document.getElementById('selected-trait').textContent = 'No trait selected';
    document.getElementById('selected-power').textContent = 'No power selected';
    document.getElementById('selected-origin').textContent = 'No origin selected';
    
    // Reset sound profile
    document.getElementById('character-voice').textContent = 'Not set';
    document.getElementById('catchphrase-audio').textContent = 'Not set';
    document.getElementById('theme-sound').textContent = 'Not set';
    
    // Reset sound suggestions
    document.getElementById('animal-sound').textContent = '';
    document.getElementById('object-sound').textContent = '';
    document.getElementById('food-sound').textContent = '';
    
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    
    showTab('character');
    
    showMessage('🔄 Character and sounds reset! Start creating your new chaos!', 'success');
  }
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showMessage(text, type = 'success') {
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 3000);
}

function addEasterEggs() {
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  
  document.addEventListener('keydown', function(e) {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
      konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length && 
        konamiCode.every((key, index) => key === konamiSequence[index])) {
      activateChaosMode();
      konamiCode = [];
    }
  });
}

function activateChaosMode() {
  document.body.style.animation = 'chaosMode 5s ease-in-out';
  showMessage('🌪️💥 MAXIMUM CHAOS MODE ACTIVATED WITH SOUND! 💥🌪️', 'success');
  
  // Trigger random sounds
  if (audioSystem) {
    playAllSounds();
  }
  
  if (!document.getElementById('chaos-styles')) {
    const style = document.createElement('style');
    style.id = 'chaos-styles';
    style.textContent = `
      @keyframes chaosMode {
        0%, 100% { filter: hue-rotate(0deg); }
        25% { filter: hue-rotate(90deg) saturate(1.5); }
        50% { filter: hue-rotate(180deg) saturate(2); }
        75% { filter: hue-rotate(270deg) saturate(1.5); }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => {
    document.body.style.animation = '';
  }, 5000);
}

addEasterEggs();