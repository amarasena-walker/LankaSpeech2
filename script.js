/**
 * Lanka Speech — Premium AI Text-to-Speech Website
 * Client Interactions & Real Audio Generation Integration
 * Powered by Bestlytical
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // ── Theme Toggle (Dark / Light Mode) ────────────────────────
  const themeToggle = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('lanka-speech-theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('lanka-speech-theme', newTheme);
  });

  // ── Mobile Menu Toggle ──────────────────────────────────────
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');

  mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close menu when clicking links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
      mobileMenuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });

  // ── Smooth Scroll Navigation Highlight ──────────────────────
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section, header, footer');
  const menuLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id') || '';
      }
    });

    menuLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // ── Hero Waveform Mock Generation ──────────────────────────
  const heroWaveform = document.getElementById('hero-waveform');
  const totalWaveformBars = 32;

  if (heroWaveform) {
    for (let i = 0; i < totalWaveformBars; i++) {
      const bar = document.createElement('div');
      bar.classList.add('waveform-bar');
      bar.style.height = `${Math.floor(Math.random() * 70) + 15}%`;
      heroWaveform.appendChild(bar);
    }

    setInterval(() => {
      const bars = heroWaveform.querySelectorAll('.waveform-bar');
      bars.forEach(bar => {
        bar.style.height = `${Math.floor(Math.random() * 70) + 15}%`;
      });
    }, 1500);
  }

  // ── Voice Casting Profile Select (Active State Sync) ────────
  const voiceCards = document.querySelectorAll('.voice-card');
  const miniVoiceCards = document.querySelectorAll('.demo-voice-mini');
  let selectedVoice = 'Kore'; // Matches backend "Kore" voice mapping

  function updateSelectedVoice(voiceName) {
    selectedVoice = voiceName;

    // Sync large cards
    voiceCards.forEach(card => {
      if (card.getAttribute('data-voice') === voiceName) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // Sync mini studio cards
    miniVoiceCards.forEach(card => {
      if (card.getAttribute('data-voice') === voiceName) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  voiceCards.forEach(card => {
    card.addEventListener('click', () => {
      const voice = card.getAttribute('data-voice');
      updateSelectedVoice(voice);
      document.getElementById('workspace').scrollIntoView({ behavior: 'smooth' });
    });
  });

  miniVoiceCards.forEach(card => {
    card.addEventListener('click', () => {
      const voice = card.getAttribute('data-voice');
      updateSelectedVoice(voice);
    });
  });

  // ── Language Auto Detection ────────────────────────────────
  const textarea = document.getElementById('demo-text-input');
  const charCount = document.getElementById('char-count');
  const detectedLangSpan = document.getElementById('detected-language');

  const singlishPatterns = [
    'mama', 'oya', 'mokak', 'kohomada', 'harida', 'enna', 'kanna', 'bonna', 'yanna',
    'hondai', 'neda', 'karanna', 'balanna', 'mage', 'obe', 'api', 'eyala', 'meka',
    'eka', 'inne', 'wada', 'sinhala', 'lanka', 'speech', 'api'
  ];

  textarea.addEventListener('input', () => {
    const text = textarea.value;
    charCount.textContent = `${text.length} / 5000 Characters`;

    if (!text.trim()) {
      detectedLangSpan.textContent = 'English';
      return;
    }

    const containsSinhala = /[\u0D80-\u0DFF]/.test(text);
    const lowerText = text.toLowerCase();
    let singlishMatches = 0;
    
    singlishPatterns.forEach(word => {
      const regex = new RegExp('\\b' + word + '\\b', 'g');
      const matches = lowerText.match(regex);
      if (matches) singlishMatches += matches.length;
    });

    if (containsSinhala) {
      if (/[a-zA-Z]/.test(text)) {
        detectedLangSpan.textContent = 'Mixed Language (Sinhala + English)';
      } else {
        detectedLangSpan.textContent = 'Sinhala Unicode Script';
      }
    } else if (singlishMatches >= 2) {
      detectedLangSpan.textContent = 'Singlish (Romanized Sinhala)';
    } else {
      detectedLangSpan.textContent = 'English';
    }
  });

  // ── Granular Sliders Visual Updates ──────────────────────────
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  speedSlider.addEventListener('input', () => {
    speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(1)}x`;
    if (activeAudio) {
      activeAudio.playbackRate = parseFloat(speedSlider.value);
    }
  });

  const stabilitySlider = document.getElementById('stability-slider');
  const stabilityValue = document.getElementById('stability-value');
  stabilitySlider.addEventListener('input', () => {
    stabilityValue.textContent = `${stabilitySlider.value}%`;
  });

  const pitchSlider = document.getElementById('pitch-slider');
  const pitchValue = document.getElementById('pitch-value');
  pitchSlider.addEventListener('input', () => {
    pitchValue.textContent = `${pitchSlider.value}%`;
  });

  // ── Clipboard Controls (Paste / Clear / Copy Share Link) ────
  const pasteBtn = document.getElementById('paste-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      textarea.value = text;
      textarea.dispatchEvent(new Event('input'));
    } catch (err) {
      alert("Please press Ctrl+V to paste manually into the editor area.");
    }
  });

  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    textarea.dispatchEvent(new Event('input'));
  });

  copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    const originalText = copyLinkBtn.innerHTML;
    copyLinkBtn.innerHTML = '<span>✔️</span> <span>Copied!</span>';
    setTimeout(() => {
      copyLinkBtn.innerHTML = originalText;
    }, 2000);
  });

  // ── Audio Generation Simulation & Timeline Progress ──────────
  const generateBtn = document.getElementById('generate-btn');
  const audioResult = document.getElementById('audio-result');
  const audioPlayBtn = document.getElementById('audio-play-btn');
  const audioProgress = document.getElementById('audio-progress');
  const timeCurrent = document.getElementById('audio-time-current');
  const timeTotal = document.getElementById('audio-time-total');
  const downloadAudioLink = document.getElementById('download-audio-link');

  let activeAudio = null;
  let audioTimer = null;

  generateBtn.addEventListener('click', async () => {
    const textVal = textarea.value.trim();
    if (!textVal) {
      alert("Please enter some text in the studio editor first!");
      return;
    }

    // Loading State
    generateBtn.disabled = true;
    const originalBtnText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span>⚡</span> Generating Audio...';

    // Retrieve settings
    const toneVal = document.getElementById('emotion-select').value;

    try {
      // Connect to the local backend endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textVal,
          voice: selectedVoice,
          tone: toneVal
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Backend TTS generation failed.');
      }

      // Load synthesized audio output
      if (activeAudio) {
        activeAudio.pause();
        clearInterval(audioTimer);
      }

      activeAudio = new Audio(data.audioUrl);
      activeAudio.playbackRate = parseFloat(speedSlider.value);

      // Set download actions
      downloadAudioLink.href = data.audioUrl;
      downloadAudioLink.download = `lanka-speech-${selectedVoice}.wav`;

      // UI updates
      audioPlayBtn.textContent = '▶';
      audioProgress.value = 0;
      timeCurrent.textContent = '0:00';
      
      const totalSec = Math.ceil(data.duration || 10);
      timeTotal.textContent = `0:${totalSec < 10 ? '0' : ''}${totalSec}`;

      // Show audio result
      audioResult.style.display = 'block';
      setTimeout(() => {
        audioResult.classList.add('visible');
      }, 50);

      // Scroll player into view
      audioResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Synchronize timeline with audio events
      activeAudio.addEventListener('timeupdate', () => {
        const pct = (activeAudio.currentTime / activeAudio.duration) * 100 || 0;
        audioProgress.value = pct;
        
        const curSec = Math.floor(activeAudio.currentTime);
        timeCurrent.textContent = `0:${curSec < 10 ? '0' : ''}${curSec}`;
      });

      activeAudio.addEventListener('ended', () => {
        audioPlayBtn.textContent = '▶';
        audioProgress.value = 0;
        timeCurrent.textContent = '0:00';
      });

    } catch (err) {
      console.error(err);
      alert("TTS Engine requires the backend server running at http://localhost:3000 to process audio. Showing offline demo mode.");
      
      // Fallback offline simulation
      if (activeAudio) {
        activeAudio.pause();
      }
      activeAudio = null;
      downloadAudioLink.href = '#';
      
      const charLen = textVal.length;
      const totalSec = Math.max(3, Math.min(60, Math.ceil(charLen / 15)));
      timeTotal.textContent = `0:${totalSec < 10 ? '0' : ''}${totalSec}`;
      
      audioResult.style.display = 'block';
      setTimeout(() => {
        audioResult.classList.add('visible');
      }, 50);
      
      audioPlayBtn.textContent = '▶';
      audioProgress.value = 0;
      timeCurrent.textContent = '0:00';
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalBtnText;
    }
  });

  // Audio Playback action
  audioPlayBtn.addEventListener('click', () => {
    if (!activeAudio) {
      // Simulate player if offline
      alert("Offline demo sound playing simulation.");
      return;
    }

    if (activeAudio.paused) {
      activeAudio.play().then(() => {
        audioPlayBtn.textContent = '⏸️';
      });
    } else {
      activeAudio.pause();
      audioPlayBtn.textContent = '▶';
    }
  });

  audioProgress.addEventListener('input', () => {
    if (activeAudio) {
      const seekTime = (parseFloat(audioProgress.value) / 100) * activeAudio.duration;
      activeAudio.currentTime = seekTime;
    }
  });

  // ── Scroll Triggered Animation Observer ────────────────────
  const scrollElements = document.querySelectorAll('.animate-on-scroll, .animate-scale');
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        const statNumber = entry.target.querySelector('.stat-number');
        if (statNumber && !statNumber.classList.contains('counted')) {
          animateStatCounter(statNumber);
        }
      }
    });
  }, { threshold: 0.15 });

  scrollElements.forEach(el => elementObserver.observe(el));

  function animateStatCounter(element) {
    element.classList.add('counted');
    const target = parseInt(element.getAttribute('data-target')) || 0;
    const suffix = element.getAttribute('data-suffix') || '';
    let current = 0;
    const duration = 2000;
    const intervalTime = 40;
    const steps = duration / intervalTime;
    const increment = Math.ceil(target / steps);

    const counterInterval = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + suffix;
        clearInterval(counterInterval);
      } else {
        element.textContent = current + suffix;
      }
    }, intervalTime);
  }

  // ── Pricing Plan Switcher ──────────────────────────────────
  const pricingToggle = document.getElementById('pricing-toggle');
  
  pricingToggle.addEventListener('click', () => {
    pricingToggle.classList.toggle('active');
    const isAnnual = pricingToggle.classList.contains('active');

    document.querySelectorAll('.pricing-amount').forEach(priceEl => {
      const monthlyVal = priceEl.getAttribute('data-monthly');
      const annualVal = priceEl.getAttribute('data-annual');
      priceEl.textContent = isAnnual ? annualVal : monthlyVal;
    });
  });

});

// Global voice sample play trigger
window.playSample = async function(voiceKey) {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "මෙය ලංකා ස්පීච් කෘත්‍රීම හඬ තාක්ෂණය පරීක්ෂා කිරීම සඳහා සාදන ලද සාම්පල හඬකි.",
        voice: voiceKey,
        tone: "cheerful"
      })
    });
    const data = await response.json();
    if (data.success && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play();
    } else {
      alert(`Playing offline preview sample voice tone: ${voiceKey}`);
    }
  } catch(e) {
    alert(`Playing offline preview sample voice tone: ${voiceKey}`);
  }
};
