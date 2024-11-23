import Swal from 'sweetalert2'

const SuccessfulAlert = (title, confirmButtonText, callback) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'ou-px-8 ou-py-3 ou-ml-3 ou-bg-green-600 ou-text-white ou-rounded'
        }, buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        position: 'center', icon: 'success', title: title, showConfirmButton: true, confirmButtonText: confirmButtonText
    }).then(callback);
};

export const ErrorAlert = (title, text, confirmButtonText) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn btn-danger'
        }, buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
        icon: 'error', title: title, text: text, showConfirmButton: true, confirmButtonText: confirmButtonText
    });
};

export const ConfirmAlert = (title, text, confirmButtonText, cancelButtonText, callBackYes, callBackNo) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            popup: '!ou-z-1500',
            confirmButton: 'ou-px-8 ou-py-3 ou-ml-3 ou-bg-green-600 ou-text-white ou-rounded', 
            cancelButton: 'ou-rounded ou-px-8 ou-py-3 ou-p5 ou-bg-red-600 ou-mr-5 ou-text-white',
        }, buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true
    }).then(function (result){
        if(result.isConfirmed)
            callBackYes();
        else
            callBackNo();
    });
};

export default SuccessfulAlert