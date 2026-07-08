/*
  EmailJS contact form integration.
  Sends portfolio enquiries directly to the Gmail inbox connected in EmailJS.
*/

const emailJsConfig = window.EMAILJS_CONFIG || {};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isMissingCredential = (value) =>
  !value || String(value).startsWith('YOUR_EMAILJS_');

function setFieldError(field, hasError) {
  field.classList.toggle('is-invalid', hasError);
  field.setAttribute('aria-invalid', String(hasError));
}

function showContactStatus(form, type, message) {
  const status = form.querySelector('[data-contact-status]');
  if (!status) return;
  status.hidden = false;
  status.className = `contact-status contact-status--${type}`;
  status.textContent = message;
}

function clearContactStatus(form) {
  const status = form.querySelector('[data-contact-status]');
  if (!status) return;
  status.hidden = true;
  status.className = 'contact-status';
  status.textContent = '';
}

function validateContactForm(form) {
  const requiredFields = ['from_name', 'from_email', 'subject', 'message'];
  let isValid = true;

  requiredFields.forEach((fieldName) => {
    const field = form.elements[fieldName];
    const value = String(field?.value || '').trim();
    const invalid = !value || (fieldName === 'from_email' && !emailPattern.test(value));
    if (field) setFieldError(field, invalid);
    if (invalid) isValid = false;
  });

  return isValid;
}

function setSendingState(form, isSending) {
  const button = form.querySelector('[data-contact-submit]');
  if (!button) return;

  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = isSending;
  button.classList.toggle('is-sending', isSending);
  button.textContent = isSending ? 'Sending message...' : button.dataset.defaultText;
}

function initEmailJsContactForms() {
  const forms = document.querySelectorAll('[data-contact-form]');
  if (!forms.length) return;

  forms.forEach((form) => {
    form.addEventListener('input', (event) => {
      if (event.target.matches('input, textarea')) {
        setFieldError(event.target, false);
        clearContactStatus(form);
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearContactStatus(form);

      if (!validateContactForm(form)) {
        showContactStatus(form, 'error', 'Please fill in every field with a valid email address.');
        return;
      }

      if (
        isMissingCredential(emailJsConfig.serviceId) ||
        isMissingCredential(emailJsConfig.templateId) ||
        isMissingCredential(emailJsConfig.publicKey)
      ) {
        showContactStatus(
          form,
          'error',
          'EmailJS is not connected yet. Add your Service ID, Template ID and Public Key in js/emailjs-config.js.'
        );
        return;
      }

      if (!window.emailjs) {
        showContactStatus(form, 'error', 'EmailJS could not load. Please check your internet connection and try again.');
        return;
      }

      const data = new FormData(form);
      const templateParams = {
        from_name: String(data.get('from_name')).trim(),
        from_email: String(data.get('from_email')).trim(),
        reply_to: String(data.get('from_email')).trim(),
        subject: String(data.get('subject')).trim(),
        message: String(data.get('message')).trim(),
        to_name: 'Rishi Shah',
      };

      try {
        setSendingState(form, true);

        await window.emailjs.send(
          emailJsConfig.serviceId,
          emailJsConfig.templateId,
          templateParams,
          { publicKey: emailJsConfig.publicKey }
        );

        form.reset();
        form.querySelectorAll('.is-invalid').forEach((field) => setFieldError(field, false));
        showContactStatus(
          form,
          'success',
          "Thank you! Your message has been sent successfully. I'll get back to you soon."
        );
      } catch (error) {
        console.error('EmailJS send failed:', error);
        showContactStatus(form, 'error', 'Something went wrong while sending. Please try again in a moment.');
      } finally {
        setSendingState(form, false);
      }
    });
  });
}

initEmailJsContactForms();
