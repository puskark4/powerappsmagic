// PowerApps Copilot Popup Blocker Content Script

class CopilotPopupBlocker {
  constructor() {
    this.isEnabled = true;
    this.observerConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true
    };
    this.init();
  }

  init() {
    // Load user preferences
    this.loadSettings();
    
    // Start blocking immediately
    this.blockExistingPopups();
    
    // Set up mutation observer to catch dynamically created popups
    this.setupMutationObserver();
    
    // Set up periodic checks as fallback
    this.setupPeriodicCheck();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'toggle') {
        this.isEnabled = message.enabled;
        this.saveSettings();
        if (this.isEnabled) {
          this.blockExistingPopups();
        }
      } else if (message.action === 'getStatus') {
        sendResponse({ enabled: this.isEnabled });
      }
    });
  }

  loadSettings() {
    chrome.storage.sync.get(['copilotBlockerEnabled'], (result) => {
      this.isEnabled = result.copilotBlockerEnabled !== false; // Default to true
    });
  }

  saveSettings() {
    chrome.storage.sync.set({ copilotBlockerEnabled: this.isEnabled });
  }

  blockExistingPopups() {
    if (!this.isEnabled) return;

    // Multiple selectors to catch different variations of the Copilot popup
    const selectors = [
      // Common popup/modal selectors
      '[data-testid*="copilot"]',
      '[class*="copilot"]',
      '[id*="copilot"]',
      '[aria-label*="copilot" i]',
      '[title*="copilot" i]',
      
      // Draft-related selectors
      '[data-testid*="draft"]',
      '[class*="draft"]',
      '[id*="draft"]',
      '[aria-label*="draft" i]',
      '[title*="draft" i]',
      
      // Generic modal/popup selectors that might contain Copilot content
      '.ms-Modal',
      '.ms-Dialog',
      '[role="dialog"]',
      '[role="alertdialog"]',
      '.modal',
      '.popup',
      '.overlay',
      
      // PowerApps specific selectors
      '[class*="PowerApps"]',
      '[class*="powerapps"]',
      '[data-automation-id*="copilot"]',
      '[data-automation-id*="draft"]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isCopilotPopup(element)) {
          this.hideElement(element);
        }
      });
    });

    // Also check for elements containing specific text
    this.hideByTextContent();
  }

  isCopilotPopup(element) {
    if (!element) return false;

    const textContent = element.textContent?.toLowerCase() || '';
    const innerHTML = element.innerHTML?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    
    // Keywords that indicate this is a Copilot-related popup
    const copilotKeywords = [
      'draft with copilot',
      'copilot',
      'ai assistant',
      'powered by ai',
      'draft mode',
      'ai-powered'
    ];

    // Check if element contains Copilot-related content
    const hasCopilotContent = copilotKeywords.some(keyword => 
      textContent.includes(keyword) || 
      innerHTML.includes(keyword) ||
      className.includes(keyword.replace(/\s+/g, '')) ||
      id.includes(keyword.replace(/\s+/g, ''))
    );

    // Additional checks for modal/popup characteristics
    const isModal = element.hasAttribute('role') && 
      ['dialog', 'alertdialog', 'modal'].includes(element.getAttribute('role'));
    
    const hasModalClass = /modal|dialog|popup|overlay|copilot|draft/i.test(className);
    
    return hasCopilotContent && (isModal || hasModalClass || this.looksLikePopup(element));
  }

  looksLikePopup(element) {
    const style = window.getComputedStyle(element);
    return style.position === 'fixed' || 
           style.position === 'absolute' ||
           style.zIndex > 1000 ||
           element.offsetParent === null;
  }

  hideByTextContent() {
    if (!this.isEnabled) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.toLowerCase().includes('draft with copilot') ||
          node.textContent.toLowerCase().includes('copilot')) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(textNode => {
      let element = textNode.parentElement;
      while (element && element !== document.body) {
        if (this.looksLikePopup(element)) {
          this.hideElement(element);
          break;
        }
        element = element.parentElement;
      }
    });
  }

  hideElement(element) {
    if (!element || element.style.display === 'none') return;
    
    element.style.setProperty('display', 'none', 'important');
    element.style.setProperty('visibility', 'hidden', 'important');
    element.style.setProperty('opacity', '0', 'important');
    element.setAttribute('data-copilot-blocked', 'true');
    
    console.log('PowerApps Copilot Popup Blocker: Hid element', element);
  }

  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;
      
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              shouldCheck = true;
            }
          });
        } else if (mutation.type === 'attributes') {
          if (mutation.attributeName === 'class' || 
              mutation.attributeName === 'style' ||
              mutation.attributeName === 'data-testid') {
            shouldCheck = true;
          }
        }
      });

      if (shouldCheck) {
        // Debounce the check to avoid excessive calls
        clearTimeout(this.checkTimeout);
        this.checkTimeout = setTimeout(() => {
          this.blockExistingPopups();
        }, 100);
      }
    });

    this.observer.observe(document, this.observerConfig);
  }

  setupPeriodicCheck() {
    // Periodic check every 2 seconds as fallback
    setInterval(() => {
      if (this.isEnabled) {
        this.blockExistingPopups();
      }
    }, 2000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CopilotPopupBlocker();
  });
} else {
  new CopilotPopupBlocker();
}