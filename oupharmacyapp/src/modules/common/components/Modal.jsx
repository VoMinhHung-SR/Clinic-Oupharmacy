import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import clsx from "clsx"

const CustomModal = (props) => {
    const {title, content, open, onClose, actions, 
        isClosingDropOutside = true, className} = props

    const handleDialogClose = (event, reason) => {
        if (!isClosingDropOutside && reason === 'backdropClick') {
            return; // Prevent closing if clicking outside and isClosingDropOutside is false
        }
        if (onClose) {
            onClose(event, reason); // Call the custom onClose function
        }
    };  
    return (
        <Dialog maxWidth={"md"}
          open={open} 
          onClose={handleDialogClose}>
            <DialogTitle className={clsx('ou-min-w-[300px]',className)}>{title}</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>{actions}</DialogActions>
        </Dialog>
    )

}
export default CustomModal