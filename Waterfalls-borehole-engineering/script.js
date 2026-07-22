/* =========================================================
   AquaCore Drilling — site behaviour
   Vanilla JS, no dependencies.
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setFooterYear();
    initMobileMenu();
    initHeaderScrollState();
    initSmoothScroll();
    initScrollSpy();
    initRevealOnScroll();
    initDepthRail();
    initQuoteForm();
    initNewsletterForm();
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  function setFooterYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ---------------------------------------------------------
     Mobile menu toggle
  --------------------------------------------------------- */
  function initMobileMenu() {
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');
    var iconMenu = document.getElementById('icon-menu');
    var iconClose = document.getElementById('icon-close');

    if (!btn || !menu) return;

    function openMenu() {
      menu.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      if (iconMenu) iconMenu.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
    }

    function closeMenu() {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      if (iconMenu) iconMenu.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    }

    btn.addEventListener('click', function () {
      var isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    var menuLinks = menu.querySelectorAll('a');
    for (var i = 0; i < menuLinks.length; i++) {
      menuLinks[i].addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
    });
  }

  /* ---------------------------------------------------------
     Sticky header background on scroll
  --------------------------------------------------------- */
  function initHeaderScrollState() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function update() {
      if (window.scrollY > 24) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------------------------------------------------------
     Smooth scroll for all in-page anchor links
     (accounts for the fixed header height)
  --------------------------------------------------------- */
  function initSmoothScroll() {
    var headerOffset = 88;
    var links = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');

        if (!targetId || targetId.length < 2) {
          return;
        }

        var target;
        try {
          target = document.querySelector(targetId);
        } catch (err) {
          return;
        }

        if (!target) return;

        e.preventDefault();

        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(targetPosition, 0),
          behavior: 'smooth'
        });

        window.setTimeout(function () {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }, 550);
      });
    }
  }

  /* ---------------------------------------------------------
     Scroll spy — highlights the current section in the nav
  --------------------------------------------------------- */
  function initScrollSpy() {
    var navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    var sections = [];
    for (var i = 0; i < navLinks.length; i++) {
      var href = navLinks[i].getAttribute('href');
      if (href && href.charAt(0) === '#' && href.length > 1) {
        var section = document.querySelector(href);
        if (section) sections.push(section);
      }
    }

    if (!sections.length) return;

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var activeId = '#' + entry.target.id;
            navLinks.forEach(function (link) {
              if (link.getAttribute('href') === activeId) {
                link.classList.add('is-active');
              } else {
                link.classList.remove('is-active');
              }
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------
     Reveal-on-scroll entrance animation
  --------------------------------------------------------- */
  function initRevealOnScroll() {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) {
        el.classList.add('reveal-visible');
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Depth rail — scroll-progress marker styled as a
     borehole depth gauge (0m at the top of the page down
     to an illustrative 90m at the foot of the page)
  --------------------------------------------------------- */
  function initDepthRail() {
    var marker = document.getElementById('depth-marker');
    var readout = document.getElementById('depth-readout');
    if (!marker || !readout) return;

    var maxDepth = 90;

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var percent = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

      marker.style.top = (percent * 100) + '%';
      readout.textContent = Math.round(percent * maxDepth) + 'M';
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------------------------------------------------------
     Quote intake form — validation + simulated submission
  --------------------------------------------------------- */
  function initQuoteForm() {
    var form = document.getElementById('quote-form');
    if (!form) return;

    var formMessage = document.getElementById('form-message');
    var submitBtn = document.getElementById('submitBtn');
    var submitBtnText = document.getElementById('submitBtnText');
    var submitSpinner = document.getElementById('submitSpinner');

    var requiredFieldIds = ['fullName', 'phone', 'province', 'propertyType', 'waterNeeds'];
    var optionalFieldIds = ['email'];
    var allFieldIds = requiredFieldIds.concat(optionalFieldIds);

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var namePattern = /^[A-Za-z\s'-]{2,60}$/;
    var phonePattern = /^(\+27|0)[1-9]\d{8}$/;

    var validators = {
      fullName: function (value) {
        if (isBlank(value)) return 'Please enter your full name.';
        if (!namePattern.test(value.trim())) return 'Please enter a valid name (letters only, at least 2 characters).';
        return '';
      },
      phone: function (value) {
        if (isBlank(value)) return 'Please enter a contact number.';
        var cleaned = value.replace(/[\s\-()]/g, '');
        if (!phonePattern.test(cleaned)) return 'Please enter a valid South African number, e.g. 082 123 4567.';
        return '';
      },
      province: function (value) {
        if (isBlank(value)) return 'Please select your province.';
        return '';
      },
      propertyType: function (value) {
        if (isBlank(value)) return 'Please select a property type.';
        return '';
      },
      waterNeeds: function (value) {
        if (isBlank(value)) return 'Please select your estimated water needs.';
        return '';
      },
      email: function (value) {
        if (isBlank(value)) return '';
        if (!emailPattern.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      }
    };

    function isBlank(value) {
      return !value || !value.toString().trim();
    }

    function showFieldError(fieldId, message) {
      var input = document.getElementById(fieldId);
      var errorEl = document.getElementById(fieldId + '-error');
      if (input) input.classList.add('field-invalid');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('form-error--visible');
      }
    }

    function clearFieldError(fieldId) {
      var input = document.getElementById(fieldId);
      var errorEl = document.getElementById(fieldId + '-error');
      if (input) input.classList.remove('field-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('form-error--visible');
      }
    }

    function validateField(fieldId) {
      var input = document.getElementById(fieldId);
      if (!input || !validators[fieldId]) return true;

      var message = validators[fieldId](input.value);
      if (message) {
        showFieldError(fieldId, message);
        return false;
      }
      clearFieldError(fieldId);
      return true;
    }

    function setFormMessage(type, text) {
      if (!formMessage) return;
      formMessage.textContent = text;
      formMessage.classList.remove('hidden', 'form-message--success', 'form-message--error');
      formMessage.classList.add(type === 'success' ? 'form-message--success' : 'form-message--error');
    }

    function hideFormMessage() {
      if (!formMessage) return;
      formMessage.classList.add('hidden');
      formMessage.classList.remove('form-message--success', 'form-message--error');
    }

    allFieldIds.forEach(function (fieldId) {
      var input = document.getElementById(fieldId);
      if (!input) return;

      input.addEventListener('blur', function () {
        validateField(fieldId);
      });

      input.addEventListener('input', function () {
        if (input.classList.contains('field-invalid')) {
          validateField(fieldId);
        }
      });

      input.addEventListener('change', function () {
        if (input.classList.contains('field-invalid')) {
          validateField(fieldId);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = true;
      allFieldIds.forEach(function (fieldId) {
        if (!validateField(fieldId)) {
          isValid = false;
        }
      });

      if (!isValid) {
        setFormMessage('error', 'Please correct the highlighted fields below.');
        var firstInvalid = form.querySelector('.field-invalid');
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      hideFormMessage();

      if (submitBtn) submitBtn.disabled = true;
      if (submitBtn) submitBtn.classList.add('is-loading');
      if (submitBtnText) submitBtnText.textContent = 'Submitting...';
      if (submitSpinner) submitSpinner.classList.remove('hidden');

      /* Simulated network request. In production this would POST
         the form data (via fetch) to AquaCore's lead-intake endpoint. */
      window.setTimeout(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (submitBtn) submitBtn.classList.remove('is-loading');
        if (submitBtnText) submitBtnText.textContent = 'Request Free Assessment';
        if (submitSpinner) submitSpinner.classList.add('hidden');

        setFormMessage(
          'success',
          'Thank you — your request has been received. A member of our hydrogeology team will contact you within 24 hours.'
        );

        if (formMessage) {
          formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        form.reset();
        allFieldIds.forEach(clearFieldError);
      }, 1200);
    });
  }

  /* ---------------------------------------------------------
     Footer newsletter subscription
  --------------------------------------------------------- */
  function initNewsletterForm() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    var input = document.getElementById('newsletterEmail');
    var errorEl = document.getElementById('newsletterEmail-error');
    var messageEl = document.getElementById('newsletter-message');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(message) {
      if (input) input.classList.add('field-invalid');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('form-error--visible');
      }
    }

    function clearError() {
      if (input) input.classList.remove('field-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('form-error--visible');
      }
    }

    function validate() {
      var value = input ? input.value.trim() : '';
      if (!value) {
        showError('Please enter your email address.');
        return false;
      }
      if (!emailPattern.test(value)) {
        showError('Please enter a valid email address.');
        return false;
      }
      clearError();
      return true;
    }

    if (input) {
      input.addEventListener('input', function () {
        if (input.classList.contains('field-invalid')) {
          validate();
        }
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (messageEl) {
        messageEl.classList.add('hidden');
        messageEl.classList.remove('newsletter-message--success', 'newsletter-message--error');
      }

      if (!validate()) {
        return;
      }

      if (messageEl) {
        messageEl.textContent = "You're subscribed. Look out for our next Water Insights email.";
        messageEl.classList.remove('hidden');
        messageEl.classList.add('newsletter-message--success');
      }

      form.reset();
      clearError();
    });
  }
})();
