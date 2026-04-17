import Swal from 'sweetalert2';

export const confirmDialog = async ({
  title = '¿Estás seguro?',
  text = '',
  icon = 'warning',
  confirmButtonText = 'Sí, continuar',
  cancelButtonText = 'Cancelar',
  confirmButtonColor = '#e74c3c',
  cancelButtonColor = '#6b7280',
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
};
