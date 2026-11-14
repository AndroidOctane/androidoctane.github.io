(() => {
  const header = document.querySelector('[data-header]')
  const menuButton = document.querySelector('.menu-toggle')
  const navigation = document.querySelector('#primary-navigation')
  const year = document.querySelector('[data-year]')

  if (year) year.textContent = String(new Date().getFullYear())

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12)
  }

  updateHeader()
  window.addEventListener('scroll', updateHeader, { passive: true })

  const mobileNavigation = window.matchMedia('(max-width: 640px)')

  const setMenuOpen = (isOpen) => {
    if (!menuButton || !navigation) return
    menuButton.setAttribute('aria-expanded', String(isOpen))
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation')
    navigation.classList.toggle('is-open', isOpen)
    navigation.inert = mobileNavigation.matches && !isOpen
    document.body.classList.toggle('menu-open', isOpen)
  }

  setMenuOpen(false)
  mobileNavigation.addEventListener('change', () => setMenuOpen(false))

  menuButton?.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true')
  })

  navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false)
  })

  document.addEventListener('click', (event) => {
    if (menuButton?.getAttribute('aria-expanded') !== 'true') return
    if (event.target instanceof Node && !navigation?.contains(event.target) && !menuButton.contains(event.target)) {
      setMenuOpen(false)
    }
  })

  const revealText = document.querySelectorAll('.reveal-text')
  const splitGraphemes = (text) => {
    if (typeof Intl.Segmenter === 'function') {
      return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), ({ segment }) => segment)
    }
    return Array.from(text)
  }

  revealText.forEach((element) => {
    const text = element.textContent ?? ''
    const accessibleCopy = document.createElement('span')
    accessibleCopy.className = 'sr-only'
    accessibleCopy.textContent = text
    const visualCopy = document.createDocumentFragment()
    let glyphIndex = 0
    text.split(/(\s+)/u).forEach((token) => {
      if (!token) return
      if (/^\s+$/u.test(token)) {
        visualCopy.append(document.createTextNode(token))
        return
      }
      const word = document.createElement('span')
      word.className = 'glyph-word'
      splitGraphemes(token).forEach((glyph) => {
        const span = document.createElement('span')
        span.className = 'glyph'
        span.setAttribute('aria-hidden', 'true')
        span.style.setProperty('--glyph-delay', `${Math.min(glyphIndex % 34, 33) * 11}ms`)
        span.textContent = glyph
        word.append(span)
        glyphIndex += 1
      })
      visualCopy.append(word)
    })
    element.replaceChildren(accessibleCopy, visualCopy)
  })

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealText.forEach((element) => element.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting)
    })
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' })

  revealText.forEach((element) => observer.observe(element))
})()
