import { useTranslation } from "react-i18next";
import * as Yup from 'yup';
import {REGEX_NUMBER999, REGEX_ADDRESS, REGEX_NAME, REGEX_EMAIL, REGEX_PHONE_NUMBER} from "../lib/constants"


const SchemaModels = () => {
    const {t} = useTranslation(['yup-validate', 'modal', 'prescription-detail'])

    const medicineSubmitUpdateSchema = Yup.object({
        medicineSubmit: Yup.array().of(
            Yup.object().shape({
                uses: Yup.string().trim()
                    .required(t('yupUsesRequired'))
                    .max(100, t('yupUsesMaxLength'))
                    .matches(REGEX_ADDRESS, t('yupUsesInvalid')),
                quantity: Yup.string(t('yupQuantityNumber')).trim()
                    .max(3, t('yupQuantityMax'))
                    .required(t('yupQuantityRequired'))
                    .matches(REGEX_NUMBER999, t('yupQuantityInvalid')),
            })
        )
    });

    const addingPatientSchema = Yup.object().shape({
        firstName: Yup.string().trim()
            .required(t('yupFirstNameRequired'))
            .max(150, t('yupFirstNameMaxLength'))
            .matches(REGEX_NAME, t('yupFirstNameInvalid')),

        lastName: Yup.string().trim()
            .required(t('yupLastNameRequired'))
            .max(150, t('yupLastNameMaxLength'))
            .matches(REGEX_NAME, t('yupLastNameInvalid')),

        email: Yup.string().trim()
            .required(t('yupEmailRequired'))
            .max(254, t('yupEmailMaxLength'))
            .matches(REGEX_EMAIL, t('yupEmailInvalid')),

        phoneNumber: Yup.string().trim()
            .required(t('yupPhoneNumberRequired'))
            .matches(REGEX_PHONE_NUMBER, t('yupPhoneNumberInvalid')),
            
        address: Yup.string().trim()
            .required(t('yupAddressRequired'))
            .matches(REGEX_ADDRESS, t('yupAddressInvalid')),

        dateOfBirth: Yup.string()
            .required(t('yupDOBRequired')),

        gender: Yup.string()
        .required(t('yupGenderRequired')),
           
    });

    const medicineUnitSchema = Yup.object().shape({
        name: Yup.string().trim()
            .required(t('yupFirstNameRequired'))
            .max(150, t('yupFirstNameMaxLength'))
            .matches(REGEX_NAME, t('yupFirstNameInvalid')),

        effect: Yup.string().trim()
            .required(t('yupLastNameRequired'))
            .max(150, t('yupLastNameMaxLength'))
            .matches(REGEX_NAME, t('yupLastNameInvalid')),

        contraindications: Yup.string().trim()
            .required(t('yupEmailRequired'))
            .max(254, t('yupEmailMaxLength'))
            .matches(REGEX_EMAIL, t('yupEmailInvalid')),

        price: Yup.string().trim()
            .required(t('yupPhoneNumberRequired'))
            .matches(REGEX_PHONE_NUMBER, t('yupPhoneNumberInvalid')),
            
        inStock: Yup.string().trim()
            .required(t('yupAddressRequired'))
            .matches(REGEX_ADDRESS, t('yupAddressInvalid')),

        packaging: Yup.string()
            .required(t('yupDOBRequired')),
           
    });

    return {
        medicineSubmitUpdateSchema,
        addingPatientSchema, medicineUnitSchema
    }
}

export default SchemaModels