import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const base = {
  confirmButtonColor: '#0071e3',
  cancelButtonColor: '#6e6e73',
  buttonsStyling: true,
}

export function alertWarning(title: string, text?: string) {
  return Swal.fire({
    ...base,
    icon: 'warning',
    title,
    text,
  })
}

export function alertError(title: string, text?: string) {
  return Swal.fire({
    ...base,
    icon: 'error',
    title,
    text,
  })
}

export function alertInfo(title: string, text?: string) {
  return Swal.fire({
    ...base,
    icon: 'info',
    title,
    text,
  })
}
