/**
 * HR JEWELLERS & SONS Luxury Showroom Core Script
 * Controls navigation drawer toggles, catalog filters, pre-filled WhatsApp enquiry messages, and booking registrations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Mobile Menu Drawer Navigation
  // ==========================================
  const mobileTrigger = document.getElementById('mobile-trigger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-item');

  const openDrawer = () => {
    mobileDrawer.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (mobileTrigger && mobileDrawer && drawerClose) {
    mobileTrigger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });


  // ==========================================
  // 2. Intersection Observer Scroll-Spy Navigation
  // ==========================================
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-item');

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -55% 0px',
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach(section => observer.observe(section));


  // ==========================================
  // 3. Gold Catalogue Filters
  // ==========================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const goldCards = document.querySelectorAll('#gold-grid .catalogue-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active states on buttons
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetFilter = btn.getAttribute('data-filter');

      goldCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        // Elegant scale and opacity transitions
        if (targetFilter === 'all' || cardCategory === targetFilter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.97)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });


  // ==========================================
  // 4. Pre-filled WhatsApp Enquiry Message Builder
  // ==========================================
  const whatsappButtons = document.querySelectorAll('.btn-whatsapp-enquiry');
  const showroomWhatsAppNumber = "919999999999"; // High-end boutique showroom number

  whatsappButtons.forEach(btn => {
    const itemName = btn.getAttribute('data-item-name');
    const itemWeight = btn.getAttribute('data-item-weight');

    // Build elegant, professional message template
    const rawMessage = `Hello HR Jewellers & Sons,\n\nI am browsing your luxury catalogue and would like to request the current price estimate and check showroom availability for the following signature piece:\n\n- Catalogue Item: ${itemName}\n- Weight Estimate: ${itemWeight}\n\nPlease let me know if a showroom viewing can be arranged.\n\nThank you.`;

    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappUrl = `https://wa.me/${showroomWhatsAppNumber}?text=${encodedMessage}`;

    btn.setAttribute('href', whatsappUrl);
    btn.setAttribute('target', '_blank');
  });


  // ==========================================
  // 5. Private Showroom Visit Booking Handler
  // ==========================================
  const bookingForm = document.getElementById('showroom-booking-form');
  const bookingSubmitBtn = document.getElementById('booking-submit-btn');
  const spinner = bookingSubmitBtn ? bookingSubmitBtn.querySelector('.gold-spinner') : null;
  const successBox = document.getElementById('booking-success-box');
  const resetBookingBtn = document.getElementById('reset-booking-btn');

  // Success fields labels
  const successName = document.getElementById('success-client-name');
  const successFocus = document.getElementById('success-client-focus');
  const successDate = document.getElementById('success-client-date');
  const successPhone = document.getElementById('success-client-phone');

  if (bookingForm && bookingSubmitBtn && successBox && resetBookingBtn) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const nameVal = document.getElementById('client-name').value;
      const phoneVal = document.getElementById('client-phone').value;
      const focusSelect = document.getElementById('jewellery-interest');
      const focusText = focusSelect.options[focusSelect.selectedIndex].text;
      const rawDate = document.getElementById('booking-date').value;

      // Format date for elegant display (e.g. YYYY-MM-DD to standard reading)
      const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Submit loading layout updates
      bookingSubmitBtn.disabled = true;
      if (spinner) spinner.style.display = 'inline-block';
      bookingSubmitBtn.querySelector('span').textContent = 'Validating slots...';

      // Latency simulation for high-end boutique slot checks
      setTimeout(() => {
        // Populate and reveal success box, hide active form
        successName.textContent = nameVal;
        successFocus.textContent = focusText;
        successDate.textContent = formattedDate;
        successPhone.textContent = phoneVal;

        bookingForm.style.display = 'none';
        successBox.style.display = 'flex';

        // Reset submit button state
        bookingSubmitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        bookingSubmitBtn.querySelector('span').textContent = 'Request Reservation Slot';
      }, 1200);
    });

    // Reset booking capability
    resetBookingBtn.addEventListener('click', () => {
      successBox.style.display = 'none';
      bookingForm.reset();
      bookingForm.style.display = 'flex';
    });
  }

});
