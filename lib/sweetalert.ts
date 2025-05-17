// Using the global Swal object from the CDN
declare const Swal: any;

/**
 * Show a small confirmation dialog using SweetAlert2
 * @param title The title of the dialog
 * @param text The text of the dialog
 * @param confirmButtonText The text of the confirm button
 * @param cancelButtonText The text of the cancel button
 * @param icon The icon to show (success, error, warning, info, question)
 * @returns A promise that resolves to true if the user confirms, false otherwise
 */
export const showConfirmation = async (
  title: string,
  text: string,
  confirmButtonText: string = 'Oui',
  cancelButtonText: string = 'Annuler',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning'
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText,
    cancelButtonText,
    width: 'auto',
    padding: '0.5em',
    customClass: {
      container: 'small-alert-container',
      popup: 'small-alert-popup',
      title: 'small-alert-title',
      content: 'small-alert-content',
      confirmButton: 'small-alert-button',
      cancelButton: 'small-alert-button',
    },
    buttonsStyling: true,
    toast: false,
    position: 'center',
    showClass: {
      popup: 'animate__animated animate__fadeIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    },
  });

  return result.isConfirmed;
};

/**
 * Show a small success message using SweetAlert2
 * @param title The title of the dialog
 * @param text The text of the dialog
 */
export const showSuccess = (title: string, text: string) => {
  Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#3085d6',
    width: 'auto',
    padding: '0.5em',
    customClass: {
      container: 'small-alert-container',
      popup: 'small-alert-popup',
      title: 'small-alert-title',
      content: 'small-alert-content',
      confirmButton: 'small-alert-button',
    },
    buttonsStyling: true,
    toast: false,
    position: 'center',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
    showClass: {
      popup: 'animate__animated animate__fadeIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    },
  });
};

/**
 * Show a small error message using SweetAlert2
 * @param title The title of the dialog
 * @param text The text of the dialog
 */
export const showError = (title: string, text: string) => {
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#3085d6',
    width: 'auto',
    padding: '0.5em',
    customClass: {
      container: 'small-alert-container',
      popup: 'small-alert-popup',
      title: 'small-alert-title',
      content: 'small-alert-content',
      confirmButton: 'small-alert-button',
    },
    buttonsStyling: true,
    toast: false,
    position: 'center',
    timer: 5000,
    timerProgressBar: true,
    showConfirmButton: true,
    showClass: {
      popup: 'animate__animated animate__fadeIn animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut animate__faster'
    },
  });
};
