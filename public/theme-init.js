;(function () {
  try {
    var stored = localStorage.getItem('intrainin-dark')
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (stored === 'true' || (stored === null && prefersDark)) {
      document.documentElement.classList.add('dark')
    }
  } catch (e) {}
})()
