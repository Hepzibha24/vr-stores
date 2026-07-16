// Initialize Vercel Speed Insights
(function() {
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Load the Speed Insights script
  const script = document.createElement('script');
  script.src = '/_vercel/speed-insights/script.js';
  script.defer = true;
  script.setAttribute('data-sdkn', '@vercel/speed-insights');
  script.setAttribute('data-sdkv', '1.3.1');
  
  // Append to head
  if (document.head) {
    document.head.appendChild(script);
  }
})();
