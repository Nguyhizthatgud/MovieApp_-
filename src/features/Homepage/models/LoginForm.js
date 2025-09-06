// src/features/Homepage/models/LoginForm.js
export class LoginFormModel {
    constructor() {
        this.defaultValues = {
            username: '',
            remember: false
        };
    }

    // 🔍 VALIDATION: Validate username field
    validateUsername(username) {
        const errors = [];

        if (!username || username.trim() === '') {
            errors.push('Nhập tên đeee anh ơi!');
        } else if (username.length < 3) {
            errors.push('Tên phải có ít nhất 3 ký tự!');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // 🔍 VALIDATION: Validate entire form
    validateForm(formData) {
        const usernameValidation = this.validateUsername(formData.username);

        return {
            isValid: usernameValidation.isValid,
            errors: {
                username: usernameValidation.errors
            }
        };
    }

    // 🔄 DATA TRANSFORMATION: Prepare form data for submission
    prepareSubmissionData(formData) {
        return {
            username: formData.username.trim(),
            remember: Boolean(formData.remember),
            timestamp: new Date().toISOString()
        };
    }

    // 🧠 BUSINESS LOGIC: Check if form should show remember me option
    shouldShowRememberMe() {
        return true; // Business rule: always show for quick login
    }

    // 🧠 BUSINESS LOGIC: Get form configuration
    getFormConfig() {
        return {
            size: 'large',
            layout: 'vertical',
            validateTrigger: ['onBlur', 'onChange'],
            autoComplete: 'off'
        };
    }

    // 🔄 DATA TRANSFORMATION: Get form field configurations
    getFieldConfigs() {
        return {
            username: {
                name: 'username',
                placeholder: 'Nhập tên nè anh ơi.',
                prefix: 'UserOutlined',
                rules: {
                    required: 'Nhập tên đeee anh ơi!',
                    minLength: { value: 3, message: 'Tên phải có ít nhất 3 ký tự!' }
                }
            },
            remember: {
                name: 'remember',
                label: 'Remember me',
                defaultValue: false
            }
        };
    }
}
