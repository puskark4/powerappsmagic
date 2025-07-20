// Popup script for PowerApps Copilot Popup Blocker

document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('toggleSwitch');
    const statusValue = document.getElementById('statusValue');
    
    // Load current state
    loadCurrentState();
    
    // Add click handler to toggle switch
    toggleSwitch.addEventListener('click', function() {
        const isCurrentlyActive = toggleSwitch.classList.contains('active');
        const newState = !isCurrentlyActive;
        
        // Update UI immediately
        updateToggleUI(newState);
        updateStatusUI(newState);
        
        // Save state
        chrome.storage.sync.set({ copilotBlockerEnabled: newState });
        
        // Send message to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('make.powerapps.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggle',
                    enabled: newState
                });
            }
        });
    });
    
    function loadCurrentState() {
        // Get stored preference
        chrome.storage.sync.get(['copilotBlockerEnabled'], function(result) {
            const isEnabled = result.copilotBlockerEnabled !== false; // Default to true
            updateToggleUI(isEnabled);
            updateStatusUI(isEnabled);
        });
        
        // Also try to get status from content script if on PowerApps
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('make.powerapps.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
                    if (chrome.runtime.lastError) {
                        // Content script not loaded yet, use stored preference
                        return;
                    }
                    if (response && typeof response.enabled === 'boolean') {
                        updateToggleUI(response.enabled);
                        updateStatusUI(response.enabled);
                    }
                });
            } else {
                // Not on PowerApps, show inactive status
                updateStatusUI(false, 'Not on PowerApps');
            }
        });
    }
    
    function updateToggleUI(isEnabled) {
        if (isEnabled) {
            toggleSwitch.classList.add('active');
        } else {
            toggleSwitch.classList.remove('active');
        }
    }
    
    function updateStatusUI(isEnabled, customMessage = null) {
        statusValue.className = 'status-value';
        
        if (customMessage) {
            statusValue.textContent = customMessage;
            statusValue.classList.add('status-inactive');
        } else if (isEnabled) {
            statusValue.textContent = 'Active - Blocking popups';
            statusValue.classList.add('status-active');
        } else {
            statusValue.textContent = 'Inactive - Popups not blocked';
            statusValue.classList.add('status-inactive');
        }
    }
});

// Check if we're on PowerApps domain
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && !tabs[0].url.includes('make.powerapps.com')) {
        // Add notice that extension only works on PowerApps
        document.addEventListener('DOMContentLoaded', function() {
            const info = document.querySelector('.info');
            if (info) {
                const notice = document.createElement('div');
                notice.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 10px; margin-top: 10px; font-size: 12px; color: #856404;';
                notice.innerHTML = '<strong>Notice:</strong> This extension only works on make.powerapps.com';
                info.appendChild(notice);
            }
        });
    }
});